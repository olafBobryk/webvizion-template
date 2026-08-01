"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { UnitNumberInput } from "./UnitNumberInput";

const onChange = () => undefined;
function CatalogPreview1() {
	const render = () => (
		<UnitNumberInput label="Distance" onChange={onChange} unit="km" />
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-input-unit-number-input",
	name: "UnitNumberInput",
	role: "NumberInput specialization with a fixed presentation unit kept separate from numeric value ownership.",
	importStatement: 'import { UnitNumberInput } from "@/components/ui/input";',
	chooseWhen: ["A numeric form value always carries one fixed display unit."],
	chooseInstead: [
		"Use NumberInput without a unit or SelectInput when the unit itself is selectable.",
	],
	compounds: ["UnitNumberInput.Skeleton"],
	exclusions: [
		"Encoding the unit into the numeric value or accepting caller-controlled unit switching.",
	],
	guarantees: [
		{
			label: "Numeric callback with fixed unit presentation",
			storyId: "ui-input-unit-number-input--unit-contract",
		},
	],

	family: "UI",
	group: "Input / Numeric",
	previewTargets: [
		{
			id: "unit-contract",
			name: "Numeric callback with fixed unit presentation",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
