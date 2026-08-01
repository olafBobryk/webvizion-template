"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { SpamProtectionFields } from "./SpamProtectionFields";

function CatalogPreview1() {
	const render = () => (
		<form aria-label="Contact">
			<SpamProtectionFields fieldName="contact_website" />
			<button type="submit">Send</button>
		</form>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-input-spam-protection-fields",
	name: "SpamProtectionFields",
	role: "Hidden honeypot field for server-checked form submissions without entering keyboard or accessibility navigation.",
	importStatement:
		'import { SpamProtectionFields } from "@/components/ui/input";',
	chooseWhen: ["A public form includes a server-validated honeypot field."],
	chooseInstead: [
		"Use application-level abuse controls when stronger protection is required.",
	],
	compounds: [],
	exclusions: [
		"Treating the honeypot as a security boundary or visible form input.",
	],
	guarantees: [
		{
			label: "Hidden, untabbable, non-autofilled form output",
			storyId: "ui-input-spam-protection-fields--honeypot-contract",
		},
	],

	family: "UI",
	group: "Input / Text",
	previewTargets: [
		{
			id: "honeypot-contract",
			name: "Hidden, untabbable, non-autofilled form output",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
