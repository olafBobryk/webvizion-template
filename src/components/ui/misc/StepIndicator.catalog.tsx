"use client";

import { type ComponentType, createElement } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ModalStepIndicator, StepIndicator } from "./StepIndicator";

const steps = [
	{ id: "details", label: "Details" },
	{ id: "review", label: "Review" },
	{ id: "publish", label: "Publish", disabled: true },
] as const;
function CatalogPreview1() {
	return createElement(
		StepIndicator as unknown as ComponentType<Record<string, unknown>>,
		{
			...{ currentStep: "review", steps, onStepChange: () => undefined },
			...{},
		},
	);
}
function CatalogPreview2() {
	const render = () => (
		<ModalStepIndicator
			aria-label="Account setup"
			currentStep="details"
			onStepChange={() => undefined}
			steps={steps}
		/>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({
		...{ currentStep: "review", steps, onStepChange: () => undefined },
		...{},
	} as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-misc-step-indicator",
	name: "StepIndicator",
	role: "Navigable progress indicator for bounded multi-step flows.",
	importStatement:
		'import { StepIndicator, ModalStepIndicator } from "@/components/ui/misc";',
	chooseWhen: [
		"A multi-step flow exposes its current, completed, and upcoming steps.",
	],
	chooseInstead: [
		"Use PaginationControls for peer media or result navigation.",
	],
	compounds: ["ModalStepIndicator"],
	exclusions: ["Modal-form state and validation ownership."],
	guarantees: [
		{
			label: "Current-step semantics and callbacks",
			storyId: "ui-misc-step-indicator--step-contract",
		},
		{
			label: "Modal composition",
			storyId: "ui-misc-step-indicator--modal-composition",
		},
	],

	family: "UI",
	group: "Misc",
	previewTargets: [
		{
			id: "step-contract",
			name: "Current-step semantics and callbacks",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "modal-composition",
			name: "Modal composition",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
	],
});
