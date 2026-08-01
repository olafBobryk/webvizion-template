"use client";

import { type ComponentType, createElement } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { SegmentedControl } from "./SegmentedControl";

const options = [
	{ value: "day", label: "Day" },
	{ value: "week", label: "Week" },
	{ value: "month", label: "Month", disabled: true },
] as const;
function CatalogPreview1() {
	return createElement(
		SegmentedControl as unknown as ComponentType<Record<string, unknown>>,
		{
			...{
				options,
				defaultValue: "day",
				onChange: () => undefined,
				ariaLabel: "Report period",
			},
			...{},
		},
	);
}
function CatalogPreview2() {
	const render = () => (
		<div className="grid w-[30rem] max-w-full gap-4">
			<SegmentedControl
				ariaLabel="Equal periods"
				options={options}
				defaultValue="day"
			/>
			<SegmentedControl
				ariaLabel="Automatic periods"
				options={options}
				defaultValue="week"
				layout="auto"
			/>
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({
		...{
			options,
			defaultValue: "day",
			onChange: () => undefined,
			ariaLabel: "Report period",
		},
		...{},
	} as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-misc-segmented-control",
	name: "SegmentedControl",
	role: "Single-value segmented selector with controlled and uncontrolled state.",
	importStatement: 'import { SegmentedControl } from "@/components/ui/misc";',
	chooseWhen: [
		"A small peer set needs immediate mutually exclusive selection.",
	],
	chooseInstead: [
		"Use RadioInput for form-owned choices or Tabs for content navigation.",
	],
	compounds: [],
	exclusions: [
		"Page-local pill navigation that duplicates pressed state and focus behavior.",
	],
	guarantees: [
		{
			label: "Pressed state and selection callback",
			storyId: "ui-misc-segmented-control--selection-contract",
		},
		{
			label: "Layouts and disabled options",
			storyId: "ui-misc-segmented-control--layout-contract",
		},
	],

	family: "UI",
	group: "Misc",
	previewTargets: [
		{
			id: "selection-contract",
			name: "Pressed state and selection callback",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "layout-contract",
			name: "Layouts and disabled options",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
	],
});
