"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { memberRolePresentation } from "../../../_lib/entities/member/presentation";
import { MemberRoleChip } from "./MemberRoleChip";

const roles = ["owner", "admin", "member"] as const;
function CatalogPreview() {
	const render = () => (
		<div className="flex flex-wrap items-center gap-3">
			{roles.map((role) => (
				<MemberRoleChip
					key={role}
					label={memberRolePresentation[role].shortLabel}
					tone={memberRolePresentation[role].tone}
				/>
			))}
			<MemberRoleChip.Skeleton />
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{ label: "Member", tone: "neutral" } } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "dashboard-entity-member-role-chip",
	name: "MemberRoleChip",
	role: "Semantic organization-role label with canonical tone mapping and loading geometry.",
	importStatement: 'import { MemberRoleChip } from "./MemberRoleChip";',
	chooseWhen: [
		"An organization member role must be scanned as compact status-like metadata.",
	],
	chooseInstead: [
		"Use MemberIdentity when the person is primary, or StatusMessage for actionable feedback.",
	],
	compounds: [],
	exclusions: [
		"Caller-selected chip colors for member roles.",
		"Interactive role selection controls.",
	],
	guarantees: [
		{
			label: "Roles And Loading",
			storyId: "dashboard-entity-member-role-chip--roles-and-loading",
		},
	],
	family: "Dashboard",
	group: "Entities / Member",
	previewTargets: [
		{
			id: "roles-and-loading",
			name: "Roles And Loading",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview,
		},
	],
});
