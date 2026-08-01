"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { SignatureInput } from "./SignatureInput";

const onClear = () => undefined;
function CatalogPreview1() {
	const render = () => (
		<div className="w-[480px]">
			<SignatureInput
				description="Sign inside the field."
				label="Approval signature"
				onClear={onClear}
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
	id: "ui-input-signature-input",
	name: "SignatureInput",
	role: "Canvas-based signature field with Field relationships, component-owned geometry, ink callbacks, and an imperative export handle.",
	importStatement: 'import { SignatureInput } from "@/components/ui/input";',
	chooseWhen: ["A form needs direct pointer or touch signature capture."],
	chooseInstead: [
		"Use FileInput when users should upload an existing signature asset.",
	],
	compounds: ["SignatureInput.Skeleton", "SignatureInputHandle"],
	exclusions: ["Page-owned canvas setup, persistence, or upload transport."],
	guarantees: [
		{
			label: "Focusable canvas and clear callback",
			storyId: "ui-input-signature-input--interaction-contract",
		},
	],

	family: "UI",
	group: "Input",
	previewTargets: [
		{
			id: "interaction-contract",
			name: "Focusable canvas and clear callback",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
