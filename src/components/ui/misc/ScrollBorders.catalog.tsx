"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ScrollBorders } from "./ScrollBorders";

const rows = Array.from({ length: 12 }, (_, index) => `Result ${index + 1}`);
function CatalogPreview1() {
	const render = (args: Parameters<typeof ScrollBorders>[0]) => (
		<ScrollBorders
			{...args}
			data-testid="scroll-region"
			tabIndex={0}
			className="h-40 w-72 overflow-y-auto"
		>
			{rows.map((row) => (
				<div className="border-b border-border p-3" key={row}>
					{row}
				</div>
			))}
		</ScrollBorders>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{ onScroll: () => undefined } } as never);
}
function CatalogPreview2() {
	const render = () => (
		<ScrollBorders.Skeleton className="h-40 w-72">
			<div className="h-80 bg-muted/40" />
		</ScrollBorders.Skeleton>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-misc-scroll-borders",
	name: "ScrollBorders",
	role: "Scrollable-region wrapper that exposes overflow through shared top and bottom edge treatment.",
	importStatement: 'import { ScrollBorders } from "@/components/ui/misc";',
	chooseWhen: [
		"A constrained vertical region needs consistent overflow affordances.",
	],
	chooseInstead: [
		"Use ordinary document scrolling when the region is not independently constrained.",
	],
	compounds: ["ScrollBorders.Skeleton"],
	exclusions: ["Page-local scroll shadows and custom back-to-top overlays."],
	guarantees: [
		{
			label: "Overflow edge and scroll callback",
			storyId: "ui-misc-scroll-borders--overflow-contract",
		},
		{
			label: "Skeleton region ownership",
			storyId: "ui-misc-scroll-borders--skeleton-contract",
		},
	],

	family: "UI",
	group: "Misc",
	previewTargets: [
		{
			id: "overflow-contract",
			name: "Overflow edge and scroll callback",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "skeleton-contract",
			name: "Skeleton region ownership",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
	],
});
