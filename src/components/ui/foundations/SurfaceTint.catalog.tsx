"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { createSurfaceTint } from "./surfaceTint";

function CatalogPreview1() {
	const render = () => {
		const tint = createSurfaceTint({
			surface: "var(--surface)",
			space: "oklab",
			tint: "var(--primary)",
			tintPercentage: 12,
		});
		return (
			<div
				className="grid gap-3 rounded-md border p-4"
				style={{ background: tint }}
			>
				<strong>Tinted surface</strong>
				<code data-testid="tint-recipe">{tint}</code>
			</div>
		);
	};
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-foundations-surface-tint",
	name: "Surface Tint",
	role: "Canonical color-mix recipe builder for opaque tinted surfaces that preserve their actual container ownership.",
	importStatement:
		'import { createSurfaceTint } from "@/components/ui/foundations/surfaceTint";',
	chooseWhen: [
		"A library owner needs a reusable tint mixed against its surface token.",
	],
	chooseInstead: [
		"Use Panel or Card semantic backgrounds when an existing surface variant already fits.",
	],
	compounds: ["SurfaceTintOptions", "SurfaceTintSpace"],
	exclusions: [
		"Component-local color-mix strings that duplicate a shared tint recipe.",
	],
	guarantees: [
		{
			label: "Stable color-mix recipe",
			storyId: "ui-foundations-surface-tint--stable-recipe",
		},
	],

	family: "UI",
	group: "Foundations",
	previewTargets: [
		{
			id: "stable-recipe",
			name: "Stable color-mix recipe",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
