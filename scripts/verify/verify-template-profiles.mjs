#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { templateProfiles } from "../../template-profiles/index.mjs";

const VERIFIED_PROFILES = ["full", "app-only", "marketing-only", "thin-start"];

function parseArgs(argv) {
	const options = { integration: false, keep: false };
	for (const arg of argv) {
		if (arg === "--integration") options.integration = true;
		else if (arg === "--keep") options.keep = true;
		else throw new Error(`Unknown flag: ${arg}`);
	}
	return options;
}

function run(command, args, cwd) {
	const result = spawnSync(command, args, {
		cwd,
		env: {
			...process.env,
			PATH: `${path.dirname(process.execPath)}${path.delimiter}${process.env.PATH ?? ""}`,
		},
		stdio: "inherit",
	});
	if (result.error) throw result.error;
	if (result.status !== 0) {
		throw new Error(`${command} ${args.join(" ")} exited ${result.status}.`);
	}
}

function runNpm(args, cwd) {
	if (process.env.npm_execpath) {
		run(process.execPath, [process.env.npm_execpath, ...args], cwd);
		return;
	}
	run("npm", args, cwd);
}

function npmRunArgs(command) {
	const parts = command.trim().split(/\s+/);
	if (parts[0] !== "npm" || parts[1] !== "run" || !parts[2]) {
		throw new Error(`Unsupported profile verification command: ${command}`);
	}
	return ["run", ...parts.slice(2)];
}

async function assertReceipt(outputRoot, profileId) {
	const receipt = JSON.parse(
		await fs.readFile(path.join(outputRoot, ".template-profile.json"), "utf8"),
	);
	if (receipt.profile !== profileId || receipt.schemaVersion !== 1) {
		throw new Error(`Invalid profile receipt for ${profileId}.`);
	}
}

async function main() {
	const options = parseArgs(process.argv.slice(2));
	const templateRoot = process.cwd();
	const tempRoot = await fs.mkdtemp(
		path.join(os.tmpdir(), "averlo-template-profile-matrix-"),
	);
	const resolvedTempRoot = path.resolve(tempRoot);
	const resolvedSystemTemp = `${path.resolve(os.tmpdir())}${path.sep}`;
	if (!resolvedTempRoot.startsWith(resolvedSystemTemp)) {
		throw new Error(`Refusing unsafe profile-matrix root: ${tempRoot}`);
	}

	try {
		for (const profileId of VERIFIED_PROFILES) {
			const profile = templateProfiles[profileId];
			const outputRoot = path.join(tempRoot, profileId);
			console.log(`\nMaterializing ${profileId} at ${outputRoot}`);
			run(
				process.execPath,
				[
					"scripts/create-template-profile.mjs",
					"--profile",
					profileId,
					"--output",
					outputRoot,
				],
				templateRoot,
			);
			await assertReceipt(outputRoot, profileId);

			if (!options.integration) continue;
			runNpm(["ci"], outputRoot);
			for (const command of profile.verification.commands) {
				runNpm(npmRunArgs(command), outputRoot);
			}
		}

		console.log(
			options.integration
				? "\nTemplate profile integration matrix passed."
				: "\nTemplate profile materialization matrix passed.",
		);
	} finally {
		if (options.keep) {
			console.log(`Retained profile matrix at ${tempRoot}`);
		} else {
			await fs.rm(resolvedTempRoot, { recursive: true, force: true });
			console.log(`Removed disposable profile matrix ${tempRoot}`);
		}
	}
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
