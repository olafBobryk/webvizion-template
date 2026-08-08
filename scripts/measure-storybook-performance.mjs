#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

const DEFAULT_RUNS = 3;
const VIEWPORT = { height: 900, width: 1440 };
const SCENARIOS = [
	{
		id: "ui-guides-catalog-rules--docs",
		path: "/?path=/docs/ui-guides-catalog-rules--docs",
	},
	{
		id: "ui-input-choice-indicators--production-composition",
		path: "/?path=/story/ui-input-choice-indicators--production-composition",
	},
	{
		id: "ui-motion-motion-effect--effect-gallery",
		path: "/?path=/story/ui-motion-motion-effect--effect-gallery",
	},
	{
		id: "ui-primitives-dropdown--recursive-pointer-ownership",
		path: "/?path=/story/ui-primitives-dropdown--recursive-pointer-ownership",
	},
	{
		id: "ui-overlays-modal--hosted-focus-and-dismissal",
		path: "/?path=/story/ui-overlays-modal--hosted-focus-and-dismissal",
	},
];

function printUsage() {
	console.log(`Usage: npm run measure:storybook-performance -- [options]

Options:
  --runs 1|2|3...        Cold-cache runs per scenario (default: ${DEFAULT_RUNS})
  --output .codex/...    Optional ignored JSON result path
`);
}

function parseArgs(argv) {
	const values = new Map();
	for (let index = 0; index < argv.length; index += 1) {
		const argument = argv[index];
		if (!argument.startsWith("--")) continue;
		if (argument === "--help") return { help: true, values };
		const [rawKey, inlineValue] = argument.slice(2).split("=");
		const value = inlineValue ?? argv[index + 1];
		if (inlineValue === undefined) index += 1;
		values.set(rawKey, value);
	}
	return { help: false, values };
}

function readRuns(values) {
	const value = values.get("runs");
	if (value === undefined) return DEFAULT_RUNS;
	const runs = Number.parseInt(String(value), 10);
	if (!Number.isInteger(runs) || runs < 1) {
		throw new Error("--runs must be a positive integer.");
	}
	return runs;
}

function quantile(values, ratio) {
	if (values.length === 0) return 0;
	const sorted = [...values].sort((left, right) => left - right);
	return sorted[
		Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)
	];
}

function round(value) {
	return Math.round(value * 10) / 10;
}

function summarize(results) {
	const numericKeys = [
		"managerDomContentLoadedMs",
		"managerJsBytes",
		"domContentLoadedMs",
		"firstContentfulPaintMs",
		"jsBytes",
		"cssBytes",
		"longTaskCount",
		"longTaskMs",
	];
	return Object.fromEntries(
		numericKeys.map((key) => {
			const values = results.map((result) => result[key]);
			return [
				key,
				{
					median: round(quantile(values, 0.5)),
					p95: round(quantile(values, 0.95)),
				},
			];
		}),
	);
}

async function readMetadata(root) {
	const metadataPath = path.join(root, ".codex", "storybook-preview.json");
	let metadata;
	try {
		metadata = JSON.parse(await fs.readFile(metadataPath, "utf8"));
	} catch (error) {
		if (error?.code === "ENOENT") {
			throw new Error(
				"No worktree-owned Storybook metadata exists. Start it with npm run storybook:preview.",
			);
		}
		throw error;
	}
	if (metadata.root !== root || !metadata.localUrl) {
		throw new Error("Storybook metadata does not belong to this checkout.");
	}
	const response = await fetch(metadata.localUrl, {
		signal: AbortSignal.timeout(5_000),
	});
	if (!response.ok) {
		throw new Error(
			`The worktree-owned Storybook UI is not healthy at ${metadata.localUrl}.`,
		);
	}
	return metadata;
}

function getOutputPath(root, values) {
	const rawOutput = values.get("output");
	if (rawOutput === undefined) return null;
	const outputPath = path.resolve(root, String(rawOutput));
	const codexDirectory = path.join(root, ".codex");
	if (!outputPath.startsWith(`${codexDirectory}${path.sep}`)) {
		throw new Error(
			"--output must stay inside this checkout's ignored .codex directory.",
		);
	}
	return outputPath;
}

