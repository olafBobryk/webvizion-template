import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { templateSurfaces } from "../template-surfaces/index.mjs";
import { getCapabilitySurfaces } from "./capabilities/index.mjs";
import {
	assemblyCoreDependencies,
	assemblyCoreDevDependencies,
	assemblyCoreRoots,
	assemblyCoreScripts,
	assemblyGeneratedPaths,
	assemblyProjectDocs,
	assemblyTemplateOnlyDevDependencies,
	assemblyTemplateOnlyPaths,
	assemblyTemplateOnlyRoots,
	assemblyTemplateOnlyScripts,
	isWithinPath,
} from "./manifest.mjs";
import {
	createProjectState,
	renderApiIndexFile,
	renderCapabilitiesFile,
	renderInternalLayoutFile,
	renderMarketingContentSourceFile,
	renderMarketingSurfaceRegistryFile,
	renderNextConfigFile,
	renderSurfacesFile,
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
		.filter((relativePath) => existsSync(path.join(sourceRoot, relativePath)))
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
	if (candidates.length === 0) {
		return /\.catalog\.tsx$/.test(relativePath) ? ["demo"] : [];
	}
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
	const surfaceKeys = new Set(
		candidates.map((candidate) => candidate.surfaceKey),
	);
	if (/\.catalog\.tsx$/.test(relativePath)) surfaceKeys.add("demo");
	return [...surfaceKeys];
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

function selectedProfileSurfaces(profile, content, capabilities = []) {
	if (!profile.content?.supported.includes(content)) {
		throw new Error(
			`Profile ${profile.id} does not support ${content} content.`,
		);
	}
	const selected = new Set(profile.assembly?.surfaces ?? []);
	for (const surface of getCapabilitySurfaces(profile, capabilities)) {
		selected.add(surface);
	}
	if (content === "static") selected.delete("payload");
	for (const surfaceKey of selected) {
		if (!templateSurfaces[surfaceKey]) {
			throw new Error(`Unknown assembly surface: ${surfaceKey}`);
		}
	}
	return selected;
}

async function buildCopyPlan(sourceRoot, profile, selectedSurfaces) {
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
		if (withinAny(relativePath, assemblyTemplateOnlyRoots)) {
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

		if (
			relativePath.startsWith("docs/") &&
			!assemblyProjectDocs.has(relativePath)
		) {
			throw new Error(`Unclassified assembly documentation: ${relativePath}`);
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

async function copyFile(
	sourceRoot,
	destinationRoot,
	sourceRelativePath,
	destinationRelativePath = sourceRelativePath,
) {
	const source = path.join(sourceRoot, sourceRelativePath);
	const destination = path.join(destinationRoot, destinationRelativePath);
	const stat = await fs.lstat(source);
	await fs.mkdir(path.dirname(destination), { recursive: true });
	if (stat.isSymbolicLink()) {
		await fs.symlink(await fs.readlink(source), destination);
	} else {
		await fs.copyFile(source, destination);
	}
}

function getAssembledPath(relativePath, selectedSurfaces) {
	if (
		selectedSurfaces.has("marketing") &&
		isWithinPath(relativePath, "src/app/(site)/(dev)/internal")
	) {
		return relativePath.replace(
			"src/app/(site)/(dev)/internal",
			"src/app/(site)/(marketing)/internal",
		);
	}

	return relativePath;
}

function selectedPackageEntries(profile, selectedSurfaces) {
	const scripts = new Set(profile.assembly.coreScripts ?? assemblyCoreScripts);
	const dependencies = new Set(
		profile.assembly.coreDependencies ?? assemblyCoreDependencies,
	);
	const devDependencies = new Set(
		profile.assembly.coreDevDependencies ?? assemblyCoreDevDependencies,
	);
	for (const surfaceKey of selectedSurfaces) {
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

function normalizePackageScriptsForSurfaces(scripts, selectedSurfaces) {
	if (selectedSurfaces.has("demo")) return scripts;
	return Object.fromEntries(
		Object.entries(scripts).map(([name, command]) => [
			name,
			command.replace(/^npm run catalog:generate && /, ""),
		]),
	);
}

export function assertPackageOwnership(pkg) {
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
			!assemblyTemplateOnlyDevDependencies.has(name) &&
			!surfaceDependencies.has(name)
		) {
			throw new Error(`Unclassified package devDependency: ${name}`);
		}
	}
}

async function writePackage(
	sourceRoot,
	destinationRoot,
	profile,
	selectedSurfaces,
	{ projectName, deferLockfile = false },
) {
	const sourcePackage = JSON.parse(
		await fs.readFile(path.join(sourceRoot, "package.json"), "utf8"),
	);
	assertPackageOwnership(sourcePackage);
	const selected = selectedPackageEntries(profile, selectedSurfaces);
	const pkg = {
		...sourcePackage,
		...(projectName ? { name: projectName } : {}),
		scripts: normalizePackageScriptsForSurfaces(
			selectRecord(sourcePackage.scripts, selected.scripts),
			selectedSurfaces,
		),
		dependencies: selectRecord(
			sourcePackage.dependencies,
			selected.dependencies,
		),
		devDependencies: selectRecord(
			sourcePackage.devDependencies,
			selected.devDependencies,
		),
	};

	await fs.writeFile(
		path.join(destinationRoot, "package.json"),
		`${JSON.stringify(pkg, null, "\t")}\n`,
	);
	if (deferLockfile) return;
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

async function applyProfileFiles(sourceRoot, destinationRoot, profile) {
	const files = [
		...(profile.sharedFiles ?? []).map((target) => ({
			source: target,
			target,
		})),
		...(profile.overrides ?? []),
	];
	for (const file of files) {
		const destination = path.join(destinationRoot, file.target);
		await fs.mkdir(path.dirname(destination), { recursive: true });
		await fs.copyFile(path.join(sourceRoot, file.source), destination);
	}
}

async function writeCentralFiles(
	sourceRoot,
	destinationRoot,
	selectedSurfaces,
) {
	const state = createProjectState(selectedSurfaces);
	state.hasMarketingSettings = await pathExists(
		path.join(destinationRoot, "src/app/(site)/(marketing)/settings/page.tsx"),
	);
	const internalLayoutPath = state.hasMarketing
		? "src/app/(site)/(marketing)/internal/layout.tsx"
		: "src/app/(site)/(dev)/internal/layout.tsx";
	const targets = [
		["src/config/capabilities.ts", renderCapabilitiesFile(state)],
		["src/config/surfaces.ts", renderSurfacesFile(state)],
		["src/lib/api/index.ts", renderApiIndexFile(state)],
		[internalLayoutPath, renderInternalLayoutFile(state)],
	];
	const marketingContentSource = renderMarketingContentSourceFile(state);
	const marketingSurfaceRegistry = renderMarketingSurfaceRegistryFile(state);
	if (marketingContentSource) {
		targets.push([
			"src/lib/marketing-content/source.ts",
			marketingContentSource,
		]);
	}
	if (marketingSurfaceRegistry) {
		targets.push([
			"src/config/surfaces/marketing.ts",
			marketingSurfaceRegistry,
		]);
	}
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

async function writeProjectDocs(
	destinationRoot,
	profile,
	content,
	projectName,
) {
	const profileLabel = profile.id;
	const projectLabel = projectName ?? `${profileLabel} project`;
	await fs.writeFile(
		path.join(destinationRoot, "README.md"),
		[
			`# ${projectLabel}`,
			"",
			`Initialized from Averlo with the \`${profileLabel}\` profile and \`${content}\` content using positive assembly.`,
			"",
			"```sh",
			"npm install",
			"npm run dev",
			"npm run storybook",
			"npm run verify",
			"```",
			"",
			"Template setup and assembly machinery is intentionally not included in this initialized project.",
			"See `.template-profile.json` for its immutable setup receipt.",
			"Read `PRODUCT.md` before making product or UX decisions.",
			"",
		].join("\n"),
	);
	await fs.writeFile(
		path.join(destinationRoot, "PRODUCT.md"),
		[
			`# ${projectLabel}`,
			"",
			"## Product definition",
			"",
			"- Purpose: To be defined by the project owner.",
			"- Primary users: To be defined by the project owner.",
			"- Core outcomes: To be defined by the project owner.",
			"",
			"Do not infer product requirements from Averlo reference fixtures. Record the project's actual product intent here before making product or UX decisions.",
			"",
			"## Starting point",
			"",
			`This project was initialized from Averlo with the \`${profileLabel}\` profile and \`${content}\` content mode.`,
			"`.template-profile.json` is the immutable source for the installed profile and content selection.",
			"",
		].join("\n"),
	);
	await fs.mkdir(path.join(destinationRoot, "docs"), { recursive: true });
	await fs.writeFile(
		path.join(destinationRoot, "docs/README.md"),
		[
			"# Documentation",
			"",
			"- [PRODUCT.md](../PRODUCT.md) contains this project's product purpose, users, and outcomes.",
			"- `operations/` contains inherited Averlo external-service runbooks when installed.",
			"- `design-system/decisions/` contains human-approved, rejected, or deferred composition ownership decisions when they exist.",
			"- Add project documentation here only when the project has real supporting material to preserve.",
			"",
		].join("\n"),
	);
	await fs.writeFile(
		path.join(destinationRoot, "AGENTS.md"),
		[
			"# Project Agent Instructions",
			"",
			"## Project",
			"",
			`- This is \`${projectLabel}\`, an independent Averlo project initialized with the \`${profileLabel}\` profile and \`${content}\` content mode.`,
			"- Read `PRODUCT.md` before making product, audience, or UX decisions. `.template-profile.json` owns the immutable installed profile; do not infer product requirements from Averlo reference fixtures.",
			"",
			"## Averlo Plugin Pack",
			"",
			"- Treat the installed Averlo plugin pack as an optional repository workflow layer. Use `$averlo:repository-workflows` when the user explicitly invokes it or an already-selected operational Averlo workflow requires it. Its absence from the current skill catalogue does not block ordinary implementation or implementation review; proceed from `AGENTS.md`, owner evidence, and existing repository verifiers.",
			"- After the router is selected, do not separately invoke overlapping Averlo design-system, skeleton, entity, or surface skills for the same change unit. `$averlo:compose` owns native source-backed composition and measured human review passes. `$averlo:systemize-composition` explicitly owns later shared design-system decisions, `$averlo:animate` explicitly owns motion, and `$averlo:visual-parity` supplies subordinate evidence. A source-backed composition must not call Figma or edit product code until Compose is loaded; systemization and animation must not begin without their explicit workflows.",
			"- Root and nearest `AGENTS.md` files own structural policy. Existing verifier commands own deterministic policy.",
			"",
			"## Development and Review Isolation",
			"",
			"- Use `$preview` to start, recover, verify, or hand off application and Storybook previews. It owns wrapper selection, server isolation, generated preview state, review modes, section anchors, screenshots, and verified review links.",
			"- Do not start development servers or report a preview as live outside that workflow.",
			"",
			"## Application Areas",
			"",
			"- The dashboard is the application implementation area.",
			"- Marketing is the public-site implementation area.",
			"- `.template-profile.json` determines which areas exist. Use the matching repository workflow and nearest `AGENTS.md` for their structure.",
			"- Resolve provider-specific records and metadata in server-side resolvers or adapters before data reaches the frontend contract.",
			"- In a marketing-capable project, run `npm run verify:marketing` for the composed section, shell, and media contract; use its focused child commands only for diagnosis.",
			"",
			"## Design System",
			"",
			"- For UI work, follow the nearest `AGENTS.md`, Storybook owner evidence, and existing repository verifiers rather than treating this file as a component catalogue or API reference. When `$averlo:repository-workflows` is explicitly invoked, also follow the concern contracts it selects.",
			"",
		].join("\n"),
	);
}

export async function assembleTemplateProfile({
	sourceRoot,
	destinationRoot,
	profile,
	content,
	capabilities = [],
	projectName,
	deferLockfile = false,
}) {
	if (!profile.assembly?.surfaces) {
		throw new Error(
			`Profile ${profile.id} has no assembly surface declaration.`,
		);
	}
	const selectedSurfaces = selectedProfileSurfaces(
		profile,
		content,
		capabilities,
	);
	const plan = await buildCopyPlan(sourceRoot, profile, selectedSurfaces);
	for (const relativePath of plan.included) {
		await copyFile(
			sourceRoot,
			destinationRoot,
			relativePath,
			getAssembledPath(relativePath, selectedSurfaces),
		);
	}
	await applyProfileFiles(sourceRoot, destinationRoot, profile);
	await writeCentralFiles(sourceRoot, destinationRoot, selectedSurfaces);
	if (selectedSurfaces.has("demo")) {
		execFileSync("node", ["scripts/generate-component-catalog.mjs"], {
			cwd: destinationRoot,
			stdio: "inherit",
		});
	}
	await writePackage(sourceRoot, destinationRoot, profile, selectedSurfaces, {
		projectName,
		deferLockfile,
	});
	await writeProjectDocs(destinationRoot, profile, content, projectName);
	return {
		includedFiles: plan.included.length,
		omittedFiles: plan.omitted.length,
		selectedSurfaces: [...plan.selectedSurfaces],
		capabilities: [...capabilities],
	};
}
