#!/usr/bin/env node

import { createHash } from "node:crypto";
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
    [--case <case-id>] [--threshold <0-255>]

The matrix declares one authoritative source and one target per case. An
endpoint is either { "image": "/absolute-or-relative/file.png" } or
{ "url": "http://…", "selector": "[data-parity-root]" }. URL endpoints are
captured with Playwright using the case viewport, DPR, theme, and reduced motion.
Image endpoints may include crop: { x, y, width, height }.`;
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
			throw new Error(
				"--require-exact has been retired; interpret measurements in the owning workflow.",
			);
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
	let modulePath;
	try {
		modulePath = requireFromRepository.resolve("playwright");
	} catch {
		modulePath = requireFromRepository.resolve("playwright-core");
	}
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

async function sha256(filePath) {
	return createHash("sha256")
		.update(await fs.readFile(filePath))
		.digest("hex");
}

function dataUrl(buffer) {
	return `data:image/png;base64,${buffer.toString("base64")}`;
}

function validateCrop(crop, caseId) {
	if (!crop) return null;
	for (const key of ["x", "y", "width", "height"]) {
		if (!Number.isInteger(crop[key]))
			throw new Error(`${caseId}: image crop.${key} must be an integer.`);
	}
	if (crop.x < 0 || crop.y < 0 || crop.width <= 0 || crop.height <= 0)
		throw new Error(
			`${caseId}: image crop needs non-negative x/y and positive width/height.`,
		);
	return crop;
}

async function cropImage({ browser, buffer, crop, outputPath, caseId }) {
	const context = await browser.newContext({
		viewport: { width: crop.width, height: crop.height },
	});
	try {
		const page = await context.newPage();
		const croppedDataUrl = await page.evaluate(
			async ({ sourceUrl, cropValue, caseIdValue }) => {
				const image = await new Promise((resolve, reject) => {
					const candidate = new Image();
					candidate.onload = () => resolve(candidate);
					candidate.onerror = () => reject(new Error("Unable to decode PNG."));
					candidate.src = sourceUrl;
				});
				if (
					cropValue.x + cropValue.width > image.naturalWidth ||
					cropValue.y + cropValue.height > image.naturalHeight
				) {
					throw new Error(
						`${caseIdValue}: image crop exceeds ${image.naturalWidth}x${image.naturalHeight} source bounds.`,
					);
				}
				const canvas = document.createElement("canvas");
				canvas.width = cropValue.width;
				canvas.height = cropValue.height;
				canvas
					.getContext("2d")
					.drawImage(
						image,
						cropValue.x,
						cropValue.y,
						cropValue.width,
						cropValue.height,
						0,
						0,
						cropValue.width,
						cropValue.height,
					);
				return canvas.toDataURL("image/png");
			},
			{ sourceUrl: dataUrl(buffer), cropValue: crop, caseIdValue: caseId },
		);
		await fs.writeFile(
			outputPath,
			Buffer.from(croppedDataUrl.split(",", 2)[1], "base64"),
		);
	} finally {
		await context.close();
	}
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
		const buffer = await assertPng(imagePath);
		const crop = validateCrop(endpoint.crop, caseDefinition.id);
		if (crop) {
			await cropImage({
				browser,
				buffer,
				crop,
				outputPath,
				caseId: caseDefinition.id,
			});
		} else {
			await fs.copyFile(imagePath, outputPath);
		}
		return { kind: "image", value: imagePath, ...(crop ? { crop } : {}) };
	}

	if (!endpoint.url)
		throw new Error("Each endpoint needs either image or url.");
	if (endpoint.crop)
		throw new Error(
			`${caseDefinition.id}: crop is supported only for image endpoints; use selector for URL endpoints.`,
		);
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
			source: sourcePath,
			target: targetPath,
		};
		if (!comparison.comparable) return { ...comparison, output };
		Object.assign(output, {
			heatmap: path.join(outputRoot, "heatmap.png"),
			overlay: path.join(outputRoot, "overlay.png"),
			sideBySide: path.join(outputRoot, "side-by-side.png"),
		});
		await page.setViewportSize(comparison.outputDimensions);
		await Promise.all([
			page.locator("#diff").screenshot({ path: output.heatmap }),
			page.locator("#overlay").screenshot({ path: output.overlay }),
			page.locator("#side").screenshot({ path: output.sideBySide }),
		]);
		return { ...comparison, output };
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
		const [sourceSha256, targetSha256] = await Promise.all([
			sha256(sourcePath),
			sha256(targetPath),
		]);
		const packet = {
			case: caseDefinition.id,
			sourceCapture: { ...sourceCapture, sha256: sourceSha256 },
			targetCapture: { ...targetCapture, sha256: targetSha256 },
			...result,
		};
		await fs.writeFile(
			path.join(caseRoot, "metrics.json"),
			`${JSON.stringify(packet, null, 2)}\n`,
		);
		results.push(packet);
	}
	const summary = {
		schemaVersion: 2,
		measuredAt: new Date().toISOString(),
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
		const measurement = result.metrics
			? `changed ${result.metrics.changedPixels}/${result.metrics.totalPixels}\tmean-delta ${result.metrics.meanAbsoluteChannelDelta.toFixed(6)}`
			: `not-comparable\t${result.reason}`;
		process.stdout.write(`${result.case}\t${measurement}\n`);
	}
} finally {
	await browser.close();
}
