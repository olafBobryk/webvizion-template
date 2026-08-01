"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { focusRing } from "./focus";

function CatalogPreview1() {
	const render = () => (
		<div className="grid gap-4">
			<button
				className={`rounded-md border px-3 py-2 ${focusRing.visibleDefault}`}
				type="button"
			>
				Direct control
			</button>
			<label className={`rounded-md border p-2 ${focusRing.fieldDefault}`}>
				<span className="sr-only">Field shell</span>
				<input className="outline-none" placeholder="Focus the field" />
			</label>
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-foundations-focus",
	name: "Focus",
	role: "Canonical visible-focus class tokens for directly focusable controls, field shells, and hidden-input peers.",
	importStatement:
		'import { focusRing } from "@/components/ui/foundations/focus";',
	chooseWhen: [
		"A reusable interactive owner must apply the shared keyboard-focus treatment.",
	],
	chooseInstead: [
		"Use a finished Button, input, or overlay when it already owns focus styling.",
	],
	compounds: [
		"fieldDefault",
		"fieldError",
		"fieldSuccess",
		"visibleDefault",
		"visibleInner",
		"visibleError",
		"peerDefault",
		"peerError",
	],
	exclusions: [
		"Page-local focus-ring recipes and suppression of visible focus.",
	],
	guarantees: [
		{
			label: "Keyboard focus visibility",
			storyId: "ui-foundations-focus--keyboard-focus-visibility",
		},
	],

	family: "UI",
	group: "Foundations",
	previewTargets: [
		{
			id: "keyboard-focus-visibility",
			name: "Keyboard focus visibility",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
