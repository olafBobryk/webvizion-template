import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, "../../../../../");
const assessScript = path.resolve(testDirectory, "../scripts/assess.mjs");
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function crc32(buffer) {
	let crc = 0xffffffff;
	for (const byte of buffer) {
		crc ^= byte;
		for (let bit = 0; bit < 8; bit += 1)
			crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
	}
	return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
	const name = Buffer.from(type, "ascii");
	const length = Buffer.alloc(4);
	length.writeUInt32BE(data.length);
	const checksum = Buffer.alloc(4);
	checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
	return Buffer.concat([length, name, data, checksum]);
}

function png(width, height, pixels) {
	assert.equal(pixels.length, width * height);
	const header = Buffer.alloc(13);
	header.writeUInt32BE(width, 0);
	header.writeUInt32BE(height, 4);
	header[8] = 8;
	header[9] = 6;
	const rows = [];
	for (let y = 0; y < height; y += 1) {
		rows.push(Buffer.from([0]));
		rows.push(Buffer.from(pixels.slice(y * width, (y + 1) * width).flat()));
	}
	return Buffer.concat([
		signature,
		chunk("IHDR", header),
		chunk("IDAT", deflateSync(Buffer.concat(rows))),
		chunk("IEND", Buffer.alloc(0)),
	]);
}

async function writePng(directory, name, width, height, pixels) {
	const filePath = path.join(directory, name);
	await fs.writeFile(filePath, png(width, height, pixels));
	return filePath;
}

function runAssess(matrix, output, extra = []) {
	return spawnSync(
		process.execPath,
		[assessScript, "--matrix", matrix, "--out", output, ...extra],
		{ cwd: repositoryRoot, encoding: "utf8" },
	);
}

test("reports mechanical pixel measurements, compatibility, and cropped evidence", async (t) => {
	const directory = await fs.mkdtemp(path.join(os.tmpdir(), "averlo-assess-"));
	t.after(() => fs.rm(directory, { recursive: true, force: true }));
	const black = [0, 0, 0, 255];
	const red = [255, 0, 0, 255];
	const blue = [0, 0, 255, 255];
	const changed = [1, 2, 3, 255];
	const transparent = [0, 0, 0, 128];
	await Promise.all([
		writePng(directory, "black-2.png", 2, 1, [black, black]),
		writePng(directory, "changed-2.png", 2, 1, [black, changed]),
		writePng(directory, "black-1.png", 1, 1, [black]),
		writePng(directory, "transparent.png", 1, 1, [transparent]),
		writePng(directory, "red-blue.png", 2, 1, [red, blue]),
		writePng(directory, "blue.png", 1, 1, [blue]),
	]);
	const matrixPath = path.join(directory, "matrix.json");
	await fs.writeFile(
		matrixPath,
		JSON.stringify({
			cases: [
				{
					id: "identical",
					source: { image: "black-2.png" },
					target: { image: "black-2.png" },
				},
				{
					id: "one-pixel",
					source: { image: "black-2.png" },
					target: { image: "changed-2.png" },
				},
				{
					id: "dimension-mismatch",
					source: { image: "black-2.png" },
					target: { image: "black-1.png" },
				},
				{
					id: "alpha-mismatch",
					source: { image: "black-1.png" },
					target: { image: "transparent.png" },
				},
				{
					id: "cropped",
					source: {
						image: "red-blue.png",
						crop: { x: 1, y: 0, width: 1, height: 1 },
					},
					target: { image: "blue.png" },
				},
			],
		}),
	);
	const output = path.join(directory, "assessment");
	const result = runAssess(matrixPath, output, ["--threshold", "2"]);
	assert.equal(result.status, 0, `${result.stderr}\n${result.stdout}`);
	const summary = JSON.parse(
		await fs.readFile(path.join(output, "summary.json"), "utf8"),
	);
	assert.equal(summary.schemaVersion, 2);
	assert.doesNotMatch(JSON.stringify(summary), /verdict|matchRating/);
	const byId = Object.fromEntries(
		summary.cases.map((item) => [item.case, item]),
	);
	assert.equal(byId.identical.comparable, true);
	assert.equal(byId.identical.metrics.changedPixels, 0);
	assert.equal(byId["one-pixel"].metrics.changedPixels, 1);
	assert.equal(byId["one-pixel"].metrics.changedPixelRatio, 0.5);
	assert.equal(byId["one-pixel"].metrics.thresholdChangedPixels, 1);
	assert.equal(byId["one-pixel"].metrics.thresholdChangedPixelRatio, 0.5);
	assert.equal(byId["one-pixel"].metrics.meanAbsoluteChannelDelta, 1);
	assert.equal(byId["one-pixel"].metrics.maxChannelDelta, 3);
	assert.equal(byId["dimension-mismatch"].comparable, false);
	assert.match(byId["dimension-mismatch"].reason, /Dimension mismatch/);
	assert.equal(byId["alpha-mismatch"].comparable, false);
	assert.match(byId["alpha-mismatch"].reason, /Transparent pixels/);
	assert.equal(byId.cropped.comparable, true);
	assert.deepEqual(byId.cropped.dimensions, { width: 1, height: 1 });
	assert.equal(byId.cropped.metrics.changedPixels, 0);
	assert.deepEqual(byId.cropped.sourceCapture.crop, {
		x: 1,
		y: 0,
		width: 1,
		height: 1,
	});
	for (const id of ["identical", "one-pixel", "cropped"]) {
		for (const artifact of [
			"source",
			"target",
			"overlay",
			"heatmap",
			"sideBySide",
		])
			await fs.access(byId[id].output[artifact]);
	}
});

test("rejects the retired exact-gate flag", async (t) => {
	const directory = await fs.mkdtemp(path.join(os.tmpdir(), "averlo-assess-"));
	t.after(() => fs.rm(directory, { recursive: true, force: true }));
	const matrix = path.join(directory, "matrix.json");
	await fs.writeFile(matrix, JSON.stringify({ cases: [] }));
	const result = runAssess(matrix, path.join(directory, "assessment"), [
		"--require-exact",
	]);
	assert.notEqual(result.status, 0);
	assert.match(result.stderr, /--require-exact has been retired/);
});
