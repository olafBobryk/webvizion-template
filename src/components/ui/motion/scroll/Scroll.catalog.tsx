"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import * as Scroll from "./index";

function ScrollLagPreview() {
	return (
		<div className="min-h-[120vh] overflow-hidden p-12">
			<Scroll.Lag className="max-w-xl">
				<div className="rounded-xl border border-subtle bg-surface p-8">
					Velocity lag remains a scroll-only non-scalar effect.
				</div>
			</Scroll.Lag>
		</div>
	);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-motion-scroll",
	name: "Scroll.Lag",
	role: "Scroll-velocity response kept outside the scalar MotionSource strategy system.",
	importStatement: 'import * as Scroll from "@/components/ui/motion/scroll";',
	chooseWhen: [
		"A supporting surface should lag current scroll velocity rather than normalized position.",
	],
	chooseInstead: [
		"Use MotionSource.Root with a scroll strategy for position-driven scalar effects.",
	],
	compounds: ["Scroll.Lag"],
	exclusions: [
		"Normalized progress, reveal timing, hover activation, and indexed transitions.",
	],
	guarantees: [
		{
			label: "Readable velocity fallback",
			storyId: "ui-motion-scroll--velocity-lag",
		},
	],
	family: "UI",
	group: "Motion",
	previewTargets: [
		{
			id: "velocity-lag",
			name: "Scroll velocity lag",
			baseline: {},
			axes: [],
			stage: "wide",
			Render: ScrollLagPreview,
		},
	],
});
