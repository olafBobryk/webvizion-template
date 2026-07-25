#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";
import process from "node:process";
import { assemblyTemplateOnlyScripts } from "../../template-assembly/manifest.mjs";
import {
	getProfileVerificationCommands,
	templateProfiles,
} from "../../template-profiles/index.mjs";

const VERIFIED_PROFILES = ["full", "app-only", "marketing-only", "thin-start"];
const ENGINES = ["prune", "assemble"];

function parseArgs(argv) {
	const options = {
		engine: "prune",
		integration: false,
		keep: false,
		performanceRuns: 1,
	};
	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === "--engine") {
			const value = argv[index + 1];
			if (!value || !["prune", "assemble", "both"].includes(value)) {
				throw new Error("--engine requires prune, assemble, or both.");
			}
			options.engine = value;
			index += 1;
		} else if (arg === "--compare") options.engine = "both";
		else if (arg === "--integration") options.integration = true;
		else if (arg === "--keep") options.keep = true;
		else if (arg === "--performance-runs") {
			const value = Number.parseInt(argv[index + 1] ?? "", 10);
			if (!Number.isInteger(value) || value < 1 || value > 10) {
				throw new Error("--performance-runs requires an integer from 1 to 10.");
			}
			options.performanceRuns = value;
			index += 1;
		} else throw new Error(`Unknown flag: ${arg}`);
	}
	return options;
}

function run(
	command,
	args,
	cwd,
	{ allowFailure = false, silent = false } = {},
) {
	const result = spawnSync(command, args, {
		cwd,
		env: {
			...process.env,
			PATH: `${path.dirname(process.execPath)}${path.delimiter}${process.env.PATH ?? ""}`,
		},
		encoding: silent ? "utf8" : undefined,
		stdio: silent ? ["ignore", "pipe", "pipe"] : "inherit",
	});
	if (result.error) throw result.error;
	if (!allowFailure && result.status !== 0) {
		throw new Error(`${command} ${args.join(" ")} exited ${result.status}.`);
	}
	return result;
}

function runNpm(args, cwd, options) {
	if (process.env.npm_execpath) {
		return run(
			process.execPath,
			[process.env.npm_execpath, ...args],
			cwd,
			options,
		);
	}
	return run("npm", args, cwd, options);
}

function npmRunArgs(command) {
	const parts = command.trim().split(/\s+/);
	if (parts[0] !== "npm" || parts[1] !== "run" || !parts[2]) {
		throw new Error(`Unsupported profile verification command: ${command}`);
	}
	return ["run", ...parts.slice(2)];
}

