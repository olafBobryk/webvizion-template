"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { PasswordInput } from "./PasswordInput";

function CatalogPreview1() {
	const render = () => (
		<PasswordInput
			autoComplete="new-password"
			label="Create password"
			showStrength
		/>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-input-password-input",
	name: "PasswordInput",
	role: "Password field with component-owned visibility control, autofill behavior, optional strength feedback, validation, and copy support.",
	importStatement: 'import { PasswordInput } from "@/components/ui/input";',
	chooseWhen: [
		"A login, signup, reset, or credential form needs password entry.",
	],
	chooseInstead: ["Use TextInput only when the value is not a credential."],
	compounds: ["PasswordInput.Skeleton"],
	exclusions: [
		"Page-local eye buttons and strength meters; login flows should not enable strength without a product reason.",
	],
	guarantees: [
		{
			label: "Visibility toggle and strength semantics",
			storyId: "ui-input-password-input--password-contract",
		},
	],

	family: "UI",
	group: "Input / Text",
	previewTargets: [
		{
			id: "password-contract",
			name: "Visibility toggle and strength semantics",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
