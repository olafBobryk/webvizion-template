"use client";

import { useState } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { getOrganizationPresentation } from "../../../_lib/entities/organization/presentation";
import type { OrganizationIdentityVisual } from "./OrganizationAvatar";
import { OrganizationSelector } from "./OrganizationSelector";

const organizations = [
	["Averlo Studio", "averlo-studio", "owner"],
	["Northstar Lab", "northstar-lab", "admin"],
	["Field Notes", "field-notes", "member"],
].map(([name, slug, role], index) =>
	getOrganizationPresentation({
		id: `organization-story-${index}`,
		name,
		profilePictureUrl: "/test/placeholder-square.jpg",
		role: role as "admin" | "member" | "owner",
		slug,
	}),
);
function ControlledOrganizationSelector({
	visual,
}: {
	visual?: OrganizationIdentityVisual;
}) {
	const [value, setValue] = useState<string | null>(organizations[0].id);
	return (
		<div className="w-80">
			<OrganizationSelector
				onChange={setValue}
				organizations={organizations}
				value={value}
				visual={visual}
			/>
		</div>
	);
}
function CatalogPreview() {
	const render = () => <ControlledOrganizationSelector />;
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "dashboard-entity-organization-selector",
	name: "OrganizationSelector",
	role: "Controlled organization selection with canonical identity visuals and option semantics.",
	importStatement:
		'import { OrganizationSelector } from "./OrganizationSelector";',
	chooseWhen: [
		"A workflow needs controlled selection from organizations the account can access.",
	],
	chooseInstead: [
		"Use OrganizationIdentity for read-only presentation or SelectInput for non-organization values.",
	],
	compounds: [],
	exclusions: [
		"Action-menu semantics for persistent organization selection.",
		"Page-local organization option and avatar rendering.",
	],
	guarantees: [
		{
			label: "Selection",
			storyId: "dashboard-entity-organization-selector--selection",
		},
	],
	family: "Dashboard",
	group: "Entities / Organization",
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
