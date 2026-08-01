"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { getMemberPresentation } from "../../../_lib/entities/member/presentation";
import { MemberIdentity } from "./MemberIdentity";

const presentation = getMemberPresentation({
	createdAt: "2026-01-12T08:00:00.000Z",
	id: "membership-story-taylor",
	organizationId: "organization-story",
	role: "owner",
	user: {
		email: "taylor@averlo.local",
		id: "user-story-taylor",
		name: "Taylor Morgan",
		profilePictureUrl: "/test/placeholder-portrait.jpg",
	},
});
const sizes = ["sm", "md", "lg", "xl"] as const;
const variants = ["default", "actor"] as const;
function CatalogPreview() {
	const render = () => (
		<div className="grid max-w-4xl gap-8">
			{variants.map((variant) => (
				<section className="grid gap-4" key={variant}>
					<h2 className="font-semibold capitalize">{variant}</h2>
					{sizes.map((avatarSize) => (
						<div className="grid gap-3 sm:grid-cols-2" key={avatarSize}>
							<MemberIdentity
								avatarSize={avatarSize}
								presentation={presentation}
								variant={variant}
							/>
							<MemberIdentity.Skeleton
								avatarSize={avatarSize}
								variant={variant}
							/>
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
	id: "dashboard-entity-member-identity",
	name: "MemberIdentity",
	role: "Canonical organization-member identity with avatar, person details, variants, sizes, and skeleton parity.",
	importStatement: 'import { MemberIdentity } from "./MemberIdentity";',
	chooseWhen: [
		"A person must be presented specifically in their organization membership context.",
	],
	chooseInstead: [
		"Use AccountIdentity for account-only context or MemberMention for compact inline prose.",
	],
	compounds: [],
	exclusions: [
		"Caller-composed member avatar, name, and metadata rows.",
		"Selection behavior, which belongs to MemberSelector.",
	],
	guarantees: [
		{
			label: "Variants And Sizes",
			storyId: "dashboard-entity-member-identity--variants-and-sizes",
		},
	],
	family: "Dashboard",
	group: "Entities / Member",
	sweepSpan: "full",
	previewTargets: [
		{
			id: "variants-and-sizes",
			name: "Variants And Sizes",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview,
		},
	],
});
