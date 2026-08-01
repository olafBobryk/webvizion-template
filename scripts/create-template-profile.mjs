#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { assembleTemplateProfile } from "../template-assembly/assembler.mjs";
import {
	getCapabilitySurfaces,
	normalizeCapabilities,
	readEffectiveCapabilities,
} from "../template-assembly/capabilities/index.mjs";
import {
	assertInstalledOrchestrationCapability,
	assertNoOrchestrationCapability,
} from "../template-assembly/capabilities/orchestration/index.mjs";
import {
	getProfileContentMode,
	getProfileVerificationCommands,
	getTemplateProfile,
	templateProfiles,
} from "../template-profiles/index.mjs";
import { templateSurfaces } from "../template-surfaces/index.mjs";

const TEMPLATE_ROOT = process.cwd();
const PROFILE_MARKER = ".template-profile.json";
const LIVE_IMPORT_PATTERN =
	/((from|import)\s*["'][^"']*(\.thin-start|thin-start\/reference|reference\/averlo-components)[^"']*["']|import\([^)]*["'][^"']*(\.thin-start|thin-start\/reference|reference\/averlo-components)[^"']*["'][^)]*\))/;
const require = createRequire(import.meta.url);

let activeProfile;

function parseArgs(argv) {
	const options = {
		capabilities: [],
		content: undefined,
		dryRun: false,
		force: false,
		help: false,
		output: undefined,
		profile: "full",
	};

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === "--profile") {
			const value = argv[index + 1];
			if (!value || value.startsWith("--")) {
				throw new Error("--profile requires a profile id.");
			}
			options.profile = value;
			index += 1;
		} else if (arg === "--content") {
			const value = argv[index + 1];
			if (!value || !["static", "payload-ready"].includes(value)) {
				throw new Error("--content requires static or payload-ready.");
			}
			options.content = value;
			index += 1;
		} else if (arg === "--output") {
			const value = argv[index + 1];
			if (!value || value.startsWith("--")) {
				throw new Error("--output requires a directory path.");
			}
			options.output = value;
			index += 1;
		} else if (arg === "--with") {
			const value = argv[index + 1];
			if (!value || value.startsWith("--")) {
				throw new Error("--with requires a capability name.");
			}
			options.capabilities.push(value);
			index += 1;
		} else if (arg === "--dry-run") options.dryRun = true;
		else if (arg === "--force") options.force = true;
		else if (arg === "--help") options.help = true;
		else throw new Error(`Unknown flag: ${arg}`);
	}

	options.capabilities = normalizeCapabilities(options.capabilities);
	return options;
}

function printUsage() {
	console.log(`Usage: npm run create:project -- --profile <id> [flags]

Profiles: ${Object.keys(templateProfiles).join(", ")}
Default behavior materializes the selected workspace at
${activeProfile.defaultOutput}.

Flags:
  --profile <id>    Select the template profile (default: full)
  --content <mode>  Select static or payload-ready content (profile default when omitted)
  --output <path>   Materialize at a custom directory
	  --with <name>     Enable an opt-in capability; repeatable (assistant, orchestration)
  --dry-run         Print the positive assembly plan without changing files
  --force           Replace a verified output with the same profile and content
  --help            Show this help text
`);
}

