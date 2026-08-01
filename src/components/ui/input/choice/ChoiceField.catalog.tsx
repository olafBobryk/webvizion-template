"use client";

import { useState } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ChoiceField } from "./ChoiceField";
import { ChoiceIndicatorMulti } from "./ChoiceIndicators";

function ChoiceFieldExample() {
	const [checked, setChecked] = useState(false);
	return (
		<ChoiceField
			checked={checked}
			description="Receive release notes by email."
			id="choice-field-updates"
			indicator={<ChoiceIndicatorMulti checked={checked} />}
			inputType="checkbox"
			label="Product updates"
			onChange={(_, nextChecked) => setChecked(nextChecked)}
			value="updates"
		/>
	);
}
function CatalogPreview1() {
	const render = () => <ChoiceFieldExample />;
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-input-choice-field",
	name: "ChoiceField",
	role: "Public composition primitive that binds a native radio or checkbox to a label, description, indicator, and change contract.",
	importStatement: 'import { ChoiceField } from "@/components/ui/input";',
	chooseWhen: [
		"A reusable library control needs custom choice presentation while retaining native input semantics.",
	],
	chooseInstead: [
		"Use RadioInput, MultiselectInput, or ToggleInput for complete grouped form controls.",
	],
	compounds: ["ChoiceField.Skeleton"],
	exclusions: [
		"Page-local choice controls and div-based replacements for native radio or checkbox inputs.",
	],
	guarantees: [
		{
			label: "Native input, label activation, focus, and change behavior",
			storyId: "ui-input-choice-field--interaction-contract",
		},
	],

	family: "UI",
	group: "Input / Choice",
	previewTargets: [
		{
			id: "interaction-contract",
			name: "Native input, label activation, focus, and change behavior",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
