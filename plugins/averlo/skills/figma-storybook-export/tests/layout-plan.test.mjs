import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import test from "node:test";

import {
	buildLayoutPlan,
	CATEGORY_ORDER,
	categoryForOwner,
	FRAME_GAP,
	FRAME_WIDTH,
	LAYOUT_AXIS,
} from "../scripts/build-layout-plan.mjs";

const EXPECTED_CATEGORY_ORDER = [
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
];

const manifest = {
	schemaVersion: 1,
	manifestFingerprint: "manifest-hash",
	owners: [
		{
			id: "button",
			title: "UI/Primitives/Button",
			name: "Button",
			description: "Action",
			fingerprint: "a",
			visual: true,
		},
		{
			id: "focus",
			title: "UI/Foundations/Focus",
			name: "Focus",
			description: "Focus docs",
			fingerprint: "b",
			visual: false,
		},
		{
			id: "divider",
			title: "UI/Primitives/Divider",
			name: "Divider",
			description: "Rule",
			fingerprint: "c",
			visual: true,
		},
		{
			id: "reveal",
			title: "UI/Motion/Reveal",
			name: "Reveal",
			description: "Motion docs",
			fingerprint: "d",
			visual: false,
		},
	],
};

test("builds the fixed horizontal low-to-high category plan and preserves manifest order", () => {
	const plan = buildLayoutPlan(manifest);
	assert.equal(plan.page.name, "Library");
	assert.equal(plan.page.layoutAxis, LAYOUT_AXIS);
	assert.equal(plan.page.frameWidth, FRAME_WIDTH);
	assert.equal(plan.page.frameGap, FRAME_GAP);
	assert.deepEqual(CATEGORY_ORDER, EXPECTED_CATEGORY_ORDER);
	assert.deepEqual(
		plan.sections.map(({ name }) => name),
		EXPECTED_CATEGORY_ORDER,
	);
	assert.deepEqual(
		plan.sections.map(({ width, x, y }) => ({ width, x, y })),
		EXPECTED_CATEGORY_ORDER.map((_, index) => ({
			width: 1440,
			x: index * 1600,
			y: 0,
		})),
	);
	assert.deepEqual(
		plan.sections.find(({ name }) => name === "Primitives").owners,
		["button", "divider"],
	);
	assert.deepEqual(plan.pipeline, {
		storybookProvider: "storybook-codex",
		figmaProvider: "figma-mcp",
		generationStrategy: "storybook-section-capture",
	});
	assert.equal(plan.owners[1].category, "Foundations");
	assert.equal(plan.owners[3].category, "Utilities");
	assert.deepEqual(plan.summary, {
		owners: 4,
		visualOwners: 2,
		documentationOnlyOwners: 2,
		sections: 11,
	});
});

test("rejects an owner whose canonical title has no category rule", () => {
	assert.throws(
		() => categoryForOwner({ id: "unknown", title: "Unknown/Thing" }),
		/No Library category rule/u,
	);
});

test("current Averlo manifest produces 76 owners in 11 frames", {
	skip: !process.env.AVERLO_TEMPLATE_ROOT,
}, () => {
	const root = resolve(process.env.AVERLO_TEMPLATE_ROOT);
	const path = join(
		root,
		".codex",
		"tmp",
		"figma-storybook-export",
		"manifest.json",
	);
	assert.equal(existsSync(path), true);
	const plan = buildLayoutPlan(JSON.parse(readFileSync(path, "utf8")));
	assert.deepEqual(plan.summary, {
		owners: 76,
		visualOwners: 64,
		documentationOnlyOwners: 12,
		sections: 11,
	});
});
