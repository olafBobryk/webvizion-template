"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { NumberInput } from "./NumberInput";

const onChange = () => undefined;
function CatalogPreview1() {
	const render = () => (
		<NumberInput
			description="Whole numbers from one to ten."
			label="Seats"
			max={10}
			min={1}
			onChange={onChange}
			validate={(value) =>
				value !== null && value > 10 ? "Maximum is 10." : null
			}
		/>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-input-number-input",
	name: "NumberInput",
	role: "Typed numeric field with native number semantics, optional validation, and shared field geometry.",
	importStatement: 'import { NumberInput } from "@/components/ui/input";',
	chooseWhen: [
		"A form needs numeric entry without a fixed unit or range slider.",
	],
	chooseInstead: [
		"Use UnitNumberInput for fixed-unit display or SliderInput for bounded range selection.",
	],
	compounds: ["NumberInput.Skeleton"],
	exclusions: ["Parsing invalid text into NaN and page-owned field shells."],
	guarantees: [
		{
			label: "Numeric parsing, validation, and ARIA relationships",
			storyId: "ui-input-number-input--numeric-contract",
		},
	],

	family: "UI",
	group: "Input / Numeric",
	previewTargets: [
		{
			id: "numeric-contract",
			name: "Numeric parsing, validation, and ARIA relationships",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
