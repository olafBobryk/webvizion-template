"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ColorInput } from "./ColorInput";

const onChange = () => undefined;
function CatalogPreview1() {
	const render = () => (
		<ColorInput
			defaultValue="#3567EA"
			description="Choose a brand accent."
			label="Accent color"
			name="accent"
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
	id: "ui-input-color-input",
	name: "ColorInput",
	role: "Complete hexadecimal color field with a controlled value, native form output, and an anchored picker panel.",
	importStatement: 'import { ColorInput } from "@/components/ui/input";',
	chooseWhen: [
		"A form needs free color selection rather than a bounded semantic palette.",
	],
	chooseInstead: [
		"Use ColorSwatchInput when consumers should choose from semantic presets with an optional custom color.",
	],
	compounds: ["ColorInput.Skeleton"],
	exclusions: ["ColorPickerPanel and raw Dropdown surface internals."],
	guarantees: [
		{
			label: "Picker disclosure, keyboard dismissal, and form value",
			storyId: "ui-input-color-input--picker-contract",
		},
	],

	family: "UI",
	group: "Input / Color",
	previewTargets: [
		{
			id: "picker-contract",
			name: "Picker disclosure, keyboard dismissal, and form value",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
