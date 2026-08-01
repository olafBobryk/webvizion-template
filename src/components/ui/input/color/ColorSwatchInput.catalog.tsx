"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import {
	ColorSwatchInput,
	SEMANTIC_COLOR_SWATCH_PRESETS,
} from "./ColorSwatchInput";

const onChange = () => undefined;
function CatalogPreview1() {
	const render = () => (
		<ColorSwatchInput
			defaultValue="neutral"
			label="Status color"
			name="statusColor"
			onChange={onChange}
			presets={SEMANTIC_COLOR_SWATCH_PRESETS}
		/>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-input-color-swatch-input",
	name: "ColorSwatchInput",
	role: "Semantic swatch radio field with independently controllable preset value and custom hexadecimal color.",
	importStatement:
		'import { ColorSwatchInput, SEMANTIC_COLOR_SWATCH_PRESETS } from "@/components/ui/input";',
	chooseWhen: [
		"A form selects a product-neutral semantic color while allowing an optional custom color.",
	],
	chooseInstead: [
		"Use ColorInput when the value is only a free hexadecimal color.",
	],
	compounds: ["ColorSwatchInput.Skeleton"],
	exclusions: [
		"ColorPickerPanel and coupled control assumptions between value and customColorHex.",
	],
	guarantees: [
		{
			label: "Radiogroup selection and semantic callback",
			storyId: "ui-input-color-swatch-input--selection-contract",
		},
	],

	family: "UI",
	group: "Input / Color",
	previewTargets: [
		{
			id: "selection-contract",
			name: "Radiogroup selection and semantic callback",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
