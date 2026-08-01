"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Button } from "./Button";
import { Section } from "./Section";
import { Text } from "./Text";

function CatalogPreview1() {
	const render = () => (
		<Section
			align="center"
			background="surface"
			maxWidth="narrow"
			padding="soft"
		>
			<Text as="h2" variant="headingPage">
				Narrow centered section
			</Text>
			<Text tone="muted">
				Outer spacing and inner width are separate decisions.
			</Text>
		</Section>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview2() {
	const render = () => (
		<Section align="center" className="min-h-80" justify="center">
			<Section.Background>
				<div
					data-testid="decorative-background"
					className="h-full bg-gradient-to-br from-primary/20 to-transparent"
				/>
			</Section.Background>
			<Text as="h2" variant="headingPage">
				Foreground content remains in flow
			</Text>
		</Section>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview3() {
	const render = () => (
		<Section align="center" className="min-h-80" justify="center">
			<Section.Background interactive>
				<div className="flex h-full items-end justify-end p-6">
					<Button>Pause background</Button>
				</div>
			</Section.Background>
			<Text as="h2" variant="headingPage">
				Interactive media opts into pointer and accessibility ownership
			</Text>
		</Section>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview4() {
	const render = () => (
		<Section
			align="center"
			background="foreground"
			height="hero"
			justify="center"
			padding="hero"
		>
			<Text as="h1" theme="light" variant="headingHero">
				Hero content can grow safely
			</Text>
			<Text theme="light" tone="muted">
				The section prefers the viewport without forcing a fixed height.
			</Text>
		</Section>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-primitives-section",
	name: "Section",
	role: "Page-section owner for outer spacing, inner width, safe hero sizing, and background media.",
	importStatement:
		'import { Section } from "@/components/ui/primitives/Section";',
	chooseWhen: [
		"A page region needs shared padding, width, alignment, height, or full-section background ownership.",
	],
	chooseInstead: [
		"Use Panel or Card for a contained surface inside an existing page section.",
	],
	compounds: ["Section.Background"],
	exclusions: [
		"A separate catalogue identity for Section.Background.",
		"Interactive background content unless it contains genuine controls.",
	],
	guarantees: [
		{
			label: "Width, padding, and alignment",
			storyId: "ui-primitives-section--width-padding-and-alignment",
		},
		{
			label: "Decorative background semantics",
			storyId: "ui-primitives-section--decorative-background",
		},
		{
			label: "Interactive background opt-in",
			storyId: "ui-primitives-section--interactive-background",
		},
		{
			label: "Safe hero height",
			storyId: "ui-primitives-section--hero-safe-height",
		},
	],

	family: "UI",
	group: "Primitives",
	sweepSpan: "full",
	previewTargets: [
		{
			id: "width-padding-and-alignment",
			name: "Width, padding, and alignment",
			baseline: {},
			axes: [],
			stage: "wide",
			Render: CatalogPreview1,
		},
		{
			id: "decorative-background",
			name: "Decorative background semantics",
			baseline: {},
			axes: [],
			stage: "wide",
			Render: CatalogPreview2,
		},
		{
			id: "interactive-background",
			name: "Interactive background opt-in",
			baseline: {},
			axes: [],
			stage: "wide",
			Render: CatalogPreview3,
		},
		{
			id: "hero-safe-height",
			name: "Safe hero height",
			baseline: {},
			axes: [],
			stage: "wide",
			Render: CatalogPreview4,
		},
	],
});
