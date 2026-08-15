#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

export const DEFAULT_CONFIG_PATH = path.join(
	os.homedir(),
	".config/averlo/publish-project.json",
);

function assertRecord(value, label) {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		throw new Error(`${label} must be an object.`);
	}
	return value;
}

function assertString(value, label, pattern) {
	if (
		typeof value !== "string" ||
		!value ||
		(pattern && !pattern.test(value))
	) {
		throw new Error(`${label} is invalid.`);
	}
	return value;
}

export function validateConfig(value) {
	const config = assertRecord(value, "Configuration");
	if (config.schemaVersion !== 1) {
		throw new Error("Configuration schemaVersion must be 1.");
	}
	const gitlab = assertRecord(config.gitlab, "gitlab");
	const vercel = assertRecord(config.vercel, "vercel");
	const host = assertString(
		gitlab.host,
		"gitlab.host",
		/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/iu,
	);
	const namespace = assertString(
		gitlab.namespace,
		"gitlab.namespace",
		/^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?(?:\/[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?)*$/u,
	);
	if (gitlab.visibility !== "private") {
		throw new Error("gitlab.visibility must be private.");
	}
	if (!new Set(["https", "ssh"]).has(gitlab.protocol)) {
		throw new Error("gitlab.protocol must be https or ssh.");
	}
	const remote = assertString(
		gitlab.remote,
		"gitlab.remote",
		/^[a-z0-9][a-z0-9._-]*$/iu,
	);
	const team = assertString(
		vercel.team,
		"vercel.team",
		/^[a-z0-9][a-z0-9-]*$/u,
	);
	if (vercel.deployment !== "production") {
		throw new Error("vercel.deployment must be production.");
	}
	if (config.confirmBeforePublish !== true) {
		throw new Error("confirmBeforePublish must be true.");
	}
	return {
		schemaVersion: 1,
		gitlab: {
			host,
			namespace,
			visibility: "private",
			protocol: gitlab.protocol,
			remote,
		},
		vercel: { team, deployment: "production" },
		confirmBeforePublish: true,
	};
}

export async function readConfig(configPath = DEFAULT_CONFIG_PATH) {
	const resolved = path.resolve(configPath);
	let stat;
	try {
		stat = await fs.stat(resolved);
	} catch {
		throw new Error(`Publish configuration was not found: ${resolved}`);
	}
	if (!stat.isFile())
		throw new Error(`Publish configuration is not a file: ${resolved}`);
	if (process.platform !== "win32" && (stat.mode & 0o077) !== 0) {
		throw new Error(
			`Publish configuration must be owner-only (chmod 600): ${resolved}`,
		);
	}
	let parsed;
	try {
		parsed = JSON.parse(await fs.readFile(resolved, "utf8"));
	} catch {
		throw new Error(`Publish configuration is not valid JSON: ${resolved}`);
	}
	return { config: validateConfig(parsed), configPath: resolved };
}

async function readJson(filePath, label) {
	try {
		return JSON.parse(await fs.readFile(filePath, "utf8"));
	} catch {
		throw new Error(`${label} is missing or invalid: ${filePath}`);
	}
}

async function exists(targetPath) {
	return fs.access(targetPath).then(
		() => true,
		() => false,
	);
}

function git(projectRoot, args) {
	try {
		return execFileSync("git", args, {
			cwd: projectRoot,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
		}).trim();
	} catch {
		throw new Error(`Git preflight failed: git ${args.join(" ")}`);
	}
}

function repositoryUrl(config, projectName) {
	const projectPath = `${config.gitlab.namespace}/${projectName}`;
	return config.gitlab.protocol === "ssh"
		? `git@${config.gitlab.host}:${projectPath}.git`
		: `https://${config.gitlab.host}/${projectPath}.git`;
}

export async function preflightProject({
	projectRoot,
	configPath = DEFAULT_CONFIG_PATH,
}) {
	if (!projectRoot) throw new Error("--project is required for preflight.");
	const resolvedRoot = path.resolve(projectRoot);
	const stat = await fs.stat(resolvedRoot).catch(() => null);
	if (!stat?.isDirectory()) {
		throw new Error(`Project directory was not found: ${resolvedRoot}`);
	}
	const { config, configPath: resolvedConfigPath } =
		await readConfig(configPath);
	const pkg = await readJson(
		path.join(resolvedRoot, "package.json"),
		"package.json",
	);
	const receipt = await readJson(
		path.join(resolvedRoot, ".template-profile.json"),
		"Averlo receipt",
	);
	const projectName = path.basename(resolvedRoot);
	if (
		pkg.name !== projectName ||
		!/^[a-z0-9][a-z0-9._-]*$/u.test(projectName)
	) {
		throw new Error(
			`Project package name must equal its lowercase directory basename: ${projectName}`,
		);
	}
	if (receipt.schemaVersion !== 2 || typeof receipt.profile !== "string") {
		throw new Error("Project does not have a valid schema-2 Averlo receipt.");
	}
	for (const requiredPath of ["PRODUCT.md", "docs/README.md"]) {
		if (!(await exists(path.join(resolvedRoot, requiredPath)))) {
			throw new Error(`Generated project is missing ${requiredPath}.`);
		}
	}
	if (git(resolvedRoot, ["branch", "--show-current"]) !== "main") {
		throw new Error("Project must be on main.");
	}
	if (git(resolvedRoot, ["status", "--porcelain"])) {
		throw new Error("Project must be clean before publishing.");
	}
	if (git(resolvedRoot, ["remote"])) {
		throw new Error("Project already has a Git remote.");
	}
	if (await exists(path.join(resolvedRoot, ".vercel"))) {
		throw new Error("Project is already linked to Vercel.");
	}
	const commit = git(resolvedRoot, ["rev-parse", "HEAD"]);
	return {
		configPath: resolvedConfigPath,
		projectRoot: resolvedRoot,
		projectName,
		profile: receipt.profile,
		content: receipt.content,
		commit,
		gitlab: {
			host: config.gitlab.host,
			namespace: config.gitlab.namespace,
			visibility: config.gitlab.visibility,
			protocol: config.gitlab.protocol,
			remote: config.gitlab.remote,
			repository: `${config.gitlab.namespace}/${projectName}`,
			repositoryUrl: repositoryUrl(config, projectName),
		},
		vercel: {
			team: config.vercel.team,
			project: projectName,
			deployment: config.vercel.deployment,
		},
		confirmationRequired: config.confirmBeforePublish,
	};
}

function parseArgs(argv) {
	const parsed = {
		command: argv[0],
		configPath: DEFAULT_CONFIG_PATH,
		json: false,
	};
	for (let index = 1; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === "--config" || arg === "--project") {
			const value = argv[index + 1];
			if (!value || value.startsWith("--"))
				throw new Error(`${arg} requires a value.`);
			if (arg === "--config") parsed.configPath = value;
			else parsed.projectRoot = value;
			index += 1;
		} else if (arg === "--json") parsed.json = true;
		else throw new Error(`Unknown option: ${arg}`);
	}
	return parsed;
}

