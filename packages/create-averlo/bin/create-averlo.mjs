#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createProject } from "../lib/create-project.mjs";
import { parseCliArgs, resolveCliOptions } from "../lib/options.mjs";
import { createPrompt } from "../lib/prompt.mjs";

const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

async function readJson(relativePath) {
	return JSON.parse(
		await fs.readFile(path.join(packageRoot, relativePath), "utf8"),
	);
}

function printHelp() {
	console.log(`Usage: create-averlo <project-directory> [options]

Options:
  --profile <id>    full, app-only, marketing-only, or thin-start
  --content <mode>  static or payload-ready; defaults to the profile setting
  --no-install      Generate the lockfile without installing dependencies
  --help            Show this help
  --version         Show the package version

Agents and other non-interactive callers must provide the project directory and --profile.`);
}

async function main() {
	const parsed = parseCliArgs(process.argv.slice(2));
	const pkg = await readJson("package.json");
	if (parsed.help) {
		printHelp();
		return;
	}
	if (parsed.version) {
		console.log(pkg.version);
		return;
	}
	const metadata = process.env.CREATE_AVERLO_METADATA_PATH
		? JSON.parse(
				await fs.readFile(
					path.resolve(process.env.CREATE_AVERLO_METADATA_PATH),
					"utf8",
				),
			)
		: await readJson("dist/template-metadata.json");
	const interactive =
		process.stdin.isTTY === true && process.stdout.isTTY === true;
	const prompt = interactive
		? createPrompt(process.stdin, process.stdout)
		: null;
	let options;
	try {
		options = await resolveCliOptions({
			cwd: process.cwd(),
			interactive,
			metadata,
			parsed,
			prompt,
		});
	} finally {
		prompt?.close();
	}

	const result = await createProject(options, metadata);
	console.log(`\nAverlo project created successfully.
- path: ${result.targetRoot}
- profile: ${result.profile}
- content: ${result.content}
- template commit: ${result.templateCommit}
- dependencies: ${result.installed ? "installed" : "lockfile only"}
- git: main, one initial commit, no remote

Next:
  cd ${JSON.stringify(result.targetRoot)}${result.installed ? "" : "\n  npm install"}
  npm run dev`);
}

main().catch((error) => {
	console.error(`\ncreate-averlo failed: ${error.message}`);
	process.exitCode = 1;
});
