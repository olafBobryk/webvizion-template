import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
	createReferenceRecord,
	deleteReferenceRecord,
	getReferenceRecord,
	resetReferenceRecordFixtureState,
} from "../../src/app/(site)/dashboard/_lib/fixtures/reference-records.core";

resetReferenceRecordFixtureState();
const before = getReferenceRecord("org-demo", "north-star");
assert.ok(before);
assert.equal(
	deleteReferenceRecord("org-demo", "north-star", { simulateFailure: true }).ok,
	false,
);
assert.deepEqual(getReferenceRecord("org-demo", "north-star"), before);

const invalidCreate = createReferenceRecord("org-demo", { title: "" });
assert.equal(invalidCreate.ok, false);
if (!invalidCreate.ok) {
	assert.equal(invalidCreate.fieldErrors?.title, "Enter a record title.");
}

const source = readFileSync(
	resolve(
		process.cwd(),
		"src/app/(site)/dashboard/_components/entities/EntityDeletion.tsx",
	),
	"utf8",
);
for (const contract of [
	"onOptimisticDelete?.()",
	"onRollback?.()",
	"return false",
	"details: definition.impacts",
	"warning: definition.warning",
	"EntityDeletionCompletion",
	'completion.type === "navigate"',
	"router.replace(completion.href)",
	"catch {",
]) {
	assert.ok(
		source.includes(contract),
		`Missing deletion contract: ${contract}`,
	);
}

assert.ok(
	(source.match(/onRollback\?\.\(\)/g) ?? []).length >= 2,
	"Returned and thrown deletion failures must both roll back optimistic state.",
);

const detailActions = readFileSync(
	resolve(
		process.cwd(),
		"src/app/(site)/dashboard/_components/entities/record/RecordDetailActions.tsx",
	),
	"utf8",
);
assert.ok(detailActions.includes('type: "navigate"'));
assert.ok(detailActions.includes("replace: true"));
assert.ok(!detailActions.includes('router.push("/dashboard/records")'));

const collectionActions = readFileSync(
	resolve(
		process.cwd(),
		"src/app/(site)/dashboard/_components/entities/record/RecordCollectionImplementation.tsx",
	),
	"utf8",
);
assert.ok(collectionActions.includes('completion: { type: "refresh" }'));
console.log("Entity deletion failure and rollback verification passed.");
