#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { installOrchestrationCapability } from "../template-assembly/capabilities/orchestration/index.mjs";

const templateRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
);

function parseArgs(argv) {
	const options = { dryRun: false, help: false, target: undefined };
	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === "--target") {
			const value = argv[index + 1];
			if (!value || value.startsWith("--")) {
				throw new Error("--target requires a project directory.");
			}
			options.target = value;
			index += 1;
		} else if (arg === "--dry-run") options.dryRun = true;
		else if (arg === "--help") options.help = true;
		else throw new Error(`Unknown flag: ${arg}`);
	}
	return options;
}

function printUsage() {
	console.log(`Usage: npm run orchestration:init -- --target <project> [--dry-run]

Installs the default-off legacy orchestration capability into canonical main or
a schema-v2 generated project. Existing partial or conflicting state is never
overwritten.`);
}

async function assertSafeTarget(targetRoot) {
	const filesystemRoot = path.parse(targetRoot).root;
	if (
		targetRoot === filesystemRoot ||
		targetRoot === path.resolve(os.homedir())
	) {
		throw new Error(`Refusing unsafe orchestration target: ${targetRoot}`);
	}
	const stat = await fs.lstat(targetRoot).catch(() => null);
	if (!stat?.isDirectory() || stat.isSymbolicLink()) {
		throw new Error(
			`Orchestration target is not a real directory: ${targetRoot}`,
		);
	}
	const pkg = await readJson(path.join(targetRoot, "package.json")).catch(
		() => null,
	);
	const receipt = await readJson(
		path.join(targetRoot, ".template-profile.json"),
	).catch(() => null);
	const canonical =
		targetRoot === templateRoot &&
		pkg?.name === "averlo-next-template" &&
		(await pathExists(path.join(targetRoot, "template-assembly/manifest.mjs")));
	const generated = receipt?.schemaVersion === 2;
	if (!canonical && !generated) {
		throw new Error(
			"Target must be canonical main or a schema-v2 generated project.",
		);
	}
}

function currentCommit() {
	return execFileSync("git", ["rev-parse", "HEAD"], {
		cwd: templateRoot,
		encoding: "utf8",
	}).trim();
}

async function main() {
	const options = parseArgs(process.argv.slice(2));
	if (options.help) {
		printUsage();
		return;
	}
	if (!options.target) throw new Error("--target is required.");
	const targetRoot = path.resolve(process.cwd(), options.target);
	await assertSafeTarget(targetRoot);
	console.log(`Legacy orchestration target: ${targetRoot}`);
	if (options.dryRun) console.log("Dry run: no files will be changed.");
	const result = await installOrchestrationCapability({
		targetRoot,
		sourceCommit: currentCommit(),
		dryRun: options.dryRun,
	});
	if (result.alreadyInstalled) {
		console.log(
			"Legacy orchestration capability is already installed exactly.",
		);
	} else if (options.dryRun) {
		console.log("Legacy orchestration capability can be installed cleanly.");
	} else {
		console.log(
			"Legacy orchestration capability installed with a local nested Git commit.",
		);
	}
}

async function pathExists(targetPath) {
	try {
		await fs.access(targetPath);
		return true;
	} catch {
		return false;
	}
}

async function readJson(filePath) {
	return JSON.parse(await fs.readFile(filePath, "utf8"));
}

main().catch((error) => {
	console.error(`\n${error.message}`);
	process.exit(1);
});
