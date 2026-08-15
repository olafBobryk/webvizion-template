"use client";

import { Panel } from "@/components/ui/primitives/surfaces";
import { Text } from "@/components/ui/primitives/Text";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Carousel } from "./Carousel";

const items = ["Strategy", "Design", "Delivery"].map((label, index) => ({
	content: (
		<Panel className="grid min-h-64 content-between" padding="md">
			<Text as="h3" variant="headingMd">
				{label}
			</Text>
			<Text tone="muted">Slide {index + 1}</Text>
		</Panel>
	),
	id: label.toLowerCase(),
	label,
}));

function CarouselPreview() {
	return <Carousel ariaLabel="Delivery phases" items={items} />;
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-misc-carousel",
	name: "Carousel",
	role: "Bounded horizontal item carousel with measured left-edge snapping, section-gutter alignment, pointer dragging, and dot pagination.",
	importStatement: 'import { Carousel } from "@/components/ui/misc";',
	chooseWhen: [
		"A responsive surface needs caller-rendered items to snap against a stable left edge with direct pagination.",
	],
	chooseInstead: [
		"Use ImageSwitcher for a single framed image carousel with preload and image-transition ownership.",
		"Use a grid or list when all items should remain simultaneously visible or directly scrollable.",
	],
	compounds: ["Carousel"],
	exclusions: [
		"Looping, autoplay, vertical tracks, centered-slide geometry, virtualized slides, or a general slider plugin API.",
		"Desktop replacement visibility; callers own whether a different composition replaces the carousel at a breakpoint.",
	],
	guarantees: [
		{
			label: "Left-gutter alignment and direct pagination",
			storyId: "ui-misc-carousel--left-gutter-and-pagination",
		},
		{
			label: "Contained presentation without a section gutter",
			storyId: "ui-misc-carousel--without-section-gutter",
		},
	],
	family: "UI",
	group: "Misc",
	sweepSpan: "full",
	previewTargets: [
		{
			id: "left-gutter-pagination",
			name: "Left-gutter carousel",
			baseline: {},
			axes: [],
			stage: "wide",
			Render: CarouselPreview,
		},
	],
});
