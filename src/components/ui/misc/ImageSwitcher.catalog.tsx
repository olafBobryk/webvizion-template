"use client";

import { type ComponentType, createElement } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ImageSwitcher } from "./ImageSwitcher";

const images = [
	{
		src: "/test/placeholder-portrait.jpg",
		alt: "Abstract blue portrait composition",
	},
	{
		src: "/test/placeholder-square.jpg",
		alt: "Overlapping charcoal and coral shapes",
	},
] as const;
function CatalogPreview1() {
	return createElement(
		ImageSwitcher as unknown as ComponentType<Record<string, unknown>>,
		{
			...{
				images,
				intervalMs: 0,
				onIndexChange: () => undefined,
				frameClassName: "h-72",
			},
			...{},
		},
	);
}
function CatalogPreview2() {
	return createElement(
		ImageSwitcher as unknown as ComponentType<Record<string, unknown>>,
		{
			...{
				images,
				intervalMs: 0,
				onIndexChange: () => undefined,
				frameClassName: "h-72",
			},
			...{ images: [images[0]], intervalMs: 0 },
		},
	);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-misc-image-switcher",
	name: "ImageSwitcher",
	role: "Small image carousel with shared transitions, eager preloading, swipe ownership, and pagination controls.",
	importStatement: 'import { ImageSwitcher } from "@/components/ui/misc";',
	chooseWhen: [
		"A small media set needs cyclic previous/next navigation or swipe.",
	],
	chooseInstead: [
		"Use a domain gallery for thumbnails, captions, or arbitrary item navigation.",
	],
	compounds: [],
	exclusions: ["Transition layers, preload items, and image-index schedulers."],
	guarantees: [
		{
			label: "Bounded controls and index callback",
			storyId: "ui-misc-image-switcher--navigation-contract",
		},
		{
			label: "Single-image control suppression",
			storyId: "ui-misc-image-switcher--single-image-contract",
		},
	],

	family: "UI",
	group: "Misc",
	sweepSpan: "full",
	previewTargets: [
		{
			id: "navigation-contract",
			name: "Bounded controls and index callback",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "single-image-contract",
			name: "Single-image control suppression",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
	],
});
