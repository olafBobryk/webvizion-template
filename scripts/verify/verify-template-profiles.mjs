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

async function pathExists(filePath) {
	return fs
		.access(filePath)
		.then(() => true)
		.catch(() => false);
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

const removedPublicEnvironmentNames = [
	["NEXT", "PUBLIC", "ORGANIZATION", "IDENTITY", "VISUAL"].join("_"),
	["NEXT", "PUBLIC", "DASHBOARD", "ORGANIZATION", "SWITCHER"].join("_"),
	["NEXT", "PUBLIC", "DASHBOARD", "DEBUG"].join("_"),
	["NEXT", "PUBLIC", "SITE", "URL"].join("_"),
];

async function assertRemovedPublicEnvironmentAbsent(root, label) {
	const candidateFiles = [
		path.join(root, ".env.example"),
		path.join(root, "README.md"),
		path.join(root, "next-sitemap.config.js"),
		...(await collectTypeScriptFiles(path.join(root, "src"))),
	];
	for (const filePath of candidateFiles) {
		if (!(await pathExists(filePath))) continue;
		const source = await fs.readFile(filePath, "utf8");
		for (const environmentName of removedPublicEnvironmentNames) {
			if (source.includes(environmentName)) {
				throw new Error(
					`${label} retains removed public environment variable ${environmentName} in ${path.relative(root, filePath)}.`,
				);
			}
		}
	}
	if (await pathExists(path.join(root, "src/config/organization.ts"))) {
		throw new Error(
			`${label} retains the obsolete organization config module.`,
		);
	}
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
	const generatedSiteLayout = await fs.readFile(
		path.join(outputRoot, "src/app/(site)/_components/layout/siteLayout.ts"),
		"utf8",
	);
	const internalTestingPath = path.join(
		outputRoot,
		expectedFamilies.has("marketing")
			? "src/app/(site)/(marketing)/internal/testing/page.tsx"
			: "src/app/(site)/(dev)/internal/testing/page.tsx",
	);
	if (!(await pathExists(internalTestingPath))) {
		throw new Error(
			`${profileCase.profileId}/${profileCase.content} is missing the development-only Testing workbench.`,
		);
	}
	if (!generatedRegistry.includes('testing: "/internal/testing"')) {
		throw new Error(
			`${profileCase.profileId}/${profileCase.content} is missing the Testing internal route identity.`,
		);
	}
	const proxySource = await fs.readFile(
		path.join(outputRoot, "src/proxy.ts"),
		"utf8",
	);
	if (
		!proxySource.includes('"/internal/testing"') ||
		!proxySource.includes('"/internal/testing/:path*"')
	) {
		throw new Error(
			`${profileCase.profileId}/${profileCase.content} does not production-guard Testing.`,
		);
	}
	for (const forbiddenPath of [
		"src/app/(site)/(dev)/internal/dictionary",
		"src/app/(site)/(dev)/internal/playground",
		"src/app/(site)/(dev)/internal/reference",
		"src/app/(site)/(marketing)/repository-footprint",
	]) {
		if (await pathExists(path.join(outputRoot, forbiddenPath))) {
			throw new Error(
				`${profileCase.profileId}/${profileCase.content} retained excluded developer or template-only surface ${forbiddenPath}.`,
			);
		}
	}
	const generatedPackage = await readJson(
		path.join(outputRoot, "package.json"),
	);
	for (const metadataPath of [
		"scripts/verify/verify-route-metadata.ts",
		"src/config/metadataConfig.ts",
		"src/lib/metadata.ts",
	]) {
		if (!(await pathExists(path.join(outputRoot, metadataPath)))) {
			throw new Error(
				`${profileCase.profileId}/${profileCase.content} is missing ${metadataPath}.`,
			);
		}
	}
	if (typeof generatedPackage.scripts?.["verify:route-metadata"] !== "string") {
		throw new Error(
			`${profileCase.profileId}/${profileCase.content} is missing verify:route-metadata.`,
		);
	}
	if (
		generatedPackage.scripts?.["footprint:generate"] !== undefined ||
		generatedPackage.dependencies?.recharts !== undefined ||
		generatedPackage.devDependencies?.["js-tiktoken"] !== undefined
	) {
		throw new Error(
			`${profileCase.profileId}/${profileCase.content} retained template-only Repository Footprint tooling.`,
		);
	}
	if (generatedSiteLayout.includes("process.env.NODE_ENV")) {
		throw new Error(
			`${profileCase.profileId}/${profileCase.content} removes installed navigation in production.`,
		);
	}
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

		const contentSource = await fs.readFile(
			path.join(outputRoot, "src/lib/marketing-content/source.ts"),
			"utf8",
		);
		const hasPayload = profileCase.content === "payload-ready";
		if (
			!contentSource.includes("getConfiguredMarketingPage") ||
			contentSource.includes("@/payload/siteLayoutSource") !== hasPayload ||
			contentSource.includes("@/payload/marketingPageSource") !== hasPayload
		) {
			throw new Error(
				`${profileCase.profileId}/${profileCase.content} generated the wrong marketing content source bridge.`,
			);
		}

		const pkg = generatedPackage;
		const generatedMarketingRegistry = await fs.readFile(
			path.join(outputRoot, "src/config/surfaces/marketing.ts"),
			"utf8",
		);
		if (generatedMarketingRegistry.includes("marketing.repositoryFootprint")) {
			throw new Error(
				`${profileCase.profileId}/${profileCase.content} retained the template-only Repository Footprint route.`,
			);
		}
		for (const scriptName of [
			"payload:seed:marketing-pages",
			"payload:seed:site-layout",
			"payload:verify:marketing-pages",
			"payload:verify:site-layout",
			"verify:payload-pages",
			"verify:payload-site-layout",
		]) {
			if ((typeof pkg.scripts?.[scriptName] === "string") !== hasPayload) {
				throw new Error(
					`${profileCase.profileId}/${profileCase.content} has the wrong ${scriptName} installation state.`,
				);
			}
		}

		if (
			profileCase.profileId !== "thin-start" &&
			(!fallbackSource.includes("publicSocialLinks") ||
				!fallbackSource.includes("getMarketingSiteLinks"))
		) {
			throw new Error(
				`${profileCase.profileId}/${profileCase.content} does not compose its public shell from canonical marketing links.`,
			);
		}
	}
}

