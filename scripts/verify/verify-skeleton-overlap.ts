#!/usr/bin/env node

import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { type Browser, chromium, type Page } from "playwright";
import {
	evaluateSkeletonGeometry,
	measurementsAreStable,
	SKELETON_OVERLAP_STABILITY_TOLERANCE,
	SKELETON_OVERLAP_TOLERANCE,
	type SkeletonGeometryLayer,
	type SkeletonGeometryMeasurements,
	type SkeletonGeometryRect,
} from "../../src/app/(site)/(marketing)/internal/playground/skeleton-overlap/_lib/geometry";
import {
	startLocalProductionServer,
	stopServer,
} from "../_lib/local-production-preview.mjs";

const ROUTE = "/internal/playground/skeleton-overlap";
const ARTIFACT_ROOT = path.resolve(".codex/tmp/skeleton-overlap");
const VIEWPORTS = [
	{ height: 844, id: "base-390", width: 390 },
	{ height: 900, id: "xl-1280", width: 1280 },
] as const;

function parseArguments(args: string[]) {
	let url: string | undefined;
	for (let index = 0; index < args.length; index += 1) {
		const argument = args[index];
		if (argument === "--url") {
			url = args[index + 1];
			if (!url) throw new Error("--url requires a value.");
			index += 1;
			continue;
		}
		if (argument === "--help" || argument === "-h") {
			console.log(
				"Usage: npm run verify:skeleton-overlap -- [--url <preview-url>]",
			);
			process.exit(0);
		}
		throw new Error(`Unknown argument: ${argument}`);
	}
	return { url };
}

function createRect(
	left: number,
	top: number,
	width: number,
	height: number,
): SkeletonGeometryRect {
	return {
		bottom: top + height,
		height,
		left,
		right: left + width,
		top,
		width,
	};
}

function createLayer(offset = 0): SkeletonGeometryLayer {
	return {
		description: createRect(10 + offset, 24 + offset, 180, 18),
		inputFrame: createRect(10 + offset, 54 + offset, 280, 36),
		label: createRect(10 + offset, offset, 140, 20),
		root: createRect(offset, offset, 300, 90),
	};
}

function createMeasurements(offset = 0): SkeletonGeometryMeasurements {
	return { live: createLayer(), skeleton: createLayer(offset) };
}

function createBoundaryMeasurements(): SkeletonGeometryMeasurements {
	return {
		live: createLayer(),
		skeleton: {
			description: createRect(9.5, 23.5, 181, 19),
			inputFrame: createRect(9.5, 53.5, 281, 37),
			label: createRect(9.5, -0.5, 141, 21),
			root: createRect(-0.5, -0.5, 301, 91),
		},
	};
}

function verifyGeometryContract() {
	const exact = createMeasurements();
	assert.equal(evaluateSkeletonGeometry(exact).pass, true);
	assert.equal(
		evaluateSkeletonGeometry(createBoundaryMeasurements()).pass,
		true,
	);
	assert.equal(
		evaluateSkeletonGeometry(
			createMeasurements(SKELETON_OVERLAP_TOLERANCE + 0.01),
		).pass,
		false,
	);

	const collision = createMeasurements();
	for (const layer of [collision.live, collision.skeleton]) {
		layer.description = createRect(10, 19, 180, 18);
	}
	assert.equal(evaluateSkeletonGeometry(collision).collisions.length > 0, true);

	const overflow = createMeasurements();
	for (const layer of [overflow.live, overflow.skeleton]) {
		layer.inputFrame = createRect(10, 54, 292, 36);
	}
	assert.equal(evaluateSkeletonGeometry(overflow).overflows.length > 0, true);

	assert.equal(measurementsAreStable(exact, exact), true);
	assert.equal(
		measurementsAreStable(
			exact,
			createMeasurements(SKELETON_OVERLAP_STABILITY_TOLERANCE + 0.01),
		),
		false,
	);
}

function getTestUrl(baseUrl: string) {
	const url = new URL(ROUTE, baseUrl);
	url.searchParams.set("motion", "off");
	url.searchParams.set("reveal", "off");
	return url;
}

async function writeFailureArtifacts({
	evidence,
	error,
	id,
	page,
}: {
	evidence?: unknown;
	error: unknown;
	id: string;
	page: Page;
}) {
	const directory = path.join(ARTIFACT_ROOT, id);
	await mkdir(directory, { recursive: true });
	await writeFile(
		path.join(directory, "failure.json"),
		`${JSON.stringify(
			{
				error: error instanceof Error ? error.message : String(error),
				evidence,
			},
			null,
			2,
		)}\n`,
	);
	await page.screenshot({
		fullPage: true,
		path: path.join(directory, "failure.png"),
	});
}