async function readJson(filePath) {
	return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function assertReceipt(outputRoot, profileId, engine) {
	const receipt = await readJson(
		path.join(outputRoot, ".template-profile.json"),
	);
	if (
		receipt.profile !== profileId ||
		receipt.schemaVersion !== 1 ||
		receipt.engine !== engine
	) {
		throw new Error(`Invalid ${engine} profile receipt for ${profileId}.`);
	}
}

async function walkRelativeFiles(root, current = root) {
	const entries = await fs.readdir(current, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const absolutePath = path.join(current, entry.name);
		if (entry.isDirectory())
			files.push(...(await walkRelativeFiles(root, absolutePath)));
		else files.push(path.relative(root, absolutePath));
	}
	return files.sort();
}

function assertEqualRecord(left, right, label) {
	const normalize = (value) => {
		if (Array.isArray(value)) return value.map(normalize);
		if (!value || typeof value !== "object") return value;
		return Object.fromEntries(
			Object.entries(value)
				.sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
				.map(([key, nestedValue]) => [key, normalize(nestedValue)]),
		);
	};
	if (JSON.stringify(normalize(left)) !== JSON.stringify(normalize(right))) {
		throw new Error(`${label} differs between prune and assembly.`);
	}
}

async function compareRuntimeSource(profileId, pruneRoot, assembleRoot) {
	const pruneSrc = path.join(pruneRoot, "src");
	const assembleSrc = path.join(assembleRoot, "src");
	const pruneFiles = await walkRelativeFiles(pruneSrc);
	const assembleFiles = await walkRelativeFiles(assembleSrc);
	const allowedPruneOnly = new Set(
		profileId === "thin-start"
			? ["lib/template-intelligence/dashboard-domain.tsx"]
			: [],
	);
	const allowedAssemblyOnly = new Set();
	const expectedAssemblyFiles = [
		...pruneFiles.filter((file) => !allowedPruneOnly.has(file)),
		...allowedAssemblyOnly,
	].sort();
	assertEqualRecord(
		expectedAssemblyFiles,
		assembleFiles,
		`${profileId} runtime source inventory`,
	);

	const allowedContentDifferences = new Set([
		"config/routes.ts",
		"lib/api/index.ts",
		"lib/routes.ts",
		...(profileId === "marketing-only"
			? ["app/(site)/(dev)/internal/intelligence/page.tsx"]
			: []),
	]);
	for (const relativePath of pruneFiles) {
		if (allowedPruneOnly.has(relativePath)) continue;
		if (allowedContentDifferences.has(relativePath)) continue;
		const [pruneContent, assembleContent] = await Promise.all([
			fs.readFile(path.join(pruneSrc, relativePath)),
			fs.readFile(path.join(assembleSrc, relativePath)),
		]);
		if (!pruneContent.equals(assembleContent)) {
			throw new Error(
				`${profileId} runtime source content differs: src/${relativePath}`,
			);
		}
	}
}

async function compareContracts(profileId, pruneRoot, assembleRoot) {
	const [prunePackage, assemblePackage] = await Promise.all([
		readJson(path.join(pruneRoot, "package.json")),
		readJson(path.join(assembleRoot, "package.json")),
	]);
	assertEqualRecord(
		prunePackage.dependencies,
		assemblePackage.dependencies,
		`${profileId} dependencies`,
	);
	assertEqualRecord(
		prunePackage.devDependencies,
		assemblePackage.devDependencies,
		`${profileId} devDependencies`,
	);
	const expectedScripts = Object.fromEntries(
		Object.entries(prunePackage.scripts).filter(
			([name]) => !assemblyTemplateOnlyScripts.has(name),
		),
	);
	assertEqualRecord(
		expectedScripts,
		assemblePackage.scripts,
		`${profileId} scripts`,
	);
	await compareRuntimeSource(profileId, pruneRoot, assembleRoot);

	for (const relativePath of [
		"template-profiles",
		"template-surfaces",
		"template-assembly",
		"scripts/prune-template.mjs",
		"scripts/create-template-profile.mjs",
	]) {
		try {
			await fs.access(path.join(assembleRoot, relativePath));
			throw new Error(
				`${profileId} assembled output retained ${relativePath}.`,
			);
		} catch (error) {
			if (error?.code !== "ENOENT") throw error;
		}
	}
}

function median(values) {
	const sorted = [...values].sort((left, right) => left - right);
	return sorted[Math.floor(sorted.length / 2)];
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
	const engines = options.engine === "both" ? ENGINES : [options.engine];
	const timings = Object.fromEntries(engines.map((engine) => [engine, []]));

	try {
		for (const profileId of VERIFIED_PROFILES) {
			const profile = templateProfiles[profileId];
			const outputs = {};
			for (const engine of engines) {
				for (
					let runIndex = 0;
					runIndex < options.performanceRuns;
					runIndex += 1
				) {
					const outputRoot = path.join(
						tempRoot,
						`${profileId}-${engine}-${runIndex + 1}`,
					);
					if (runIndex === 0) outputs[engine] = outputRoot;
					console.log(
						`\nMaterializing ${profileId} with ${engine} (${runIndex + 1}/${options.performanceRuns})`,
					);
					const startedAt = performance.now();
					run(
						process.execPath,
						[
							"scripts/create-template-profile.mjs",
							"--profile",
							profileId,
							"--engine",
							engine,
							"--output",
							outputRoot,
						],
						templateRoot,
						{ silent: runIndex > 0 },
					);
					timings[engine].push(performance.now() - startedAt);
					await assertReceipt(outputRoot, profileId, engine);
				}
			}

			if (outputs.prune && outputs.assemble) {
				await compareContracts(profileId, outputs.prune, outputs.assemble);
				console.log(`Contract parity passed for ${profileId}.`);
			}

			const integrationRoot = outputs.assemble ?? outputs.prune;
			const integrationEngine = outputs.assemble ? "assemble" : "prune";
			if (!options.integration) continue;
			runNpm(["ci", "--no-audit", "--no-fund"], integrationRoot);
			if (profileId === "thin-start" && integrationEngine === "assemble") {
				runNpm(
					[
						"run",
						"review:thin-start-api",
						"--",
						"--root",
						integrationRoot,
						"--strict",
					],
					templateRoot,
				);
			}
			for (const command of getProfileVerificationCommands(
				profile,
				integrationEngine,
			)) {
				runNpm(npmRunArgs(command), integrationRoot);
			}
		}

		if (engines.includes("prune") && engines.includes("assemble")) {
			const pruneRoot = path.join(tempRoot, "full-prune-1");
			const mismatch = run(
				process.execPath,
				[
					"scripts/create-template-profile.mjs",
					"--profile",
					"full",
					"--engine",
					"assemble",
					"--output",
					pruneRoot,
					"--force",
				],
				templateRoot,
				{ allowFailure: true, silent: true },
			);
			if (mismatch.status === 0) {
				throw new Error("Cross-engine force replacement did not fail closed.");
			}

			const dryRunRoot = path.join(tempRoot, "assembly-dry-run");
			const dryRun = run(
				process.execPath,
				[
					"scripts/create-template-profile.mjs",
					"--profile",
					"full",
					"--engine",
					"assemble",
					"--output",
					dryRunRoot,
					"--dry-run",
				],
				templateRoot,
				{ silent: true },
			);
			if (
				await fs
					.stat(dryRunRoot)
					.then(() => true)
					.catch(() => false)
			) {
				throw new Error("Assembly dry-run created its output directory.");
			}
			if (!dryRun.stdout.includes("- engine: assemble")) {
				throw new Error("Assembly dry-run did not report its engine.");
			}

			const defaultEngine = run(
				process.execPath,
				[
					"scripts/create-template-profile.mjs",
					"--profile",
					"full",
					"--output",
					path.join(tempRoot, "default-engine-dry-run"),
					"--dry-run",
				],
				templateRoot,
				{ silent: true },
			);
			if (!defaultEngine.stdout.includes("- engine: prune")) {
				throw new Error("The compatibility default engine is not prune.");
			}

			const unsafeInPlace = run(
				process.execPath,
				[
					"scripts/create-template-profile.mjs",
					"--profile",
					"full",
					"--engine",
					"assemble",
					"--in-place",
					"--confirm-instance",
					"--yes",
				],
				templateRoot,
				{ allowFailure: true, silent: true },
			);
			if (unsafeInPlace.status === 0) {
				throw new Error("Assembly in-place activation did not fail closed.");
			}
			console.log("Engine safety checks passed.");
		}

		for (const engine of engines) {
			console.log(
				`${engine} median materialization: ${Math.round(median(timings[engine]))}ms`,
			);
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
