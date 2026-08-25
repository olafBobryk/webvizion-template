#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const DEFAULT_HEIGHT = 900;
const DEFAULT_SETTLE_MS = 400;
const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_WIDTH = 1440;
const PREVIEW_METADATA_PATH = path.join(".codex", "preview.json");
const BLOCKING_OVERLAY_SELECTOR = [
	'[aria-busy="true"]',
	'[data-loading="true"]',
	'[data-state="loading"]',
].join(", ");

const HELP = `Usage: npm run preview:capture -- --route <path> [options]

Capture and verify a complete route through the repository-owned preview.

Options:
  --route <path>       Route, query, and optional anchor to capture (required)
  --base-url <url>     Override the human-facing preview base, for example a LAN URL
  --review <mode>      Automation-only review state (supported: composition)
  --expect <text>      Visible landmark to require; repeat for multiple landmarks
  --output <path>      PNG output path (default: .codex/preview-artifacts/<route>-1440.png)
  --width <pixels>     CSS viewport width (default: 1440)
  --height <pixels>    CSS viewport height (default: 900)
  --timeout <ms>       Navigation and landmark timeout (default: 60000)
  --settle-ms <ms>     Final post-layout settling time (default: 400)
  --help               Show this help
`;

function readPositiveInteger(value, flag) {
	const parsed = Number.parseInt(value ?? "", 10);
	if (!Number.isInteger(parsed) || parsed < 1) {
		throw new Error(`${flag} requires a positive integer.`);
	}
	return parsed;
}

function readFlagValue(argv, index, flag) {
	const value = argv[index + 1];
	if (!value || value.startsWith("--")) {
		throw new Error(`${flag} requires a value.`);
	}
	return value;
}

export function parseArgs(argv) {
	const options = {
		baseUrl: null,
		expects: [],
		height: DEFAULT_HEIGHT,
		help: false,
		output: null,
		review: null,
		route: null,
		settleMs: DEFAULT_SETTLE_MS,
		timeoutMs: DEFAULT_TIMEOUT_MS,
		width: DEFAULT_WIDTH,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const flag = argv[index];
		if (flag === "--help") {
			options.help = true;
			continue;
		}

		if (
			flag === "--route" ||
			flag === "--base-url" ||
			flag === "--expect" ||
			flag === "--output" ||
			flag === "--review" ||
			flag === "--width" ||
			flag === "--height" ||
			flag === "--timeout" ||
			flag === "--settle-ms"
		) {
			const value = readFlagValue(argv, index, flag);
			index += 1;
			if (flag === "--route") options.route = value;
			else if (flag === "--base-url") options.baseUrl = value;
			else if (flag === "--expect") options.expects.push(value);
			else if (flag === "--output") options.output = value;
			else if (flag === "--review") {
				if (value !== "composition") {
					throw new Error("--review supports only composition.");
				}
				options.review = value;
			} else if (flag === "--width") {
				options.width = readPositiveInteger(value, flag);
			} else if (flag === "--height") {
				options.height = readPositiveInteger(value, flag);
			} else if (flag === "--timeout") {
				options.timeoutMs = readPositiveInteger(value, flag);
			} else {
				options.settleMs = readPositiveInteger(value, flag);
			}
			continue;
		}

		throw new Error(`Unknown option: ${flag}`);
	}

	if (!options.help && !options.route) {
		throw new Error("--route is required.");
	}

	return options;
}

function normalizeBaseUrl(value, label) {
	let url;
	try {
		url = new URL(value);
	} catch {
		throw new Error(`${label} must be an absolute HTTP(S) URL.`);
	}
	if (url.protocol !== "http:" && url.protocol !== "https:") {
		throw new Error(`${label} must use HTTP or HTTPS.`);
	}
	return url;
}

function assertTrackedRoute(route) {
	if (route.startsWith("/")) return;
	let url;
	try {
		url = new URL(route);
	} catch {
		throw new Error(
			"--route must be root-relative or an absolute HTTP(S) URL.",
		);
	}
	if (url.protocol !== "http:" && url.protocol !== "https:") {
		throw new Error("--route must use HTTP or HTTPS when it is absolute.");
	}
}

