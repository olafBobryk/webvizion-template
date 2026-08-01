import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { recordDesignSystemEvidence } from "../record-design-system-evidence.mjs";

const temporaryDirectory = await fs.mkdtemp(
	path.join(os.tmpdir(), "averlo-design-system-evidence-"),
);

try {
	process.env.DESIGN_SYSTEM_EVIDENCE_DIR = temporaryDirectory;
	const { receipt, receiptPath } = await recordDesignSystemEvidence([
		"--quiet",
		"--target",
		"src/components/ui/primitives/Button.tsx",
		"--owner",
		"src/components/ui/primitives/Button.stories.tsx",
	]);

	assert.equal(receipt.schemaVersion, 1);
	assert.equal(receipt.recordKind, "design-system-evidence");
	assert.match(receipt.invocationId, /^[0-9a-f-]{36}$/);
	assert.deepEqual(receipt.targets, [
		"src/components/ui/primitives/Button.tsx",
	]);
	assert.deepEqual(receipt.owners, [
		"src/components/ui/primitives/Button.stories.tsx",
	]);

	const kinds = receipt.inspectionOrder.map((entry) => entry.kind);
	const lastPolicy = kinds.lastIndexOf("policy");
	const firstOwner = kinds.indexOf("owner-story");
	const firstSource = kinds.indexOf("implementation-source");
	assert.ok(lastPolicy >= 0, "at least one governing policy must be inspected");
	assert.ok(
		firstOwner > lastPolicy,
		"owner stories must follow governing policies",
	);
	assert.ok(
		firstSource > firstOwner,
		"implementation source must follow owner stories",
	);
	assert.ok(
		receipt.inspectionOrder.every(
			(entry) => entry.path && entry.sha256.length === 64 && entry.bytes > 0,
		),
		"every inspected file must have privacy-safe path, digest, and size evidence",
	);

	const persisted = JSON.parse(await fs.readFile(receiptPath, "utf8"));
	assert.deepEqual(persisted, receipt);
	if (process.platform !== "win32") {
		assert.equal((await fs.stat(receiptPath)).mode & 0o777, 0o600);
	}

	await assert.rejects(
		() =>
			recordDesignSystemEvidence([
				"--quiet",
				"--target",
				"src/components/ui/primitives/Button.tsx",
				"--owner",
				"src/components/ui/primitives/Button.tsx",
			]),
		/colocated Storybook story/,
	);

	process.stdout.write(
		"Design-system evidence verification passed: policy, owner-story, and source order is durable and privacy-safe.\n",
	);
} finally {
	delete process.env.DESIGN_SYSTEM_EVIDENCE_DIR;
	await fs.rm(temporaryDirectory, { recursive: true, force: true });
}
