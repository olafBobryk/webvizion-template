#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const CATEGORY_ORDER = Object.freeze([
	"Overview",
	"Foundations",
	"Icons",
	"Helpers",
	"Primitives",
	"Input",
	"Time",
	"Misc",
	"Overlays",
	"Assistant",
	"Utilities",
]);

export const LAYOUT_AXIS = "horizontal";
export const FRAME_WIDTH = 1440;
export const FRAME_GAP = 160;

const TITLE_CATEGORY_RULES = Object.freeze([
	["Domain/Assistant/", "Assistant"],
	["UI/Foundations/", "Foundations"],
	["UI/Helpers/", "Helpers"],
	["UI/Icons/", "Icons"],
	["UI/Input/", "Input"],
	["UI/Misc/", "Misc"],
	["UI/Overlays/", "Overlays"],
	["UI/Primitives/", "Primitives"],
	["UI/Time/", "Time"],
	["UI/Motion/", "Utilities"],
]);

export function categoryForOwner(owner) {
	for (const [prefix, category] of TITLE_CATEGORY_RULES) {
		if (owner?.title?.startsWith(prefix)) return category;
	}
	throw new Error(
		`No Library category rule for ${owner?.id ?? "unknown owner"}: ${owner?.title ?? "missing title"}`,
	);
}

function slug(value) {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/gu, "-")
		.replace(/^-|-$/gu, "");
}

export function buildLayoutPlan(manifest) {
	if (
		manifest?.schemaVersion !== 1 ||
		!Array.isArray(manifest?.owners) ||
		!manifest?.manifestFingerprint
	) {
		throw new Error(
			"Manifest must use schemaVersion 1 and include owners plus manifestFingerprint",
		);
	}

	const categories = CATEGORY_ORDER.map((name, index) => ({
		name,
		order: index,
		frameKey: `library/category/${slug(name)}`,
		width: FRAME_WIDTH,
		x: index * (FRAME_WIDTH + FRAME_GAP),
		y: 0,
		owners: [],
	}));
	const byName = new Map(
		categories.map((category) => [category.name, category]),
	);
	const owners = manifest.owners.map((owner, manifestOrder) => {
		const category = categoryForOwner(owner);
		const item = {
			id: owner.id,
			layoutKey: `library/owner/${owner.id}`,
			sourceHash: owner.fingerprint,
			manifestOrder,
			category,
			categoryFrameKey: byName.get(category).frameKey,
			title: owner.title,
			label: owner.name,
			description: owner.description,
			visual: owner.visual,
			storyPath: owner.storyPath,
			sourcePath: owner.sourcePath,
		};
		byName.get(category).owners.push(owner.id);
		return item;
	});

	return {
		schemaVersion: 2,
		manifestFingerprint: manifest.manifestFingerprint,
		page: {
			name: "Library",
			pageKey: "library",
			layoutAxis: LAYOUT_AXIS,
			frameWidth: FRAME_WIDTH,
			frameGap: FRAME_GAP,
		},
		presentation: {
			allowed: [
				"section-heading",
				"subgroup-heading",
				"owner-label",
				"role",
				"short-description",
				"bare-preview",
				"state-label",
				"whitespace",
			],
			forbidden: [
				"cards",
				"dividers",
				"borders",
				"shadows",
				"navigation",
				"decorative-chrome",
			],
		},
		pipeline: {
			storybookProvider: "storybook-codex",
			figmaProvider: "figma-mcp",
			generationStrategy: "storybook-section-capture",
		},
		sections: categories,
		owners,
		summary: {
			owners: owners.length,
			visualOwners: owners.filter((owner) => owner.visual).length,
			documentationOnlyOwners: owners.filter((owner) => !owner.visual).length,
			sections: categories.length,
		},
	};
}

function parseArgs(argv) {
	const options = { root: process.cwd(), manifest: null, out: null };
	for (let index = 0; index < argv.length; index += 1) {
		if (argv[index] === "--root") options.root = argv[++index];
		else if (argv[index] === "--manifest") options.manifest = argv[++index];
		else if (argv[index] === "--out") options.out = argv[++index];
		else if (argv[index] === "--help") options.help = true;
		else throw new Error(`Unknown argument: ${argv[index]}`);
	}
	return options;
}

function main() {
	const options = parseArgs(process.argv.slice(2));
	if (options.help) {
		console.log(
			"Usage: build-layout-plan.mjs [--root <repo>] [--manifest <file>] [--out <file>]",
		);
		return;
	}
	const root = resolve(options.root);
	const base = join(root, ".codex", "tmp", "figma-storybook-export");
	const manifestPath = resolve(options.manifest ?? join(base, "manifest.json"));
	const outputPath = resolve(options.out ?? join(base, "layout-plan.json"));
	if (!existsSync(manifestPath))
		throw new Error(`Manifest not found: ${manifestPath}`);
	const plan = buildLayoutPlan(JSON.parse(readFileSync(manifestPath, "utf8")));
	mkdirSync(dirname(outputPath), { recursive: true });
	writeFileSync(outputPath, `${JSON.stringify(plan, null, 2)}\n`, "utf8");
	process.stdout.write(
		`${JSON.stringify({ outputPath, summary: plan.summary }, null, 2)}\n`,
	);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
