"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Loader } from "./Loader";

function CatalogPreview1() {
	const render = () => (
		<div role="status" className="flex items-center gap-2">
			<Loader data-testid="loader" size="md" />
			<span>Refreshing results</span>
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-misc-loader",
	name: "Loader",
	role: "Shared indeterminate spinner glyph for inline asynchronous regions.",
	importStatement: 'import { Loader } from "@/components/ui/misc";',
	chooseWhen: [
		"An existing region needs a compact indeterminate loading signal.",
	],
	chooseInstead: [
		"Use component skeletons for initial layout loading and Button loading for action progress.",
	],
	compounds: [],
	exclusions: [
		"A standalone status announcement; the surrounding owner supplies accessible status copy.",
	],
	guarantees: [
		{
			label: "Size inheritance and status composition",
			storyId: "ui-misc-loader--status-composition",
		},
	],

	family: "UI",
	group: "Misc",
	previewTargets: [
		{
			id: "status-composition",
			name: "Size inheritance and status composition",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
