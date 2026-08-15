#!/usr/bin/env node

import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const DEFAULT_THRESHOLD = 16;

function usage() {
	return `Usage:
  node assess.mjs --matrix <matrix.json> --out <artifact-directory>
    [--case <case-id>] [--threshold <0-255>] [--require-exact]

The matrix declares one authoritative source and one target per case. An
endpoint is either { "image": "/absolute-or-relative/file.png" } or
{ "url": "http://…", "selector": "[data-parity-root]" }. URL endpoints are
captured with Playwright using the case viewport, DPR, theme, and reduced motion.`;
}

function parseArgs(argv) {
	const options = {};
	for (let index = 0; index < argv.length; index += 1) {
		const argument = argv[index];
		if (argument === "--help" || argument === "-h") {
			options.help = true;
			continue;
		}
		if (argument === "--require-exact") {
			options.requireExact = true;
			continue;
		}
		if (!argument.startsWith("--"))
			throw new Error(`Unexpected argument: ${argument}`);
		const value = argv[index + 1];
		if (!value || value.startsWith("--"))
			throw new Error(`Missing value for ${argument}`);
		options[argument.slice(2)] = value;
		index += 1;
	}
	return options;
}

function required(options, key) {
	const value = options[key];
	if (!value) throw new Error(`Missing required option: --${key}`);
	return value;
}

function resolveMatrixPath(matrixPath, value) {
	return path.isAbsolute(value)
		? value
		: path.resolve(path.dirname(matrixPath), value);
}

async function loadPlaywright() {
	const requireFromRepository = createRequire(
		path.join(process.cwd(), "package.json"),
	);
	const modulePath = requireFromRepository.resolve("playwright");
	const module = await import(pathToFileURL(modulePath).href);
	const chromium = module.chromium ?? module.default?.chromium;
	if (!chromium)
		throw new Error("Resolved Playwright without a Chromium export.");
	return { chromium, modulePath };
}

async function assertPng(filePath) {
	const buffer = await fs.readFile(filePath);
	if (buffer.length < PNG_SIGNATURE.length)
		throw new Error(`Not a PNG: ${filePath}`);
	for (let index = 0; index < PNG_SIGNATURE.length; index += 1) {
		if (buffer[index] !== PNG_SIGNATURE[index])
			throw new Error(`Not a PNG: ${filePath}`);
	}
	return buffer;
}

function dataUrl(buffer) {
	return `data:image/png;base64,${buffer.toString("base64")}`;
}

async function captureEndpoint({
	browser,
	endpoint,
	caseDefinition,
	outputPath,
	matrixPath,
}) {
	if (endpoint.image) {
		const imagePath = resolveMatrixPath(matrixPath, endpoint.image);
		await assertPng(imagePath);
		await fs.copyFile(imagePath, outputPath);
		return { kind: "image", value: imagePath };
	}

	if (!endpoint.url)
		throw new Error("Each endpoint needs either image or url.");
	const viewport = caseDefinition.viewport;
	if (
		!Number.isInteger(viewport?.width) ||
		!Number.isInteger(viewport?.height)
	) {
		throw new Error(
			`${caseDefinition.id}: viewport.width and viewport.height must be integers.`,
		);
	}
	const context = await browser.newContext({
		colorScheme: caseDefinition.colorScheme ?? "light",
		deviceScaleFactor: caseDefinition.dpr ?? 1,
		reducedMotion: "reduce",
		viewport,
	});
	try {
		const page = await context.newPage();
		await page.goto(endpoint.url, { waitUntil: "domcontentloaded" });
		await page.evaluate(() => document.fonts.ready);
		if (endpoint.waitFor) await page.locator(endpoint.waitFor).waitFor();
		await page.waitForTimeout(
			endpoint.settleMs ?? caseDefinition.settleMs ?? 100,
		);
		if (endpoint.selector) {
			await page.locator(endpoint.selector).screenshot({ path: outputPath });
		} else {
			await page.screenshot({ fullPage: true, path: outputPath });
		}
		return { kind: "url", value: endpoint.url };
	} finally {
		await context.close();
	}
}

