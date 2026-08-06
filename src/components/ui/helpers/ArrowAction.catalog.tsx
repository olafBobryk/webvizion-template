"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ArrowAction } from "./ArrowAction";

function CatalogPreview1() {
	const render = () => (
		<div className="flex items-center gap-3">
			<ArrowAction aria-label="Open project" />
			<ArrowAction aria-label="Open documentation" href="/dashboard" />
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

function CatalogPreview2() {
	const render = () => (
		<div className="flex items-center gap-3">
			<ArrowAction decorative variant="secondary" />
			<ArrowAction decorative variant="primary" />
			<ArrowAction decorative variant="inverse" />
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-helpers-arrow-action",
	name: "ArrowAction",
	role: "Icon-only action composition with a directional outgoing/incoming arrow transition.",
	importStatement:
		'import { ArrowAction } from "@/components/ui/helpers/ArrowAction";',
	chooseWhen: [
		"A compact button or link needs the shared diagonal arrow departure and arrival treatment.",
	],
	chooseInstead: [
		"Use Button with a static icon for ordinary icon-only actions, or IconSwap when a control represents a stateful icon change.",
	],
	compounds: [],
	exclusions: [
		"Caller-owned focus rings or accessible names for interactive instances.",
		"A clickable decorative arrow; use decorative mode only when another element owns the interaction.",
	],
	guarantees: [
		{
			label: "Button and link semantics",
			storyId: "ui-helpers-arrow-action--interactive-and-navigation",
		},
		{
			label: "Decorative mode",
			storyId: "ui-helpers-arrow-action--decorative-composition",
		},
		{
			label: "Reduced-motion fallback",
			storyId: "ui-helpers-arrow-action--reduced-motion-fallback",
		},
	],

	family: "UI",
	group: "Helpers",
	previewTargets: [
		{
			id: "interactive-and-navigation",
			name: "Interactive and navigation",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "decorative-composition",
			name: "Decorative composition",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
	],
});
