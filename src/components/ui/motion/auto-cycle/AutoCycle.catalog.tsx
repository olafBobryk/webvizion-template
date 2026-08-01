"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Button } from "../../primitives/Button";
import * as AutoCycle from "./index";

function CycleItems() {
	const controller = AutoCycle.useController();
	return (
		<div className="grid gap-3">
			<div className="flex gap-3">
				{["Overview", "Details", "History"].map((label, index) => (
					<Button
						type="button"
						key={label}
						{...controller.getItemProps(index)}
						aria-pressed={controller.isActive(index)}
						onClick={() => controller.setActive(index)}
						variant="secondary"
					>
						{label}
					</Button>
				))}
			</div>
			<div
				aria-hidden={true}
				className="h-1 overflow-hidden rounded-full bg-surface"
			>
				<div
					className="h-full origin-left bg-primary"
					data-testid="cycle-progress"
					style={{ transform: `scaleX(${controller.progress})` }}
				/>
			</div>
		</div>
	);
}
function WorkflowCycleItems() {
	const controller = AutoCycle.useController();
	const items = [
		["Brief", "Gather the highest-risk user need before motion begins."],
		["Sequence", "Cycle through items after readiness or a visibility gate."],
		["Refine", "Pause on hover or focus so one state remains inspectable."],
	] as const;
	return (
		<div className="grid gap-3">
			<div
				aria-hidden="true"
				className="h-1 overflow-hidden rounded-full bg-foreground/10"
			>
				<div
					className="h-full origin-left bg-primary"
					data-testid="workflow-progress"
					style={{ transform: `scaleX(${controller.progress})` }}
				/>
			</div>
			<div className="grid gap-2 sm:grid-cols-3">
				{items.map(([title, description], index) => (
					<Button
						align="left"
						className="h-auto min-h-32 rounded-xl p-4 data-[active=true]:bg-primary/10"
						contentClassName="flex-col items-start gap-2"
						key={title}
						onClick={() => controller.setActive(index)}
						size="none"
						type="button"
						{...controller.getItemProps(index)}
						variant="secondary"
					>
						<span className="font-medium">{title}</span>
						<span className="text-left text-sm opacity-75">{description}</span>
					</Button>
				))}
			</div>
		</div>
	);
}
function CatalogPreview1() {
	const render = () => (
		<AutoCycle.Root count={3} autoCycle={false}>
			<CycleItems />
		</AutoCycle.Root>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{ count: 3, children: <CycleItems /> } } as never);
}
function CatalogPreview2() {
	const render = () => (
		<AutoCycle.Root count={3} initialIndex={99} autoCycle={false}>
			<CycleItems />
		</AutoCycle.Root>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{ count: 3, children: <CycleItems /> } } as never);
}
function CatalogPreview3() {
	const render = () => (
		<AutoCycle.Root count={3} intervalMs={1600}>
			<CycleItems />
		</AutoCycle.Root>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{ count: 3, children: <CycleItems /> } } as never);
}
function CatalogPreview4() {
	const render = () => (
		<AutoCycle.Root count={3} intervalMs={1800}>
			<WorkflowCycleItems />
		</AutoCycle.Root>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({
		...{},
		...{ count: 3, children: <WorkflowCycleItems /> },
	} as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-motion-auto-cycle",
	name: "AutoCycle",
	role: "Finite active-item controller with timed cycling and hover/focus pause ownership.",
	importStatement:
		'import * as AutoCycle from "@/components/ui/motion/auto-cycle";',
	chooseWhen: [
		"A small set should advance automatically while remaining directly selectable.",
	],
	chooseInstead: [
		"Use explicit tabs or segmented selection when automatic progression would be distracting.",
	],
	compounds: ["AutoCycle.Root", "AutoCycle.useController"],
	exclusions: [
		"AutoCycleRoot and controller context as independent catalogue identities.",
	],
	guarantees: [
		{
			label: "Focus, hover, and manual active ownership",
			storyId: "ui-motion-auto-cycle--interaction-contract",
		},
		{
			label: "Index clamping",
			storyId: "ui-motion-auto-cycle--clamped-initial-index",
		},
		{
			label: "Timed automatic progression",
			storyId: "ui-motion-auto-cycle--timed-cycle",
		},
		{
			label: "Selectable workflow composition with progress",
			storyId: "ui-motion-auto-cycle--workflow-composition",
		},
	],

	family: "UI",
	group: "Motion",
	sweepSpan: "full",
	previewTargets: [
		{
			id: "interaction-contract",
			name: "Focus, hover, and manual active ownership",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "clamped-initial-index",
			name: "Index clamping",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
		{
			id: "timed-cycle",
			name: "Timed automatic progression",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview3,
		},
		{
			id: "workflow-composition",
			name: "Selectable workflow composition with progress",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview4,
		},
	],
});