async function assertReceipt(outputRoot, profileCase, capabilities = []) {
	const receipt = await readJson(
		path.join(outputRoot, ".template-profile.json"),
	);
	if (
		receipt.profile !== profileCase.profileId ||
		receipt.content !== profileCase.content ||
		receipt.schemaVersion !== 2 ||
		receipt.engine !== undefined ||
		JSON.stringify(receipt.capabilities ?? []) !== JSON.stringify(capabilities)
	) {
		throw new Error(
			`Invalid profile receipt for ${profileCase.profileId}/${profileCase.content}.`,
		);
	}
}

async function assertGeneratedDocumentation(outputRoot, profileCase) {
	for (const requiredPath of ["AGENTS.md", "PRODUCT.md", "docs/README.md"]) {
		if (!(await pathExists(path.join(outputRoot, requiredPath)))) {
			throw new Error(
				`${profileCase.profileId}/${profileCase.content} is missing generated documentation path ${requiredPath}.`,
			);
		}
	}
	for (const retiredPath of [
		"docs/project/README.md",
		"docs/project/source/README.md",
	]) {
		if (await pathExists(path.join(outputRoot, retiredPath))) {
			throw new Error(
				`${profileCase.profileId}/${profileCase.content} retained retired documentation path ${retiredPath}.`,
			);
		}
	}

	const agentInstructions = await fs.readFile(
		path.join(outputRoot, "AGENTS.md"),
		"utf8",
	);
	for (const heading of [
		"## Project",
		"## Averlo Plugin Pack",
		"## Development and Review Isolation",
		"## Application Areas",
		"## Design System",
	]) {
		if (!agentInstructions.includes(heading)) {
			throw new Error(
				`${profileCase.profileId}/${profileCase.content} generated AGENTS.md is missing ${heading}.`,
			);
		}
	}
	for (const forbiddenText of [
		"ToastHost",
		"showToast",
		"ConfirmationModal",
		"useTailwindBreakpoints",
		"## Responsive Rendering",
	]) {
		if (agentInstructions.includes(forbiddenText)) {
			throw new Error(
				`${profileCase.profileId}/${profileCase.content} generated AGENTS.md contains recipe text: ${forbiddenText}.`,
			);
		}
	}
	for (const requiredPolicy of [
		"resolve and read that exact skill before any implementation",
		"stop and report a workflow resolution failure",
		"A source-backed composition must not call Figma or edit product code",
	]) {
		if (!agentInstructions.replace(/\s+/gu, " ").includes(requiredPolicy)) {
			throw new Error(
				`${profileCase.profileId}/${profileCase.content} generated AGENTS.md is missing workflow-delivery policy: ${requiredPolicy}.`,
			);
		}
	}

	const product = await fs.readFile(
		path.join(outputRoot, "PRODUCT.md"),
		"utf8",
	);
	if (
		!product.includes(`\`${profileCase.profileId}\` profile`) ||
		!product.includes(`\`${profileCase.content}\` content mode`) ||
		!product.includes("Purpose: To be defined by the project owner.")
	) {
		throw new Error(
			`${profileCase.profileId}/${profileCase.content} generated PRODUCT.md does not preserve its setup facts and unfinished product definition.`,
		);
	}

	const documentation = await fs.readFile(
		path.join(outputRoot, "docs/README.md"),
		"utf8",
	);
	if (
		!documentation.includes(
			"`composition/` contains committed composition records and promoted visual evidence",
		)
	) {
		throw new Error(
			`${profileCase.profileId}/${profileCase.content} generated docs/README.md does not describe durable composition records.`,
		);
	}
}

