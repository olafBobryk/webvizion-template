#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import thinStartProfile from "../template-profiles/thin-start/manifest.mjs";

function parseArgs(argv) {
	const options = {
		dryRun: false,
		output: thinStartProfile.defaultOutput,
		random: false,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === "--output") {
			const value = argv[index + 1];
			if (!value || value.startsWith("--")) {
				throw new Error("--output requires a directory path.");
			}
			options.output = value;
			index += 1;
			continue;
		}
		if (arg === "--random") options.random = true;
		else if (arg === "--dry-run") options.dryRun = true;
		else throw new Error(`Unknown flag: ${arg}`);
	}

	return options;
}

function run(command, args, cwd) {
	const result = spawnSync(command, args, { cwd, stdio: "inherit" });
	if (result.error) throw result.error;
	if (result.status !== 0) {
		throw new Error(`${command} ${args.join(" ")} exited ${result.status}.`);
	}
}

async function main() {
	const options = parseArgs(process.argv.slice(2));
	const templateRoot = process.cwd();
	const outputRoot = path.resolve(templateRoot, options.output);
	const createArgs = [
		path.join(templateRoot, "scripts/create-thin-start.mjs"),
		"--output",
		outputRoot,
		"--force",
	];
	if (options.dryRun) createArgs.push("--dry-run");

	run(process.execPath, createArgs, templateRoot);
	if (options.dryRun) return;

	run("npm", ["install"], outputRoot);
	const devArgs = ["run", "dev", "--"];
	if (options.random) devArgs.push("--random");

	const child = spawn("npm", devArgs, {
		cwd: outputRoot,
		stdio: "inherit",
	});
	for (const signal of ["SIGINT", "SIGTERM"]) {
		process.on(signal, () => child.kill(signal));
	}
	child.on("error", (error) => {
		throw error;
	});
	child.on("exit", (code, signal) => {
		if (signal) process.kill(process.pid, signal);
		else process.exit(code ?? 1);
	});
}

main().catch((error) => {
	console.error(`\n${error.message}`);
	process.exit(1);
});
