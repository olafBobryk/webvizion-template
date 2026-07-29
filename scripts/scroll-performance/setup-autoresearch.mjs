#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import process from "node:process";
import {
	DEFAULT_AUTORESEARCH_PASS_LIMIT,
	DEFAULT_TARGET_PATH,
	ensureJsonLineFile,
	getAutoresearchBranchName,
	getAutoresearchWorktreePath,
	normalizeScopePath,
	normalizeTargetPath,
	PRIMARY_METRIC_TOLERANCES,
	READ_ONLY_SCOPE,
	resolveAutoresearchRuntimePaths,
	sanitizeTag,
	writeJsonFile,
} from "./lib/scroll-performance.mjs";

function printUsage() {
	console.log(`Usage: npm run setup:scroll-performance-autoresearch -- --tag <tag> --mutable <path> [options]

Options:
  --tag <tag>                 Required run tag used for branch, worktree, and runtime files
  --path /                    Page path to measure (default: ${DEFAULT_TARGET_PATH})
  --ready-selector "[data]"   Optional selector to wait for before scoring
  --mutable <path>            Allowed candidate mutation scope; repeatable
  --passes 12                 Candidate pass cap (default: ${DEFAULT_AUTORESEARCH_PASS_LIMIT})
  --allow-over-12             Required when --passes exceeds ${DEFAULT_AUTORESEARCH_PASS_LIMIT}
  --dry-run                   Print setup plan without creating a worktree
`);
}

function parseArgs(argv) {
	const flags = new Set();
	const values = new Map();

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (!arg.startsWith("--")) continue;
		if (!arg.includes("=") && (argv[index + 1]?.startsWith("--") ?? true)) {
			flags.add(arg.slice(2));
			continue;
		}

		const [rawKey, inlineValue] = arg.slice(2).split("=");
		const key = rawKey.trim();
		const nextValue = inlineValue ?? argv[index + 1];
		if (inlineValue === undefined) index += 1;

		if (values.has(key)) {
			const existing = values.get(key);
			values.set(
				key,
				Array.isArray(existing)
					? [...existing, nextValue]
					: [existing, nextValue],
			);
			continue;
		}

		values.set(key, nextValue);
	}

	return { flags, values };
}

