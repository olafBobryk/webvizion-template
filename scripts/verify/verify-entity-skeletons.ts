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
	"src/app/(site)/dashboard/_components/entities/record/RecordAvatar.tsx",
	"src/app/(site)/dashboard/_components/entities/record/RecordIdentity.tsx",
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

const memberAvatar = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/_components/entities/member/MemberAvatar.tsx",
	),
	"utf8",
);
const accountIdentity = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/_components/entities/account/AccountIdentity.tsx",
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
const recordAvatar = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/_components/entities/record/RecordAvatar.tsx",
	),
	"utf8",
);
const entityIdentity = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/_components/entities/EntityIdentity.tsx",
	),
	"utf8",
);
const textPrimitive = readFileSync(
	resolve(root, "src/components/ui/primitives/Text.tsx"),
	"utf8",
);
const memberIdentity = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/_components/entities/member/MemberIdentity.tsx",
	),
	"utf8",
);
const organizationIdentity = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/_components/entities/organization/OrganizationIdentity.tsx",
	),
	"utf8",
);
const recordIdentity = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/_components/entities/record/RecordIdentity.tsx",
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
for (const [name, source] of [
	["OrganizationAvatar", organizationAvatar],
	["RecordAvatar", recordAvatar],
] as const) {
	assert.ok(
		source.includes("<ProfilePicture") && source.includes("fallback={"),
		`${name} icons must render inside ProfilePicture geometry.`,
	);
	assert.equal(
		source.includes("Icon.Skeleton"),
		false,
		`${name} loading state must use the owning ProfilePicture skeleton.`,
	);
}
assert.ok(
	accountIdentity.includes(
		'export type AccountIdentityVariant = "actor" | "default";',
	),
	"Account identity must expose only default and actor variants.",
);
assert.equal(
	accountIdentity.match(/variant = "default"/g)?.length,
	2,
	"Live and skeleton account identities must both default to default geometry.",
);
for (const required of [
	'const actor = variant === "actor";',
	'const resolvedAvatarSize = avatarSize ?? (actor ? "sm" : "md");',
	"size={resolvedAvatarSize}",
	"avatarSize={resolvedAvatarSize}",
	'primaryAs="span"',
	"secondaryLabel={actor ? undefined : presentation.emailLabel}",
	"secondaryLabel={actor ? undefined : emailLabel}",
	"variant={variant}",
]) {
	assert.ok(
		accountIdentity.includes(required),
		`Account identity live/skeleton geometry must include ${required}.`,
	);
}
assert.ok(
	entityIdentity.includes(
		'export type EntityIdentityVariant = "actor" | "default";',
	),
	"Shared identity must expose only default and actor layouts.",
);
assert.ok(
	entityIdentity.includes("const defaultPrimaryVariantByAvatarSize = {") &&
		entityIdentity.includes("function getPrimaryVariant(") &&
		entityIdentity.includes("avatarSize?: EntityIdentityAvatarSize;"),
	"Shared EntityIdentity must own default avatar-size name hierarchy.",
);
assert.ok(
	memberIdentity.includes(
		'export type MemberIdentityVariant = "actor" | "default";',
	) && memberIdentity.match(/variant = "default"/g)?.length === 2,
	"Member identity must retain the default/actor baseline.",
);
assert.ok(
	organizationIdentity.includes(
		'export type OrganizationIdentityVariant = "actor" | "default";',
	) && organizationIdentity.match(/variant = "default"/g)?.length === 2,
	"Organization identity must retain the default/actor baseline.",
);
assert.ok(
	recordIdentity.includes(
		'export type RecordIdentityVariant = "actor" | "default";',
	) && recordIdentity.includes("RecordAvatar.Skeleton"),
	"Record identity must implement the shared baseline with owned loading geometry.",
);
for (const source of [
	entityIdentity,
	accountIdentity,
	memberIdentity,
	organizationIdentity,
	recordIdentity,
]) {
	assert.equal(
		source.includes('variant="compact"'),
		false,
		"Identity contracts must not retain the retired compact variant.",
	);
	assert.equal(
		source.includes('"profile"'),
		false,
		"Identity contracts must not retain the retired profile variant.",
	);
}
for (const [name, source] of [
	["AccountIdentity", accountIdentity],
	["MemberIdentity", memberIdentity],
	["OrganizationIdentity", organizationIdentity],
	["RecordIdentity", recordIdentity],
] as const) {
	assert.ok(
		source.includes("avatarSize={resolvedAvatarSize}"),
		`${name} must pass its resolved avatar size to EntityIdentity.`,
	);
	assert.equal(
		source.includes("primaryVariant"),
		false,
		`${name} must not own a primary text-variant override.`,
	);
}
for (const forbidden of ['"compact" | "profile"', 'variant === "profile"']) {
	assert.equal(
		accountIdentity.includes(forbidden),
		false,
		`Account identity must not retain ${forbidden}.`,
	);
}
assert.ok(
	textPrimitive.includes(
		'export type TextSkeletonDensity = "default" | "compact";',
	) && textPrimitive.includes('density === "compact"'),
	"Text.Skeleton must own the compact density treatment.",
);
assert.equal(
	entityIdentity.match(/density="compact"/g)?.length,
	2,
	"Identity primary and secondary loading bars must both use compact Text.Skeleton density.",
);

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
assert.ok(
	tablePanel.includes('kind?: "action" | "data"') &&
		tablePanel.includes("responsivePriority?: number"),
	"Dashboard table columns must expose action ownership and responsive priority.",
);
assert.ok(
	recordCollection.includes('kind: "action"'),
	"Record row actions must use the canonical action-column contract.",
);

console.log("Permanent entity skeleton ownership verification passed.");
