"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { TextInput } from "./TextInput";

const onChange = () => undefined;
function CatalogPreview1() {
	const render = () => (
		<TextInput
			description="Use at least three characters."
			label="Project name"
			onChange={onChange}
			required
			validate={(value) =>
				value.length >= 3 ? null : "Enter at least three characters."
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
	id: "ui-input-text-input",
	name: "TextInput",
	role: "Canonical single-line text field with shared Field relationships, InputFrame geometry, validation, and optional copy action.",
	importStatement: 'import { TextInput } from "@/components/ui/input";',
	chooseWhen: ["A form needs ordinary single-line text entry."],
	chooseInstead: [
		"Use EmailInput, PasswordInput, PhoneInput, or a selection owner when the value has stronger semantics.",
	],
	compounds: ["TextInput.Skeleton"],
	exclusions: [
		"Page-owned field shells, validation relationships, or clipboard buttons.",
	],
	guarantees: [
		{
			label: "Change, validation, and accessible field relationships",
			storyId: "ui-input-text-input--field-contract",
		},
	],

	family: "UI",
	group: "Input / Text",
	previewTargets: [
		{
			id: "field-contract",
			name: "Change, validation, and accessible field relationships",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
