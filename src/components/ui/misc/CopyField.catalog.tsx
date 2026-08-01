"use client";

import { type ComponentType, createElement } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { CopyField } from "./CopyField";

function CatalogPreview1() {
	return createElement(
		CopyField as unknown as ComponentType<Record<string, unknown>>,
		{
			...{},
			...{
				value: "averlo.example/invite",
				toastMessage: false,
				onCopy: () => undefined,
			},
		},
	);
}
function CatalogPreview2() {
	const render = () => (
		<div className="grid w-96 max-w-full gap-3">
			<CopyField value="averlo.example/invite" toastMessage={false} />
			<CopyField loading value="averlo.example/invite" toastMessage={false} />
			<CopyField.Skeleton placeholder="averlo.example/invite" />
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{ value: "averlo.example/invite" } } as never);
}
function CatalogPreview3() {
	const render = () => (
		<div className="grid w-96 max-w-full gap-3">
			<CopyField
				toastMessage={false}
				value="https://averlo.example/reports/q1"
			/>
			<CopyField
				showIcon={false}
				toastMessage={false}
				type="phone"
				value="+31 20 123 4567"
			/>
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({
		...{},
		...{ value: "https://averlo.example/reports/q1" },
	} as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-misc-copy-field",
	name: "CopyField",
	role: "Canonical copy-to-clipboard action with visible value, status icon, and loading parity.",
	importStatement: 'import { CopyField } from "@/components/ui/misc";',
	chooseWhen: [
		"A token, URL, phone number, or identifier should be copied as one action.",
	],
	chooseInstead: [
		"Use useCopyAction only inside another reusable owner with distinct behavior.",
	],
	compounds: ["CopyField.Skeleton"],
	exclusions: ["Page-local clipboard state and copied icons."],
	guarantees: [
		{
			label: "Copy callback and button semantics",
			storyId: "ui-misc-copy-field--copy-contract",
		},
		{
			label: "Live and skeleton geometry",
			storyId: "ui-misc-copy-field--loading-parity",
		},
		{
			label: "URL and phone copy presentations",
			storyId: "ui-misc-copy-field--value-presentations",
		},
	],

	family: "UI",
	group: "Misc",
	previewTargets: [
		{
			id: "copy-contract",
			name: "Copy callback and button semantics",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "loading-parity",
			name: "Live and skeleton geometry",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
		{
			id: "value-presentations",
			name: "URL and phone copy presentations",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview3,
		},
	],
});
