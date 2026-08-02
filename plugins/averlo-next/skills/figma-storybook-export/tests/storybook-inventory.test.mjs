import assert from "node:assert/strict";
import test from "node:test";

import {
	collectInventory,
	parseStorybookInventory,
} from "../scripts/collect-storybook-inventory.mjs";

const markdown =
	"# Components\n\n" +
	"- Figma Export (opaque-export-component)\n" +
	"  - Overview (opaque-story-alpha)\n" +
	"  - Foundations (opaque-story-beta)\n" +
	"- Dashboard Card (opaque-dashboard)\n" +
	"  - Default (opaque-dashboard-story)\n";

const plan = {
	schemaVersion: 2,
	manifestFingerprint: "manifest",
	sections: [
		{ name: "Overview", owners: [] },
		{ name: "Foundations", owners: ["focus"] },
	],
	owners: [{ id: "focus", sourceHash: "focus-hash" }],
};

test("parses Storybook-returned IDs without deriving them", () => {
	assert.deepEqual(parseStorybookInventory(markdown), [
		{
			name: "Figma Export",
			id: "opaque-export-component",
			kind: "component",
			stories: [
				{ name: "Overview", id: "opaque-story-alpha" },
				{ name: "Foundations", id: "opaque-story-beta" },
			],
		},
		{
			name: "Dashboard Card",
			id: "opaque-dashboard",
			kind: "component",
			stories: [{ name: "Default", id: "opaque-dashboard-story" }],
		},
	]);
});

test("resolves organizer stories by returned name and signs section content", () => {
	const inventory = collectInventory(plan, markdown);
	assert.deepEqual(
		inventory.sections.map(({ label, storyId }) => ({ label, storyId })),
		[
			{ label: "Overview", storyId: "opaque-story-alpha" },
			{ label: "Foundations", storyId: "opaque-story-beta" },
		],
	);
	assert.match(inventory.sections[0].contentSignature, /^[a-f0-9]{64}$/u);
	assert.deepEqual(inventory.unrelated, ["opaque-dashboard-story"]);
	assert.deepEqual(inventory.missing, []);
	assert.deepEqual(inventory.ambiguous, []);
});

test("reports missing or ambiguous organizer story names", () => {
	const missing = collectInventory(
		plan,
		markdown.replace("  - Foundations (opaque-story-beta)\n", ""),
	);
	assert.deepEqual(missing.missing, ["Foundations"]);
	const duplicate = collectInventory(
		plan,
		markdown +
			"- Other Export (opaque-other)\n  - Overview (opaque-other-overview)\n",
	);
	assert.deepEqual(duplicate.ambiguous, ["Overview"]);
});

test("rejects duplicate opaque story IDs", () => {
	assert.throws(
		() =>
			collectInventory(
				plan,
				markdown +
					"- Duplicate (opaque-duplicate)\n  - Other (opaque-story-alpha)\n",
			),
		/Duplicate Storybook story ID/u,
	);
});
