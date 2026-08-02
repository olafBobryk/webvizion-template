import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { buildManifest } from "../scripts/build-export-manifest.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const fixtureRoot = join(here, "fixtures", "catalogue");

test("parses owner contracts and explicit appearance pins", () => {
	const manifest = buildManifest({ root: fixtureRoot });
	const owner = manifest.owners.find(({ id }) => id === "ui-primitives-button");
	assert.equal(manifest.summary.storyFiles, 2);
	assert.equal(manifest.summary.ownerContracts, 1);
	assert.equal(
		owner.contract.importStatement,
		'import { Button } from "./Button";',
	);
	assert.deepEqual(owner.contract.compounds, ["Button.Skeleton"]);
	assert.deepEqual(owner.pinnedAppearances, { ActionHierarchy: "dark" });
	assert.equal(owner.defaultAppearance, "light");
	assert.equal(owner.sourcePath, "src/components/ui/Button.tsx");
	assert.match(owner.fingerprint, /^[a-f0-9]{64}$/u);
});

test("uses the Assistant meta id rather than fixture ids that precede it", () => {
	const manifest = buildManifest({ root: fixtureRoot });
	const assistant = manifest.owners.find(
		({ title }) => title === "Domain/Assistant/Message",
	);
	assert.equal(assistant.id, "domain-assistant-message");
	assert.notEqual(assistant.id, "message-user-fixture-must-not-be-meta");
	assert.equal(assistant.kind, "domain-story");
	assert.equal(
		assistant.sourcePath,
		"src/components/domain/assistant/index.tsx",
	);
});

test("current Averlo repository resolves the accepted catalogue counts", {
	skip: !process.env.AVERLO_TEMPLATE_ROOT,
}, () => {
	const root = resolve(process.env.AVERLO_TEMPLATE_ROOT);
	assert.equal(existsSync(join(root, "package.json")), true);
	const manifest = buildManifest({ root });
	assert.deepEqual(
		{
			storyFiles: manifest.summary.storyFiles,
			visualOwners: manifest.summary.visualOwners,
			documentationOnlyOwners: manifest.summary.documentationOnlyOwners,
		},
		{ storyFiles: 76, visualOwners: 64, documentationOnlyOwners: 12 },
	);
	assert.equal(
		manifest.owners.some(({ id }) => id === "domain-assistant-message"),
		true,
	);
});
