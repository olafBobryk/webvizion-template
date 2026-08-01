"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import {
	getMotionCssVariables,
	getMotionTiming,
	motionTiming,
} from "./motionTiming";
import { getSpring, spring } from "./spring";

function CatalogPreview1() {
	const render = () => {
		const variables = getMotionCssVariables();
		return (
			<dl className="grid grid-cols-2 gap-2" data-testid="timing-table">
				<dt>Feedback</dt>
				<dd>{String(motionTiming.feedback.duration)}</dd>
				<dt>Overlay</dt>
				<dd>{String(motionTiming.overlay.duration)}</dd>
				<dt>Reveal</dt>
				<dd>{String(getMotionTiming("grand").duration)}</dd>
				<dt>CSS token</dt>
				<dd>
					{String(
						variables["--motion-overlay-duration" as keyof typeof variables],
					)}
				</dd>
			</dl>
		);
	};
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview2() {
	const render = () => (
		<dl className="grid grid-cols-2 gap-2">
			<dt>Interactive type</dt>
			<dd data-testid="spring-type">{String(spring.interaction.type)}</dd>
			<dt>Strong stiffness</dt>
			<dd data-testid="spring-stiffness">
				{String(getSpring("overlay", { intensity: "strong" }).stiffness)}
			</dd>
		</dl>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-foundations-motion-timing",
	name: "Motion Timing and Spring",
	role: "Shared transition and spring vocabulary for feedback, interaction, disclosure, overlays, reveals, ambient motion, and scroll behavior.",
	importStatement:
		'import { getMotionTiming, motionTiming, resolveMotionTransition } from "@/components/ui/foundations/motionTiming";\nimport { getSpring, spring } from "@/components/ui/foundations/spring";',
	chooseWhen: [
		"A CSS or motion/react interaction needs a library-owned duration, easing, or spring.",
	],
	chooseInstead: [
		"Use MotionScope when a subtree needs a shared expressive adjustment.",
	],
	compounds: ["motionTiming", "getMotionTiming", "spring", "getSpring"],
	exclusions: ["Hard-coded page-local durations and easings."],
	guarantees: [
		{
			label: "Moment hierarchy",
			storyId: "ui-foundations-motion-timing--moment-hierarchy",
		},
		{
			label: "Resolved spring tokens",
			storyId: "ui-foundations-motion-timing--resolved-springs",
		},
	],

	family: "UI",
	group: "Foundations",
	previewTargets: [
		{
			id: "moment-hierarchy",
			name: "Moment hierarchy",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "resolved-springs",
			name: "Resolved spring tokens",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
	],
});