async function assertCanonicalAgentContract(templateRoot) {
	const agentInstructions = await fs.readFile(
		path.join(templateRoot, "AGENTS.md"),
		"utf8",
	);
	for (const heading of [
		"## Project",
		"## Averlo Plugin Pack",
		"## Development and Review Isolation",
		"## Application Areas",
		"## Design System",
	]) {
		if (!agentInstructions.includes(heading)) {
			throw new Error(`Canonical AGENTS.md is missing ${heading}.`);
		}
	}
	for (const forbiddenText of [
		"## Template Content Modes",
		"## Halo UI Primitives",
		"## Responsive Rendering",
		"ToastHost",
		"showToast",
		"ConfirmationModal",
		"useTailwindBreakpoints",
	]) {
		if (agentInstructions.includes(forbiddenText)) {
			throw new Error(
				`Canonical AGENTS.md contains retired recipe text: ${forbiddenText}.`,
			);
		}
	}
	for (const requiredPolicy of [
		"resolve and read that exact skill before any implementation",
		"stop and report a workflow resolution failure",
		"A source-backed composition must not call Figma or edit product code",
	]) {
		if (!agentInstructions.replace(/\s+/gu, " ").includes(requiredPolicy)) {
			throw new Error(
				`Canonical AGENTS.md is missing workflow-delivery policy: ${requiredPolicy}.`,
			);
		}
	}
	if (!(await pathExists(path.join(templateRoot, "PRODUCT.md")))) {
		throw new Error("Canonical template is missing PRODUCT.md.");
	}
}

async function verifyAssistantCapability(templateRoot, tempRoot) {
	const selectedRoot = path.join(tempRoot, "assistant-selected");
	run(
		process.execPath,
		[
			"scripts/create-template-profile.mjs",
			"--profile",
			"app-only",
			"--content",
			"static",
			"--with",
			"assistant",
			"--output",
			selectedRoot,
		],
		templateRoot,
		{ silent: true },
	);
	await assertReceipt(
		selectedRoot,
		{ content: "static", profileId: "app-only" },
		["assistant"],
	);
	for (const requiredPath of [
		"src/app/(site)/dashboard/_components/entities/record/RecordToolCall.tsx",
		"src/app/(site)/dashboard/assistant",
		"src/app/api/assistant",
		"src/components/domain/assistant",
		"src/lib/assistant",
	]) {
		if (!(await pathExists(path.join(selectedRoot, requiredPath)))) {
			throw new Error(
				`Selected Assistant capability is missing ${requiredPath}.`,
			);
		}
	}
	const selectedPackage = await readJson(
		path.join(selectedRoot, "package.json"),
	);
	for (const dependency of [
		"@ai-sdk/openai",
		"@ai-sdk/react",
		"ai",
		"streamdown",
	]) {
		if (!selectedPackage.dependencies?.[dependency]) {
			throw new Error(
				`Selected Assistant capability is missing ${dependency}.`,
			);
		}
	}

	const rejected = run(
		process.execPath,
		[
			"scripts/create-template-profile.mjs",
			"--profile",
			"marketing-only",
			"--content",
			"static",
			"--with",
			"assistant",
			"--dry-run",
		],
		templateRoot,
		{ allowFailure: true, silent: true },
	);
	assertFailure(
		rejected,
		"Dashboard-less profile accepted the Assistant capability.",
	);
	const unknown = run(
		process.execPath,
		["scripts/create-template-profile.mjs", "--with", "unknown", "--dry-run"],
		templateRoot,
		{ allowFailure: true, silent: true },
	);
	assertFailure(unknown, "Unknown capability was accepted.");
	console.log("Assistant capability checks passed.");
}

