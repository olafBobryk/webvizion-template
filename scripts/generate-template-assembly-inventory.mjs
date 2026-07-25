#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

async function walkFiles(root, current = root) {
	const entries = await fs.readdir(current, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const absolutePath = path.join(current, entry.name);
		if (entry.isDirectory())
			files.push(...(await walkFiles(root, absolutePath)));
		else files.push(path.relative(root, absolutePath));
	}
	return files;
}

async function main() {
	const [sourceArg, outputArg] = process.argv.slice(2);
	if (!sourceArg || !outputArg) {
		throw new Error(
			"Usage: node scripts/generate-template-assembly-inventory.mjs <materialized-src> <output-json>",
		);
	}

	const sourceRoot = path.resolve(sourceArg);
	const outputPath = path.resolve(outputArg);
	const files = (await walkFiles(sourceRoot))
		.map((relativePath) => `src/${relativePath}`)
		.sort();
	await fs.mkdir(path.dirname(outputPath), { recursive: true });
	await fs.writeFile(outputPath, `${JSON.stringify(files, null, "\t")}\n`);
	console.log(`Wrote ${files.length} positive source paths to ${outputPath}`);
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
