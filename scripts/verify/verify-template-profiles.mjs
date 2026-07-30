#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";
import process from "node:process";
import { assertPackageOwnership } from "../../template-assembly/assembler.mjs";
import {
	getProfileVerificationCommands,
	templateProfiles,
} from "../../template-profiles/index.mjs";

const PROFILE_CASES = [
	{ profileId: "full", content: "payload-ready" },
	{ profileId: "full", content: "static" },
	{ profileId: "app-only", content: "static" },
	{ profileId: "marketing-only", content: "payload-ready" },
	{ profileId: "marketing-only", content: "static" },
	{ profileId: "thin-start", content: "payload-ready" },
	{ profileId: "thin-start", content: "static" },
];

function parseArgs(argv) {
	const options = {
		integration: false,
		keep: false,
		performanceRuns: 1,
	};
	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === "--integration") options.integration = true;
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

async function collectTypeScriptFiles(directory) {
	const files = [];
	for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
		const absolutePath = path.join(directory, entry.name);
		if (entry.isDirectory())
			files.push(...(await collectTypeScriptFiles(absolutePath)));
		else if (/\.tsx?$/.test(entry.name)) files.push(absolutePath);
	}
	return files;
}

async function assertGeneratedSurfaceContract(outputRoot, profileCase) {
	const selectedSurfaces = new Set(
		templateProfiles[profileCase.profileId]?.assembly?.surfaces ?? [],
	);
	const expectedFamilies = new Set();
	if (selectedSurfaces.has("marketing")) expectedFamilies.add("marketing");
	if (selectedSurfaces.has("dashboard")) {
		expectedFamilies.add("auth");
		expectedFamilies.add("dashboard");
	}

	const generatedRegistry = await fs.readFile(
		path.join(outputRoot, "src/config/surfaces.ts"),
		"utf8",
	);
	const registryFiles = {
		auth: "src/config/surfaces/auth.ts",
		dashboard: "src/config/surfaces/dashboard.ts",
		marketing: "src/config/surfaces/marketing.ts",
	};
	const installedIds = new Set();

	for (const [family, relativePath] of Object.entries(registryFiles)) {
		const absolutePath = path.join(outputRoot, relativePath);
		const expected = expectedFamilies.has(family);
		const exists = await fs
			.stat(absolutePath)
			.then(() => true)
			.catch(() => false);
		if (exists !== expected) {
			throw new Error(
				`${profileCase.profileId}/${profileCase.content} ${family} registry installation mismatch.`,
			);
		}
		const importMarker = `@/config/surfaces/${family}`;
		if (generatedRegistry.includes(importMarker) !== expected) {
			throw new Error(
				`${profileCase.profileId}/${profileCase.content} generated registry has the wrong ${family} composition.`,
			);
		}
		if (!exists) continue;
		const source = await fs.readFile(absolutePath, "utf8");
		for (const match of source.matchAll(/\bid:\s*["']([^"']+)["']/g)) {
			if (
				family === "marketing" &&
				match[1] === "marketing.settings" &&
				generatedRegistry.includes("marketingCoreSurfaceRegistry")
			) {
				continue;
			}
			installedIds.add(match[1]);
		}
	}

	const srcRoot = path.join(outputRoot, "src");
	for (const filePath of await collectTypeScriptFiles(srcRoot)) {
		const source = await fs.readFile(filePath, "utf8");
		const directReferencePattern =
			/(?:surfaceId\s*:\s*|(?:hrefFor|surfaceHref)\(\s*)["']((?:auth|dashboard|marketing)\.[^"']+)["']/g;
		for (const match of source.matchAll(directReferencePattern)) {
			if (!installedIds.has(match[1])) {
				throw new Error(
					`${profileCase.profileId}/${profileCase.content} references unavailable surface ${match[1]} in ${path.relative(outputRoot, filePath)}.`,
				);
			}
		}
	}

	if (expectedFamilies.has("marketing")) {
		const fallbackSource = await fs.readFile(
			path.join(outputRoot, "src/lib/marketing-content/fallback.ts"),
			"utf8",
		);
		const expectedCtaId = expectedFamilies.has("auth")
			? "auth.login"
			: "marketing.contact";
		if (!fallbackSource.includes(expectedCtaId)) {
			throw new Error(
				`${profileCase.profileId}/${profileCase.content} is missing hero CTA ${expectedCtaId}.`,
			);
		}
	}
}

async function assertReceipt(outputRoot, profileCase) {
	const receipt = await readJson(
		path.join(outputRoot, ".template-profile.json"),
	);
	if (
		receipt.profile !== profileCase.profileId ||
		receipt.content !== profileCase.content ||
		receipt.schemaVersion !== 2 ||
		receipt.engine !== undefined
	) {
		throw new Error(
			`Invalid profile receipt for ${profileCase.profileId}/${profileCase.content}.`,
		);
	}
}

async function assertInternalRouteShell(outputRoot, profileCase) {
	const marketingInternalLayout = path.join(
		outputRoot,
		"src/app/(site)/(marketing)/internal/layout.tsx",
	);
	const standaloneInternalLayout = path.join(
		outputRoot,
		"src/app/(site)/(dev)/internal/layout.tsx",
	);
	const shouldUseMarketingShell =
		templateProfiles[profileCase.profileId]?.assembly?.surfaces.includes(
			"marketing",
		) ?? false;
	const expectedLayout = shouldUseMarketingShell
		? marketingInternalLayout
		: standaloneInternalLayout;
	const unexpectedLayout = shouldUseMarketingShell
		? standaloneInternalLayout
		: marketingInternalLayout;

	if (
		!(await fs
			.stat(expectedLayout)
			.then(() => true)
			.catch(() => false))
	) {
		throw new Error(
			`Missing expected internal layout for ${profileCase.profileId}/${profileCase.content}.`,
		);
	}
	if (
		await fs
			.stat(unexpectedLayout)
			.then(() => true)
			.catch(() => false)
	) {
		throw new Error(
			`Internal routes were assembled beneath the wrong shell for ${profileCase.profileId}/${profileCase.content}.`,
		);
	}

	const internalLayout = await fs.readFile(expectedLayout, "utf8");
	if (shouldUseMarketingShell && internalLayout.includes("SiteShell")) {
		throw new Error(
			`Marketing internal layout duplicated the shell for ${profileCase.profileId}/${profileCase.content}.`,
		);
	}
	if (!shouldUseMarketingShell && !internalLayout.includes("SiteShell")) {
		throw new Error(
			`Standalone internal layout lost its fallback shell for ${profileCase.profileId}/${profileCase.content}.`,
		);
	}
}

function assertFailure(result, message) {
	if (result.status === 0) throw new Error(message);
}

function assertThrows(action, expectedMessage) {
	try {
		action();
	} catch (error) {
		if (error instanceof Error && error.message.includes(expectedMessage))
			return;
		throw error;
	}
	throw new Error(`Expected failure containing: ${expectedMessage}`);
}

async function verifyOwnershipGuards(templateRoot, tempRoot) {
	assertThrows(
		() => assertPackageOwnership({ scripts: { "unknown:script": "true" } }),
		"Unclassified package script",
	);
	assertThrows(
		() => assertPackageOwnership({ dependencies: { "unknown-package": "1" } }),
		"Unclassified package dependency",
	);
	assertThrows(
		() =>
			assertPackageOwnership({
				devDependencies: { "unknown-dev-package": "1" },
			}),
		"Unclassified package devDependency",
	);

	const sentinelPath = path.join(
		templateRoot,
		"docs/.assembly-unclassified-sentinel.md",
	);
	const outputRoot = path.join(tempRoot, "unclassified-documentation");
	try {
		await fs.writeFile(sentinelPath, "assembly ownership sentinel\n", "utf8");
		const result = run(
			process.execPath,
			[
				"scripts/create-template-profile.mjs",
				"--profile",
				"full",
				"--output",
				outputRoot,
			],
			templateRoot,
			{ allowFailure: true, silent: true },
		);
		assertFailure(result, "Unclassified documentation did not fail closed.");
		if (!result.stderr.includes("Unclassified assembly documentation")) {
			throw new Error(
				"Unclassified documentation failed for the wrong reason.",
			);
		}
	} finally {
		await fs.rm(sentinelPath, { force: true });
		await fs.rm(outputRoot, { recursive: true, force: true });
	}
	console.log("Assembly ownership guards passed.");
}

async function verifyCreationSafety(templateRoot, tempRoot) {
	const assemblyRoot = path.join(tempRoot, "full-payload-ready-assemble-1");
	const contentMismatch = run(
		process.execPath,
		[
			"scripts/create-template-profile.mjs",
			"--profile",
			"full",
			"--content",
			"static",
			"--output",
			assemblyRoot,
			"--force",
		],
		templateRoot,
		{ allowFailure: true, silent: true },
	);
	assertFailure(
		contentMismatch,
		"Cross-content replacement did not fail closed.",
	);

	const profileMismatch = run(
		process.execPath,
		[
			"scripts/create-template-profile.mjs",
			"--profile",
			"marketing-only",
			"--content",
			"payload-ready",
			"--output",
			assemblyRoot,
			"--force",
		],
		templateRoot,
		{ allowFailure: true, silent: true },
	);
	assertFailure(
		profileMismatch,
		"Cross-profile replacement did not fail closed.",
	);

	const dryRunRoot = path.join(tempRoot, "assembly-dry-run");
	const dryRun = run(
		process.execPath,
		[
			"scripts/create-template-profile.mjs",
			"--profile",
			"full",
			"--content",
			"static",
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
	if (!dryRun.stdout.includes("- content: static")) {
		throw new Error("Assembly dry-run did not report its content mode.");
	}

	const defaults = run(
		process.execPath,
		[
			"scripts/create-template-profile.mjs",
			"--profile",
			"full",
			"--output",
			path.join(tempRoot, "default-content-dry-run"),
			"--dry-run",
		],
		templateRoot,
		{ silent: true },
	);
	if (!defaults.stdout.includes("- content: payload-ready")) {
		throw new Error("The full profile default content is not payload-ready.");
	}

	for (const args of [
		["--profile", "app-only", "--content", "payload-ready", "--dry-run"],
		["--engine", "legacy", "--dry-run"],
		["--in-place", "--dry-run"],
		["--output", templateRoot],
	]) {
		const result = run(
			process.execPath,
			["scripts/create-template-profile.mjs", ...args],
			templateRoot,
			{ allowFailure: true, silent: true },
		);
		assertFailure(
			result,
			`Unsafe creation arguments were accepted: ${args.join(" ")}`,
		);
	}
	console.log("Assembly creation safety checks passed.");
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
	const timings = [];

	try {
		for (const profileCase of PROFILE_CASES) {
			const { profileId, content } = profileCase;
			const profile = templateProfiles[profileId];
			let integrationRoot;
			for (
				let runIndex = 0;
				runIndex < options.performanceRuns;
				runIndex += 1
			) {
				const outputRoot = path.join(
					tempRoot,
					`${profileId}-${content}-assemble-${runIndex + 1}`,
				);
				if (runIndex === 0) integrationRoot = outputRoot;
				console.log(
					`\nMaterializing ${profileId}/${content} (${runIndex + 1}/${options.performanceRuns})`,
				);
				const startedAt = performance.now();
				run(
					process.execPath,
					[
						"scripts/create-template-profile.mjs",
						"--profile",
						profileId,
						"--content",
						content,
						"--output",
						outputRoot,
					],
					templateRoot,
					{ silent: runIndex > 0 },
				);
				timings.push(performance.now() - startedAt);
				await assertReceipt(outputRoot, profileCase);
			}

			await assertInternalRouteShell(integrationRoot, profileCase);
			await assertGeneratedSurfaceContract(integrationRoot, profileCase);
			run(
				process.execPath,
				[
					path.join(templateRoot, "node_modules/tsx/dist/cli.mjs"),
					"scripts/verify/verify-route-surfaces.ts",
				],
				integrationRoot,
			);
			if (!options.integration) continue;
			runNpm(["ci", "--no-audit", "--no-fund"], integrationRoot);
			if (profileId === "thin-start") {
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
			for (const command of getProfileVerificationCommands(profile)) {
				runNpm(npmRunArgs(command), integrationRoot);
			}
		}

		await verifyCreationSafety(templateRoot, tempRoot);
		await verifyOwnershipGuards(templateRoot, tempRoot);
		console.log(
			`assemble median materialization: ${Math.round(median(timings))}ms`,
		);
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
