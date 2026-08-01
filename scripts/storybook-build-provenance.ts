#!/usr/bin/env tsx

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const includedRootFiles = [
	"components.json",
	"next.config.ts",
	"package-lock.json",
	"package.json",
	"postcss.config.mjs",
	"tsconfig.json",
];

function collectFiles(directory: string): string[] {
	if (!fs.existsSync(directory)) return [];
	return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const entryPath = path.join(directory, entry.name);
		return entry.isDirectory() ? collectFiles(entryPath) : [entryPath];
	});
}

export function getStorybookBuildFingerprint(root = process.cwd()) {
	const files = [
		...includedRootFiles.map((file) => path.join(root, file)),
		...collectFiles(path.join(root, ".storybook")),
		...collectFiles(path.join(root, "src")),
	]
		.filter((file) => fs.existsSync(file))
		.sort();
	const hash = createHash("sha256");
	for (const file of files) {
		hash.update(path.relative(root, file).replaceAll(path.sep, "/"));
		hash.update("\0");
		hash.update(fs.readFileSync(file));
		hash.update("\0");
	}
	return { fileCount: files.length, fingerprint: hash.digest("hex") };
}

function writeProvenance() {
	const root = process.cwd();
	const outputPath = path.join(
		root,
		"storybook-static",
		"averlo-build-provenance.json",
	);
	const provenance = {
		...getStorybookBuildFingerprint(root),
		generatedAt: new Date().toISOString(),
		schemaVersion: 1,
	};
	fs.writeFileSync(outputPath, `${JSON.stringify(provenance, null, 2)}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) writeProvenance();
