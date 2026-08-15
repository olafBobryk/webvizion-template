#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Tiktoken } from "js-tiktoken/lite";
import o200kBase from "js-tiktoken/ranks/o200k_base";

const rootDirectory = process.cwd();
const defaultDataOutput =
	"src/app/(site)/(dev)/internal/playground/footprint/_data/repository-footprint.json";
const generatedFootprintCommitSubjects = new Set([
	"chore: update commit history charts",
	"chore: update commit line delta chart",
	"chore: update repository footprint",
]);
const excludedExactPaths = new Set([
	"package-lock.json",
	"src/app/(site)/(dev)/internal/playground/footprint/_data/repository-footprint.json",
]);
const excludedPathPatterns = [
	/(^|\/)node_modules(\/|$)/,
	/(^|\/)\.next(?:-|\/|$)/,
	/(^|\/)(?:build|coverage|dist)(\/|$)/,
	/(^|\/)(?:\.template-intelligence|\.serena|\.understand-anything)(\/|$)/,
	/(^|\/)_data\//,
	/\.generated\.[^/]+$/,
	/^docs\/assets\//,
	/^public\//,
];
const textDecoder = new TextDecoder("utf-8", { fatal: true });
const encoder = new Tiktoken(o200kBase);
const metricsByBlob = new Map();

function getArgument(name, fallback) {
	const index = process.argv.indexOf(name);
	if (index === -1) return fallback;
	const value = process.argv[index + 1];
	if (!value) throw new Error(`Expected a path after ${name}.`);
	return value;
}

function git(args, options = {}) {
	return execFileSync("git", args, {
		cwd: rootDirectory,
		maxBuffer: 1024 * 1024 * 128,
		...options,
	});
}

function isIncludedPath(filePath) {
	return (
		!excludedExactPaths.has(filePath) &&
		!excludedPathPatterns.some((pattern) => pattern.test(filePath))
	);
}

function countPhysicalLines(text) {
	if (text.length === 0) return 0;
	const lineBreakCount = text.match(/\r\n|[\r\n]/g)?.length ?? 0;
	return lineBreakCount + (/(?:\r|\n)$/.test(text) ? 0 : 1);
}

function getTextMetrics(content) {
	if (content.includes(0)) return null;

	try {
		const text = textDecoder.decode(content);
		return {
			lines: countPhysicalLines(text),
			textBytes: content.byteLength,
			tokens: encoder.encode(text).length,
		};
	} catch {
		return null;
	}
}

function parseTree(commitHash) {
	const output = git(["ls-tree", "-r", "-z", "--long", commitHash], {
		encoding: null,
	});

	return output
		.toString("utf8")
		.split("\0")
		.filter(Boolean)
		.flatMap((entry) => {
			const match = entry.match(/^\d+ blob ([0-9a-f]{40})\s+\d+\t(.+)$/);
			if (!match) return [];
			const [, blobHash, filePath] = match;
			return isIncludedPath(filePath) ? [{ blobHash, filePath }] : [];
		});
}

function loadMissingBlobMetrics(blobHashes) {
	const missingHashes = [...new Set(blobHashes)].filter(
		(blobHash) => !metricsByBlob.has(blobHash),
	);
	if (missingHashes.length === 0) return;

	const output = git(["cat-file", "--batch"], {
		encoding: null,
		input: `${missingHashes.join("\n")}\n`,
	});
	let offset = 0;

	for (const expectedHash of missingHashes) {
		const headerEnd = output.indexOf(0x0a, offset);
		if (headerEnd === -1) {
			throw new Error(`Missing object header for ${expectedHash}.`);
		}

		const header = output.subarray(offset, headerEnd).toString("utf8");
		const match = header.match(/^([0-9a-f]{40}) blob (\d+)$/);
		if (!match) throw new Error(`Unexpected object header: ${header}`);
		const [, blobHash, size] = match;
		const contentStart = headerEnd + 1;
		const contentEnd = contentStart + Number(size);
		metricsByBlob.set(
			blobHash,
			getTextMetrics(output.subarray(contentStart, contentEnd)),
		);
		offset = contentEnd + 1;
	}
}

function measureCommit(commit) {
	const files = parseTree(commit.hash);
	loadMissingBlobMetrics(files.map((file) => file.blobHash));

	return files.reduce(
		(totals, file) => {
			const metrics = metricsByBlob.get(file.blobHash);
			if (!metrics) return totals;
			totals.files += 1;
			totals.lines += metrics.lines;
			totals.textBytes += metrics.textBytes;
			totals.tokens += metrics.tokens;
			return totals;
		},
		{ files: 0, lines: 0, textBytes: 0, tokens: 0 },
	);
}

function getCommits() {
	const output = git(
		[
			"log",
			"--reverse",
			"--topo-order",
			"--format=%H%x09%ad%x09%s",
			"--date=short",
			"HEAD",
		],
		{ encoding: "utf8" },
	);

	return output
		.trim()
		.split("\n")
		.filter(Boolean)
		.flatMap((line) => {
			const [hash, date, subject] = line.split("\t", 3);
			if (generatedFootprintCommitSubjects.has(subject)) return [];
			return [{ date, hash, subject }];
		});
}

function writeOutput(outputPath, content) {
	const resolvedOutput = path.resolve(rootDirectory, outputPath);
	mkdirSync(path.dirname(resolvedOutput), { recursive: true });
	writeFileSync(resolvedOutput, content);
	return path.relative(rootDirectory, resolvedOutput);
}

const dataOutputPath = getArgument("--data-output", defaultDataOutput);
const snapshots = getCommits().map((commit) => ({
	...commit,
	...measureCommit(commit),
}));

if (snapshots.length === 0) {
	throw new Error("No authored commits were found at HEAD.");
}

const dataOutput = writeOutput(
	dataOutputPath,
	`${JSON.stringify(
		{
			encoding: "o200k_base",
			head: snapshots.at(-1).hash,
			scope: "all-authored-text",
			snapshots,
			version: 1,
		},
		null,
		"\t",
	)}\n`,
);

console.log(
	`Wrote ${dataOutput} for ${snapshots.length} authored commits using o200k_base.`,
);
