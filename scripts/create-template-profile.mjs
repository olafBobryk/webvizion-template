#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import process, { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import { assembleTemplateProfile } from "../template-assembly/assembler.mjs";
import {
	getProfileContentMode,
	getProfileVerificationCommands,
	getTemplateProfile,
	templateProfiles,
} from "../template-profiles/index.mjs";
import { templateSurfaces } from "../template-surfaces/index.mjs";

const TEMPLATE_ROOT = process.cwd();
const require = createRequire(import.meta.url);
const PROFILE_MARKER = ".template-profile.json";
const PARKED_ROOT = path.join(TEMPLATE_ROOT, ".thin-start");
const PARKED_REFERENCE_DIR = path.join(
	PARKED_ROOT,
	"reference/averlo-components",
);
const LIVE_IMPORT_PATTERN =
	/((from|import)\s*["'][^"']*(\.thin-start|thin-start\/reference|reference\/averlo-components)[^"']*["']|import\([^)]*["'][^"']*(\.thin-start|thin-start\/reference|reference\/averlo-components)[^"']*["'][^)]*\))/;

let activeProfile;

function parseArgs(argv) {
	const options = {
		confirmInstance: false,
		content: undefined,
		dryRun: false,
		engine: "prune",
		force: false,
		help: false,
		inPlace: false,
		output: undefined,
		profile: "full",
		yes: false,
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
			continue;
		}
		if (arg === "--content") {
			const value = argv[index + 1];
			if (!value || !["static", "payload-ready"].includes(value)) {
				throw new Error("--content requires static or payload-ready.");
			}
			options.content = value;
			index += 1;
			continue;
		}
		if (arg === "--engine") {
			const value = argv[index + 1];
			if (!value || !["prune", "assemble"].includes(value)) {
				throw new Error("--engine requires prune or assemble.");
			}
			options.engine = value;
			index += 1;
			continue;
		}
		if (arg === "--output") {
			const value = argv[index + 1];
			if (!value || value.startsWith("--")) {
				throw new Error("--output requires a directory path.");
			}
			options.output = value;
			index += 1;
			continue;
		}
		if (arg === "--confirm-instance") options.confirmInstance = true;
		else if (arg === "--dry-run") options.dryRun = true;
		else if (arg === "--force") options.force = true;
		else if (arg === "--help") options.help = true;
		else if (arg === "--in-place") options.inPlace = true;
		else if (arg === "--yes") options.yes = true;
		else throw new Error(`Unknown flag: ${arg}`);
	}

	if (options.inPlace && options.output) {
		throw new Error("--output cannot be combined with --in-place.");
	}

	return options;
}

function printUsage() {
	console.log(`Usage: npm run create:project -- --profile <id> [flags]

Profiles: ${Object.keys(templateProfiles).join(", ")}
Default behavior materializes the selected workspace at
${activeProfile.defaultOutput}.

Flags:
	--profile <id>      Select the template profile (default: full)
	--content <mode>    Select static or payload-ready content (profile default when omitted)
  --engine <engine>  Select prune or assemble (default: prune)
  --output <path>     Materialize at a custom directory
  --dry-run           Print the profile plan without changing files
  --force             Replace an existing verified template profile output/reference
  --in-place          Apply the profile to the current project instance
  --confirm-instance  Required for mutating --in-place activation
  --yes               Skip the in-place confirmation prompt
  --help              Show this help text
`);
}

function resolveOutputRoot(options) {
	return options.inPlace
		? TEMPLATE_ROOT
		: path.resolve(
				TEMPLATE_ROOT,
				options.output ?? activeProfile.defaultOutput,
			);
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

async function readJson(filePath) {
	return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function assertReplaceableOutput(outputRoot, options) {
	const markerPath = path.join(outputRoot, PROFILE_MARKER);
	if (!(await pathExists(markerPath))) {
		throw new Error(
			`Refusing to replace ${displayPath(outputRoot)} because it is not a verified template profile output.`,
		);
	}
	const marker = await readJson(markerPath);
	if (marker.profile !== activeProfile.id) {
		throw new Error(
			`Refusing to replace ${displayPath(outputRoot)} because its profile marker does not match ${activeProfile.id}.`,
		);
	}
	const markerEngine = marker.engine ?? "prune";
	if (markerEngine !== options.engine) {
		throw new Error(
			`Refusing to replace ${displayPath(outputRoot)} because its engine marker is ${markerEngine}, not ${options.engine}.`,
		);
	}
	const markerContent = marker.content ?? activeProfile.content.default;
	if (markerContent !== options.content) {
		throw new Error(
			`Refusing to replace ${displayPath(outputRoot)} because its content marker is ${markerContent}, not ${options.content}.`,
		);
	}
}

function assertInPlaceActivationAllowed(options) {
	if (options.inPlace && options.engine === "assemble") {
		throw new Error(
			"Positive assembly only creates a new output workspace; --engine assemble cannot be used with --in-place.",
		);
	}
	if (!options.inPlace || options.dryRun) return;
	if (!options.confirmInstance) {
		throw new Error(
			"Mutating template profile activation requires --confirm-instance. Use it only in a new/disposable template instance.",
		);
	}
}

async function confirmInPlaceMutation(options) {
	if (!options.inPlace || options.yes) return true;
	const rl = createInterface({ input, output });
	try {
		const answer = await rl.question(
			`This rewrites the current project instance using the ${activeProfile.id} profile. Continue? [y/N] `,
		);
		return /^(y|yes)$/i.test(answer.trim());
	} finally {
		rl.close();
	}
}

function trackedFiles() {
	const result = execFileSync(
		"git",
		["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
		{
			cwd: TEMPLATE_ROOT,
			encoding: "utf8",
		},
	);
	return result.split("\0").filter(Boolean);
}

async function copyTrackedWorkspace(outputRoot) {
	for (const relativePath of trackedFiles()) {
		const source = path.join(TEMPLATE_ROOT, relativePath);
		const destination = path.join(outputRoot, relativePath);
		let stat;
		try {
			stat = await fs.lstat(source);
		} catch (error) {
			if (error?.code === "ENOENT") continue;
			throw error;
		}
		await fs.mkdir(path.dirname(destination), { recursive: true });
		if (stat.isSymbolicLink()) {
			await fs.symlink(await fs.readlink(source), destination);
		} else {
			await fs.copyFile(source, destination);
		}
	}
}

async function parkComponentReference(options) {
	if (await pathExists(PARKED_REFERENCE_DIR)) {
		if (!options.force) {
			throw new Error(
				`${displayPath(PARKED_REFERENCE_DIR)} already exists. Re-run with --force to replace the verified parked reference.`,
			);
		}
		const marker = path.join(PARKED_REFERENCE_DIR, PROFILE_MARKER);
		if (!(await pathExists(marker))) {
			throw new Error(
				`Refusing to replace ${displayPath(PARKED_REFERENCE_DIR)} without its profile marker.`,
			);
		}
		await fs.rm(PARKED_REFERENCE_DIR, { recursive: true, force: true });
	}

	await fs.mkdir(PARKED_REFERENCE_DIR, { recursive: true });
	await fs.cp(
		path.join(TEMPLATE_ROOT, "src/components"),
		path.join(PARKED_REFERENCE_DIR, "src/components"),
		{ recursive: true },
	);
	await fs.writeFile(
		path.join(PARKED_REFERENCE_DIR, PROFILE_MARKER),
		`${JSON.stringify({ profile: activeProfile.id, referenceOnly: true }, null, 2)}\n`,
		"utf8",
	);
	await fs.writeFile(
		path.join(PARKED_REFERENCE_DIR, "README.md"),
		[
			"# Thin-Start Parked Component Reference",
			"",
			"This is a reference-only snapshot created before in-place activation.",
			"Do not import from `.thin-start/` into live source.",
			"",
		].join("\n"),
		"utf8",
	);
}

async function applyFileRules(destinationRoot, { removePaths = true } = {}) {
	if (removePaths) {
		for (const target of activeProfile.removals ?? []) {
			await fs.rm(path.join(destinationRoot, target), {
				recursive: true,
				force: true,
			});
		}
	}

	const fileRules = [
		...(activeProfile.sharedFiles ?? []).map((target) => ({
			source: target,
			target,
		})),
		...(activeProfile.overrides ?? []),
	];

	for (const file of fileRules) {
		const source = path.join(TEMPLATE_ROOT, file.source);
		const destination = path.join(destinationRoot, file.target);
		if (source === destination) continue;
		await fs.mkdir(path.dirname(destination), { recursive: true });
		await fs.copyFile(source, destination);
	}
}

function applyRecordChanges(record, changes) {
	const next = { ...(record ?? {}) };
	for (const name of changes.remove) delete next[name];
	for (const [name, value] of Object.entries(changes.add)) next[name] = value;
	return Object.fromEntries(
		Object.entries(next).sort(([left], [right]) => left.localeCompare(right)),
	);
}

async function applyPackageChanges(destinationRoot) {
	if (!activeProfile.packageChanges) return;
	const packagePath = path.join(destinationRoot, "package.json");
	const pkg = await readJson(packagePath);
	const changes = activeProfile.packageChanges;
	pkg.dependencies = applyRecordChanges(pkg.dependencies, changes.dependencies);
	pkg.devDependencies = applyRecordChanges(
		pkg.devDependencies,
		changes.devDependencies,
	);
	for (const scriptName of changes.scripts.remove)
		delete pkg.scripts?.[scriptName];
	await fs.writeFile(
		packagePath,
		`${JSON.stringify(pkg, null, "\t")}\n`,
		"utf8",
	);

	const lockPath = path.join(destinationRoot, "package-lock.json");
	if (await pathExists(lockPath)) {
		execFileSync(
			"npm",
			[
				"install",
				"--package-lock-only",
				"--ignore-scripts",
				"--no-audit",
				"--no-fund",
			],
			{ cwd: destinationRoot, stdio: "inherit" },
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
		{
			cwd: destinationRoot,
			stdio: "inherit",
		},
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

async function validateProfile(destinationRoot, engine, content) {
	const payloadPaths = templateSurfaces.payload.ownedPaths;
	const payloadPackages = templateSurfaces.payload.packageDependencies;
	const requiredFiles = activeProfile.verification.requiredFiles.filter(
		(requiredFile) =>
			content === "payload-ready" || requiredFile !== "payload.config.ts",
	);
	for (const requiredFile of requiredFiles) {
		if (!(await pathExists(path.join(destinationRoot, requiredFile)))) {
			throw new Error(
				`template profile required file is missing: ${requiredFile}`,
			);
		}
	}
	const forbiddenPaths = [
		...activeProfile.verification.forbiddenPaths,
		...(content === "static" ? payloadPaths : []),
	];
	for (const forbiddenPath of new Set(forbiddenPaths)) {
		if (await pathExists(path.join(destinationRoot, forbiddenPath))) {
			throw new Error(
				`template profile forbidden path remains: ${forbiddenPath}`,
			);
		}
	}
	for (const route of activeProfile.routes?.retain ?? []) {
		if (!(await pathExists(path.join(destinationRoot, route.file)))) {
			throw new Error(
				`template profile retained route is missing: ${route.path}`,
			);
		}
	}

	const pkg = await readJson(path.join(destinationRoot, "package.json"));
	const forbiddenPackages = [
		...activeProfile.verification.forbiddenPackages,
		...(content === "static" ? payloadPackages : []),
	];
	for (const name of new Set(forbiddenPackages)) {
		if (pkg.dependencies?.[name] || pkg.devDependencies?.[name]) {
			throw new Error(`template profile forbidden package remains: ${name}`);
		}
	}
	const retainedScripts =
		engine === "assemble"
			? getProfileVerificationCommands(activeProfile, engine)
					.filter((command) => command.startsWith("npm run "))
					.map((command) => command.split(/\s+/)[2])
			: (activeProfile.packageChanges?.scripts?.retain ?? []);
	for (const name of retainedScripts) {
		if (typeof pkg.scripts?.[name] !== "string") {
			throw new Error(`template profile retained script is missing: ${name}`);
		}
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

function runProfilePrune(destinationRoot, content) {
	const pruneFlags = [
		...(activeProfile.pruneFlags ?? []),
		...(content === "static" &&
		!activeProfile.pruneFlags?.includes("--no-payload")
			? ["--no-payload"]
			: []),
	];
	if (pruneFlags.length === 0) return;
	const result = spawnSync(
		process.execPath,
		[
			"scripts/prune-template.mjs",
			"--yes",
			"--materialize-profile",
			...pruneFlags,
		],
		{ cwd: destinationRoot, stdio: "inherit" },
	);
	if (result.error) throw result.error;
	if (result.status !== 0) {
		throw new Error(
			`Profile prune failed for ${activeProfile.id} with exit code ${result.status}.`,
		);
	}
}

async function writeReceipt(
	destinationRoot,
	mode,
	engine,
	content,
	assemblyResult,
) {
	const receipt = {
		schemaVersion: activeProfile.schemaVersion,
		profile: activeProfile.id,
		content,
		mode,
		engine,
		sourceCommit: currentCommit(),
		sourceDirty: isSourceDirty(),
		verification: getProfileVerificationCommands(activeProfile, engine),
		...(assemblyResult
			? {
					assembly: {
						includedFiles: assemblyResult.includedFiles,
						omittedFiles: assemblyResult.omittedFiles,
						surfaces: assemblyResult.selectedSurfaces,
					},
				}
			: {}),
	};
	const receiptPath =
		mode === "in-place" && activeProfile.id === "thin-start"
			? path.join(PARKED_ROOT, "profile.json")
			: path.join(destinationRoot, PROFILE_MARKER);
	await fs.mkdir(path.dirname(receiptPath), { recursive: true });
	await fs.writeFile(
		receiptPath,
		`${JSON.stringify(receipt, null, "\t")}\n`,
		"utf8",
	);
}

function printPlan(options, destinationRoot) {
	console.log("\nTemplate profile plan");
	console.log("=======================");
	console.log(
		`- profile: ${activeProfile.id} (schema ${activeProfile.schemaVersion})`,
	);
	console.log(`- content: ${options.content}`);
	console.log(`- engine: ${options.engine}`);
	console.log(
		`- mode: ${options.inPlace ? "in-place" : "materialized workspace"}`,
	);
	console.log(`- destination: ${displayPath(destinationRoot)}`);
	if (options.engine === "prune") {
		console.log(
			`- prune flags: ${activeProfile.pruneFlags?.join(", ") || "none"}`,
		);
	} else {
		const selectedSurfaces = activeProfile.assembly?.surfaces.filter(
			(surface) => options.content === "payload-ready" || surface !== "payload",
		);
		console.log(
			`- selected surfaces: ${selectedSurfaces?.join(", ") || "core only"}`,
		);
	}
	console.log(`- shared files: ${activeProfile.sharedFiles?.length ?? 0}`);
	console.log(
		`- file-backed overrides: ${activeProfile.overrides?.length ?? 0}`,
	);
	console.log(`- removals: ${activeProfile.removals?.length ?? 0}`);
	if (options.inPlace && activeProfile.id === "thin-start") {
		console.log("- park: current src/components reference before mutation");
	}
	if (options.force)
		console.log("- force: replace verified prior output/reference");
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
	let assemblyResult;
	if (options.engine === "assemble") {
		assemblyResult = await assembleTemplateProfile({
			sourceRoot: TEMPLATE_ROOT,
			destinationRoot,
			profile: activeProfile,
			content: options.content,
		});
		await applyFileRules(destinationRoot, { removePaths: false });
	} else {
		await copyTrackedWorkspace(destinationRoot);
		runProfilePrune(destinationRoot, options.content);
		await applyFileRules(destinationRoot);
		await applyPackageChanges(destinationRoot);
	}
	formatWorkspace(destinationRoot);
	await validateProfile(destinationRoot, options.engine, options.content);
	await writeReceipt(
		destinationRoot,
		"materialized",
		options.engine,
		options.content,
		assemblyResult,
	);
	formatReceipt(destinationRoot);
}

async function activateInPlace(options) {
	if (activeProfile.id === "thin-start") {
		await parkComponentReference(options);
	}
	runProfilePrune(TEMPLATE_ROOT, options.content);
	await applyFileRules(TEMPLATE_ROOT);
	await applyPackageChanges(TEMPLATE_ROOT);
	formatWorkspace(TEMPLATE_ROOT);
	await validateProfile(TEMPLATE_ROOT, "prune", options.content);
	await writeReceipt(TEMPLATE_ROOT, "in-place", "prune", options.content);
}

async function main() {
	const options = parseArgs(process.argv.slice(2));
	activeProfile = getTemplateProfile(options.profile);
	options.content = getProfileContentMode(activeProfile, options.content);
	if (options.help) {
		printUsage();
		return;
	}

	const destinationRoot = resolveOutputRoot(options);
	assertInPlaceActivationAllowed(options);
	printPlan(options, destinationRoot);
	if (options.dryRun) {
		console.log("\nDry run complete. No files were changed.");
		return;
	}

	if (!(await confirmInPlaceMutation(options))) {
		throw new Error("Aborted by user.");
	}
	if (options.inPlace) await activateInPlace(options);
	else await materializeWorkspace(options, destinationRoot);

	console.log(
		options.inPlace
			? "\ntemplate profile in-place activation complete."
			: `\ntemplate profile workspace materialized at ${displayPath(destinationRoot)}.`,
	);
}

main().catch((error) => {
	console.error(`\n${error.message}`);
	process.exit(1);
});
