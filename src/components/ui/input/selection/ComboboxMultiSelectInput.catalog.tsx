"use client";

import { useState } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ComboboxMultiSelectInput } from "./ComboboxMultiSelectInput";

const options = [
	{ value: "amsterdam", label: "Amsterdam" },
	{ value: "berlin", label: "Berlin" },
	{ value: "copenhagen", label: "Copenhagen" },
];
function ComboboxExample() {
	const [value, setValue] = useState<string[]>(["amsterdam"]);
	return (
		<div className="w-96">
			<ComboboxMultiSelectInput
				label="Offices"
				onChange={setValue}
				options={options}
				placeholder="Search offices"
				value={value}
			/>
		</div>
	);
}
function CatalogPreview1() {
	const render = () => <ComboboxExample />;
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-input-combobox-multi-select-input",
	name: "ComboboxMultiSelectInput",
	role: "Controlled searchable multi-select that owns option filtering, selected chips, keyboard navigation, and listbox semantics.",
	importStatement:
		'import { ComboboxMultiSelectInput } from "@/components/ui/input";',
	chooseWhen: [
		"A larger option set needs searchable multi-selection and removable selected tokens.",
	],
	chooseInstead: [
		"Use ButtonMultiSelectInput or MultiselectInput for small visible sets.",
	],
	compounds: ["ComboboxMultiSelectInput.Skeleton"],
	exclusions: [
		"Content, listbox, query, chip, and controller implementation modules.",
	],
	guarantees: [
		{
			label: "Search, selection, chip removal, and keyboard ownership",
			storyId: "ui-input-combobox-multi-select-input--combobox-contract",
		},
	],

	family: "UI",
	group: "Input / Selection",
	previewTargets: [
		{
			id: "combobox-contract",
			name: "Search, selection, chip removal, and keyboard ownership",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
