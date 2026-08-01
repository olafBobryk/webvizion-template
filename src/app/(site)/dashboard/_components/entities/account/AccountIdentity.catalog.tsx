"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { getAccountPresentation } from "../../../_lib/entities/account/presentation";
import { AccountIdentity } from "./AccountIdentity";

const presentation = getAccountPresentation({
	membership: {
		createdAt: "2026-01-12T08:00:00.000Z",
		id: "membership-story-account",
		organizationId: "organization-story",
		role: "owner",
		status: "active",
		userId: "user-story-account",
	},
	organization: {
		id: "organization-story",
		mode: "multi",
		name: "Averlo Studio",
		slug: "averlo-studio",
	},
	user: {
		email: "taylor@averlo.local",
		id: "user-story-account",
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
							<AccountIdentity
								avatarSize={avatarSize}
								presentation={presentation}
								variant={variant}
							/>
							<AccountIdentity.Skeleton
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
	id: "dashboard-entity-account-identity",
	name: "AccountIdentity",
	role: "Canonical account avatar-and-label identity with shared variants, sizes, and loading geometry.",
	importStatement: 'import { AccountIdentity } from "./AccountIdentity";',
	chooseWhen: [
		"An account must be identified consistently by avatar, name, and optional supporting metadata.",
	],
	chooseInstead: [
		"Use MemberIdentity for organization membership context or a plain Avatar when no identity label is needed.",
	],
	compounds: [],
	exclusions: [
		"Caller-composed avatar and name rows that bypass shared identity sizing.",
		"Organization and record identity presentations.",
	],
	guarantees: [
		{
			label: "Variants And Sizes",
			storyId: "dashboard-entity-account-identity--variants-and-sizes",
		},
	],
	family: "Dashboard",
	group: "Entities / Account",
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