function readString(values, key) {
	const value = values.get(key);
	return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readStringList(values, key) {
	const value = values.get(key);
	const valuesList = Array.isArray(value)
		? value
		: value === undefined
			? []
			: [value];
	return valuesList
		.map((item) => (typeof item === "string" ? item.trim() : ""))
		.filter(Boolean);
}

function readPositiveInteger(values, key, fallback) {
	const raw = values.get(key);
	if (raw === undefined) return fallback;
	const parsed = Number.parseInt(String(raw), 10);
	if (!Number.isFinite(parsed) || parsed < 1) {
		throw new Error(`--${key} must be a positive integer.`);
	}
	return parsed;
}

function runCommand(command, args, { cwd, allowFailure = false } = {}) {
	const result = spawnSync(command, args, {
		cwd,
		encoding: "utf8",
		maxBuffer: 1024 * 1024 * 20,
	});

	if (result.status !== 0 && !allowFailure) {
		throw new Error(
			(result.stderr || result.stdout || `${command} ${args.join(" ")}`).trim(),
		);
	}

	return result;
}

function git(args, options = {}) {
	return runCommand("git", args, options);
}

function getRepoRoot(cwd) {
	return git(["rev-parse", "--show-toplevel"], { cwd }).stdout.trim();
}

function requireCleanWorkingTree(cwd) {
	const status = git(["status", "--short"], { cwd }).stdout.trim();
	if (status) {
		throw new Error(
			"Setup requires a clean working tree so the disposable branch starts from an accepted baseline commit.",
		);
	}
}

async function pathExists(filePath) {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
}

function printDryRunPlan({
	branchName,
	mutableScopeAllowlist,
	passLimit,
	readySelector,
	targetPath,
	worktreePath,
}) {
	console.log("Scroll-performance autoresearch setup plan");
	console.log("============================================");
	console.log(`Branch: ${branchName}`);
	console.log(`Worktree: ${worktreePath}`);
	console.log(`Target path: ${targetPath}`);
	console.log(`Ready selector: ${readySelector ?? "(none)"}`);
	console.log(`Pass limit: ${passLimit}`);
	console.log("Mutable scope allowlist:");
	for (const scopePath of mutableScopeAllowlist) {
		console.log(`- ${scopePath}`);
	}
	console.log("Dry run complete. No worktree was created.");
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	if (args.flags.has("help")) {
		printUsage();
		return;
	}

	const tag = sanitizeTag(readString(args.values, "tag"));
	const passLimit = readPositiveInteger(
		args.values,
		"passes",
		DEFAULT_AUTORESEARCH_PASS_LIMIT,
	);
	const targetPath = normalizeTargetPath(readString(args.values, "path"));
	const readySelector = readString(args.values, "ready-selector");
	const mutableScopeAllowlist = readStringList(args.values, "mutable").map(
		normalizeScopePath,
	);
	const dryRun = args.flags.has("dry-run");

	if (mutableScopeAllowlist.length === 0 && !dryRun) {
		throw new Error(
			"Provide at least one --mutable <path> for non-dry-run setup.",
		);
	}

	if (
		passLimit > DEFAULT_AUTORESEARCH_PASS_LIMIT &&
		!args.flags.has("allow-over-12")
	) {
		throw new Error(
			`Pass counts above ${DEFAULT_AUTORESEARCH_PASS_LIMIT} require --allow-over-12.`,
		);
	}

	const repoRoot = getRepoRoot(process.cwd());
	const branchAtSetup = git(["branch", "--show-current"], {
		cwd: repoRoot,
	}).stdout.trim();
	if (!branchAtSetup) {
		throw new Error(
			"Setup requires a named branch checkout, not detached HEAD.",
		);
	}

	const acceptedHead = git(["rev-parse", "HEAD"], {
		cwd: repoRoot,
	}).stdout.trim();
	const acceptedCommit = git(["rev-parse", "--short", "HEAD"], {
		cwd: repoRoot,
	}).stdout.trim();
	const branchName = getAutoresearchBranchName(tag);
	const worktreePath = getAutoresearchWorktreePath({ cwd: repoRoot, tag });
	const runtimePaths = resolveAutoresearchRuntimePaths({
		cwd: worktreePath,
		tag,
	});

	if (dryRun) {
		printDryRunPlan({
			branchName,
			mutableScopeAllowlist,
			passLimit,
			readySelector,
			targetPath,
			worktreePath,
		});
		return;
	}

	requireCleanWorkingTree(repoRoot);

	if (
		git(["show-ref", "--verify", "--quiet", `refs/heads/${branchName}`], {
			allowFailure: true,
			cwd: repoRoot,
		}).status === 0
	) {
		throw new Error(`Branch ${branchName} already exists.`);
	}

	if (await pathExists(worktreePath)) {
		throw new Error(`Worktree path already exists: ${worktreePath}`);
	}

	git(["worktree", "add", "-b", branchName, worktreePath, "HEAD"], {
		cwd: repoRoot,
	});

	await ensureJsonLineFile(runtimePaths.resultsPath);
	await writeJsonFile(runtimePaths.statePath, {
		accepted: {
			commit: acceptedCommit,
			establishedAt: null,
			head: acceptedHead,
			label: "accepted page target baseline",
			metrics: null,
		},
		benchmark: {
			doc: "docs/guides/scroll-performance.md",
			exampleLog:
				"scripts/scroll-performance/fixtures/scroll-performance-runs.example.jsonl",
			primaryMetricTolerances: PRIMARY_METRIC_TOLERANCES,
		},
		branch: branchName,
		completedPasses: 0,
		createdAt: new Date().toISOString(),
		lastDecision: null,
		mutableScopeAllowlist,
		passLimit,
		readOnlyScope: READ_ONLY_SCOPE,
		readySelector,
		schemaVersion: 1,
		source: {
			branch: branchAtSetup,
			commit: acceptedCommit,
			head: acceptedHead,
			repoRoot,
		},
		tag,
		targetPath,
		worktreePath,
	});

	console.log(`Created ${branchName}`);
	console.log(`Worktree: ${worktreePath}`);
	console.log(`Runtime state: ${runtimePaths.statePath}`);
	console.log("Next:");
	console.log(`  cd ${worktreePath}`);
	console.log(`  npm run score:scroll-performance -- --tag ${tag}`);
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
