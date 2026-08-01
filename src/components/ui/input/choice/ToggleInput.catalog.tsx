"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ToggleInput } from "./ToggleInput";

const onChange = () => undefined;
const options = [
	{
		value: "marketing",
		label: "Marketing email",
		description: "Occasional product news.",
	},
];
function CatalogPreview1() {
	const render = () => (
		<ToggleInput
			label="Preferences"
			name="preferences"
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
	id: "ui-input-toggle-input",
	name: "ToggleInput",
	role: "Complete switch-presented checkbox field for one or more independent boolean choices.",
	importStatement: 'import { ToggleInput } from "@/components/ui/input";',
	chooseWhen: [
		"Visible settings take effect as independently enabled or disabled choices.",
	],
	chooseInstead: [
		"Use RadioInput for exactly-one selection or MultiselectInput when checkbox presentation is clearer.",
	],
	compounds: ["ToggleInput.Skeleton"],
	exclusions: ["Div-based switches and page-owned focus indicators."],
	guarantees: [
		{
			label: "Native toggle state and callbacks",
			storyId: "ui-input-toggle-input--selection-contract",
		},
	],

	family: "UI",
	group: "Input / Choice",
	previewTargets: [
		{
			id: "selection-contract",
			name: "Native toggle state and callbacks",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