export function buildCaptureUrls({
	automationUrl,
	baseUrl,
	localUrl,
	review,
	route,
}) {
	assertTrackedRoute(route);
	const localBase = normalizeBaseUrl(localUrl, "Preview metadata localUrl");
	const selectedBase = baseUrl
		? normalizeBaseUrl(baseUrl, "--base-url")
		: localBase;
	const humanUrl = new URL(route, selectedBase);
	const automationSource = normalizeBaseUrl(
		automationUrl ?? localUrl,
		"Preview metadata automationUrl",
	);
	const captureUrl = new URL(humanUrl);

	for (const [name, value] of automationSource.searchParams) {
		captureUrl.searchParams.set(name, value);
	}
	if (!captureUrl.searchParams.has("loading")) {
		captureUrl.searchParams.set("loading", "off");
	}
	if (review) {
		captureUrl.searchParams.set("review", review);
	}

	return {
		captureUrl: captureUrl.toString(),
		humanUrl: humanUrl.toString(),
	};
}

function slugifyRoute(routeUrl) {
	const url = new URL(routeUrl);
	const parts = [url.pathname, url.hash.slice(1)]
		.filter(Boolean)
		.join("-")
		.replaceAll(/[^a-zA-Z0-9]+/g, "-")
		.replaceAll(/^-|-$/g, "")
		.toLowerCase();
	return parts || "root";
}

function defaultOutputPath(root, routeUrl, width) {
	return path.join(
		root,
		".codex",
		"preview-artifacts",
		`${slugifyRoute(routeUrl)}-${width}.png`,
	);
}

function pngDimensions(buffer) {
	const pngSignature = "89504e470d0a1a0a";
	if (
		buffer.length < 24 ||
		buffer.subarray(0, 8).toString("hex") !== pngSignature
	) {
		throw new Error("Capture output is not a valid PNG.");
	}
	return {
		height: buffer.readUInt32BE(20),
		width: buffer.readUInt32BE(16),
	};
}

async function readPreviewMetadata(root) {
	const metadataPath = path.join(root, PREVIEW_METADATA_PATH);
	let metadata;
	try {
		metadata = JSON.parse(await fs.readFile(metadataPath, "utf8"));
	} catch (error) {
		if (error?.code === "ENOENT") {
			throw new Error(
				`Preview metadata is unavailable at ${metadataPath}. Start or recover the repository preview first.`,
			);
		}
		throw new Error(`Could not read preview metadata: ${error.message}`);
	}

	if (!metadata.localUrl) {
		throw new Error("Preview metadata does not contain localUrl.");
	}
	if (metadata.root && path.resolve(metadata.root) !== path.resolve(root)) {
		throw new Error(
			`Preview metadata belongs to another checkout: ${metadata.root}`,
		);
	}
	return metadata;
}

async function waitForLandmarks(page, expects, timeoutMs) {
	const landmarks = [];
	for (const text of expects) {
		const matches = page.getByText(text, { exact: false });
		await matches.first().waitFor({ state: "attached", timeout: timeoutMs });
		const deadline = Date.now() + timeoutMs;
		let found = false;

		while (!found && Date.now() < deadline) {
			for (let index = 0; index < (await matches.count()); index += 1) {
				const candidate = matches.nth(index);
				try {
					await candidate.evaluate((element) => {
						element.scrollIntoView({ block: "center" });
					});
					await page.waitForTimeout(50);
					if (await candidate.isVisible()) {
						found = true;
						break;
					}
				} catch {
					// Dynamic matches may detach while the route settles; retry the set.
				}
			}
		}

		if (!found) {
			throw new Error(`Expected visible landmark was not found: ${text}`);
		}
		landmarks.push(text);
	}
	await page.evaluate(
		() =>
			new Promise((resolve) => {
				window.scrollTo(0, 0);
				requestAnimationFrame(() => requestAnimationFrame(resolve));
			}),
	);
	return landmarks;
}

async function navigateAndInspect(page, url, expects, timeoutMs) {
	const pageErrors = [];
	page.on("pageerror", (error) => pageErrors.push(error.message));
	const response = await page.goto(url, {
		timeout: timeoutMs,
		waitUntil: "domcontentloaded",
	});
	await page.waitForLoadState("load", { timeout: timeoutMs });
	const landmarks = await waitForLandmarks(page, expects, timeoutMs);
	const finalUrl = page.url();

	if (!response || response.status() >= 400) {
		throw new Error(
			`Route returned ${response?.status() ?? "no response"}: ${url}`,
		);
	}
	if (finalUrl !== url) {
		throw new Error(
			`Route redirected unexpectedly from ${url} to ${finalUrl}.`,
		);
	}
	if (pageErrors.length > 0) {
		throw new Error(`Browser page error: ${pageErrors[0]}`);
	}

	return {
		finalUrl,
		landmarks,
		pageErrors,
		status: response.status(),
		title: await page.title(),
	};
}