async function assertNoAssistantCapability(outputRoot) {
	for (const forbiddenPath of [
		"src/app/(site)/dashboard/assistant",
		"src/app/api/assistant",
		"src/components/domain/assistant",
	]) {
		if (await pathExists(path.join(outputRoot, forbiddenPath))) {
			throw new Error(
				`Default project unexpectedly contains Assistant path: ${forbiddenPath}`,
			);
		}
	}
	const assistantLibraryRoot = path.join(outputRoot, "src/lib/assistant");
	if (await pathExists(assistantLibraryRoot)) {
		const assistantLibraryEntries = (
			await fs.readdir(assistantLibraryRoot)
		).sort();
		if (
			assistantLibraryEntries.length !== 1 ||
			assistantLibraryEntries[0] !== "contracts.ts"
		) {
			throw new Error(
				`Default project must retain only the shared Assistant contracts, found: ${assistantLibraryEntries.join(", ")}`,
			);
		}
	}
	const pkg = await readJson(path.join(outputRoot, "package.json"));
	for (const dependency of [
		"@ai-sdk/openai",
		"@ai-sdk/react",
		"ai",
		"streamdown",
	]) {
		if (pkg.dependencies?.[dependency] !== undefined) {
			throw new Error(
				`Default project unexpectedly contains Assistant dependency: ${dependency}`,
			);
		}
	}
}

async function assertStorybook(outputRoot, profileCase) {
	for (const requiredPath of [
		".storybook/main.ts",
		".storybook/preview.tsx",
		"vitest.config.mts",
		"vitest.shims.d.ts",
		"scripts/storybook-preview.mjs",
		"scripts/storybook-build-provenance.ts",
		"scripts/verify/verify-storybook-preview.mjs",
	]) {
		if (!(await pathExists(path.join(outputRoot, requiredPath)))) {
			throw new Error(
				`${profileCase.profileId}/${profileCase.content} is missing Storybook path: ${requiredPath}`,
			);
		}
	}
	for (const forbiddenPath of [".agents", "plugins"]) {
		if (await pathExists(path.join(outputRoot, forbiddenPath))) {
			throw new Error(
				`${profileCase.profileId}/${profileCase.content} contains template plugin source: ${forbiddenPath}`,
			);
		}
	}
	const sourceFiles = await collectTypeScriptFiles(
		path.join(outputRoot, "src"),
	);
	const storyFile = sourceFiles.find((filePath) =>
		/\.stories\.[cm]?[jt]sx?$/.test(filePath),
	);
	if (profileCase.profileId !== "thin-start" && !storyFile) {
		throw new Error(
			`${profileCase.profileId}/${profileCase.content} retained Storybook without any owned stories.`,
		);
	}
	const obsoleteUiDemo = sourceFiles.find((filePath) =>
		/internal\/demo\/_content\/pages\/ui(?:-|\.[cm]?[jt]sx?$)/.test(
			filePath.replaceAll(path.sep, "/"),
		),
	);
	if (obsoleteUiDemo) {
		throw new Error(
			`Generated project unexpectedly contains a superseded UI demo module: ${path.relative(outputRoot, obsoleteUiDemo)}`,
		);
	}

	const pkg = await readJson(path.join(outputRoot, "package.json"));
	const requiredScripts = [
		"storybook",
		"storybook:preview",
		"storybook:status",
		"storybook:stop",
		"verify:storybook-preview",
		"build-storybook",
		"test-storybook",
	];
	if (profileCase.profileId !== "thin-start") {
		requiredScripts.push(
			"test-storybook:ui:light",
			"test-storybook:ui:dark",
			"test-storybook:ui",
			"verify:storybook-catalog",
		);
	}
	for (const script of requiredScripts) {
		if (typeof pkg.scripts?.[script] !== "string") {
			throw new Error(
				`${profileCase.profileId}/${profileCase.content} is missing Storybook script: ${script}`,
			);
		}
	}
	for (const dependency of [
		"@chromatic-com/storybook",
		"@storybook/addon-a11y",
		"@storybook/addon-docs",
		"@storybook/addon-mcp",
		"@storybook/addon-vitest",
		"@storybook/nextjs-vite",
		"@vitest/browser-playwright",
		"@vitest/coverage-v8",
		"storybook",
		"vite",
		"vitest",
	]) {
		if (pkg.devDependencies?.[dependency] === undefined) {
			throw new Error(
				`${profileCase.profileId}/${profileCase.content} is missing Storybook dependency: ${dependency}`,
			);
		}
	}
}