async function collectFrameMetrics(frame) {
	return frame.evaluate(() => {
		const navigation = performance.getEntriesByType("navigation")[0];
		const paintEntries = performance.getEntriesByType("paint");
		const firstContentfulPaint = paintEntries.find(
			(entry) => entry.name === "first-contentful-paint",
		)?.startTime;
		const resources = performance.getEntriesByType("resource").map((entry) => ({
			initiatorType: entry.initiatorType,
			name: entry.name,
			transferSize: entry.transferSize,
		}));
		const jsBytes = resources
			.filter((entry) => entry.name.includes(".js"))
			.reduce((total, entry) => total + entry.transferSize, 0);
		const cssBytes = resources
			.filter((entry) => entry.name.includes(".css"))
			.reduce((total, entry) => total + entry.transferSize, 0);
		const longTasks = window.__storybookPerformanceLongTasks ?? [];
		return {
			domContentLoadedMs: navigation?.domContentLoadedEventEnd ?? 0,
			firstContentfulPaintMs: firstContentfulPaint ?? 0,
			jsBytes,
			cssBytes,
			longTaskCount: longTasks.length,
			longTaskMs: longTasks.reduce((total, duration) => total + duration, 0),
			resources: resources
				.sort((left, right) => right.transferSize - left.transferSize)
				.slice(0, 5),
		};
	});
}

async function measureScenario(browser, baseUrl, scenario, run) {
	const context = await browser.newContext({
		colorScheme: "light",
		viewport: VIEWPORT,
	});
	await context.addInitScript(() => {
		window.__storybookPerformanceLongTasks = [];
		try {
			new PerformanceObserver((entries) => {
				window.__storybookPerformanceLongTasks.push(
					...entries.getEntries().map((entry) => entry.duration),
				);
			}).observe({ buffered: true, type: "longtask" });
		} catch {
			// Long Task reporting is optional in the browser runtime.
		}
	});
	try {
		const page = await context.newPage();
		await page.goto(`${baseUrl}${scenario.path}`, {
			waitUntil: "networkidle",
		});
		const iframeHandle = await page.waitForSelector(
			"#storybook-preview-iframe",
			{
				state: "attached",
				timeout: 20_000,
			},
		);
		const iframe = await iframeHandle.contentFrame();
		if (!iframe)
			throw new Error(`Story iframe did not attach for ${scenario.id}.`);
		await iframe.waitForLoadState("networkidle");
		const manager = await collectFrameMetrics(page.mainFrame());
		const preview = await collectFrameMetrics(iframe);
		return {
			...preview,
			id: scenario.id,
			managerDomContentLoadedMs: manager.domContentLoadedMs,
			managerJsBytes: manager.jsBytes,
			run,
		};
	} finally {
		await context.close();
	}
}

function printSummary(report) {
	console.log(`Storybook performance baseline: ${report.metadata.localUrl}`);
	for (const scenario of report.scenarios) {
		const summary = scenario.summary;
		const largestResource = scenario.results
			.flatMap((result) => result.resources)
			.sort((left, right) => right.transferSize - left.transferSize)[0];
		const largest = largestResource
			? `${new URL(largestResource.name).pathname} (${largestResource.transferSize}B)`
			: "n/a";
		console.log(
			`${scenario.id}: manager DCL ${summary.managerDomContentLoadedMs.median}ms (p95 ${summary.managerDomContentLoadedMs.p95}ms), JS ${summary.managerJsBytes.median}B; iframe DCL ${summary.domContentLoadedMs.median}ms (p95 ${summary.domContentLoadedMs.p95}ms), FCP ${summary.firstContentfulPaintMs.median}ms, JS ${summary.jsBytes.median}B, CSS ${summary.cssBytes.median}B, long tasks ${summary.longTaskCount.median}/${summary.longTaskMs.median}ms; largest ${largest}`,
		);
	}
}

async function main() {
	const { help, values } = parseArgs(process.argv.slice(2));
	if (help) {
		printUsage();
		return;
	}
	const root = await fs.realpath(process.cwd());
	const metadata = await readMetadata(root);
	const runs = readRuns(values);
	const outputPath = getOutputPath(root, values);
	const browser = await chromium.launch({ headless: true });
	try {
		const scenarios = [];
		for (const scenario of SCENARIOS) {
			const results = [];
			for (let run = 1; run <= runs; run += 1) {
				results.push(
					await measureScenario(browser, metadata.localUrl, scenario, run),
				);
			}
			scenarios.push({ ...scenario, results, summary: summarize(results) });
		}
		const report = {
			metadata: {
				localUrl: metadata.localUrl,
				ownership: metadata.ownership,
				root,
			},
			runs,
			scenarios,
		};
		if (outputPath) {
			await fs.mkdir(path.dirname(outputPath), { recursive: true });
			await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
			console.log(`Wrote ignored baseline to ${outputPath}`);
		}
		printSummary(report);
	} finally {
		await browser.close();
	}
}

main().catch((error) => {
	console.error(error.message);
	process.exit(1);
});