async function comparePair({
	browser,
	sourcePath,
	targetPath,
	sourceLabel,
	targetLabel,
	outputRoot,
	threshold,
}) {
	const [source, target] = await Promise.all([
		assertPng(sourcePath),
		assertPng(targetPath),
	]);
	const context = await browser.newContext({
		viewport: { width: 800, height: 600 },
	});
	try {
		const page = await context.newPage();
		await page.setContent(
			'<!doctype html><style>html,body{margin:0;background:#fff}canvas{display:block}</style><canvas id="diff"></canvas><canvas id="overlay"></canvas><canvas id="side"></canvas>',
		);
		const comparison = await page.evaluate(
			async ({
				sourceUrl,
				targetUrl,
				sourceLabelValue,
				targetLabelValue,
				thresholdValue,
			}) => {
				const load = (url) =>
					new Promise((resolve, reject) => {
						const image = new Image();
						image.onload = () => resolve(image);
						image.onerror = () => reject(new Error("Unable to decode PNG."));
						image.src = url;
					});
				const [sourceImage, targetImage] = await Promise.all([
					load(sourceUrl),
					load(targetUrl),
				]);
				if (
					sourceImage.naturalWidth !== targetImage.naturalWidth ||
					sourceImage.naturalHeight !== targetImage.naturalHeight
				) {
					return {
						comparable: false,
						reason: `Dimension mismatch: source ${sourceImage.naturalWidth}x${sourceImage.naturalHeight}, target ${targetImage.naturalWidth}x${targetImage.naturalHeight}.`,
					};
				}
				const width = sourceImage.naturalWidth;
				const height = sourceImage.naturalHeight;
				const read = document.createElement("canvas");
				read.width = width;
				read.height = height;
				const readContext = read.getContext("2d", { willReadFrequently: true });
				readContext.drawImage(sourceImage, 0, 0);
				const sourcePixels = readContext.getImageData(0, 0, width, height).data;
				readContext.clearRect(0, 0, width, height);
				readContext.drawImage(targetImage, 0, 0);
				const targetPixels = readContext.getImageData(0, 0, width, height).data;
				let sourceTransparent = 0;
				let targetTransparent = 0;
				for (let index = 3; index < sourcePixels.length; index += 4) {
					if (sourcePixels[index] !== 255) sourceTransparent += 1;
					if (targetPixels[index] !== 255) targetTransparent += 1;
				}
				if (sourceTransparent || targetTransparent) {
					return {
						comparable: false,
						reason: `Transparent pixels: source ${sourceTransparent}, target ${targetTransparent}.`,
					};
				}
				const diff = document.querySelector("#diff");
				diff.width = width;
				diff.height = height;
				const diffContext = diff.getContext("2d");
				const diffImage = diffContext.createImageData(width, height);
				let changedPixels = 0;
				let thresholdChangedPixels = 0;
				let sumAbsoluteDelta = 0;
				let maxChannelDelta = 0;
				for (let index = 0; index < sourcePixels.length; index += 4) {
					let changed = false;
					let thresholdChanged = false;
					let pixelMax = 0;
					for (let channel = 0; channel < 3; channel += 1) {
						const delta = Math.abs(
							sourcePixels[index + channel] - targetPixels[index + channel],
						);
						changed ||= delta > 0;
						thresholdChanged ||= delta >= thresholdValue;
						pixelMax = Math.max(pixelMax, delta);
						maxChannelDelta = Math.max(maxChannelDelta, delta);
						sumAbsoluteDelta += delta;
					}
					if (changed) changedPixels += 1;
					if (thresholdChanged) thresholdChangedPixels += 1;
					const intensity = Math.min(255, pixelMax * 4);
					diffImage.data[index] = intensity;
					diffImage.data[index + 1] = changed ? 18 : 0;
					diffImage.data[index + 2] = changed ? 35 : 0;
					diffImage.data[index + 3] = 255;
				}
				diffContext.putImageData(diffImage, 0, 0);
				const overlay = document.querySelector("#overlay");
				overlay.width = width;
				overlay.height = height;
				const overlayContext = overlay.getContext("2d");
				overlayContext.drawImage(sourceImage, 0, 0);
				overlayContext.globalAlpha = 0.5;
				overlayContext.drawImage(targetImage, 0, 0);
				const side = document.querySelector("#side");
				const margin = 20;
				const gap = 24;
				const labelHeight = 44;
				side.width = width * 2 + gap + margin * 2;
				side.height = height + labelHeight + margin;
				const sideContext = side.getContext("2d");
				sideContext.fillStyle = "#f4f4f5";
				sideContext.fillRect(0, 0, side.width, side.height);
				sideContext.fillStyle = "#18181b";
				sideContext.font = "600 15px Arial, sans-serif";
				sideContext.fillText(sourceLabelValue, margin, 28);
				sideContext.fillText(targetLabelValue, margin + width + gap, 28);
				sideContext.drawImage(sourceImage, margin, labelHeight);
				sideContext.drawImage(targetImage, margin + width + gap, labelHeight);
				const totalPixels = width * height;
				return {
					comparable: true,
					dimensions: { width, height },
					outputDimensions: { width: side.width, height: side.height },
					metrics: {
						changedPixels,
						changedPixelRatio: changedPixels / totalPixels,
						matchRating: Number(
							(100 * (1 - changedPixels / totalPixels)).toFixed(4),
						),
						meanAbsoluteChannelDelta: sumAbsoluteDelta / (totalPixels * 3),
						maxChannelDelta,
						threshold: thresholdValue,
						thresholdChangedPixels,
						thresholdChangedPixelRatio: thresholdChangedPixels / totalPixels,
						totalPixels,
					},
				};
			},
			{
				sourceUrl: dataUrl(source),
				targetUrl: dataUrl(target),
				sourceLabelValue: sourceLabel,
				targetLabelValue: targetLabel,
				thresholdValue: threshold,
			},
		);
		const output = {
			diff: path.join(outputRoot, "diff.png"),
			overlay: path.join(outputRoot, "overlay.png"),
			sideBySide: path.join(outputRoot, "side-by-side.png"),
		};
		if (!comparison.comparable)
			return { verdict: "incomparable", ...comparison, output };
		await page.setViewportSize(comparison.outputDimensions);
		await Promise.all([
			page.locator("#diff").screenshot({ path: output.diff }),
			page.locator("#overlay").screenshot({ path: output.overlay }),
			page.locator("#side").screenshot({ path: output.sideBySide }),
		]);
		return {
			verdict: comparison.metrics.changedPixels === 0 ? "exact" : "residual",
			...comparison,
			output,
		};
	} finally {
		await context.close();
	}
}

