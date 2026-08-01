"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { RecordIdentity } from "./RecordIdentity";

const presentation = { slugLabel: "north-star", title: "North star" };
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
							<RecordIdentity
								avatarSize={avatarSize}
								presentation={presentation}
								variant={variant}
							/>
							<RecordIdentity.Skeleton
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
	id: "dashboard-entity-record-identity",
	name: "RecordIdentity",
	role: "Canonical record identity with icon, title, supporting metadata, variants, sizes, and skeleton parity.",
	importStatement: 'import { RecordIdentity } from "./RecordIdentity";',
	chooseWhen: [
		"A record must be recognized consistently across collection rows, selectors, and detail surfaces.",
	],
	chooseInstead: [
		"Use RecordSelector when users must change the value, or RecordStatusChip for lifecycle metadata alone.",
	],
	compounds: [],
	exclusions: [
		"Caller-composed record icons, titles, and metadata rows.",
		"Account, member, and organization identity presentations.",
	],
	guarantees: [
		{
			label: "Variants And Sizes",
			storyId: "dashboard-entity-record-identity--variants-and-sizes",
		},
	],
	family: "Dashboard",
	group: "Entities / Record",
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
