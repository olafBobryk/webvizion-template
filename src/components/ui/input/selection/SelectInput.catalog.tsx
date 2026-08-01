"use client";

import { useState } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { SelectInput } from "./SelectInput";

const options = [
	{ value: "draft", label: "Draft" },
	{ value: "published", label: "Published" },
	{ value: "archived", label: "Archived", disabled: true },
];
function SelectExample() {
	const [value, setValue] = useState<string | null>(null);
	return (
		<div className="w-80">
			<SelectInput
				description="Choose the public state."
				label="Status"
				onChange={setValue}
				options={options}
				value={value}
			/>
		</div>
	);
}
const presentationOptions = [
	{
		dropdownContent: (
			<span className="grid gap-0.5 text-foreground">
				<span>Ada Lovelace</span>
				<span>ada@example.com</span>
			</span>
		),
		label: "Ada Lovelace",
		searchText: "Ada Lovelace ada@example.com",
		value: "ada",
	},
	{
		dropdownContent: (
			<span className="grid gap-0.5 text-foreground">
				<span>Grace Hopper</span>
				<span>grace@example.com</span>
			</span>
		),
		label: "Grace Hopper",
		searchText: "Grace Hopper grace@example.com",
		value: "grace",
	},
];
function PresentationSelectExample() {
	const [value, setValue] = useState<string | null>("ada");
	return (
		<div className="w-80">
			<SelectInput
				label="Member"
				onChange={setValue}
				options={presentationOptions}
				value={value}
			/>
		</div>
	);
}
function CatalogPreview1() {
	const render = () => <SelectExample />;
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview2() {
	const render = () => <PresentationSelectExample />;
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-input-select-input",
	name: "SelectInput",
	role: "Controlled searchable single-select field with listbox semantics, active-option navigation, and portal positioning.",
	importStatement: 'import { SelectInput } from "@/components/ui/input";',
	chooseWhen: [
		"A form value must be one supported option and benefits from type-to-filter selection.",
	],
	chooseInstead: ["Use ComboboxTextInput when arbitrary text remains valid."],
	compounds: ["SelectInput.Skeleton"],
	exclusions: [
		"Direct dropdown/listbox assembly and implementation-only option renderers.",
	],
	guarantees: [
		{
			label: "Selection, interception, filtering, and listbox semantics",
			storyId: "ui-input-select-input--selection-contract",
		},
		{
			label: "Compact selected value and intrinsic-height option presentation",
			storyId: "ui-input-select-input--presentation-option-contract",
		},
	],

	family: "UI",
	group: "Input / Selection",
	previewTargets: [
		{
			id: "selection-contract",
			name: "Selection, interception, filtering, and listbox semantics",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "presentation-option-contract",
			name: "Compact selected value and intrinsic-height option presentation",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
	],
});
