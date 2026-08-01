"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Skeleton } from "./Skeleton";

function CatalogPreview1() {
	const render = () => (
		<Skeleton data-testid="placeholder" className="w-64 p-3">
			Final content width
		</Skeleton>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview2() {
	const render = () => (
		<div className="flex gap-3">
			{(["none", "sm", "md", "lg", "xl", "2xl", "full"] as const).map(
				(radius) => (
					<Skeleton
						key={radius}
						radius={radius}
						className="size-14"
						data-testid={`radius-${radius}`}
					/>
				),
			)}
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-misc-skeleton",
	name: "Skeleton",
	role: "Base non-interactive placeholder used when no component-owned skeleton exists.",
	importStatement: 'import { Skeleton } from "@/components/ui/misc";',
	chooseWhen: [
		"Initial loading needs a shape placeholder and no higher-level skeleton exists.",
	],
	chooseInstead: [
		"Use the final component's Skeleton compound whenever available.",
	],
	compounds: [],
	exclusions: [
		"One-off shimmer implementations and interactive loading placeholders.",
	],
	guarantees: [
		{
			label: "Hidden semantics and sizing content",
			storyId: "ui-misc-skeleton--non-interactive-contract",
		},
		{ label: "Owned radius scale", storyId: "ui-misc-skeleton--radius-scale" },
	],

	family: "UI",
	group: "Misc",
	previewTargets: [
		{
			id: "non-interactive-contract",
			name: "Hidden semantics and sizing content",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "radius-scale",
			name: "Owned radius scale",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
	],
});
