"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Text } from "./Text";

function CatalogPreview1() {
	const render = () => (
		<div className="grid gap-3">
			<Text as="h1" variant="headingHero">
				Hero heading
			</Text>
			<Text as="h2" variant="headingPage">
				Page heading
			</Text>
			<Text as="h3" variant="headingLg">
				Section heading
			</Text>
			<Text variant="bodyStrong">Strong body</Text>
			<Text variant="body">Body copy</Text>
			<Text variant="caption">Caption</Text>
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
		<div className="grid gap-4">
			<div className="grid gap-1">
				<Text>Default foreground</Text>
				<Text tone="muted">Muted supporting copy</Text>
			</div>
			<div className="grid gap-1 rounded-xl bg-foreground p-4">
				<Text theme="light">Light-theme foreground</Text>
				<Text theme="light" tone="muted">
					Light-theme supporting copy
				</Text>
			</div>
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview3() {
	const render = () => (
		<div className="grid gap-4">
			<Text as="label" htmlFor="storybook-text-input" variant="bodyStrong">
				Project name
			</Text>
			<input id="storybook-text-input" className="rounded-lg border p-2" />
			<Text.Skeleton as="p" variant="support">
				Loading supporting copy
			</Text.Skeleton>
			<Text.Skeleton
				as="p"
				data-testid="compact-text-skeleton"
				density="compact"
				variant="support"
			>
				Loading compact supporting copy
			</Text.Skeleton>
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-primitives-text",
	name: "Text",
	role: "Canonical typography, semantic tone, and text-skeleton primitive.",
	importStatement: 'import { Text } from "@/components/ui/primitives/Text";',
	chooseWhen: [
		"Visible copy needs the shared type scale, semantic tone, theme contrast, polymorphic element, or skeleton.",
	],
	chooseInstead: [
		"Use an owning component's text props when it already controls the copy slot.",
	],
	compounds: ["Text.Skeleton"],
	exclusions: [
		"Hardcoded component-level typography recipes.",
		"textVariants as a standalone consumer component or catalogue identity.",
	],
	guarantees: [
		{ label: "Shared type scale", storyId: "ui-primitives-text--type-scale" },
		{
			label: "Semantic tone and theme contrast",
			storyId: "ui-primitives-text--tone-and-theme",
		},
		{
			label: "Polymorphism and skeleton",
			storyId: "ui-primitives-text--polymorphism-and-skeleton",
		},
	],

	family: "UI",
	group: "Primitives",
	sweepSpan: "full",
	previewTargets: [
		{
			id: "type-scale",
			name: "Shared type scale",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "tone-and-theme",
			name: "Semantic tone and theme contrast",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
		{
			id: "polymorphism-and-skeleton",
			name: "Polymorphism and skeleton",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview3,
		},
	],
});
