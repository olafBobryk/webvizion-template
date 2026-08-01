"use client";

import { useState } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { getMemberPresentation } from "../../../_lib/entities/member/presentation";
import { MemberSelector } from "./MemberSelector";

const members = [
	["Taylor Morgan", "taylor@averlo.local", "owner"],
	["Avery Chen", "avery@averlo.local", "admin"],
	["Sam Rivera", "sam@averlo.local", "member"],
].map(([name, email, role], index) =>
	getMemberPresentation({
		createdAt: "2026-01-12T08:00:00.000Z",
		id: `membership-story-${index}`,
		organizationId: "organization-story",
		role: role as "admin" | "member" | "owner",
		user: {
			email,
			id: `user-story-${index}`,
			name,
			profilePictureUrl: "/test/placeholder-portrait.jpg",
		},
	}),
);
function ControlledMemberSelector() {
	const [value, setValue] = useState<string | null>(members[0].id);
	return (
		<div className="w-80">
			<MemberSelector members={members} onChange={setValue} value={value} />
		</div>
	);
}
function CatalogPreview() {
	const render = () => <ControlledMemberSelector />;
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "dashboard-entity-member-selector",
	name: "MemberSelector",
	role: "Organization-member selection control with canonical identity rendering and controlled value semantics.",
	importStatement: 'import { MemberSelector } from "./MemberSelector";',
	chooseWhen: [
		"A form or workflow needs controlled selection from known organization members.",
	],
	chooseInstead: [
		"Use MemberIdentity for read-only presentation or a generic SelectInput for non-member options.",
	],
	compounds: [],
	exclusions: [
		"Action menus that only resemble persistent member selection.",
		"Page-local member option rendering or selection state.",
	],
	guarantees: [
		{
			label: "Selection",
			storyId: "dashboard-entity-member-selector--selection",
		},
	],
	family: "Dashboard",
	group: "Entities / Member",
	sweepSpan: "full",
	previewTargets: [
		{
			id: "selection",
			name: "Selection",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview,
		},
	],
});
