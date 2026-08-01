"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { EditableTextField } from "./EditableTextField";

const onSave = async () => {};
function CatalogPreview1() {
	const render = () => (
		<div className="w-80">
			<EditableTextField
				label="Project name"
				onSave={onSave}
				required
				value="Averlo"
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
	id: "ui-input-editable-text-field",
	name: "EditableTextField",
	role: "Display-to-edit text field that owns validation, pending state, inline errors, and focus restoration.",
	importStatement: 'import { EditableTextField } from "@/components/ui/input";',
	chooseWhen: [
		"A reusable rename or inline editing flow transitions between readable text and a real form control.",
	],
	chooseInstead: ["Use TextInput when the control is always editable."],
	compounds: ["EditableTextField.Skeleton"],
	exclusions: [
		"Page-local edit/display toggles and mutation state inside Field or TextInput.",
	],
	guarantees: [
		{
			label: "Edit, validation, save, cancel, and focus restoration",
			storyId: "ui-input-editable-text-field--editing-contract",
		},
	],

	family: "UI",
	group: "Input / Editable",
	previewTargets: [
		{
			id: "editing-contract",
			name: "Edit, validation, save, cancel, and focus restoration",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
