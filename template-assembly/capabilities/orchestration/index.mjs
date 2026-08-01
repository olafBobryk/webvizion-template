import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ORCHESTRATION_CAPABILITY = "orchestration";
export const ORCHESTRATION_IGNORE_RULE = "/docs/orchestration/";
export const ORCHESTRATION_MARKER = ".averlo-capability.json";
export const orchestrationScripts = Object.freeze({
	orchestration: "node scripts/orchestration.mjs",
	"orchestration-state": "node scripts/orchestration.mjs state",
});

const capabilityDirectory = path.dirname(fileURLToPath(import.meta.url));
const capabilityFiles = [
	{
		source: "project/docs/ORCHESTRATION.md",
		target: "docs/ORCHESTRATION.md",
	},
	{
		source: "project/scripts/orchestration.mjs",
		target: "scripts/orchestration.mjs",
	},
	{
		source: "root/_tools/orchestration.mjs",
		target: "docs/orchestration/_tools/orchestration.mjs",
	},
	{ source: "root/map.md", target: "docs/orchestration/map.md" },
];

export async function readOrchestrationCapabilityMarker(targetRoot) {
	const markerPath = path.join(
		targetRoot,
		"docs/orchestration",
		ORCHESTRATION_MARKER,
	);
	if (await pathExists(markerPath)) {
		const marker = await readJson(markerPath);
		if (
			marker.schemaVersion !== 1 ||
			marker.capability !== ORCHESTRATION_CAPABILITY
		) {
			throw new Error("Invalid orchestration capability marker.");
		}
		return true;
	}
	return false;
}

export async function installOrchestrationCapability({
	targetRoot,
	sourceCommit,
	dryRun = false,
}) {
	const packagePath = path.join(targetRoot, "package.json");
	const ignorePath = path.join(targetRoot, ".gitignore");
	if (!(await pathExists(packagePath)) || !(await pathExists(ignorePath))) {
		throw new Error(
			"The orchestration capability requires a project package.json and .gitignore.",
		);
	}

	const markerPath = path.join(
		targetRoot,
		"docs/orchestration",
		ORCHESTRATION_MARKER,
	);
	if (await pathExists(markerPath)) {
		await assertInstalledOrchestrationCapability(targetRoot);
		return { alreadyInstalled: true, dryRun };
	}

	const pkg = await readJson(packagePath);
	const ignore = await fs.readFile(ignorePath, "utf8");
	const conflicts = [];
	if (await pathExists(path.join(targetRoot, "docs/orchestration"))) {
		conflicts.push("docs/orchestration");
	}
	for (const file of capabilityFiles) {
		if (file.target.startsWith("docs/orchestration/")) continue;
		if (await pathExists(path.join(targetRoot, file.target))) {
			conflicts.push(file.target);
		}
	}
	for (const script of Object.keys(orchestrationScripts)) {
		if (pkg.scripts?.[script] !== undefined) {
			conflicts.push(`package.json#scripts.${script}`);
		}
	}
	if (ignore.split(/\r?\n/).includes(ORCHESTRATION_IGNORE_RULE)) {
		conflicts.push(`.gitignore:${ORCHESTRATION_IGNORE_RULE}`);
	}
	if (conflicts.length > 0) {
		throw new Error(
			`Refusing partial or conflicting orchestration installation:\n${conflicts.map((entry) => `- ${entry}`).join("\n")}`,
		);
	}
	if (dryRun) return { alreadyInstalled: false, dryRun: true };

	const originalPackage = await fs.readFile(packagePath, "utf8");
	const originalIgnore = ignore;
	const stagingRoot = await fs.mkdtemp(
		path.join(targetRoot, ".orchestration-install-"),
	);
	const finalRoot = path.join(targetRoot, "docs/orchestration");
	const createdProjectFiles = [];
	try {
		const markerFiles = {};
		for (const file of capabilityFiles) {
			const sourcePath = path.join(capabilityDirectory, file.source);
			const content = await fs.readFile(sourcePath);
			markerFiles[file.target] = sha256(content);
			if (file.target.startsWith("docs/orchestration/")) {
				const relativeRootPath = file.target.slice(
					"docs/orchestration/".length,
				);
				const destination = path.join(stagingRoot, relativeRootPath);
				await fs.mkdir(path.dirname(destination), { recursive: true });
				await fs.writeFile(destination, content);
			} else {
				const destination = path.join(targetRoot, file.target);
				await fs.mkdir(path.dirname(destination), { recursive: true });
				await fs.writeFile(destination, content);
				createdProjectFiles.push(destination);
			}
		}

		const marker = {
			schemaVersion: 1,
			capability: ORCHESTRATION_CAPABILITY,
			capabilityVersion: 1,
			sourceCommit,
			files: markerFiles,
		};
		await fs.writeFile(
			path.join(stagingRoot, ORCHESTRATION_MARKER),
			`${JSON.stringify(marker, null, "\t")}\n`,
		);

		const nextPackage = {
			...pkg,
			scripts: sortedRecord({ ...pkg.scripts, ...orchestrationScripts }),
		};
		await fs.writeFile(
			packagePath,
			`${JSON.stringify(nextPackage, null, "\t")}\n`,
		);
		await fs.writeFile(ignorePath, appendIgnoreRule(ignore));

		initializeNestedRepository(stagingRoot);
		await fs.mkdir(path.dirname(finalRoot), { recursive: true });
		await fs.rename(stagingRoot, finalRoot);
		await assertInstalledOrchestrationCapability(targetRoot);
		return { alreadyInstalled: false, dryRun: false };
	} catch (error) {
		await fs.writeFile(packagePath, originalPackage);
		await fs.writeFile(ignorePath, originalIgnore);
		for (const createdFile of createdProjectFiles) {
			await fs.rm(createdFile, { force: true });
		}
		await fs.rm(finalRoot, { recursive: true, force: true });
		await fs.rm(stagingRoot, { recursive: true, force: true });
		throw error;
	}
}

