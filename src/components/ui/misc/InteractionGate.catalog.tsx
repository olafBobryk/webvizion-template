"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { InteractionGate } from "./InteractionGate";

function CatalogPreview1() {
	const render = (args: Parameters<typeof InteractionGate>[0]) => (
		<div className="relative h-80 bg-muted">
			<InteractionGate {...args} />
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({
		...{},
		...{
			active: true,
			title: "Enable map",
			description: "The map loads third-party content.",
			actionLabel: "Enable map",
			onActivate: () => undefined,
		},
	} as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-misc-interaction-gate",
	name: "InteractionGate",
	role: "Overlay gate that blocks an interactive region until the user explicitly activates it.",
	importStatement: 'import { InteractionGate } from "@/components/ui/misc";',
	chooseWhen: [
		"Embedded or expensive interaction needs a consent or activation step.",
	],
	chooseInstead: [
		"Use Modal for a page-level decision or ConfirmationModal for a destructive action.",
	],
	compounds: [],
	exclusions: ["Authentication and authorization guards."],
	guarantees: [
		{
			label: "Explicit accessible activation",
			storyId: "ui-misc-interaction-gate--activation-contract",
		},
	],

	family: "UI",
	group: "Misc",
	previewTargets: [
		{
			id: "activation-contract",
			name: "Explicit accessible activation",
			baseline: {},
			axes: [],
			stage: "wide",
			Render: CatalogPreview1,
		},
	],
});
