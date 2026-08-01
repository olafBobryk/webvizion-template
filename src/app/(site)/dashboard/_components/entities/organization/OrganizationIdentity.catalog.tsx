"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { getOrganizationPresentation } from "../../../_lib/entities/organization/presentation";
import { OrganizationIdentity } from "./OrganizationIdentity";

const presentation = getOrganizationPresentation({
	id: "organization-story",
	name: "Averlo Studio",
	profilePictureUrl: "/test/placeholder-square.jpg",
	role: "owner",
	slug: "averlo-studio",
});
const sizes = ["sm", "md", "lg", "xl"] as const;
const variants = ["default", "actor"] as const;
const visuals = ["profile-picture", "icon"] as const;
function CatalogPreview() {
	const render = () => (
		<div className="grid max-w-4xl gap-10">
			{visuals.map((visual) => (
				<section className="grid gap-6" key={visual}>
					<h2 className="font-semibold capitalize">{visual}</h2>
					{variants.map((variant) => (
						<div className="grid gap-4" key={variant}>
							<h3 className="font-medium capitalize">{variant}</h3>
							{sizes.map((avatarSize) => (
								<div className="grid gap-3 sm:grid-cols-2" key={avatarSize}>
									<OrganizationIdentity
										avatarSize={avatarSize}
										presentation={presentation}
										variant={variant}
										visual={visual}
									/>
									<OrganizationIdentity.Skeleton
										avatarSize={avatarSize}
										variant={variant}
										visual={visual}
									/>
								</div>
							))}
						</div>
					))}
				</section>
			))}
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{ presentation } } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "dashboard-entity-organization-identity",
	name: "OrganizationIdentity",
	role: "Canonical organization identity with mark, name, supporting details, visual variants, sizes, and skeleton parity.",
	importStatement:
		'import { OrganizationIdentity } from "./OrganizationIdentity";',
	chooseWhen: [
		"An organization must be recognized consistently across navigation, forms, and detail surfaces.",
	],
	chooseInstead: [
		"Use OrganizationSelector when users must change the value, or Logo for the product brand itself.",
	],
	compounds: [],
	exclusions: [
		"Caller-composed organization marks and labels.",
		"Account, member, and record identity presentations.",
	],
	guarantees: [
		{
			label: "Variants Sizes And Visuals",
			storyId:
				"dashboard-entity-organization-identity--variants-sizes-and-visuals",
		},
	],
	family: "Dashboard",
	group: "Entities / Organization",
	sweepSpan: "full",
	previewTargets: [
		{
			id: "variants-sizes-and-visuals",
			name: "Variants Sizes And Visuals",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview,
		},
	],
});
