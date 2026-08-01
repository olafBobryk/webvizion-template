"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { DateRangeInput } from "./DateRangeInput";

const onChange = () => undefined;
function CatalogPreview1() {
	const render = () => (
		<DateRangeInput
			defaultValue={{ start: "2026-08-01", end: "2026-08-07" }}
			endName="endDate"
			label="Reporting period"
			onChange={onChange}
			presets={["last_7_days"]}
			startName="startDate"
		/>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-input-date-range-input",
	name: "DateRangeInput",
	role: "Full-start date-range field that commits validated UTC endpoints through the shared calendar and optional presets.",
	importStatement: 'import { DateRangeInput } from "@/components/ui/input";',
	chooseWhen: ["A form needs a start and end date selected as one range."],
	chooseInstead: [
		"Use DateInput for one date; use a higher-level filter owner when it also owns query state.",
	],
	compounds: ["DateRangeInput.Skeleton"],
	exclusions: [
		"Manual range text fields, separate calendars, and direct CalendarPopover use.",
	],
	guarantees: [
		{
			label: "Range dialog, preset commit, and endpoint form values",
			storyId: "ui-input-date-range-input--range-contract",
		},
	],

	family: "UI",
	group: "Input / Date",
	previewTargets: [
		{
			id: "range-contract",
			name: "Range dialog, preset commit, and endpoint form values",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
