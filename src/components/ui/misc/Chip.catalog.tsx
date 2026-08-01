"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Chip } from "./Chip";

function CatalogPreview1() {
	const render = () => {
		const onClick = () => undefined;
		return (
			<div className="flex gap-3">
				<Chip>Static</Chip>
				<Chip href="/docs">Documentation</Chip>
				<Chip onClick={onClick} data-testid="chip-action">
					Remove filter
				</Chip>
			</div>
		);
	};
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{ children: "Static" } } as never);
}
function CatalogPreview2() {
	const render = () => (
		<div className="flex flex-wrap gap-2">
			{(
				[
					"neutral",
					"primary",
					"success",
					"warning",
					"danger",
					"helper",
				] as const
			).map((tone, index) => (
				<Chip key={tone} tone={tone} helperIndex={index}>
					{tone}
				</Chip>
			))}
			<Chip.Skeleton leadingIcon trailingIcon>
				Loading chip
			</Chip.Skeleton>
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{ children: "Tone" } } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-misc-chip",
	name: "Chip",
	role: "Compact static, linked, or button-like label and status surface.",
	importStatement: 'import { Chip } from "@/components/ui/misc";',
	chooseWhen: [
		"A compact source, status, filter, or token-like action needs shared surface-aware chrome.",
	],
	chooseInstead: [
		"Use Button for full actions and StatusMessage for persistent contextual notices.",
	],
	compounds: ["Chip.Text", "Chip.Skeleton"],
	exclusions: [
		"Caller-owned pill backgrounds that bypass tone and surface tint ownership.",
	],
	guarantees: [
		{
			label: "Static, link, and button semantics",
			storyId: "ui-misc-chip--semantic-modes",
		},
		{
			label: "Tone and skeleton ownership",
			storyId: "ui-misc-chip--tones-and-skeleton",
		},
	],

	family: "UI",
	group: "Misc",
	previewTargets: [
		{
			id: "semantic-modes",
			name: "Static, link, and button semantics",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "tones-and-skeleton",
			name: "Tone and skeleton ownership",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
	],
});
