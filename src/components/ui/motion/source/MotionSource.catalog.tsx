"use client";

import Link from "next/link";
import { useState } from "react";
import { focusRing } from "@/components/ui/foundations/focus";
import * as MotionEffect from "@/components/ui/motion/effect";
import { Button } from "@/components/ui/primitives/Button";
import { Panel } from "@/components/ui/primitives/surfaces";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import * as MotionSource from "./index";

function SourcePreview() {
	const [active, setActive] = useState(false);
	return (
		<div className="grid max-w-3xl gap-5 p-6 sm:grid-cols-2">
			<MotionSource.Root
				asChild
				strategy={{ type: "hover", timing: "component" }}
			>
				<Link
					className={`rounded-lg border border-subtle p-5 text-xl ${focusRing.visibleDefault}`}
					href="/motion-source"
				>
					<MotionEffect.UnderlineText>
						Direct hover source
					</MotionEffect.UnderlineText>
				</Link>
			</MotionSource.Root>
			<Panel padding="md">
				<Button
					onClick={() => setActive((value) => !value)}
					size="sm"
					variant="secondary"
				>
					Toggle progress
				</Button>
				<MotionSource.Root strategy={{ type: "boolean", active }}>
					<MotionEffect.TextHighlight className="mt-4 block">
						Boolean source drives a neutral effect.
					</MotionEffect.TextHighlight>
				</MotionSource.Root>
			</Panel>
		</div>
	);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-motion-motion-source",
	name: "MotionSource.Root",
	role: "Typed strategy owner that produces and shares private normalized progress for scalar motion effects.",
	importStatement:
		'import * as MotionSource from "@/components/ui/motion/source";',
	chooseWhen: [
		"One or more scalar effects should respond to scroll, hover, owner hover, boolean state, viewport entry, or reveal scheduling.",
	],
	chooseInstead: [
		"Use Scroll.Lag for velocity response and indexed owners such as AutoCycle or ImageSwitcher for discrete transitions.",
	],
	compounds: ["MotionSource.Root", "MotionSource.Sequence"],
	exclusions: [
		"Public MotionValue access, effect styling, indexed state, and scroll velocity.",
		"Arbitrary owner selectors; owner hover resolves only the nearest data-motion-owner ancestor.",
	],
	guarantees: [
		{
			label: "Typed interaction timing and boolean strategies",
			storyId: "ui-motion-motion-source--strategy-matrix",
		},
		{
			label: "Shared scroll progress",
			storyId: "ui-motion-motion-source--shared-scroll-scene",
		},
		{
			label: "Reveal sequence ordering",
			storyId: "ui-motion-motion-source--reveal-sequence",
		},
		{
			label: "Opt-in viewport exit reset and re-entry playback",
			storyId: "ui-motion-motion-source--reveal-viewport-reentry",
		},
		{
			label: "Reduced-motion source fallbacks",
			storyId: "ui-motion-motion-source--reduced-motion",
		},
	],
	family: "UI",
	group: "Motion",
	sweepSpan: "full",
	previewTargets: [
		{
			id: "strategy-matrix",
			name: "Interaction and boolean strategies",
			baseline: {},
			axes: [],
			stage: "wide",
			Render: SourcePreview,
		},
	],
});