const options = parseArgs(process.argv.slice(2));
if (options.help) {
	process.stdout.write(`${usage()}\n`);
	process.exit(0);
}
const matrixPath = path.resolve(required(options, "matrix"));
const outputRoot = path.resolve(required(options, "out"));
const threshold = Number(options.threshold ?? DEFAULT_THRESHOLD);
if (!Number.isInteger(threshold) || threshold < 0 || threshold > 255)
	throw new Error("--threshold must be an integer from 0 to 255.");
const matrix = JSON.parse(await fs.readFile(matrixPath, "utf8"));
if (!Array.isArray(matrix.cases) || matrix.cases.length === 0)
	throw new Error("matrix.cases must be a non-empty array.");
const cases = options.case
	? matrix.cases.filter((item) => item.id === options.case)
	: matrix.cases;
if (cases.length === 0)
	throw new Error(`No matrix case named ${options.case}.`);
await fs.mkdir(outputRoot, { recursive: true });
const { chromium, modulePath } = await loadPlaywright();
const browser = await chromium.launch({ headless: true });
try {
	const results = [];
	for (const caseDefinition of cases) {
		if (!caseDefinition.id || !caseDefinition.source || !caseDefinition.target)
			throw new Error("Every matrix case needs id, source, and target.");
		const caseRoot = path.join(outputRoot, caseDefinition.id);
		await fs.mkdir(caseRoot, { recursive: true });
		const sourcePath = path.join(caseRoot, "source.png");
		const targetPath = path.join(caseRoot, "target.png");
		const [sourceCapture, targetCapture] = await Promise.all([
			captureEndpoint({
				browser,
				endpoint: caseDefinition.source,
				caseDefinition,
				outputPath: sourcePath,
				matrixPath,
			}),
			captureEndpoint({
				browser,
				endpoint: caseDefinition.target,
				caseDefinition,
				outputPath: targetPath,
				matrixPath,
			}),
		]);
		const result = await comparePair({
			browser,
			outputRoot: caseRoot,
			sourceLabel:
				caseDefinition.source.label ?? matrix.source?.label ?? "Source",
			targetLabel:
				caseDefinition.target.label ?? matrix.target?.label ?? "Target",
			sourcePath,
			targetPath,
			threshold,
		});
		const packet = {
			case: caseDefinition.id,
			sourceCapture,
			targetCapture,
			...result,
		};
		await fs.writeFile(
			path.join(caseRoot, "metrics.json"),
			`${JSON.stringify(packet, null, 2)}\n`,
		);
		results.push(packet);
	}
	const summary = {
		schemaVersion: 1,
		matrix: matrixPath,
		playwrightModulePath: modulePath,
		threshold,
		cases: results,
	};
	await fs.writeFile(
		path.join(outputRoot, "summary.json"),
		`${JSON.stringify(summary, null, 2)}\n`,
	);
	for (const result of results) {
		const rating = result.metrics
			? `${result.metrics.matchRating.toFixed(4)}%`
			: "n/a";
		process.stdout.write(
			`${result.case}\t${result.verdict}\tmatch ${rating}\n`,
		);
	}
	if (
		options.requireExact &&
		results.some((result) => result.verdict !== "exact")
	)
		process.exitCode = 1;
} finally {
	await browser.close();
}