function printHuman(result) {
	if (result.projectRoot) {
		console.log(`Publish preflight passed.
- project: ${result.projectRoot}
- commit: ${result.commit}
- GitLab: ${result.gitlab.host}/${result.gitlab.repository} (${result.gitlab.visibility})
- remote: ${result.gitlab.remote} via ${result.gitlab.protocol}
- Vercel: ${result.vercel.team}/${result.vercel.project}
- deployment: ${result.vercel.deployment}
- confirmation required: yes`);
		return;
	}
	console.log(`Publish configuration is valid.
- config: ${result.configPath}
- GitLab: ${result.config.gitlab.host}/${result.config.gitlab.namespace} (${result.config.gitlab.visibility})
- Vercel team: ${result.config.vercel.team}
- deployment: ${result.config.vercel.deployment}
- confirmation required: yes`);
}

async function main() {
	const parsed = parseArgs(process.argv.slice(2));
	let result;
	if (parsed.command === "config") {
		result = await readConfig(parsed.configPath);
	} else if (parsed.command === "preflight") {
		result = await preflightProject(parsed);
	} else {
		throw new Error(
			"Usage: publish-project.mjs config|preflight [--config <path>] [--project <path>] [--json]",
		);
	}
	if (parsed.json) console.log(JSON.stringify(result, null, 2));
	else printHuman(result);
}

if (
	process.argv[1] &&
	pathToFileURL(process.argv[1]).href === import.meta.url
) {
	main().catch((error) => {
		console.error(`publish-project preflight failed: ${error.message}`);
		process.exitCode = 1;
	});
}
