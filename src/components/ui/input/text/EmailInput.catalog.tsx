"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { EmailInput } from "./EmailInput";

const onChange = () => undefined;
function CatalogPreview1() {
	const render = () => (
		<EmailInput
			label="Work email"
			onChange={onChange}
			validate={(value) =>
				value.includes("@") ? null : "Enter a valid email."
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
	id: "ui-input-email-input",
	name: "EmailInput",
	role: "Email-semantic text field with email keyboard hints, autofill-safe attributes, validation, and optional copy action.",
	importStatement: 'import { EmailInput } from "@/components/ui/input";',
	chooseWhen: ["A form value is an email address."],
	chooseInstead: ["Use TextInput for text without email semantics."],
	compounds: ["EmailInput.Skeleton"],
	exclusions: [
		"TextInput configured ad hoc as email or browser-native validation bubbles.",
	],
	guarantees: [
		{
			label: "Email semantics, change, and inline validation",
			storyId: "ui-input-email-input--email-contract",
		},
	],

	family: "UI",
	group: "Input / Text",
	previewTargets: [
		{
			id: "email-contract",
			name: "Email semantics, change, and inline validation",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
