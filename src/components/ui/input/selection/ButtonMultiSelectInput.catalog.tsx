"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ButtonMultiSelectInput } from "./ButtonMultiSelectInput";

const onChange = () => undefined;
const options = [
	{ value: "design", label: "Design" },
	{ value: "engineering", label: "Engineering" },
	{ value: "research", label: "Research" },
];
function CatalogPreview1() {
	const render = () => (
		<ButtonMultiSelectInput
			defaultValue={["design"]}
			label="Teams"
			name="teams"
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
	id: "ui-input-button-multi-select-input",
	name: "ButtonMultiSelectInput",
	role: "Compact multi-select field whose pressed-state selection is expressed through shared Button hierarchy.",
	importStatement:
		'import { ButtonMultiSelectInput } from "@/components/ui/input";',
	chooseWhen: [
		"A small tag, filter, or preference set benefits from compact visible buttons.",
	],
	chooseInstead: [
		"Use MultiselectInput for checkbox semantics or ComboboxMultiSelectInput for searchable sets.",
	],
	compounds: ["ButtonMultiSelectInput.Skeleton"],
	exclusions: [
		"Choice indicators, per-button styles, and configurable button variants.",
	],
	guarantees: [
		{
			label: "Pressed state, callback, and hidden form values",
			storyId: "ui-input-button-multi-select-input--selection-contract",
		},
	],

	family: "UI",
	group: "Input / Selection",
	previewTargets: [
		{
			id: "selection-contract",
			name: "Pressed state, callback, and hidden form values",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