async function verifyViewport(
	browser: Browser,
	baseUrl: string,
	viewport: (typeof VIEWPORTS)[number],
) {
	const context = await browser.newContext({
		colorScheme: "light",
		deviceScaleFactor: 1,
		viewport: { height: viewport.height, width: viewport.width },
	});
	const page = await context.newPage();
	const consoleErrors: string[] = [];
	const httpFailures: string[] = [];
	const ignoredPrefetchAborts: string[] = [];
	const pageErrors: string[] = [];
	const requestFailures: string[] = [];
	page.on("console", (message) => {
		if (message.type() === "error") consoleErrors.push(message.text());
	});
	page.on("pageerror", (error) => pageErrors.push(error.message));
	page.on("requestfailed", (request) => {
		const errorText = request.failure()?.errorText ?? "failed";
		const requestUrl = new URL(request.url());
		const failure = `${request.method()} ${request.url()} ${errorText}`;
		if (
			errorText === "net::ERR_ABORTED" &&
			request.resourceType() === "fetch" &&
			!request.isNavigationRequest() &&
			requestUrl.searchParams.has("_rsc")
		) {
			ignoredPrefetchAborts.push(failure);
			return;
		}
		requestFailures.push(failure);
	});
	page.on("response", (response) => {
		if (response.status() >= 400) {
			httpFailures.push(`${response.status()} ${response.url()}`);
		}
	});

	let evidence: unknown;
	try {
		const response = await page.goto(getTestUrl(baseUrl).toString(), {
			waitUntil: "domcontentloaded",
		});
		assert.equal(
			response?.status(),
			200,
			`${viewport.id} route must return 200.`,
		);
		await page.evaluate(() => document.fonts.ready);
		const marker = page.locator("[data-skeleton-overlap-status]");
		await marker.waitFor({ state: "attached", timeout: 15_000 });
		await page.waitForFunction(
			() =>
				document
					.querySelector("[data-skeleton-overlap-status]")
					?.getAttribute("data-skeleton-overlap-status") !== "pending",
			undefined,
			{ timeout: 15_000 },
		);

		const attributes = await marker.evaluate((element) => ({
			measurements: element.getAttribute("data-skeleton-overlap-measurements"),
			verdict: element.getAttribute("data-skeleton-overlap-verdict"),
			stable: element.getAttribute("data-skeleton-overlap-stable"),
			status: element.getAttribute("data-skeleton-overlap-status"),
			tolerance: element.getAttribute("data-skeleton-overlap-tolerance"),
		}));
		assert.ok(
			attributes.measurements,
			`${viewport.id} measurements are missing.`,
		);
		assert.ok(attributes.verdict, `${viewport.id} verdict is missing.`);
		const measurements = JSON.parse(
			attributes.measurements,
		) as SkeletonGeometryMeasurements;
		const verdict = evaluateSkeletonGeometry(measurements);
		const routeVerdict = JSON.parse(attributes.verdict);
		evidence = {
			attributes,
			consoleErrors,
			httpFailures,
			ignoredPrefetchAborts,
			pageErrors,
			requestFailures,
			verdict,
			viewport,
		};

		assert.equal(
			attributes.stable,
			"true",
			`${viewport.id} did not stabilize.`,
		);
		assert.equal(
			Number(attributes.tolerance),
			SKELETON_OVERLAP_TOLERANCE,
			`${viewport.id} route tolerance drifted.`,
		);
		assert.equal(attributes.status, verdict.pass ? "pass" : "fail");
		assert.deepEqual(routeVerdict, verdict, `${viewport.id} verdict drifted.`);
		assert.equal(
			verdict.pass,
			true,
			`${viewport.id} skeleton geometry drifted: ${JSON.stringify(verdict)}`,
		);
		assert.deepEqual(
			consoleErrors,
			[],
			`${viewport.id} logged console errors.`,
		);
		assert.deepEqual(httpFailures, [], `${viewport.id} received HTTP errors.`);
		assert.deepEqual(pageErrors, [], `${viewport.id} logged page errors.`);
		assert.deepEqual(
			requestFailures,
			[],
			`${viewport.id} had failed requests.`,
		);
		console.log(
			`ok ${viewport.id} max=${Math.max(...verdict.slots.map((slot) => slot.maxEdgeDelta)).toFixed(2)}px`,
		);
	} catch (error) {
		await writeFailureArtifacts({ evidence, error, id: viewport.id, page });
		throw error;
	} finally {
		await context.close();
	}
}

async function main() {
	verifyGeometryContract();
	const { url } = parseArguments(process.argv.slice(2));
	let ownedServer: Awaited<
		ReturnType<typeof startLocalProductionServer>
	> | null = null;
	let browser: Browser | null = null;
	try {
		if (!url) {
			ownedServer = await startLocalProductionServer({
				env: { TEMPLATE_INTERNAL_ROUTES: "enabled" },
			});
		}
		const baseUrl = url ? new URL(url).origin : ownedServer?.baseUrl;
		assert.ok(baseUrl, "A preview URL is required.");
		browser = await chromium.launch({ headless: true });
		for (const viewport of VIEWPORTS) {
			await verifyViewport(browser, baseUrl, viewport);
		}
		console.log("Skeleton overlap geometry verification passed.");
	} finally {
		if (browser) await browser.close();
		if (ownedServer) await stopServer(ownedServer.child);
	}
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
