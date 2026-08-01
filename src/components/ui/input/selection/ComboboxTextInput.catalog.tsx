"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ComboboxTextInput } from "./ComboboxTextInput";

const onChange = () => undefined;
const onSelect = () => undefined;
const options = [
	{ id: "apple", label: "Apple" },
	{ id: "banana", label: "Banana" },
	{ id: "pear", label: "Pear" },
];
function CatalogPreview1() {
	const render = () => (
		<div className="w-80">
			<ComboboxTextInput
				label="Fruit"
				onChange={onChange}
				onSelect={onSelect}
				options={options}
				placeholder="Type a fruit"
			/>
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-input-combobox-text-input",
	name: "ComboboxTextInput",
	role: "Text-entry combobox that allows free text while offering filtered listbox suggestions.",
	importStatement: 'import { ComboboxTextInput } from "@/components/ui/input";',
	chooseWhen: [
		"Users may type arbitrary text or select a suggested text value.",
	],
	chooseInstead: [
		"Use SelectInput when the value must be one supported option.",
	],
	compounds: ["ComboboxTextInput.Skeleton"],
	exclusions: [
		"Page-local searchable dropdowns and direct Listbox controller use.",
	],
	guarantees: [
		{
			label: "Text change, filtering, keyboard listbox, and option callback",
			storyId: "ui-input-combobox-text-input--combobox-contract",
		},
	],

	family: "UI",
	group: "Input / Selection",
	previewTargets: [
		{
			id: "combobox-contract",
			name: "Text change, filtering, keyboard listbox, and option callback",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
