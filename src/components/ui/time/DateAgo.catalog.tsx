"use client";

import { type ComponentType, createElement } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { DateAgo } from "./DateAgo";

function CatalogPreview1() {
	const render = () => (
		<div className="grid gap-2">
			<DateAgo
				date={new Date(Date.now() - 5 * 60_000)}
				updateIntervalMs={60_000}
			/>
			<DateAgo
				date={new Date(Date.now() + 2 * 60 * 60_000)}
				updateIntervalMs={60_000}
			/>
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview2() {
	return createElement(
		DateAgo as unknown as ComponentType<Record<string, unknown>>,
		{
			...{},
			...{ date: "not-a-date", placeholder: "Date unavailable" },
		},
	);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-time-date-ago",
	name: "DateAgo",
	role: "Relative-time text owner for recent, past, and future timestamps with a safe invalid-date fallback.",
	importStatement: 'import { DateAgo } from "@/components/ui/time/DateAgo";',
	chooseWhen: [
		"A feed, activity item, or recent update needs human relative time.",
	],
	chooseInstead: [
		"Use DateIndicator when the exact calendar date is the important information.",
	],
	compounds: ["DateAgo.Skeleton"],
	exclusions: [
		"Page-local relative-time formatters and a separate DateAgo.Skeleton identity.",
	],
	guarantees: [
		{
			label: "Relative past and future output",
			storyId: "ui-time-date-ago--past-and-future",
		},
		{
			label: "Invalid-date fallback",
			storyId: "ui-time-date-ago--invalid-date-fallback",
		},
	],

	family: "UI",
	group: "Time",
	previewTargets: [
		{
			id: "past-and-future",
			name: "Relative past and future output",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "invalid-date-fallback",
			name: "Invalid-date fallback",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
	],
});
