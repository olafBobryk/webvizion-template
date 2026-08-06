"use client";

import { useEffect } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Button } from "../primitives/Button";
import {
	MotionProvider,
	MotionScope,
	useMotionTransition,
} from "./MotionProvider";
import {
	useIntroDisableOverride,
	useMotionDisableOverride,
} from "./motionDisableOverride";

function TransitionEvidence() {
	const transition = useMotionTransition("interaction");
	return (
		<output data-testid="transition-duration">
			{String(transition.duration)}
		</output>
	);
}
function OverrideEvidence() {
	const motionDisabled = useMotionDisableOverride();
	const introDisabled = useIntroDisableOverride();

	useEffect(
		() => () => {
			delete document.documentElement.dataset.motionOverride;
			delete document.documentElement.dataset.loadingOverride;
		},
		[],
	);

	return (
		<div className="grid gap-3">
			<output aria-live="polite">
				Motion {motionDisabled ? "disabled" : "enabled"}; intro{" "}
				{introDisabled ? "disabled" : "enabled"}
			</output>
			<Button
				onClick={() => {
					document.documentElement.dataset.motionOverride = "off";
					document.documentElement.dataset.loadingOverride = "off";
					window.dispatchEvent(new PopStateEvent("popstate"));
				}}
			>
				Apply automation overrides
			</Button>
		</div>
	);
}
function CatalogPreview1() {
	const render = () => (
		<MotionProvider expressive={-0.25}>
			<MotionScope expressive={0.75}>
				<div data-testid="motion-scope">
					<TransitionEvidence />
				</div>
			</MotionScope>
		</MotionProvider>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview2() {
	const render = () => <OverrideEvidence />;
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-foundations-motion-provider",
	name: "Motion Provider and Overrides",
	role: "Context owner for application and locally scoped motion expression, plus deterministic automation overrides.",
	importStatement:
		'import { MotionProvider, MotionScope, useMotionTransition } from "@/components/ui/foundations/MotionProvider";\nimport { useIntroDisableOverride, useMotionDisableOverride } from "@/components/ui/foundations/motionDisableOverride";',
	chooseWhen: [
		"Motion components need shared CSS variables, an expressive scope, or a test-friendly disable override.",
	],
	chooseInstead: [
		"Use motionTiming or spring directly when a non-React transition configuration is sufficient.",
	],
	compounds: [
		"MotionScope",
		"useMotionTransition",
		"useMotionDisableOverride",
		"useIntroDisableOverride",
	],
	exclusions: ["GlobalMotionScheduler and other scheduler internals."],
	guarantees: [
		{
			label: "Scoped motion variables",
			storyId: "ui-foundations-motion-provider--scoped-motion-variables",
		},
		{
			label: "Automation override detection",
			storyId: "ui-foundations-motion-provider--automation-overrides",
		},
	],

	family: "UI",
	group: "Foundations",
	previewTargets: [
		{
			id: "scoped-motion-variables",
			name: "Scoped motion variables",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "automation-overrides",
			name: "Automation override detection",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
	],
});
