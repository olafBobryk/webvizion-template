"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { getMemberPresentation } from "../../../_lib/entities/member/presentation";
import { MemberMention } from "./MemberMention";

const presentation = getMemberPresentation({
	createdAt: "2026-01-12T08:00:00.000Z",
	id: "membership-mention",
	organizationId: "organization-story",
	role: "member",
	user: {
		email: "avery@averlo.local",
		id: "user-mention",
		name: "Avery Chen",
		profilePictureUrl: "/test/placeholder-portrait.jpg",
	},
});
function CatalogPreview() {
	const render = () => (
		<p>
			Assigned to <MemberMention presentation={presentation} /> ·{" "}
			<MemberMention.Skeleton />
		</p>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{ presentation } } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "dashboard-entity-member-mention",
	name: "MemberMention",
	role: "Compact inline member reference for prose, activity, and message content with skeleton parity.",
	importStatement: 'import { MemberMention } from "./MemberMention";',
	chooseWhen: [
		"A member identity must appear inline without the geometry of a full identity row.",
	],
	chooseInstead: [
		"Use MemberIdentity for standalone rows or MemberAvatarList for a compact group summary.",
	],
	compounds: [],
	exclusions: [
		"Full member cards or selection controls.",
		"Plain styled text that loses the shared member reference treatment.",
	],
	guarantees: [
		{
			label: "Live And Loading",
			storyId: "dashboard-entity-member-mention--live-and-loading",
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
