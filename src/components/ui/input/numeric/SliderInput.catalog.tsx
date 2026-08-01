"use client";

import { useState } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { SliderInput } from "./SliderInput";

function SliderExample() {
	const [value, setValue] = useState<number | null>(40);
	return (
		<SliderInput
			label="Volume"
			max={100}
			min={0}
			onChange={setValue}
			unit="%"
			value={value}
		/>
	);
}
function CatalogPreview1() {
	const render = () => <SliderExample />;
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-input-slider-input",
	name: "SliderInput",
	role: "Bounded numeric field combining a native range control and synchronized number entry in one InputFrame.",
	importStatement: 'import { SliderInput } from "@/components/ui/input";',
	chooseWhen: [
		"A bounded numeric choice benefits from both direct range adjustment and precise entry.",
	],
	chooseInstead: ["Use NumberInput when range manipulation adds no value."],
	compounds: ["SliderInput.Skeleton"],
	exclusions: ["Custom slider tracks without native range semantics."],
	guarantees: [
		{
			label: "Synchronized range and number ownership",
			storyId: "ui-input-slider-input--range-contract",
		},
	],

	family: "UI",
	group: "Input / Numeric",
	previewTargets: [
		{
			id: "range-contract",
			name: "Synchronized range and number ownership",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
