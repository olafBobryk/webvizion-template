import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { templateSurfaces } from "../template-surfaces/index.mjs";
import {
	assemblyCoreDependencies,
	assemblyCoreDevDependencies,
	assemblyCoreRoots,
	assemblyCoreScripts,
	assemblyGeneratedPaths,
	assemblyProjectDocs,
	assemblyTemplateOnlyPaths,
	assemblyTemplateOnlyRoots,
	assemblyTemplateOnlyScripts,
	isWithinPath,
} from "./manifest.mjs";
import {
	createProjectState,
	renderApiIndexFile,
	renderLibRoutesFile,
	renderNextConfigFile,
	renderRoutesFile,
	renderTsconfigFile,
} from "./project-files.mjs";

function sortedRecord(record) {
	return Object.fromEntries(
		Object.entries(record).sort(([left], [right]) => left.localeCompare(right)),
	);
}

async function pathExists(targetPath) {
	try {
		await fs.access(targetPath);
		return true;
	} catch {
		return false;
	}
}

function sourceFiles(sourceRoot) {
	return execFileSync(
		"git",
		["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
		{ cwd: sourceRoot, encoding: "utf8" },
	)
		.split("\0")
		.filter(Boolean)
		.sort();
}

function matchingSurfaces(relativePath) {
	const candidates = [];
	for (const [surfaceKey, surface] of Object.entries(templateSurfaces)) {
		for (const ownedPath of surface.ownedPaths ?? []) {
			if (isWithinPath(relativePath, ownedPath)) {
				candidates.push({ surfaceKey, ownedPath });
			}
		}
	}
	if (candidates.length === 0) return [];
	candidates.sort(
		(left, right) => right.ownedPath.length - left.ownedPath.length,
	);
	if (
		candidates[1] &&
		candidates[0].ownedPath.length === candidates[1].ownedPath.length &&
		candidates[0].surfaceKey !== candidates[1].surfaceKey
	) {
		throw new Error(
			`Assembly ownership collision for ${relativePath}: ${candidates[0].surfaceKey}, ${candidates[1].surfaceKey}`,
		);
	}
	return [...new Set(candidates.map((candidate) => candidate.surfaceKey))];
}

function withinAny(relativePath, roots) {
	return roots.some((root) => isWithinPath(relativePath, root));
}

async function loadThinInventory(sourceRoot, profile) {
	if (!profile.assembly?.sourceInventory) return null;
	const raw = await fs.readFile(
		path.join(sourceRoot, profile.assembly.sourceInventory),
		"utf8",
	);
	return new Set(JSON.parse(raw));
}

async function buildCopyPlan(sourceRoot, profile) {
	const selectedSurfaces = new Set(profile.assembly?.surfaces ?? []);
	const thinInventory = await loadThinInventory(sourceRoot, profile);
	const providedTargets = new Set([
		...(profile.sharedFiles ?? []),
		...(profile.overrides ?? []).map((file) => file.target),
	]);
	const included = [];
	const omitted = [];
	const ownership = new Map();

	for (const relativePath of sourceFiles(sourceRoot)) {
		if (assemblyGeneratedPaths.has(relativePath)) {
			omitted.push({ path: relativePath, reason: "generated" });
			continue;
		}
		if (assemblyTemplateOnlyPaths.has(relativePath)) {
			omitted.push({ path: relativePath, reason: "template-only" });
			continue;
		}
		if (
			thinInventory &&
			relativePath.startsWith("src/") &&
			!thinInventory.has(relativePath)
		) {
			ownership.set(relativePath, "thin-inventory");
			omitted.push({ path: relativePath, reason: "thin-inventory" });
			continue;
		}

		const surfaceKeys = matchingSurfaces(relativePath);
		if (surfaceKeys.length > 0) {
			ownership.set(relativePath, surfaceKeys.join("+"));
			const unselectedOwners = surfaceKeys.filter(
				(surfaceKey) => !selectedSurfaces.has(surfaceKey),
			);
			if (unselectedOwners.length === 0) included.push(relativePath);
			else {
				omitted.push({
					path: relativePath,
					reason: `surface:${unselectedOwners.join("+")}`,
				});
			}
			continue;
		}

		if (withinAny(relativePath, assemblyTemplateOnlyRoots)) {
			omitted.push({ path: relativePath, reason: "template-only" });
			continue;
		}

		if (
			relativePath.startsWith("docs/") &&
			!assemblyProjectDocs.has(relativePath)
		) {
			omitted.push({ path: relativePath, reason: "template-documentation" });
			continue;
		}

		if (withinAny(relativePath, assemblyCoreRoots)) {
			ownership.set(relativePath, "core");
			included.push(relativePath);
			continue;
		}

		throw new Error(`Unclassified assembly source path: ${relativePath}`);
	}

	if (thinInventory) {
		for (const relativePath of thinInventory) {
			if (
				!providedTargets.has(relativePath) &&
				!(await pathExists(path.join(sourceRoot, relativePath)))
			) {
				throw new Error(
					`Thin positive inventory path is missing: ${relativePath}`,
				);
			}
		}
	}

	return { included, omitted, ownership, selectedSurfaces };
}

async function copyFile(sourceRoot, destinationRoot, relativePath) {
	const source = path.join(sourceRoot, relativePath);
	const destination = path.join(destinationRoot, relativePath);
	const stat = await fs.lstat(source);
	await fs.mkdir(path.dirname(destination), { recursive: true });
	if (stat.isSymbolicLink()) {
		await fs.symlink(await fs.readlink(source), destination);
	} else {
		await fs.copyFile(source, destination);
	}
}

function applyRecordChanges(record, changes) {
	const next = { ...(record ?? {}) };
	for (const name of changes?.remove ?? []) delete next[name];
	for (const [name, value] of Object.entries(changes?.add ?? {})) {
		next[name] = value;
	}
	return sortedRecord(next);
}

function selectedPackageEntries(profile) {
	const scripts = new Set(assemblyCoreScripts);
	const dependencies = new Set(assemblyCoreDependencies);
	const devDependencies = new Set(assemblyCoreDevDependencies);
	for (const surfaceKey of profile.assembly?.surfaces ?? []) {
		const surface = templateSurfaces[surfaceKey];
		if (!surface) throw new Error(`Unknown assembly surface: ${surfaceKey}`);
		for (const scriptName of surface.packageScripts ?? []) {
			if (!assemblyTemplateOnlyScripts.has(scriptName)) scripts.add(scriptName);
		}
		for (const dependencyName of surface.packageDependencies ?? []) {
			dependencies.add(dependencyName);
			devDependencies.add(dependencyName);
		}
	}
	return { scripts, dependencies, devDependencies };
}

function selectRecord(source, selectedNames) {
	const selected = {};
	for (const [name, value] of Object.entries(source ?? {})) {
		if (!selectedNames.has(name)) continue;
		selected[name] = value;
	}
	for (const name of selectedNames) {
		if (!(name in (source ?? {}))) selectedNames.delete(name);
	}
	return sortedRecord(selected);
}

function assertPackageOwnership(pkg) {
	const surfaceScripts = new Set(
		Object.values(templateSurfaces).flatMap(
			(surface) => surface.packageScripts ?? [],
		),
	);
	for (const name of Object.keys(pkg.scripts ?? {})) {
		if (
			!assemblyCoreScripts.has(name) &&
			!assemblyTemplateOnlyScripts.has(name) &&
			!surfaceScripts.has(name)
		) {
			throw new Error(`Unclassified package script: ${name}`);
		}
	}

	const surfaceDependencies = new Set(
		Object.values(templateSurfaces).flatMap(
			(surface) => surface.packageDependencies ?? [],
		),
	);
	for (const name of Object.keys(pkg.dependencies ?? {})) {
		if (!assemblyCoreDependencies.has(name) && !surfaceDependencies.has(name)) {
			throw new Error(`Unclassified package dependency: ${name}`);
		}
	}
	for (const name of Object.keys(pkg.devDependencies ?? {})) {
		if (
			!assemblyCoreDevDependencies.has(name) &&
			!surfaceDependencies.has(name)
		) {
			throw new Error(`Unclassified package devDependency: ${name}`);
		}
	}
}

async function writePackage(sourceRoot, destinationRoot, profile) {
	const sourcePackage = JSON.parse(
		await fs.readFile(path.join(sourceRoot, "package.json"), "utf8"),
	);
	assertPackageOwnership(sourcePackage);
	const selected = selectedPackageEntries(profile);
	const pkg = {
		...sourcePackage,
		scripts: selectRecord(sourcePackage.scripts, selected.scripts),
		dependencies: selectRecord(
			sourcePackage.dependencies,
			selected.dependencies,
		),
		devDependencies: selectRecord(
			sourcePackage.devDependencies,
			selected.devDependencies,
		),
	};

	if (profile.packageChanges) {
		pkg.dependencies = applyRecordChanges(
			pkg.dependencies,
			profile.packageChanges.dependencies,
		);
		pkg.devDependencies = applyRecordChanges(
			pkg.devDependencies,
			profile.packageChanges.devDependencies,
		);
		for (const scriptName of profile.packageChanges.scripts?.remove ?? []) {
			delete pkg.scripts[scriptName];
		}
	}

	await fs.writeFile(
		path.join(destinationRoot, "package.json"),
		`${JSON.stringify(pkg, null, "\t")}\n`,
	);
	await fs.copyFile(
		path.join(sourceRoot, "package-lock.json"),
		path.join(destinationRoot, "package-lock.json"),
	);
	execFileSync(
		"npm",
		[
			"install",
			"--package-lock-only",
			"--ignore-scripts",
			"--offline",
			"--no-audit",
			"--no-fund",
		],
		{ cwd: destinationRoot, stdio: "inherit" },
	);
}

async function writeCentralFiles(sourceRoot, destinationRoot, profile) {
	const state = createProjectState(profile.assembly.surfaces);
	const targets = [
		["src/config/routes.ts", renderRoutesFile(state)],
		["src/lib/routes.ts", renderLibRoutesFile(state)],
		["src/lib/api/index.ts", renderApiIndexFile(state)],
	];
	const nextConfig = renderNextConfigFile(state);
	const tsconfig = renderTsconfigFile(state);
	targets.push([
		"next.config.ts",
		nextConfig ??
			(await fs.readFile(path.join(sourceRoot, "next.config.ts"), "utf8")),
	]);
	targets.push([
		"tsconfig.json",
		tsconfig ??
			(await fs.readFile(path.join(sourceRoot, "tsconfig.json"), "utf8")),
	]);

	for (const [relativePath, content] of targets) {
		const destination = path.join(destinationRoot, relativePath);
		await fs.mkdir(path.dirname(destination), { recursive: true });
		await fs.writeFile(
			destination,
			content.endsWith("\n") ? content : `${content}\n`,
		);
	}
}

async function writeProjectDocs(destinationRoot, profile) {
	const profileLabel = profile.id;
	await fs.writeFile(
		path.join(destinationRoot, "README.md"),
		[
			`# ${profileLabel} project`,
			"",
			`Initialized from Averlo with the \`${profileLabel}\` profile using positive assembly.`,
			"",
			"```sh",
			"npm install",
			"npm run dev",
			"npm run verify",
			"```",
			"",
			"Template setup and pruning machinery is intentionally not included in this initialized project.",
			"See `.template-profile.json` for its immutable setup receipt.",
			"",
		].join("\n"),
	);
	await fs.writeFile(
		path.join(destinationRoot, "AGENTS.md"),
		[
			"# Project Agent Instructions",
			"",
			"- Use `npm run dev:agent -- --random` for isolated automated previews.",
			"- Do not run Next.js development commands directly.",
			"- Keep generated build, environment, and local intelligence artifacts out of Git.",
			"- Internal developer routes are local-only and must remain unavailable in production.",
			"- Use the shared toast and confirmation-modal primitives for standard feedback and confirmation flows.",
			"",
		].join("\n"),
	);
}

export async function assembleTemplateProfile({
	sourceRoot,
	destinationRoot,
	profile,
}) {
	if (!profile.assembly?.surfaces) {
		throw new Error(
			`Profile ${profile.id} has no assembly surface declaration.`,
		);
	}
	const plan = await buildCopyPlan(sourceRoot, profile);
	for (const relativePath of plan.included) {
		await copyFile(sourceRoot, destinationRoot, relativePath);
	}
	await writeCentralFiles(sourceRoot, destinationRoot, profile);
	await writePackage(sourceRoot, destinationRoot, profile);
	await writeProjectDocs(destinationRoot, profile);
	return {
		includedFiles: plan.included.length,
		omittedFiles: plan.omitted.length,
		selectedSurfaces: [...plan.selectedSurfaces],
	};
}
