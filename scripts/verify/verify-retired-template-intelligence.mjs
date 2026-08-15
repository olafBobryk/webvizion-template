#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const verifierPath = "scripts/verify/verify-retired-template-intelligence.mjs";
const historicalRunsPath =
	"docs/benchmarks/history/template-intelligence-runs.jsonl";
const benchmarksIndexPath = "docs/benchmarks/README.md";
const allowedPaths = new Set([
	verifierPath,
	"scripts/verify/verify-retired-semantic-service.mjs",
	historicalRunsPath,
]);
const retiredContentTokens = [
	"template intelligence",
	".template-intelligence",
	"/internal/intelligence",
	'"intelligence"',
	"intelligence:generate",
	"intelligence:ensure",
	"intelligence:query",
	"intelligence:benchmark",
	"intelligence:record",
	"verify:intelligence",
	"hasintelligence",
	"sitelinks.intelligence",
];

const output = execFileSync(
	"rg",
	[
		"--files",
		"--hidden",
		"--glob",
		"!.git/**",
		"--glob",
		"!**/node_modules/**",
		"--glob",
		"!**/.next*/**",
	],
	{ cwd: root, encoding: "utf8" },
);
const paths = output.split(/\r?\n/u).filter(Boolean).sort();
const violations = [];

for (const relativePath of paths) {
	if (allowedPaths.has(relativePath)) continue;
	const absolutePath = path.join(root, relativePath);
	if (!(await fs.stat(absolutePath).catch(() => null))) continue;
	const content = await fs.readFile(absolutePath, "utf8").catch(() => null);
	if (relativePath === benchmarksIndexPath) {
		if (
			content === null ||
			!content.includes(
				"./history/template-intelligence-runs.jsonl",
			)
		) {
			violations.push(`historical benchmark index: ${relativePath}`);
		}
		continue;
	}

	const normalizedPath = relativePath.toLowerCase();
	const segments = normalizedPath.split("/");
	if (
		normalizedPath.includes("template-intelligence") ||
		segments.includes("intelligence")
	) {
		violations.push(`path: ${relativePath}`);
	}

	if (content === null) continue;
	const normalizedContent = content.toLowerCase();
	for (const token of retiredContentTokens) {
		if (normalizedContent.includes(token)) {
			violations.push(`content (${token}): ${relativePath}`);
		}
	}
}

if (violations.length > 0) {
	throw new Error(
		`Retired Template Intelligence references remain outside historical benchmark evidence:\n${violations.join("\n")}`,
	);
}

console.log(
	"Retired Template Intelligence verification passed: live routes, scripts, hooks, surfaces, and generated artifacts are absent; historical benchmark runs are preserved.",
);
