"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Button } from "../primitives/Button";
import { LetterWave } from "./LetterWave";

function CatalogPreview1() {
	const render = () => (
		<Button className="group" variant="secondary">
			<LetterWave variant="bodyStrong">Open project</LetterWave>
		</Button>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{ children: "Open project" } } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-motion-letter-wave",
	name: "LetterWave",
	role: "Hover-only per-character text accent triggered by a parent group.",
	importStatement:
		'import { LetterWave } from "@/components/ui/motion/LetterWave";',
	chooseWhen: [
		"A hoverable owner benefits from a restrained typographic accent.",
	],
	chooseInstead: [
		"Use plain Text when the accent adds no interaction meaning.",
	],
	compounds: [],
	exclusions: [
		"Standalone activation state, scheduling, and essential copy gating.",
	],
	guarantees: [
		{
			label: "Readable text and group-owned hover",
			storyId: "ui-motion-letter-wave--hover-contract",
		},
	],

	family: "UI",
	group: "Motion",
	previewTargets: [
		{
			id: "hover-contract",
			name: "Readable text and group-owned hover",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
	],
});
