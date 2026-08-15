#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

function sha256(value) {
	return createHash("sha256").update(value).digest("hex");
}

export function parseStorybookInventory(markdown) {
	const entries = [];
	let section = null;
	let current = null;
	for (const rawLine of markdown.split(/\r?\n/u)) {
		const line = rawLine.trimEnd();
		if (/^#\s+Components\s*$/u.test(line)) {
			section = "component";
			current = null;
			continue;
		}
		if (/^#\s+/u.test(line)) {
			section = "documentation";
			current = null;
			continue;
		}
		const ownerMatch = line.match(/^- (.+) \(([^()]+)\)$/u);
		if (ownerMatch) {
			current = {
				name: ownerMatch[1],
				id: ownerMatch[2],
				kind: section ?? "unknown",
				stories: [],
			};
			entries.push(current);
			continue;
		}
		const storyMatch = line.match(/^\s{2,}- (.+) \(([^()]+)\)$/u);
		if (storyMatch && current)
			current.stories.push({ name: storyMatch[1], id: storyMatch[2] });
	}
	return entries;
}

export function collectInventory(plan, markdown) {
	if (
		plan?.schemaVersion !== 2 ||
		!Array.isArray(plan?.sections) ||
		!plan?.manifestFingerprint
	) {
		throw new Error(
			"Layout plan must use schemaVersion 2 and contain sections plus manifestFingerprint",
		);
	}
	const entries = parseStorybookInventory(markdown);
	const allStories = entries.flatMap((entry) =>
		entry.stories.map((story) => ({ ...story, componentId: entry.id })),
	);
	const seenIds = new Set();
	for (const story of allStories) {
		if (seenIds.has(story.id))
			throw new Error("Duplicate Storybook story ID: " + story.id);
		seenIds.add(story.id);
	}

	const missing = [];
	const ambiguous = [];
	const selectedIds = new Set();
	const sections = plan.sections.map((section) => {
		const matches = allStories.filter((story) => story.name === section.name);
		if (matches.length === 0) missing.push(section.name);
		if (matches.length > 1) ambiguous.push(section.name);
		const match = matches.length === 1 ? matches[0] : null;
		if (match) selectedIds.add(match.id);
		const owners = section.owners.map((ownerId) => {
			const owner = plan.owners.find((candidate) => candidate.id === ownerId);
			return { id: ownerId, sourceHash: owner?.sourceHash ?? null };
		});
		return {
			id: section.name.toLowerCase(),
			label: section.name,
			storyId: match?.id ?? null,
			storybookComponentId: match?.componentId ?? null,
			contentSignature: sha256(
				JSON.stringify({
					manifestFingerprint: plan.manifestFingerprint,
					section: section.name,
					owners,
				}),
			),
		};
	});

	const unrelated = allStories
		.filter((story) => !selectedIds.has(story.id))
		.map((story) => story.id)
		.sort();
	return {
		schemaVersion: 2,
		generatedAt: new Date().toISOString(),
		provider: "storybook-codex",
		strategy: "storybook-section-capture",
		manifestFingerprint: plan.manifestFingerprint,
		sections,
		unrelated,
		missing: missing.sort(),
		ambiguous: ambiguous.sort(),
		summary: {
			expectedSections: plan.sections.length,
			resolvedSections: sections.filter((section) => section.storyId).length,
			unrelatedStories: unrelated.length,
			missingSections: missing.length,
			ambiguousSections: ambiguous.length,
		},
	};
}

function parseArgs(argv) {
	const options = { root: process.cwd(), plan: null, input: null, out: null };
	for (let index = 0; index < argv.length; index += 1) {
		if (argv[index] === "--root") options.root = argv[++index];
		else if (argv[index] === "--plan") options.plan = argv[++index];
		else if (argv[index] === "--input") options.input = argv[++index];
		else if (argv[index] === "--out") options.out = argv[++index];
		else if (argv[index] === "--help") options.help = true;
		else throw new Error("Unknown argument: " + argv[index]);
	}
	return options;
}

function main() {
	const options = parseArgs(process.argv.slice(2));
	if (options.help) {
		console.log(
			"Usage: collect-storybook-inventory.mjs [--root <repo>] [--plan <file>] [--input <markdown>] [--out <json>]",
		);
		return;
	}
	const root = resolve(options.root);
	const base = join(root, ".codex", "tmp", "figma-storybook-export");
	const planPath = resolve(options.plan ?? join(base, "layout-plan.json"));
	const inputPath = resolve(
		options.input ?? join(base, "storybook-inventory.md"),
	);
	const outputPath = resolve(
		options.out ?? join(base, "storybook-inventory.json"),
	);
	for (const path of [planPath, inputPath])
		if (!existsSync(path)) throw new Error("Required file not found: " + path);
	const inventory = collectInventory(
		JSON.parse(readFileSync(planPath, "utf8")),
		readFileSync(inputPath, "utf8"),
	);
	mkdirSync(dirname(outputPath), { recursive: true });
	writeFileSync(outputPath, JSON.stringify(inventory, null, 2) + "\n", "utf8");
	process.stdout.write(
		JSON.stringify(
			{
				outputPath,
				summary: inventory.summary,
				missing: inventory.missing,
				ambiguous: inventory.ambiguous,
			},
			null,
			2,
		) + "\n",
	);
	if (inventory.missing.length || inventory.ambiguous.length)
		process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
