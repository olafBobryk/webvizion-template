"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { MultiselectInput } from "./MultiselectInput";

const onChange = () => undefined;
const options = [
	{ value: "email", label: "Email" },
	{ value: "sms", label: "SMS" },
];
function CatalogPreview1() {
	const render = () => (
		<MultiselectInput
			defaultValue={["email"]}
			label="Notifications"
			name="notifications"
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
	id: "ui-input-multiselect-input",
	name: "MultiselectInput",
	role: "Complete checkbox-style field for choosing zero or more visible options.",
	importStatement: 'import { MultiselectInput } from "@/components/ui/input";',
	chooseWhen: ["A form exposes a small visible set of independent selections."],
	chooseInstead: [
		"Use ComboboxMultiSelectInput for searchable or larger option sets.",
	],
	compounds: ["MultiselectInput.Skeleton"],
	exclusions: ["A separate CheckboxInput owner or page-local checkbox group."],
	guarantees: [
		{
			label: "Native multi-selection and callbacks",
			storyId: "ui-input-multiselect-input--selection-contract",
		},
	],

	family: "UI",
	group: "Input / Choice",
	previewTargets: [
		{
			id: "selection-contract",
			name: "Native multi-selection and callbacks",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
