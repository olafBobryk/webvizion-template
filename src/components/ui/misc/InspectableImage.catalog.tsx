"use client";

import { type ComponentType, createElement } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { InspectableImage } from "./InspectableImage";

function CatalogPreview1() {
	return createElement(
		InspectableImage as unknown as ComponentType<Record<string, unknown>>,
		{
			...{},
			...{
				src: "/test/placeholder-square.jpg",
				alt: "Overlapping charcoal and coral shapes",
				width: 480,
				height: 320,
				className: "h-56 w-80 overflow-hidden rounded-xl",
			},
		},
	);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-misc-inspectable-image",
	name: "InspectableImage",
	role: "Image trigger wired to the shared image-inspection modal system.",
	importStatement: 'import { InspectableImage } from "@/components/ui/misc";',
	chooseWhen: [
		"An image should open the canonical inspect, zoom, and optional share flow.",
	],
	chooseInstead: ["Use next/image directly when the image is not interactive."],
	compounds: [],
	exclusions: ["File-input previews and ImageInspectModal internals."],
	guarantees: [
		{
			label: "Button semantics and shared modal launch",
			storyId: "ui-misc-inspectable-image--inspection-contract",
		},
	],

	family: "UI",
	group: "Misc",
	previewTargets: [
		{
			id: "inspection-contract",
			name: "Button semantics and shared modal launch",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
