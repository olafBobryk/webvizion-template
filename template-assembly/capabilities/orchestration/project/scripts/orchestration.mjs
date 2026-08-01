#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const TOOL_FROM_PRODUCT_ROOT = "docs/orchestration/_tools/orchestration.mjs";
const productRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
);
const invocationRoot = process.env.INIT_CWD
	? path.resolve(process.env.INIT_CWD)
	: process.cwd();
const orchestrationRoot = resolveOrchestrationRoot();

if (!orchestrationRoot) {
	console.error(
		"No orchestration capability is installed for this project or a validated linked worktree.",
	);
	console.error(
		"Set ORCHESTRATION_ROOT explicitly or reinstall the legacy capability from the canonical template.",
	);
	process.exit(1);
}

const tool = path.join(orchestrationRoot, "_tools/orchestration.mjs");
const result = spawnSync(process.execPath, [tool, ...process.argv.slice(2)], {
	cwd: invocationRoot,
	env: { ...process.env, ORCHESTRATION_ROOT: orchestrationRoot },
	stdio: "inherit",
});

process.exit(result.status ?? 1);

function resolveOrchestrationRoot() {
	if (process.env.ORCHESTRATION_ROOT) {
		const explicitRoot = path.resolve(process.env.ORCHESTRATION_ROOT);
		return hasTool(explicitRoot) ? explicitRoot : null;
	}

	const ownRoot = path.join(productRoot, "docs/orchestration");
	if (hasTool(ownRoot)) return ownRoot;

	// Linked-worktree fallback is allowed only when the installed shim itself is
	// at a Git worktree root. A generated project nested inside the template
	// therefore cannot borrow the parent template's orchestration root.
	if (
		gitOutput(productRoot, ["rev-parse", "--show-toplevel"]) !== productRoot
	) {
		return null;
	}
	const invocationGitRoot = gitOutput(invocationRoot, [
		"rev-parse",
		"--show-toplevel",
	]);
	if (!invocationGitRoot || invocationGitRoot === productRoot) return null;
	const linkedRoots = gitOutput(productRoot, [
		"worktree",
		"list",
		"--porcelain",
	])
		.split("\n")
		.filter((line) => line.startsWith("worktree "))
		.map((line) => path.resolve(line.slice("worktree ".length)));
	if (!linkedRoots.includes(invocationGitRoot)) return null;
	if (
		gitCommonDir(productRoot) !== gitCommonDir(invocationGitRoot) ||
		!existsSync(path.join(invocationGitRoot, TOOL_FROM_PRODUCT_ROOT))
	) {
		return null;
	}
	return path.join(invocationGitRoot, "docs/orchestration");
}

function hasTool(root) {
	return existsSync(path.join(root, "_tools/orchestration.mjs"));
}

function gitCommonDir(root) {
	const commonDir = gitOutput(root, ["rev-parse", "--git-common-dir"]);
	return commonDir ? path.resolve(root, commonDir) : "";
}

function gitOutput(cwd, args) {
	try {
		return execFileSync("git", args, {
			cwd,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		}).trim();
	} catch {
		return "";
	}
}
