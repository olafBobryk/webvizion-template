"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { TextAreaInput } from "./TextAreaInput";

const onChange = () => undefined;
function CatalogPreview1() {
	const render = () => (
		<div className="w-96">
			<TextAreaInput
				description="At least ten characters."
				label="Summary"
				onChange={onChange}
				validate={(value) => (value.length >= 10 ? null : "Add more detail.")}
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
	id: "ui-input-text-area-input",
	name: "TextAreaInput",
	role: "Canonical multiline text field with Field relationships, textarea semantics, validation, and component-owned loading geometry.",
	importStatement: 'import { TextAreaInput } from "@/components/ui/input";',
	chooseWhen: ["A form needs multiline free-text entry."],
	chooseInstead: [
		"Use TextInput for one line or a rich editor owner for authored structured content.",
	],
	compounds: ["TextAreaInput.Skeleton"],
	exclusions: [
		"Page-owned textarea shells and browser-native validation bubbles.",
	],
	guarantees: [
		{
			label: "Multiline change, validation, and relationships",
			storyId: "ui-input-text-area-input--textarea-contract",
		},
	],

	family: "UI",
	group: "Input / Text",
	previewTargets: [
		{
			id: "textarea-contract",
			name: "Multiline change, validation, and relationships",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
