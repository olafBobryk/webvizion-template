"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ErrorState } from "./ErrorState";
import { IdleState } from "./IdleState";
import { StateIndicator } from "./State";

function CatalogPreview1() {
	const render = () => (
		<div className="grid w-[36rem] max-w-full gap-8">
			<StateIndicator
				title="Route unavailable"
				description="A prerequisite is missing."
				iconName="warning"
			/>
			<IdleState
				variant="framed"
				layout="stacked"
				align="center"
				title="No projects yet"
				description="Create a project to begin."
			/>
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview2() {
	const render = () => {
		const onAction = () => undefined;
		return (
			<ErrorState
				title="Could not load members"
				description="Try the request again."
				onAction={onAction}
				actionLabel="Retry members"
			/>
		);
	};
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-misc-state",
	name: "State",
	role: "Region-availability presentation for empty, idle, error, and retry states.",
	importStatement:
		'import { StateIndicator, ErrorState, IdleState } from "@/components/ui/misc";',
	chooseWhen: [
		"A condition owns whether a route or contained region can present its normal content.",
	],
	chooseInstead: [
		"Use Field for input validation, StatusMessage for contextual notices, and Toast for action outcomes.",
	],
	compounds: ["ErrorState", "IdleState"],
	exclusions: [
		"Danger-colored StatusMessage as a replacement for fatal region state.",
	],
	guarantees: [
		{
			label: "Plain and framed region variants",
			storyId: "ui-misc-state--variant-contract",
		},
		{
			label: "Preset actions and focus",
			storyId: "ui-misc-state--action-contract",
		},
	],

	family: "UI",
	group: "Misc",
	previewTargets: [
		{
			id: "variant-contract",
			name: "Plain and framed region variants",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "action-contract",
			name: "Preset actions and focus",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
	],
});