async function assertComponentExport(outputRoot, profileCase) {
	const selectedSurfaces = new Set(
		templateProfiles[profileCase.profileId]?.assembly?.surfaces ?? [],
	);
	const hasDemo = selectedSurfaces.has("demo");
	const catalogRoot = path.join(outputRoot, "src/lib/component-catalog");
	const generatorPath = path.join(
		outputRoot,
		"scripts/generate-component-catalog.mjs",
	);
	const packageJson = await readJson(path.join(outputRoot, "package.json"));
	const sourceFiles = await collectTypeScriptFiles(
		path.join(outputRoot, "src"),
	);
	const catalogFiles = sourceFiles.filter((filePath) =>
		/\.catalog\.tsx$/.test(filePath),
	);

	if (!hasDemo) {
		for (const forbiddenPath of [catalogRoot, generatorPath]) {
			if (await pathExists(forbiddenPath)) {
				throw new Error(
					`${profileCase.profileId}/${profileCase.content} unexpectedly contains Component Export machinery: ${path.relative(outputRoot, forbiddenPath)}`,
				);
			}
		}
		if (catalogFiles.length > 0) {
			throw new Error(
				`${profileCase.profileId}/${profileCase.content} unexpectedly contains ${catalogFiles.length} catalogue contracts.`,
			);
		}
		for (const [name, command] of Object.entries(packageJson.scripts ?? {})) {
			if (
				name.startsWith("catalog:") ||
				`${command}`.includes("catalog:generate")
			) {
				throw new Error(
					`${profileCase.profileId}/${profileCase.content} retains an unselected catalogue script: ${name}`,
				);
			}
		}
		return;
	}

	for (const requiredPath of [catalogRoot, generatorPath]) {
		if (!(await pathExists(requiredPath))) {
			throw new Error(
				`${profileCase.profileId}/${profileCase.content} is missing Component Export machinery: ${path.relative(outputRoot, requiredPath)}`,
			);
		}
	}
	if (
		packageJson.scripts?.["catalog:generate"] === undefined ||
		packageJson.scripts?.["verify:component-sweep"] === undefined
	) {
		throw new Error(
			`${profileCase.profileId}/${profileCase.content} is missing Component Export scripts.`,
		);
	}
	const expectedOwnerCount = selectedSurfaces.has("dashboard") ? 89 : 77;
	if (catalogFiles.length !== expectedOwnerCount) {
		throw new Error(
			`${profileCase.profileId}/${profileCase.content} expected ${expectedOwnerCount} installed catalogue owners, found ${catalogFiles.length}.`,
		);
	}
	run(
		process.execPath,
		["scripts/generate-component-catalog.mjs", "--check"],
		outputRoot,
		{
			silent: true,
		},
	);
	for (const filePath of [
		...catalogFiles,
		path.join(
			outputRoot,
			"src/lib/component-catalog/ComponentExportSurface.tsx",
		),
		path.join(
			outputRoot,
			"src/app/(component-export)/internal/demo/[section]/page.tsx",
		),
	]) {
		const source = await fs.readFile(filePath, "utf8");
		if (/@storybook|\.stories\./.test(source)) {
			throw new Error(
				`${profileCase.profileId}/${profileCase.content} Component Export imports Storybook: ${path.relative(outputRoot, filePath)}`,
			);
		}
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
	if (
		internalLayout.includes('process.env.NODE_ENV === "production"') ||
		internalLayout.includes("notFound()")
	) {
		throw new Error(
			`Installed internal routes remain production-gated for ${profileCase.profileId}/${profileCase.content}.`,
		);
	}
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
		await assertCanonicalAgentContract(templateRoot);
		await assertRemovedPublicEnvironmentAbsent(
			templateRoot,
			"Canonical template",
		);
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
				await assertGeneratedDocumentation(outputRoot, profileCase);
				await assertNoAssistantCapability(outputRoot);
				await assertStorybook(outputRoot, profileCase);
				await assertComponentExport(outputRoot, profileCase);
				await assertRemovedPublicEnvironmentAbsent(
					outputRoot,
					`${profileId}/${content}`,
				);
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
		await verifyAssistantCapability(templateRoot, tempRoot);
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
