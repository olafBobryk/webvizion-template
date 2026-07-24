import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
for (const relativePath of [
	"src/app/(site)/dashboard/_components/entities/member/MemberAvatar.tsx",
	"src/app/(site)/dashboard/_components/entities/account/AccountIdentity.tsx",
	"src/app/(site)/dashboard/_components/entities/member/MemberIdentity.tsx",
	"src/app/(site)/dashboard/_components/entities/organization/OrganizationAvatar.tsx",
	"src/app/(site)/dashboard/_components/entities/organization/OrganizationIdentity.tsx",
	"src/app/(site)/dashboard/_components/data/DashboardTablePanel.tsx",
	"src/app/(site)/dashboard/_components/detail/DashboardDetailField.tsx",
	"src/app/(site)/dashboard/_components/layout/DashboardPageHeader.tsx",
]) {
	const source = readFileSync(resolve(root, relativePath), "utf8");
	assert.ok(
		source.includes("Object.assign") && source.includes("Skeleton:"),
		`${relativePath} must own its Skeleton namespace.`,
	);
}

const reference = [
	"src/app/(site)/dashboard/reference/entities/_components/EntityReferenceSurface.tsx",
	"src/app/(site)/dashboard/reference/entities/EntitySkeletonReference.tsx",
]
	.map((relativePath) => readFileSync(resolve(root, relativePath), "utf8"))
	.join("\n");
const tablePanel = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/_components/data/DashboardTablePanel.tsx",
	),
	"utf8",
);
const recordCollection = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/_components/entities/record/RecordCollectionImplementation.tsx",
	),
	"utf8",
);
const memberAvatar = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/_components/entities/member/MemberAvatar.tsx",
	),
	"utf8",
);
const organizationAvatar = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/_components/entities/organization/OrganizationAvatar.tsx",
	),
	"utf8",
);
assert.ok(
	memberAvatar.includes("export function MemberAvatarSkeleton"),
	"Server-owned skeleton compositions need a named client-boundary export.",
);
assert.ok(
	organizationAvatar.includes("export function OrganizationAvatarSkeleton"),
	"Organization skeleton compositions need a named client-boundary export.",
);
for (const usage of [
	"AccountIdentity.Skeleton",
	"MemberIdentity.Skeleton",
	"OrganizationIdentity.Skeleton",
	"DashboardTablePanel.Skeleton",
	"DashboardDetailField.Skeleton",
	"Accordion.Skeleton",
]) {
	assert.ok(reference.includes(usage), `Reference route must show ${usage}.`);
}
assert.ok(
	tablePanel.includes('kind?: "action" | "data"') &&
		tablePanel.includes("responsivePriority?: number"),
	"Dashboard table columns must expose action ownership and responsive priority.",
);
assert.ok(
	recordCollection.includes('kind: "action"'),
	"Record row actions must use the canonical action-column contract.",
);
assert.ok(
	reference.includes("responsivePriority: 100") &&
		reference.includes('kind: "action"'),
	"Reference route must demonstrate responsive priority and action retention.",
);
console.log("Entity skeleton ownership and parity verification passed.");
