import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

function read(relativePath: string) {
	return readFileSync(resolve(root, relativePath), "utf8");
}

function assertIncludes(source: string, needle: string, label: string) {
	assert.ok(source.includes(needle), `Missing ${label}: ${needle}`);
}

const fullShell = read("src/components/ui/overlays/modal/ModalShell.tsx");
const thinShell = read(
	"template-profiles/thin-start/overrides/src/components/ui/overlays/modal/ModalShell.tsx",
);
const fullConfirmation = read(
	"src/components/ui/overlays/modal/ConfirmationModal.tsx",
);
const thinConfirmation = read(
	"template-profiles/thin-start/overrides/src/components/ui/overlays/modal/ConfirmationModal.tsx",
);

for (const [label, source] of [
	["full modal shell", fullShell],
	["thin modal shell", thinShell],
] as const) {
	for (const contract of [
		"export function useModalSubmission()",
		"submissionRef",
		"beginSubmission",
		"endSubmission",
		"isSubmitting",
		"requestClose",
		"if (!submissionRef.current) onClose();",
	]) {
		assertIncludes(source, contract, `${label} submission contract`);
	}
}

for (const [label, source] of [
	["full confirmation", fullConfirmation],
	["thin confirmation", thinConfirmation],
] as const) {
	for (const contract of [
		"useModalSubmission",
		"if (!beginSubmission()) return",
		"shouldEndSubmission = false",
		"if (shouldEndSubmission) endSubmission()",
	]) {
		assertIncludes(source, contract, `${label} pending handoff`);
	}
}

const modalForm = read("src/components/ui/overlays/modal/ModalForm.tsx");
assertIncludes(modalForm, "isSubmitting?: boolean", "step form pending API");
assert.ok(
	(modalForm.match(/disabled=\{isSubmitting\}/g) ?? []).length >= 3,
	"ModalStepForm must disable Back, Cancel, and Next while pending.",
);
assertIncludes(
	modalForm,
	"steps={indicatorSteps}",
	"step indicator pending lock",
);
assertIncludes(
	modalForm,
	"if (!isSubmitting) onStepChange(step)",
	"step callback pending guard",
);

assertIncludes(
	read("src/components/ui/overlays/modal/ModalHost.tsx"),
	"ariaLabel={options?.ariaLabel}",
	"modal aria label forwarding",
);
assertIncludes(
	read("src/components/ui/overlays/modal/useConfirmationModal.tsx"),
	"ariaLabel: title",
	"confirmation aria label",
);

for (const relativePath of [
	"src/app/(site)/dashboard/_components/entities/record/RecordCollectionImplementation.tsx",
	"src/app/(site)/dashboard/_components/entities/record/RecordDetailActions.tsx",
	"src/app/(site)/dashboard/_components/detail/DashboardMarkdownEditorModalButton.tsx",
	"src/components/composites/markdown/MarkdownEditor.tsx",
]) {
	const source = read(relativePath);
	assertIncludes(source, "useModalSubmission", `${relativePath} adoption`);
	assertIncludes(
		source,
		"if (!beginSubmission()) return",
		`${relativePath} guard`,
	);
}

const collection = read(
	"src/app/(site)/dashboard/_components/entities/record/RecordCollectionImplementation.tsx",
);
assertIncludes(
	collection,
	'completion: { type: "refresh" }',
	"collection deletion completion",
);

const detail = read(
	"src/app/(site)/dashboard/_components/entities/record/RecordDetailActions.tsx",
);
assertIncludes(detail, 'type: "navigate"', "detail deletion navigation");
assertIncludes(detail, "replace: true", "detail replacement navigation");
assert.ok(
	!detail.includes('router.push("/dashboard/records")'),
	"Detail deletion must not own a second navigation path.",
);

const referenceRecords = read(
	"src/app/(site)/dashboard/_lib/fixtures/reference-records.core.ts",
);
assertIncludes(referenceRecords, "fieldErrors?", "structured record errors");

console.log("Full/thin modal mutation policy verification passed.");
