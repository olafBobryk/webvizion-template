"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { RadioInput } from "./RadioInput";

const onChange = () => undefined;
const options = [
	{ value: "weekly", label: "Weekly", description: "A weekly summary." },
	{ value: "monthly", label: "Monthly" },
];
function CatalogPreview1() {
	const render = () => (
		<RadioInput
			description="Choose a cadence."
			label="Digest"
			name="digest"
			onChange={onChange}
			options={options}
		/>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-input-radio-input",
	name: "RadioInput",
	role: "Complete single-choice radio field with shared labels, messages, native semantics, and loading geometry.",
	importStatement: 'import { RadioInput } from "@/components/ui/input";',
	chooseWhen: ["A form must choose exactly one option from a visible group."],
	chooseInstead: [
		"Use SelectInput when the option set should live in a compact searchable dropdown.",
	],
	compounds: ["RadioInput.Skeleton"],
	exclusions: ["Custom page-level radio groups and CheckboxInput aliases."],
	guarantees: [
		{
			label: "Selection callback and field relationships",
			storyId: "ui-input-radio-input--selection-contract",
		},
	],

	family: "UI",
	group: "Input / Choice",
	previewTargets: [
		{
			id: "selection-contract",
			name: "Selection callback and field relationships",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
