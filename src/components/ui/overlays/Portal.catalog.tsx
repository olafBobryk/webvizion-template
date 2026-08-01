"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import Portal from "./Portal";

function CatalogPreview1() {
	const render = () => (
		<div className="grid gap-2">
			<p>Source location</p>
			<div
				className="rounded-md border border-dashed p-3"
				id="catalog-portal-target"
			/>
			<Portal target="catalog-portal-target">
				<p>Portaled into the configured target</p>
			</Portal>
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
		<Portal target="missing-catalog-target">
			<p data-testid="body-portal-content">Portaled to the document body</p>
		</Portal>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-overlays-portal",
	name: "Portal",
	role: "Low-level shared portal boundary for reusable owners that must escape their layout stacking context.",
	importStatement: 'import Portal from "@/components/ui/overlays/Portal";',
	chooseWhen: [
		"A reusable component must render into a configured DOM target outside its parent flow.",
	],
	chooseInstead: [
		"Use Modal, Dropdown, or Toast owners for their specialized interaction and host behavior.",
	],
	compounds: [],
	exclusions: [
		"Scattered direct createPortal calls.",
		"Modal, dropdown, or toast behavior implemented directly on Portal.",
	],
	guarantees: [
		{
			label: "Configured target routing",
			storyId: "ui-overlays-portal--configured-target",
		},
		{ label: "Body fallback", storyId: "ui-overlays-portal--body-fallback" },
	],

	family: "UI",
	group: "Overlays",
	previewTargets: [
		{
			id: "configured-target",
			name: "Configured target routing",
			baseline: {},
			axes: [],
			stage: "overlay",
			Render: CatalogPreview1,
		},
		{
			id: "body-fallback",
			name: "Body fallback",
			baseline: {},
			axes: [],
			stage: "overlay",
			Render: CatalogPreview2,
		},
	],
});