async function primeFullPage(page, viewportHeight) {
	await page.evaluate(
		async (step) => {
			const pauseForFrame = () =>
				new Promise((resolve) => requestAnimationFrame(() => resolve()));
			const height = document.documentElement.scrollHeight;
			for (let position = 0; position < height; position += step) {
				window.scrollTo(0, position);
				await pauseForFrame();
			}
			window.scrollTo(0, 0);
			await pauseForFrame();
			await pauseForFrame();
		},
		Math.max(1, Math.floor(viewportHeight * 0.8)),
	);
}

async function waitForCaptureReadiness(page, options) {
	let networkIdle = true;
	try {
		await page.waitForLoadState("networkidle", {
			timeout: Math.min(options.timeoutMs, 10_000),
		});
	} catch {
		networkIdle = false;
	}

	await page.evaluate(async () => {
		if (document.fonts?.ready) await document.fonts.ready;
	});
	await primeFullPage(page, options.height);
	await page.waitForFunction(
		() => Array.from(document.images).every((image) => image.complete),
		undefined,
		{ timeout: options.timeoutMs },
	);
	await page.waitForTimeout(options.settleMs);
	await page.evaluate(
		() =>
			new Promise((resolve) =>
				requestAnimationFrame(() => requestAnimationFrame(resolve)),
			),
	);

	const blockingOverlays = page.locator(BLOCKING_OVERLAY_SELECTOR);
	let visibleBlockingOverlays = 0;
	for (let index = 0; index < (await blockingOverlays.count()); index += 1) {
		if (await blockingOverlays.nth(index).isVisible()) {
			visibleBlockingOverlays += 1;
		}
	}
	if (visibleBlockingOverlays > 0) {
		throw new Error(
			`Capture is blocked by ${visibleBlockingOverlays} visible loading overlay(s).`,
		);
	}

	const scrollY = await page.evaluate(() => window.scrollY);
	if (scrollY !== 0) {
		throw new Error(`Capture scroll normalization failed: scrollY=${scrollY}.`);
	}

	return { networkIdle, scrollY, visibleBlockingOverlays };
}

export async function captureRoute(options, { root = process.cwd() } = {}) {
	const metadata = await readPreviewMetadata(root);
	const urls = buildCaptureUrls({
		automationUrl: metadata.automationUrl,
		baseUrl: options.baseUrl,
		localUrl: metadata.localUrl,
		review: options.review,
		route: options.route,
	});
	const outputPath = path.resolve(
		root,
		options.output ?? defaultOutputPath(root, urls.humanUrl, options.width),
	);
	await fs.mkdir(path.dirname(outputPath), { recursive: true });

	const browser = await chromium.launch({ headless: true });
	try {
		const context = await browser.newContext({
			deviceScaleFactor: 1,
			viewport: { height: options.height, width: options.width },
		});
		const humanPage = await context.newPage();
		const human = await navigateAndInspect(
			humanPage,
			urls.humanUrl,
			options.expects.slice(0, 1),
			options.timeoutMs,
		);
		await humanPage.close();

		const capturePage = await context.newPage();
		const capture = await navigateAndInspect(
			capturePage,
			urls.captureUrl,
			options.expects,
			options.timeoutMs,
		);
		const readiness = await waitForCaptureReadiness(capturePage, options);
		const documentHeight = await capturePage.evaluate(
			() => document.documentElement.scrollHeight,
		);
		const screenshot = await capturePage.screenshot({
			animations: "disabled",
			fullPage: true,
			path: outputPath,
			scale: "css",
			type: "png",
		});
		const dimensions = pngDimensions(screenshot);
		await capturePage.close();

		if (dimensions.width !== options.width) {
			throw new Error(
				`Capture width mismatch: expected ${options.width}, received ${dimensions.width}.`,
			);
		}
		if (dimensions.height !== documentHeight) {
			throw new Error(
				`Capture height mismatch: expected ${documentHeight}, received ${dimensions.height}.`,
			);
		}

		return {
			schemaVersion: 1,
			capture: {
				...capture,
				...readiness,
				documentHeight,
				requestedUrl: urls.captureUrl,
			},
			human: {
				...human,
				requestedUrl: urls.humanUrl,
			},
			outputPath,
			screenshot: {
				...dimensions,
				fullPage: true,
			},
			viewport: { height: options.height, width: options.width },
		};
	} finally {
		await browser.close();
	}
}

async function main() {
	const options = parseArgs(process.argv.slice(2));
	if (options.help) {
		process.stdout.write(HELP);
		return;
	}
	const result = await captureRoute(options);
	process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

const isCli =
	process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isCli) {
	main().catch((error) => {
		console.error(`Preview capture failed: ${error.message}`);
		process.exitCode = 1;
	});
}
