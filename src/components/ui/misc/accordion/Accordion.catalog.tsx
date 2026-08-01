"use client";

import { type ComponentType, createElement } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Accordion } from "./Accordion";

function CatalogPreview1() {
	return createElement(
		Accordion as unknown as ComponentType<Record<string, unknown>>,
		{
			...{},
			...{
				title: "Billing details",
				description: "Invoice and tax information",
				onOpenChange: () => undefined,
				children: <p>Billing content</p>,
				forceReducedMotion: true,
			},
		},
	);
}
function CatalogPreview2() {
	const render = () => (
		<div className="grid w-[min(36rem,90vw)] gap-5">
			<Accordion.Card defaultOpen forceReducedMotion>
				<Accordion.Header>
					<Accordion.Title>Project access</Accordion.Title>
					<Accordion.Description>
						Who can open this project
					</Accordion.Description>
				</Accordion.Header>
				<Accordion.Content>Members inherit workspace access.</Accordion.Content>
				<Accordion.Footer>Access is audited.</Accordion.Footer>
			</Accordion.Card>
			<Accordion.Card.Skeleton
				open
				title="Project access"
				description="Who can open this project"
			/>
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{ title: "Project access" } } as never);
}
function CatalogPreview3() {
	const render = () => (
		<div className="grid w-[min(36rem,90vw)] gap-2">
			<Accordion
				description="Closed without a leading icon."
				title="Compact disclosure"
			>
				This borderless row is closed by default.
			</Accordion>
			<Accordion
				defaultOpen
				description="Open with a leading icon."
				title="Open disclosure"
			>
				Open content keeps the same horizontal edge as its trigger.
			</Accordion>
			<Accordion disabled title="Disabled disclosure">
				Disabled content.
			</Accordion>
			<Accordion.Skeleton
				description="Closed without a leading icon."
				title="Compact disclosure"
			/>
			<Accordion.Skeleton
				description="Open with a leading icon."
				leadingIcon
				open
				title="Open disclosure"
			/>
			<Accordion.Skeleton
				title="Skeleton without a trailing icon"
				trailingIcon={false}
			/>
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{ title: "Compact disclosure" } } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-misc-accordion",
	name: "Accordion",
	role: "Shared disclosure owner for compact rows and collapsible Card sections.",
	importStatement: 'import { Accordion } from "@/components/ui/misc";',
	chooseWhen: [
		"Content needs an accessible, optionally controlled disclosure.",
	],
	chooseInstead: [
		"Use Dropdown or Modal when revealed content must be portal-backed.",
	],
	compounds: [
		"Accordion.Skeleton",
		"Accordion.Card",
		"Accordion.Card.Skeleton",
		"Accordion.Header",
		"Accordion.Title",
		"Accordion.Description",
		"Accordion.Action",
		"Accordion.Content",
		"Accordion.Footer",
	],
	exclusions: [
		"AccordionClient and Accordion.shared are private implementation modules.",
	],
	guarantees: [
		{
			label: "Disclosure semantics and callbacks",
			storyId: "ui-misc-accordion--disclosure-contract",
		},
		{
			label: "Card composition and skeleton parity",
			storyId: "ui-misc-accordion--card-and-skeleton",
		},
		{
			label: "Compact rows, disabled state, and skeleton variants",
			storyId: "ui-misc-accordion--compact-row-family",
		},
	],

	family: "UI",
	group: "Misc",
	sweepSpan: "full",
	previewTargets: [
		{
			id: "disclosure-contract",
			name: "Disclosure semantics and callbacks",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "card-and-skeleton",
			name: "Card composition and skeleton parity",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
		{
			id: "compact-row-family",
			name: "Compact rows, disabled state, and skeleton variants",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview3,
		},
	],
});
