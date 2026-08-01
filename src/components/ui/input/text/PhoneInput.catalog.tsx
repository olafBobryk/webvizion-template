"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { PhoneInput } from "./PhoneInput";

const onChange = () => undefined;
function CatalogPreview1() {
	const render = () => (
		<div className="w-80">
			<PhoneInput
				defaultCountry="US"
				e164Name="phoneE164"
				label="Phone"
				onChange={onChange}
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
	id: "ui-input-phone-input",
	name: "PhoneInput",
	role: "Country-aware telephone field with E.164 output, native tel semantics, searchable country selection, and optional formatting.",
	importStatement: 'import { PhoneInput } from "@/components/ui/input";',
	chooseWhen: [
		"A form accepts a phone number and needs country-aware parsing or selection.",
	],
	chooseInstead: ["Use TextInput only for non-telephone text."],
	compounds: ["PhoneInput.Skeleton", "PHONE_COUNTRIES", "CountryOption"],
	exclusions: [
		"PhoneCountryListbox, normalization helpers, and page-local dial-code menus.",
	],
	guarantees: [
		{
			label: "Tel semantics, E.164 output, and country list ownership",
			storyId: "ui-input-phone-input--phone-contract",
		},
	],

	family: "UI",
	group: "Input / Text",
	previewTargets: [
		{
			id: "phone-contract",
			name: "Tel semantics, E.164 output, and country list ownership",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