export async function assertInstalledOrchestrationCapability(targetRoot) {
	const markerPath = path.join(
		targetRoot,
		"docs/orchestration",
		ORCHESTRATION_MARKER,
	);
	const marker = await readJson(markerPath).catch(() => null);
	if (
		marker?.schemaVersion !== 1 ||
		marker.capability !== ORCHESTRATION_CAPABILITY ||
		marker.capabilityVersion !== 1 ||
		typeof marker.files !== "object"
	) {
		throw new Error("Invalid orchestration capability marker.");
	}
	for (const file of capabilityFiles) {
		const installedPath = path.join(targetRoot, file.target);
		if (!(await pathExists(installedPath))) {
			throw new Error(
				`Orchestration capability file is missing: ${file.target}`,
			);
		}
		const actualHash = sha256(await fs.readFile(installedPath));
		const sourceHash = sha256(
			await fs.readFile(path.join(capabilityDirectory, file.source)),
		);
		if (
			marker.files[file.target] !== actualHash ||
			marker.files[file.target] !== sourceHash
		) {
			throw new Error(`Orchestration capability file changed: ${file.target}`);
		}
	}
	const pkg = await readJson(path.join(targetRoot, "package.json"));
	for (const [name, command] of Object.entries(orchestrationScripts)) {
		if (pkg.scripts?.[name] !== command) {
			throw new Error(`Orchestration package script mismatch: ${name}`);
		}
	}
	const ignore = await fs.readFile(path.join(targetRoot, ".gitignore"), "utf8");
	if (!ignore.split(/\r?\n/).includes(ORCHESTRATION_IGNORE_RULE)) {
		throw new Error("Orchestration ignore rule is missing.");
	}
	const branch = gitOutput(path.dirname(markerPath), [
		"branch",
		"--show-current",
	]);
	if (branch !== "orchestration") {
		throw new Error("Orchestration nested repository is not on its branch.");
	}
	if (gitOutput(path.dirname(markerPath), ["status", "--porcelain"])) {
		throw new Error("Orchestration nested repository is not clean.");
	}
	if (!gitOutput(path.dirname(markerPath), ["rev-parse", "HEAD"])) {
		throw new Error("Orchestration nested repository has no initial commit.");
	}
}

export async function assertNoOrchestrationCapability(targetRoot) {
	const forbidden = [
		"docs/ORCHESTRATION.md",
		"docs/orchestration",
		"scripts/orchestration.mjs",
	];
	for (const relativePath of forbidden) {
		if (await pathExists(path.join(targetRoot, relativePath))) {
			throw new Error(
				`Default project unexpectedly contains orchestration path: ${relativePath}`,
			);
		}
	}
	const pkg = await readJson(path.join(targetRoot, "package.json"));
	for (const script of Object.keys(orchestrationScripts)) {
		if (pkg.scripts?.[script] !== undefined) {
			throw new Error(
				`Default project unexpectedly contains orchestration script: ${script}`,
			);
		}
	}
	const ignore = await fs.readFile(path.join(targetRoot, ".gitignore"), "utf8");
	if (ignore.split(/\r?\n/).includes(ORCHESTRATION_IGNORE_RULE)) {
		throw new Error(
			"Default project unexpectedly contains orchestration ignore rule.",
		);
	}
}

function initializeNestedRepository(root) {
	execFileSync("git", ["init", "-b", "orchestration"], {
		cwd: root,
		stdio: "ignore",
	});
	execFileSync("git", ["add", "."], { cwd: root, stdio: "ignore" });
	execFileSync(
		"git",
		[
			"-c",
			"user.name=Averlo Template",
			"-c",
			"user.email=template@localhost",
			"commit",
			"-m",
			"Initialize legacy orchestration capability",
		],
		{ cwd: root, stdio: "ignore" },
	);
}

function appendIgnoreRule(content) {
	const trimmed = content.replace(/\s+$/u, "");
	return `${trimmed}\n${ORCHESTRATION_IGNORE_RULE}\n`;
}

function sortedRecord(record) {
	return Object.fromEntries(
		Object.entries(record).sort(([left], [right]) => left.localeCompare(right)),
	);
}

function sha256(content) {
	return createHash("sha256").update(content).digest("hex");
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
