import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const scopedRoutes = [
	"src/app/(site)/(auth)/forgot-password",
	"src/app/(site)/(auth)/invitation",
	"src/app/(site)/(auth)/login",
	"src/app/(site)/(auth)/reset-password",
	"src/app/(site)/(auth)/select-organization",
	"src/app/(site)/(auth)/set-password",
	"src/app/(site)/(auth)/sign-in-options",
	"src/app/(site)/dashboard",
	"src/app/(site)/dashboard/profile",
	"src/app/(site)/dashboard/administration",
	"src/app/(site)/dashboard/organization",
	"src/app/(site)/dashboard/organization/members",
	"src/app/(site)/dashboard/organization/members/[memberId]",
	"src/app/(site)/dashboard/organization/settings",
	"src/app/(site)/dashboard/organization/switch",
	"src/app/(site)/dashboard/records",
	"src/app/(site)/dashboard/records/[recordId]",
	"src/app/(site)/dashboard/reference/entities",
	"src/app/(site)/dashboard/reference/skeletons",
	"src/app/(site)/dashboard/settings",
] as const;

for (const route of scopedRoutes) {
	const loadingPath = resolve(root, route, "loading.tsx");
	assert.ok(
		existsSync(loadingPath),
		`${route} must own a loading.tsx boundary.`,
	);
	const loadingSource = readFileSync(loadingPath, "utf8");
	assert.equal(
		loadingSource.includes("<Skeleton"),
		false,
		`${route}/loading.tsx must delegate to component-owned loading views.`,
	);
}

const skeletonOwners = [
	"src/components/ui/input/text/EmailInput.tsx",
	"src/components/ui/input/text/PasswordInput.tsx",
	"src/components/ui/input/choice/RadioInput.tsx",
	"src/components/ui/input/choice/ToggleInput.tsx",
	"src/components/ui/input/choice/ChoiceField.tsx",
	"src/components/ui/misc/ProfilePicture.tsx",
	"src/components/composites/markdown/MarkdownRenderer.tsx",
	"src/app/(site)/_components/organization/OrganizationSelectionCard.tsx",
	"src/app/(site)/(auth)/_components/PasswordRecoveryRequestForm.tsx",
	"src/app/(site)/(auth)/_components/PasswordResetForm.tsx",
	"src/app/(site)/dashboard/_components/data/DashboardTablePanel.tsx",
	"src/app/(site)/dashboard/_components/detail/DashboardDetailField.tsx",
	"src/app/(site)/dashboard/_components/detail/DashboardPropertyList.tsx",
	"src/app/(site)/dashboard/_components/entities/member/MemberAvatarList.tsx",
	"src/app/(site)/dashboard/_components/entities/account/AccountIdentity.tsx",
	"src/app/(site)/dashboard/_components/entities/member/MemberIdentity.tsx",
	"src/app/(site)/dashboard/_components/entities/member/MemberMention.tsx",
	"src/app/(site)/dashboard/_components/entities/member/MemberRoleChip.tsx",
	"src/app/(site)/dashboard/_components/entities/member/MemberSelector.tsx",
	"src/app/(site)/dashboard/_components/entities/member/MemberSelectorDemo.tsx",
	"src/app/(site)/dashboard/_components/entities/organization/OrganizationIdentity.tsx",
	"src/app/(site)/dashboard/_components/entities/record/RecordCollectionClient.tsx",
	"src/app/(site)/dashboard/_components/entities/record/RecordDetailActions.tsx",
	"src/app/(site)/dashboard/_components/entities/record/RecordDetailContent.tsx",
	"src/app/(site)/dashboard/_components/entities/record/RecordStatusChip.tsx",
	"src/app/(site)/dashboard/settings/_components/AccountSettingsSections.tsx",
	"src/app/(site)/dashboard/settings/_components/ProfileSettingsSection.tsx",
	"src/app/(site)/dashboard/organization/settings/_components/OrganizationSettingsSection.tsx",
] as const;

for (const relativePath of skeletonOwners) {
	const source = readFileSync(resolve(root, relativePath), "utf8");
	assert.ok(
		source.includes("Object.assign") && source.includes("Skeleton:"),
		`${relativePath} must expose its loading state through Component.Skeleton.`,
	);
}

const tablePanel = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/_components/data/DashboardTablePanel.tsx",
	),
	"utf8",
);
assert.ok(
	tablePanel.includes("children: ReactNode") &&
		!tablePanel.includes("rowCount?: number"),
	"DashboardTablePanel.Skeleton must accept exact caller-owned rows.",
);

const forcedLoading = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/_components/debug/DashboardForcedLoadingView.tsx",
	),
	"utf8",
);
for (const route of [
	"/dashboard/profile",
	"/dashboard/administration",
	"/dashboard/settings",
	"/dashboard/organization/settings",
	"/dashboard/organization/switch",
	"/dashboard/organization/members",
	"/dashboard/organization",
	"/dashboard/records",
	"/dashboard/reference/entities",
	"/dashboard/reference/skeletons",
]) {
	assert.ok(
		forcedLoading.includes(route),
		`Forced loading registry must cover ${route}.`,
	);
}
assert.ok(
	forcedLoading.includes("organization\\/members\\/[^/]+") &&
		forcedLoading.includes("records\\/[^/]+"),
	"Forced loading registry must cover member and record detail routes.",
);

console.log("Route skeleton coverage and ownership verification passed.");
