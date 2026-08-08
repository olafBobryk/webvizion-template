#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

function readJson(path) {
	return JSON.parse(readFileSync(path, "utf8"));
}

function sectionId(label) {
	return label.toLowerCase();
}

export function comparePlanToState(plan, state, inventory = null) {
	const schemaErrors = [];
	if (plan?.schemaVersion !== 2 || !Array.isArray(plan?.sections))
		schemaErrors.push("plan must use schemaVersion 2 and contain sections");
	if (
		state?.schemaVersion !== 3 ||
		state?.strategy !== "storybook-section-capture" ||
		!state?.sections ||
		Array.isArray(state.sections)
	) {
		schemaErrors.push(
			"state must use schemaVersion 3, section-capture strategy, and a sections object",
		);
	}
	if (
		inventory &&
		(inventory.schemaVersion !== 2 || !Array.isArray(inventory.sections))
	)
		schemaErrors.push(
			"inventory must use schemaVersion 2 and contain sections",
		);
	const result = {
		new: [],
		changed: [],
		removed: [],
		completed: [],
		missingStoryIds: [],
		missingFrameIds: [],
		missingCaptureIds: [],
		missingScreenshots: [],
		layoutDrift: [],
		unvalidated: [],
		schemaErrors,
	};
	const plannedIds = new Set();
	const inventoryByLabel = new Map(
		(inventory?.sections ?? []).map((section) => [section.label, section]),
	);
	for (const section of plan?.sections ?? []) {
		const id = sectionId(section.name);
		plannedIds.add(id);
		const current = state?.sections?.[id];
		const storybook = inventoryByLabel.get(section.name);
		if (!current) result.new.push(id);
		else {
			if (
				storybook?.contentSignature &&
				current.contentSignature !== storybook.contentSignature
			)
				result.changed.push(id);
			if (current.status === "validated") result.completed.push(id);
			if (
				current.x !== section.x ||
				current.y !== section.y ||
				current.width !== section.width
			)
				result.layoutDrift.push(id);
		}
		if (!current?.storyId || !storybook?.storyId)
			result.missingStoryIds.push(id);
		if (!current?.frameId) result.missingFrameIds.push(id);
		if (!current?.captureRootId) result.missingCaptureIds.push(id);
		if (!current?.validationScreenshot) result.missingScreenshots.push(id);
		if (current?.status !== "validated") result.unvalidated.push(id);
	}
	for (const id of Object.keys(state?.sections ?? {}))
		if (!plannedIds.has(id)) result.removed.push(id);
	for (const value of Object.values(result))
		if (Array.isArray(value)) value.sort();
	return result;
}

function parseArgs(argv) {
	const options = {
		root: process.cwd(),
		plan: null,
		inventory: null,
		state: null,
		out: null,
		strict: false,
	};
	for (let index = 0; index < argv.length; index += 1) {
		if (argv[index] === "--root") options.root = argv[++index];
		else if (argv[index] === "--plan") options.plan = argv[++index];
		else if (argv[index] === "--inventory") options.inventory = argv[++index];
		else if (argv[index] === "--state") options.state = argv[++index];
		else if (argv[index] === "--out") options.out = argv[++index];
		else if (argv[index] === "--strict") options.strict = true;
		else if (argv[index] === "--help") options.help = true;
		else throw new Error(`Unknown argument: ${argv[index]}`);
	}
	return options;
}

function main() {
	const options = parseArgs(process.argv.slice(2));
	if (options.help) {
		console.log(
			"Usage: verify-export-state.mjs [--root <repo>] [--plan <file>] [--inventory <file>] [--state <file>] [--out <file>] [--strict]",
		);
		return;
	}
	const root = resolve(options.root);
	const base = join(root, ".codex", "tmp", "figma-storybook-export");
	const planPath = resolve(options.plan ?? join(base, "layout-plan.json"));
	const inventoryPath = resolve(
		options.inventory ?? join(base, "storybook-inventory.json"),
	);
	const statePath = resolve(options.state ?? join(base, "state.json"));
	for (const path of [planPath, inventoryPath, statePath])
		if (!existsSync(path)) throw new Error(`Required file not found: ${path}`);
	const result = comparePlanToState(
		readJson(planPath),
		readJson(statePath),
		readJson(inventoryPath),
	);
	const report = {
		planPath,
		inventoryPath,
		statePath,
		counts: Object.fromEntries(
			Object.entries(result).map(([key, value]) => [key, value.length]),
		),
		...result,
	};
	const output = `${JSON.stringify(report, null, 2)}\n`;
	if (options.out) {
		const out = resolve(options.out);
		mkdirSync(dirname(out), { recursive: true });
		writeFileSync(out, output, "utf8");
	}
	process.stdout.write(output);
	const blocking = [
		"new",
		"changed",
		"removed",
		"missingStoryIds",
		"missingFrameIds",
		"missingCaptureIds",
		"missingScreenshots",
		"layoutDrift",
		"unvalidated",
		"schemaErrors",
	];
	if (options.strict && blocking.some((key) => result[key].length > 0))
		process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
