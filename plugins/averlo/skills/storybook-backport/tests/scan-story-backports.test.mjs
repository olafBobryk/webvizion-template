import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
	assertBoundedWorkspace,
	fingerprintStory,
	formatHumanReport,
	scanWorkspace,
} from "../scripts/scan-story-backports.mjs";

const templateRoot = process.cwd();

async function withWorkspace(run) {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "storybook-backport-"));
	try {
		await run(root);
	} finally {
		await fs.rm(root, { force: true, recursive: true });
	}
}

function storySource({
	status = "backport-candidate",
	fingerprint,
	canonicalStoryId = "ui-primitives-dropdown--contextual-destructive-action",
	source,
} = {}) {
	const fingerprintLine = fingerprint
		? `fingerprint: ${JSON.stringify(fingerprint)},`
		: "";
	const sourceBlock = source ? `source: ${JSON.stringify(source)},` : "";
	return `
export const ContextualDestructiveAction = {
  tags: [${JSON.stringify(status)}],
  parameters: {
    backport: {
      schemaVersion: 1,
      target: "averlo-next-template",
      canonicalStoryId: ${JSON.stringify(canonicalStoryId)},
      strategy: "adapt",
      rationale: "Keep destructive row actions in the contextual menu.",
      ${fingerprintLine}
      ${sourceBlock}
    },
    docs: { description: { story: "Executable evidence." } },
  },
  render: () => "member row",
};
`;
}

async function createRepository(root, name, source, receipt) {
	const repositoryRoot = path.join(root, name);
	const storyPath = path.join(repositoryRoot, "src", "Dropdown.stories.tsx");
	await fs.mkdir(path.dirname(storyPath), { recursive: true });
	await fs.writeFile(
		path.join(repositoryRoot, "package.json"),
		`${JSON.stringify({ name })}\n`,
	);
	if (receipt) {
		await fs.writeFile(
			path.join(repositoryRoot, ".template-profile.json"),
			`${JSON.stringify(receipt)}\n`,
		);
	}
	await fs.writeFile(storyPath, source);
	return { repositoryRoot, storyPath };
}

async function approveStory(repository, receipt) {
	const created = await createRepository(
		repository.root,
		repository.name,
		storySource(),
		receipt,
	);
	const fingerprint = await fingerprintStory({
		exportName: "ContextualDestructiveAction",
		story: created.storyPath,
		template: templateRoot,
	});
	await fs.writeFile(
		created.storyPath,
		storySource({ fingerprint, status: "backport-approved" }),
	);
	return { ...created, fingerprint };
}

test("discovers approved stories and receipt lineage", async () => {
	await withWorkspace(async (root) => {
		const approved = await approveStory(
			{ name: "instance-a", root },
			{ schemaVersion: 2, sourceCommit: "abc123" },
		);
		const report = await scanWorkspace({
			template: templateRoot,
			workspace: root,
		});
		assert.equal(report.errors.length, 0);
		assert.equal(report.entries.length, 1);
		assert.equal(report.entries[0].status, "backport-approved");
		assert.equal(report.entries[0].fingerprint, approved.fingerprint);
		assert.equal(report.entries[0].lineage.kind, "receipt-v2");
		assert.match(formatHumanReport(report), /Approved queue: 1/);
		assert.match(formatHumanReport(report), /Lineage: receipt-v2/);
	});
});

test("reports legacy lineage without blocking a valid story", async () => {
	await withWorkspace(async (root) => {
		await approveStory({ name: "legacy-instance", root });
		const report = await scanWorkspace({
			template: templateRoot,
			workspace: root,
		});
		assert.equal(report.errors.length, 0);
		assert.equal(report.entries[0].lineage.kind, "legacy-unverified");
	});
});

test("rejects dynamic participating metadata and ignores ordinary dynamic tags", async () => {
	await withWorkspace(async (root) => {
		await createRepository(
			root,
			"dynamic-instance",
			`const sharedTags = ["autodocs"];
export const Ordinary = { tags: sharedTags, render: () => "ordinary" };
export const Invalid = {
  tags: sharedTags,
  parameters: { backport: {
    schemaVersion: 1,
    target: "averlo-next-template",
    canonicalStoryId: "ui-primitives-dropdown--invalid",
    strategy: "adapt",
    rationale: "Invalid dynamic status.",
  } },
  render: () => "invalid",
};`,
		);
		const report = await scanWorkspace({
			template: templateRoot,
			workspace: root,
		});
		assert.equal(report.entries.length, 0);
		assert.equal(report.errors.length, 1);
		assert.match(report.errors[0].message, /tags must be a literal value/);
	});
});

test("rejects stale approved fingerprints", async () => {
	await withWorkspace(async (root) => {
		const approved = await approveStory({ name: "stale-instance", root });
		const source = await fs.readFile(approved.storyPath, "utf8");
		await fs.writeFile(
			approved.storyPath,
			source.replace("member row", "changed member row"),
		);
		const report = await scanWorkspace({
			template: templateRoot,
			workspace: root,
		});
		assert.equal(report.entries.length, 0);
		assert.equal(report.errors.length, 1);
		assert.match(report.errors[0].message, /fingerprint does not match/);
	});
});

test("groups duplicate approved targets as blocking conflicts", async () => {
	await withWorkspace(async (root) => {
		await approveStory({ name: "instance-a", root });
		await approveStory({ name: "instance-b", root });
		const report = await scanWorkspace({
			template: templateRoot,
			workspace: root,
		});
		assert.equal(report.conflicts.length, 1);
		assert.equal(report.conflicts[0].candidates.length, 2);
		assert.match(formatHumanReport(report), /Blocking conflicts/);
	});
});

test("validates canonical source provenance", async () => {
	await withWorkspace(async (root) => {
		const created = await createRepository(
			root,
			"template-copy",
			storySource(),
		);
		const fingerprint = await fingerprintStory({
			exportName: "ContextualDestructiveAction",
			story: created.storyPath,
			template: templateRoot,
		});
		await fs.writeFile(
			created.storyPath,
			storySource({
				status: "backport-canonical",
				source: {
					fingerprint,
					repository: "synthetic:dropdown-pilot",
					storyId: "ui-primitives-dropdown--contextual-destructive-action",
				},
			}),
		);
		const report = await scanWorkspace({
			includeTemplate: true,
			template: templateRoot,
			workspace: root,
		});
		assert.equal(report.errors.length, 0);
		assert.equal(report.entries[0].status, "backport-canonical");
	});
});

test("refuses filesystem and home roots", () => {
	assert.throws(() => assertBoundedWorkspace(path.parse(process.cwd()).root));
	assert.throws(() => assertBoundedWorkspace(path.resolve(os.homedir())));
});