function displayPath(targetPath) {
	const relative = path.relative(TEMPLATE_ROOT, targetPath);
	return relative && !relative.startsWith("..") ? relative : targetPath;
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

function assertSafeOutputRoot(outputRoot) {
	const normalized = path.resolve(outputRoot);
	const filesystemRoot = path.parse(normalized).root;
	const home = path.resolve(os.homedir());
	if (
		normalized === filesystemRoot ||
		normalized === home ||
		normalized === TEMPLATE_ROOT ||
		TEMPLATE_ROOT.startsWith(`${normalized}${path.sep}`)
	) {
		throw new Error(
			`Refusing unsafe template profile output path: ${normalized}`,
		);
	}
}

async function assertReplaceableOutput(outputRoot, options) {
	const markerPath = path.join(outputRoot, PROFILE_MARKER);
	if (!(await pathExists(markerPath))) {
		throw new Error(
			`Refusing to replace ${displayPath(outputRoot)} because it is not a verified template profile output.`,
		);
	}
	const marker = await readJson(markerPath);
	if (marker.schemaVersion !== 2) {
		throw new Error(
			`Refusing to replace ${displayPath(outputRoot)} because its receipt schema is not 2.`,
		);
	}
	if (marker.profile !== activeProfile.id) {
		throw new Error(
			`Refusing to replace ${displayPath(outputRoot)} because its profile marker does not match ${activeProfile.id}.`,
		);
	}
	if (marker.content !== options.content) {
		throw new Error(
			`Refusing to replace ${displayPath(outputRoot)} because its content marker is ${marker.content}, not ${options.content}.`,
		);
	}
	const effectiveCapabilities = await readEffectiveCapabilities(
		outputRoot,
		marker,
	);
	if (
		JSON.stringify(effectiveCapabilities) !==
		JSON.stringify(options.capabilities)
	) {
		throw new Error(
			`Refusing to replace ${displayPath(outputRoot)} because its effective capabilities are ${effectiveCapabilities.join(", ") || "none"}, not ${options.capabilities.join(", ") || "none"}.`,
		);
	}
}

function formatWorkspace(destinationRoot) {
	let biomeCli;
	try {
		biomeCli = require.resolve("@biomejs/biome/bin/biome");
	} catch {
		throw new Error(
			"The template formatter is unavailable. Run npm install in the source template before creating a project.",
		);
	}
	execFileSync(process.execPath, [biomeCli, "check", "--write", "."], {
		cwd: destinationRoot,
		stdio: "inherit",
	});
}

function formatReceipt(destinationRoot) {
	const biomeCli = require.resolve("@biomejs/biome/bin/biome");
	execFileSync(
		process.execPath,
		[biomeCli, "format", "--write", PROFILE_MARKER],
		{ cwd: destinationRoot, stdio: "inherit" },
	);
}

async function walkFiles(targetDir) {
	if (!(await pathExists(targetDir))) return [];
	const entries = await fs.readdir(targetDir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const absolutePath = path.join(targetDir, entry.name);
		if (entry.isDirectory()) files.push(...(await walkFiles(absolutePath)));
		else files.push(absolutePath);
	}
	return files;
}

async function assertNoParkedImports(destinationRoot) {
	const files = (await walkFiles(path.join(destinationRoot, "src"))).filter(
		(filePath) => /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(filePath),
	);
	const failures = [];
	for (const filePath of files) {
		if (LIVE_IMPORT_PATTERN.test(await fs.readFile(filePath, "utf8"))) {
			failures.push(path.relative(destinationRoot, filePath));
		}
	}
	if (failures.length > 0) {
		throw new Error(
			`Parked template profile reference imports found in live source:\n${failures.map((file) => `- ${file}`).join("\n")}`,
		);
	}
}

async function validateProfile(destinationRoot, content, capabilities) {
	const requiredFiles = activeProfile.verification.requiredFiles.filter(
		(requiredFile) =>
			content === "payload-ready" || requiredFile !== "payload.config.ts",
	);
	for (const requiredFile of requiredFiles) {
		if (!(await pathExists(path.join(destinationRoot, requiredFile)))) {
			throw new Error(
				`Template profile required file is missing: ${requiredFile}`,
			);
		}
	}

	const forbiddenPaths = new Set([
		...activeProfile.verification.forbiddenPaths,
		...(content === "static" ? templateSurfaces.payload.ownedPaths : []),
	]);
	for (const forbiddenPath of forbiddenPaths) {
		if (await pathExists(path.join(destinationRoot, forbiddenPath))) {
			throw new Error(
				`Template profile forbidden path remains: ${forbiddenPath}`,
			);
		}
	}

	const pkg = await readJson(path.join(destinationRoot, "package.json"));
	const forbiddenPackages = new Set([
		...activeProfile.verification.forbiddenPackages,
		...(content === "static"
			? templateSurfaces.payload.packageDependencies
			: []),
	]);
	for (const name of forbiddenPackages) {
		if (pkg.dependencies?.[name] || pkg.devDependencies?.[name]) {
			throw new Error(`Template profile forbidden package remains: ${name}`);
		}
	}

	for (const command of getProfileVerificationCommands(activeProfile)) {
		if (!command.startsWith("npm run ")) continue;
		const scriptName = command.split(/\s+/)[2];
		if (typeof pkg.scripts?.[scriptName] !== "string") {
			throw new Error(
				`Template profile verification script is missing: ${scriptName}`,
			);
		}
	}
	if (capabilities.includes("orchestration")) {
		await assertInstalledOrchestrationCapability(destinationRoot);
	} else {
		await assertNoOrchestrationCapability(destinationRoot);
	}
	await assertNoParkedImports(destinationRoot);
}

function currentCommit() {
	return execFileSync("git", ["rev-parse", "HEAD"], {
		cwd: TEMPLATE_ROOT,
		encoding: "utf8",
	}).trim();
}

function isSourceDirty() {
	return (
		execFileSync("git", ["status", "--porcelain", "--untracked-files=all"], {
			cwd: TEMPLATE_ROOT,
			encoding: "utf8",
		}).trim().length > 0
	);
}

async function writeReceipt(destinationRoot, options, assemblyResult) {
	const receipt = {
		schemaVersion: 2,
		profile: activeProfile.id,
		content: options.content,
		capabilities: options.capabilities,
		mode: "materialized-workspace",
		sourceCommit: currentCommit(),
		sourceDirty: isSourceDirty(),
		verification: getProfileVerificationCommands(activeProfile),
		assembly: {
			includedFiles: assemblyResult.includedFiles,
			omittedFiles: assemblyResult.omittedFiles,
			surfaces: assemblyResult.selectedSurfaces,
		},
	};
	await fs.writeFile(
		path.join(destinationRoot, PROFILE_MARKER),
		`${JSON.stringify(receipt, null, "\t")}\n`,
		"utf8",
	);
}

function printPlan(options, destinationRoot) {
	const selectedSurfaces = [
		...activeProfile.assembly.surfaces,
		...getCapabilitySurfaces(activeProfile, options.capabilities),
	].filter(
		(surface) => options.content === "payload-ready" || surface !== "payload",
	);
	console.log("\nTemplate project assembly plan");
	console.log("==============================");
	console.log(`- profile: ${activeProfile.id}`);
	console.log(`- content: ${options.content}`);
	console.log(`- capabilities: ${options.capabilities.join(", ") || "none"}`);
	console.log(`- destination: ${displayPath(destinationRoot)}`);
	console.log(
		`- selected surfaces: ${selectedSurfaces.join(", ") || "core only"}`,
	);
	console.log(`- shared files: ${activeProfile.sharedFiles?.length ?? 0}`);
	console.log(
		`- file-backed overrides: ${activeProfile.overrides?.length ?? 0}`,
	);
	if (options.force) console.log("- force: replace matching verified output");
}

async function materializeWorkspace(options, destinationRoot) {
	assertSafeOutputRoot(destinationRoot);
	if (await pathExists(destinationRoot)) {
		if (!options.force) {
			throw new Error(
				`${displayPath(destinationRoot)} already exists. Re-run with --force to replace a verified template profile output.`,
			);
		}
		await assertReplaceableOutput(destinationRoot, options);
		await fs.rm(destinationRoot, { recursive: true, force: true });
	}

	await fs.mkdir(destinationRoot, { recursive: true });
	const assemblyResult = await assembleTemplateProfile({
		sourceRoot: TEMPLATE_ROOT,
		destinationRoot,
		profile: activeProfile,
		content: options.content,
		capabilities: options.capabilities,
		sourceCommit: currentCommit(),
	});
	formatWorkspace(destinationRoot);
	await validateProfile(destinationRoot, options.content, options.capabilities);
	await writeReceipt(destinationRoot, options, assemblyResult);
	formatReceipt(destinationRoot);
}

async function main() {
	const options = parseArgs(process.argv.slice(2));
	activeProfile = getTemplateProfile(options.profile);
	options.content = getProfileContentMode(activeProfile, options.content);

	if (options.help) {
		printUsage();
		return;
	}

	const destinationRoot = path.resolve(
		TEMPLATE_ROOT,
		options.output ?? activeProfile.defaultOutput,
	);
	printPlan(options, destinationRoot);
	if (options.dryRun) {
		console.log("\nDry run complete. No files were changed.");
		return;
	}

	await materializeWorkspace(options, destinationRoot);
	console.log(
		`\nTemplate project materialized at ${displayPath(destinationRoot)}.`,
	);
}

main().catch((error) => {
	console.error(`\n${error.message}`);
	process.exit(1);
});
