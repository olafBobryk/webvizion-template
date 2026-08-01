"use client";

import { type ComponentType, createElement } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { DateIndicator } from "./DateIndicator";

function CatalogPreview1() {
	return createElement(
		DateIndicator as unknown as ComponentType<Record<string, unknown>>,
		{ ...{}, ...{ date: "2025-01-13T12:00:00Z", leadingText: "Published" } },
	);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-time-date-indicator",
	name: "DateIndicator",
	role: "Timezone-aware calendar-date text owner with consistent weekday, ordinal, and month formatting.",
	importStatement:
		'import { DateIndicator } from "@/components/ui/time/DateIndicator";',
	chooseWhen: [
		"Schedule metadata or an explicit timestamp needs a stable calendar date.",
	],
	chooseInstead: ["Use DateAgo when recency matters more than the exact date."],
	compounds: ["DateIndicator.Skeleton"],
	exclusions: [
		"Page-local timezone and ordinal formatting.",
		"A separate DateIndicator.Skeleton identity.",
	],
	guarantees: [
		{
			label: "Timezone-aware calendar output",
			storyId: "ui-time-date-indicator--calendar-output",
		},
	],

	family: "UI",
	group: "Time",
	previewTargets: [
		{
			id: "calendar-output",
			name: "Timezone-aware calendar output",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
