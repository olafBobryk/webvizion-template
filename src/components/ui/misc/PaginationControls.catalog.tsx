"use client";

import { type ComponentType, createElement } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { PaginationControls } from "./PaginationControls";

function CatalogPreview1() {
	return createElement(
		PaginationControls as unknown as ComponentType<Record<string, unknown>>,
		{
			...{
				current: 2,
				total: 5,
				onPrev: () => undefined,
				onNext: () => undefined,
			},
			...{},
		},
	);
}
function CatalogPreview2() {
	const render = () => (
		<div className="grid gap-4">
			<PaginationControls
				current={1}
				total={5}
				onPrev={() => undefined}
				onNext={() => undefined}
				disablePrev
			/>
			<PaginationControls.Skeleton current={1} total={5} />
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({
		...{
			current: 2,
			total: 5,
			onPrev: () => undefined,
			onNext: () => undefined,
		},
		...{},
	} as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-misc-pagination-controls",
	name: "PaginationControls",
	role: "Compact previous/next paging control with a current-total indicator.",
	importStatement: 'import { PaginationControls } from "@/components/ui/misc";',
	chooseWhen: [
		"A bounded sequence needs compact previous and next navigation.",
	],
	chooseInstead: [
		"Use product pagination when users must jump directly among many numbered pages.",
	],
	compounds: ["PaginationControls.Skeleton"],
	exclusions: ["ImageSwitcher-internal index state."],
	guarantees: [
		{
			label: "Labels, callbacks, and disabled bounds",
			storyId: "ui-misc-pagination-controls--paging-contract",
		},
		{
			label: "Loading geometry",
			storyId: "ui-misc-pagination-controls--skeleton-parity",
		},
	],

	family: "UI",
	group: "Misc",
	previewTargets: [
		{
			id: "paging-contract",
			name: "Labels, callbacks, and disabled bounds",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "skeleton-parity",
			name: "Loading geometry",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
	],
});
