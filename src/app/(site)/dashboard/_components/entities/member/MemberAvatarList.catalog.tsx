"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { getMemberPresentation } from "../../../_lib/entities/member/presentation";
import { MemberAvatarList } from "./MemberAvatarList";

const members = ["Taylor Morgan", "Avery Chen", "Sam Rivera", "Robin Park"].map(
	(name, index) =>
		getMemberPresentation({
			createdAt: "2026-01-12T08:00:00.000Z",
			id: `membership-avatar-${index}`,
			organizationId: "organization-story",
			role: "member",
			user: {
				email: `${name.toLowerCase().replace(" ", ".")}@averlo.local`,
				id: `user-avatar-${index}`,
				name,
				profilePictureUrl: "/test/placeholder-portrait.jpg",
			},
		}),
);
function CatalogPreview() {
	const render = () => (
		<div className="grid gap-6">
			<MemberAvatarList members={members} />
			<MemberAvatarList.Skeleton count={3} />
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{ members } } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "dashboard-entity-member-avatar-list",
	name: "MemberAvatarList",
	role: "Compact member-avatar collection with shared overlap, count, accessibility, and skeleton behavior.",
	importStatement: 'import { MemberAvatarList } from "./MemberAvatarList";',
	chooseWhen: [
		"Several organization members need a compact visual summary without full identity rows.",
	],
	chooseInstead: [
		"Use MemberIdentity when names or supporting metadata must remain visible for each member.",
	],
	compounds: [],
	exclusions: [
		"Hand-built overlapping avatar stacks or caller-owned overflow counters.",
		"Selectable member collections, which belong to MemberSelector.",
	],
	guarantees: [
		{
			label: "Live And Loading",
			storyId: "dashboard-entity-member-avatar-list--live-and-loading",
		},
	],
	family: "Dashboard",
	group: "Entities / Member",
	previewTargets: [
		{
			id: "live-and-loading",
			name: "Live And Loading",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview,
		},
	],
});
