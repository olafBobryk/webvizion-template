#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

function readJson(path) {
	return JSON.parse(readFileSync(path, "utf8"));
}

function sectionId(label) {
	return label.toLowerCase();
}

export function reconcileState({
	plan,
	inventory,
	state,
	ids,
	localStorybookUrl = null,
	hostedStorybookUrl = null,
	pluginVersion = null,
}) {
	if (plan?.schemaVersion !== 2 || !Array.isArray(plan?.sections))
		throw new Error("Layout plan must use schemaVersion 2");
	if (inventory?.schemaVersion !== 2 || !Array.isArray(inventory?.sections))
		throw new Error("Storybook inventory must use schemaVersion 2");
	const inventoryByLabel = new Map(
		inventory.sections.map((section) => [section.label, section]),
	);
	const previousSections = state?.sections ?? {};
	const now = new Date().toISOString();
	const sections = {};

	for (const [order, section] of plan.sections.entries()) {
		const id = sectionId(section.name);
		const previous = previousSections[id] ?? {};
		const storybook = inventoryByLabel.get(section.name);
		const frameId =
			ids.sectionFrameIds?.[section.name] ?? previous.frameId ?? null;
		const captureRootId =
			ids.captureRootIds?.[section.name] ?? previous.captureRootId ?? null;
		const captureHeight =
			ids.captureHeights?.[section.name] ?? previous.captureHeight ?? null;
		const validationScreenshot =
			ids.validationScreenshots?.[section.name] ??
			previous.validationScreenshot ??
			null;
		const sourceChanged = Boolean(
			previous.contentSignature &&
				previous.contentSignature !== storybook?.contentSignature,
		);
		let status = "pending";
		if (!storybook?.storyId || !frameId) status = "blocked";
		else if (sourceChanged) status = "changed";
		else if (captureRootId && validationScreenshot) status = "validated";
		else if (captureRootId) status = "captured";
		sections[id] = {
			id,
			label: section.name,
			order,
			storyId: storybook?.storyId ?? null,
			contentSignature: storybook?.contentSignature ?? null,
			frameId,
			x: section.x,
			y: section.y,
			width: section.width,
			captureRootId,
			captureHeight,
			validationScreenshot,
			status,
			capturedAt: captureRootId ? (previous.capturedAt ?? now) : null,
			validatedAt:
				status === "validated" ? (previous.validatedAt ?? now) : null,
		};
	}

	const removedSections = Object.keys(previousSections)
		.filter((id) => !sections[id])
		.sort();
	const next = {
		schemaVersion: 3,
		strategy: "storybook-section-capture",
		runId: state?.runId ?? "averlo-storybook-section-capture",
		pipeline: {
			storybookProvider: "storybook-codex",
			storybookPluginVersion:
				pluginVersion ?? state?.pipeline?.storybookPluginVersion ?? null,
			figmaProvider: "figma-mcp",
			localStorybookUrl:
				localStorybookUrl ?? state?.pipeline?.localStorybookUrl ?? null,
			hostedStorybookUrl:
				hostedStorybookUrl ?? state?.pipeline?.hostedStorybookUrl ?? null,
			lastSyncAt: now,
		},
		source: {
			manifestPath: ".codex/tmp/figma-storybook-export/manifest.json",
			layoutPlanPath: ".codex/tmp/figma-storybook-export/layout-plan.json",
			storybookInventoryPath:
				".codex/tmp/figma-storybook-export/storybook-inventory.json",
			manifestFingerprint: plan.manifestFingerprint,
			includedOwners: plan.summary.owners,
			excludedDashboardOwners: 13,
		},
		destination: {
			...(state?.destination ?? {}),
			libraryPageId: ids.libraryPageId,
			quickPilotPageId: ids.quickPilotPageId,
		},
		sections,
		removedSections,
		verification: {
			status: Object.values(sections).every(
				(section) => section.status === "validated",
			)
				? "complete"
				: "pending",
			missing: [],
			schemaErrors: [],
			validatedAt: Object.values(sections).every(
				(section) => section.status === "validated",
			)
				? now
				: null,
		},
	};
	return next;
}

function parseArgs(argv) {
	const options = {
		root: process.cwd(),
		plan: null,
		inventory: null,
		state: null,
		ids: null,
		localStorybookUrl: null,
		hostedStorybookUrl: null,
		pluginVersion: null,
	};
	for (let index = 0; index < argv.length; index += 1) {
		if (argv[index] === "--root") options.root = argv[++index];
		else if (argv[index] === "--plan") options.plan = argv[++index];
		else if (argv[index] === "--inventory") options.inventory = argv[++index];
		else if (argv[index] === "--state") options.state = argv[++index];
		else if (argv[index] === "--ids") options.ids = argv[++index];
		else if (argv[index] === "--local-storybook-url")
			options.localStorybookUrl = argv[++index];
		else if (argv[index] === "--hosted-storybook-url")
			options.hostedStorybookUrl = argv[++index];
		else if (argv[index] === "--plugin-version")
			options.pluginVersion = argv[++index];
		else if (argv[index] === "--help") options.help = true;
		else throw new Error("Unknown argument: " + argv[index]);
	}
	return options;
}

function main() {
	const options = parseArgs(process.argv.slice(2));
	if (options.help) {
		console.log(
			"Usage: reconcile-layout-state.mjs --ids <figma-section-ids.json> [--root <repo>] [--plan <file>] [--inventory <file>] [--state <file>]",
		);
		return;
	}
	const root = resolve(options.root);
	const base = join(root, ".codex", "tmp", "figma-storybook-export");
	const paths = {
		plan: resolve(options.plan ?? join(base, "layout-plan.json")),
		inventory: resolve(
			options.inventory ?? join(base, "storybook-inventory.json"),
		),
		state: resolve(options.state ?? join(base, "state.json")),
		ids: resolve(options.ids ?? join(base, "figma-section-ids.json")),
	};
	for (const path of [paths.plan, paths.inventory, paths.ids])
		if (!existsSync(path)) throw new Error("Required file not found: " + path);
	const previous = existsSync(paths.state) ? readJson(paths.state) : {};
	const next = reconcileState({
		plan: readJson(paths.plan),
		inventory: readJson(paths.inventory),
		state: previous,
		ids: readJson(paths.ids),
		localStorybookUrl: options.localStorybookUrl,
		hostedStorybookUrl: options.hostedStorybookUrl,
		pluginVersion: options.pluginVersion,
	});
	writeFileSync(paths.state, JSON.stringify(next, null, 2) + "\n", "utf8");
	process.stdout.write(
		JSON.stringify(
			{
				statePath: paths.state,
				sections: Object.keys(next.sections).length,
				status: next.verification.status,
			},
			null,
			2,
		) + "\n",
	);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
