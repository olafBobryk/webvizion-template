import assert from "node:assert/strict";
import test from "node:test";

import { reconcileState } from "../scripts/reconcile-layout-state.mjs";
import { comparePlanToState } from "../scripts/verify-export-state.mjs";

const plan = {
	schemaVersion: 2,
	manifestFingerprint: "manifest",
	page: { layoutAxis: "horizontal", frameWidth: 1440, frameGap: 160 },
	sections: [
		{ name: "Overview", width: 1440, x: 0, y: 0, owners: [] },
		{ name: "Foundations", width: 1440, x: 1600, y: 0, owners: ["focus"] },
	],
	owners: [{ id: "focus", sourceHash: "focus-hash" }],
	summary: { owners: 1 },
};

const inventory = {
	schemaVersion: 2,
	sections: [
		{
			label: "Overview",
			storyId: "opaque-overview",
			contentSignature: "overview-signature",
		},
		{
			label: "Foundations",
			storyId: "opaque-foundations",
			contentSignature: "foundations-next",
		},
	],
};

test("classifies section signature drift and missing validation evidence", () => {
	const state = {
		schemaVersion: 3,
		strategy: "storybook-section-capture",
		sections: {
			overview: {
				status: "validated",
				storyId: "opaque-overview",
				contentSignature: "overview-signature",
				frameId: "28:3",
				captureRootId: "60:2",
				validationScreenshot: "overview.png",
				x: 0,
				y: 0,
				width: 1440,
			},
			foundations: {
				status: "changed",
				storyId: "opaque-foundations",
				contentSignature: "foundations-before",
				frameId: "28:4",
				captureRootId: null,
				validationScreenshot: null,
				x: 1600,
				y: 0,
				width: 1440,
			},
			legacy: { status: "validated" },
		},
	};
	const result = comparePlanToState(plan, state, inventory);
	assert.deepEqual(result.new, []);
	assert.deepEqual(result.changed, ["foundations"]);
	assert.deepEqual(result.removed, ["legacy"]);
	assert.deepEqual(result.completed, ["overview"]);
	assert.deepEqual(result.missingStoryIds, []);
	assert.deepEqual(result.missingFrameIds, []);
	assert.deepEqual(result.missingCaptureIds, ["foundations"]);
	assert.deepEqual(result.missingScreenshots, ["foundations"]);
	assert.deepEqual(result.layoutDrift, []);
	assert.deepEqual(result.unvalidated, ["foundations"]);
	assert.deepEqual(result.schemaErrors, []);
});

test("migrates obsolete native-owner state into schema v3 section captures", () => {
	const state = {
		schemaVersion: 2,
		importer: { provider: "story.to.design" },
		owners: { focus: { figmaNodeId: "old-owner-node" } },
		codeConnect: { enabled: true },
		destination: { fileKey: "file" },
	};
	const ids = {
		libraryPageId: "28:2",
		quickPilotPageId: "0:1",
		sectionFrameIds: { Overview: "28:3", Foundations: "28:4" },
		captureRootIds: { Overview: "60:2", Foundations: "62:2" },
		captureHeights: { Overview: 1400, Foundations: 2400 },
		validationScreenshots: {
			Overview: "overview.png",
			Foundations: "foundations.png",
		},
	};
	const next = reconcileState({
		plan,
		inventory,
		state,
		ids,
		localStorybookUrl: "http://localhost:6006",
		pluginVersion: "0.0.0",
	});
	assert.equal(next.schemaVersion, 3);
	assert.equal(next.strategy, "storybook-section-capture");
	assert.equal(next.pipeline.storybookProvider, "storybook-codex");
	assert.equal(next.sections.overview.status, "validated");
	assert.equal(next.sections.foundations.frameId, "28:4");
	assert.equal(next.sections.foundations.captureRootId, "62:2");
	assert.equal(next.destination.libraryPageId, "28:2");
	assert.equal("owners" in next, false);
	assert.equal("importer" in next, false);
	assert.equal("codeConnect" in next, false);
});
