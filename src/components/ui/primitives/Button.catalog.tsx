"use client";

import { type ComponentProps, type ComponentType, createElement } from "react";
import {
	type CatalogPreviewProps,
	defineCatalogOwnerContract,
} from "@/lib/component-catalog/contract";
import { Button } from "./Button";

function CatalogPreview1() {
	const render = () => (
		<div className="flex flex-wrap items-center gap-3">
			<Button variant="primary">Publish</Button>
			<Button variant="secondary">Save draft</Button>
			<Button variant="ghost">Cancel</Button>
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({
		...{
			children: "Continue",
			size: "md",
			variant: "secondary",
		},
		...{},
	} as never);
}
function CatalogPreview2() {
	const render = () => (
		<div className="flex flex-wrap items-center gap-3">
			<Button tone="danger" variant="primary">
				Delete permanently
			</Button>
			<Button tone="danger" variant="secondary">
				Remove member
			</Button>
			<Button tone="danger" variant="ghost">
				Discard
			</Button>
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({
		...{
			children: "Continue",
			size: "md",
			variant: "secondary",
		},
		...{},
	} as never);
}
function CatalogPreview3() {
	const render = () => (
		<div className="flex flex-wrap items-center gap-3">
			<Button size="sm">Small</Button>
			<Button size="lg" leadingIcon="plus">
				Create
			</Button>
			<Button aria-label="Continue" leadingIcon="arrow-right" size="icon" />
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({
		...{
			children: "Continue",
			size: "md",
			variant: "secondary",
		},
		...{},
	} as never);
}
function CatalogPreview4() {
	const render = () => (
		<div className="grid gap-4">
			<div className="flex items-center gap-3">
				<Button variant="primary">Save changes</Button>
				<Button loading variant="primary">
					Save changes
				</Button>
			</div>
			<div className="flex items-center gap-3">
				<Button.Skeleton variant="primary">Save changes</Button.Skeleton>
				<Button disabled variant="secondary">
					Unavailable
				</Button>
			</div>
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({
		...{
			children: "Continue",
			size: "md",
			variant: "secondary",
		},
		...{},
	} as never);
}
function CatalogPreview5() {
	return createElement(
		Button as unknown as ComponentType<Record<string, unknown>>,
		{
			...{
				children: "Continue",
				size: "md",
				variant: "secondary",
			},
			...{
				children: "Save changes",
				onClick: () => undefined,
				variant: "primary",
			},
		},
	);
}

function CatalogPropProjection({ coordinate }: CatalogPreviewProps) {
	return (
		<Button
			size={coordinate.size as ComponentProps<typeof Button>["size"]}
			tone={coordinate.tone as ComponentProps<typeof Button>["tone"]}
			variant={coordinate.variant as ComponentProps<typeof Button>["variant"]}
		>
			Continue
		</Button>
	);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-primitives-button",
	name: "Button",
	role: "Canonical action and button-like navigation primitive.",
	importStatement:
		'import { Button } from "@/components/ui/primitives/Button";',
	chooseWhen: [
		"An action needs shared hierarchy, sizing, icons, loading, focus, or button-like link behavior.",
	],
	chooseInstead: [
		"Use a finished input, menu, or composite when the action belongs to that higher-level owner.",
	],
	compounds: ["Button.Skeleton"],
	exclusions: [
		"Raw styled buttons that duplicate Button behavior.",
		"A separate catalogue identity or direct consumer import for Button.Skeleton.",
	],
	guarantees: [
		{
			label: "Action hierarchy",
			storyId: "ui-primitives-button--action-hierarchy",
		},
		{
			label: "Destructive semantic tone",
			storyId: "ui-primitives-button--destructive-meaning",
		},
		{
			label: "Size and icon ownership",
			storyId: "ui-primitives-button--sizes-and-icons",
		},
		{
			label: "Loading and skeleton parity",
			storyId: "ui-primitives-button--async-state-parity",
		},
		{
			label: "Click and focus contract",
			storyId: "ui-primitives-button--interaction-contract",
		},
	],

	family: "UI",
	group: "Primitives",
	sweepSpan: "full",
	previewTargets: [
		{
			id: "prop-projection",
			name: "Finite prop projection",
			baseline: {
				size: "md",
				tone: "default",
				variant: "secondary",
			},
			axes: [
				{
					id: "variant",
					label: "Variant",
					values: [
						{ id: "primary", label: "Primary", value: "primary" },
						{ id: "secondary", label: "Secondary", value: "secondary" },
						{ id: "ghost", label: "Ghost", value: "ghost" },
						{ id: "inverse", label: "Inverse", value: "inverse" },
					],
				},
				{
					id: "tone",
					label: "Tone",
					values: [
						{ id: "default", label: "Default", value: "default" },
						{ id: "danger", label: "Danger", value: "danger" },
					],
				},
				{
					id: "size",
					label: "Size",
					values: [
						{ id: "none", label: "None", value: "none" },
						{ id: "sm", label: "Small", value: "sm" },
						{ id: "md", label: "Medium", value: "md" },
						{ id: "lg", label: "Large", value: "lg" },
						{ id: "xl", label: "Extra large", value: "xl" },
						{ id: "chip", label: "Chip", value: "chip" },
						{ id: "icon", label: "Icon", value: "icon" },
						{ id: "icon-sm", label: "Small icon", value: "icon-sm" },
					],
				},
			],
			stage: "standard",
			Render: CatalogPropProjection,
		},
		{
			id: "action-hierarchy",
			name: "Action hierarchy",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "destructive-meaning",
			name: "Destructive semantic tone",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
		{
			id: "sizes-and-icons",
			name: "Size and icon ownership",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview3,
		},
		{
			id: "async-state-parity",
			name: "Loading and skeleton parity",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview4,
		},
		{
			id: "interaction-contract",
			name: "Click and focus contract",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview5,
		},
	],
});
