"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { DateInput } from "./DateInput";

const onChange = () => undefined;
function CatalogPreview1() {
	const render = () => (
		<DateInput
			defaultValue="2026-08-01"
			description="Stored as a UTC calendar date."
			label="Launch date"
			name="launchDate"
			onChange={onChange}
		/>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-input-date-input",
	name: "DateInput",
	role: "Single-date field using validated YYYY-MM-DD values, UTC date arithmetic, and the shared calendar popover.",
	importStatement: 'import { DateInput } from "@/components/ui/input";',
	chooseWhen: [
		"A form needs one calendar date with native form output and bounded selection.",
	],
	chooseInstead: [
		"Use DateRangeInput when both start and end dates are committed together.",
	],
	compounds: ["DateInput.Skeleton"],
	exclusions: [
		"CalendarPopover, date utilities, and independent calendar implementations.",
	],
	guarantees: [
		{
			label: "Calendar disclosure, dismissal, and hidden form value",
			storyId: "ui-input-date-input--calendar-contract",
		},
	],

	family: "UI",
	group: "Input / Date",
	previewTargets: [
		{
			id: "calendar-contract",
			name: "Calendar disclosure, dismissal, and hidden form value",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
