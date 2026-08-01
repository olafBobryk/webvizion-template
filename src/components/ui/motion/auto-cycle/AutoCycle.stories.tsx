import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Button } from "../../primitives/Button";
import { catalogContract } from "./AutoCycle.catalog";
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
const meta = {
	id: "ui-motion-auto-cycle",
	title: "UI/Motion/AutoCycle",
	component: AutoCycle.Root,
	excludeStories: ["catalogContract"],
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof AutoCycle.Root>;
export default meta;
type Story = StoryObj<typeof meta>;
export const InteractionContract: Story = {
	args: { count: 3, children: <CycleItems /> },
	render: () => (
		<AutoCycle.Root count={3} autoCycle={false}>
			<CycleItems />
		</AutoCycle.Root>
	),
	play: async ({ canvas }) => {
		const overview = canvas.getByRole("button", { name: "Overview" });
		const details = canvas.getByRole("button", { name: "Details" });
		await expect(overview).toHaveAttribute("aria-pressed", "true");
		await userEvent.tab();
		await expect(overview).toHaveFocus();
		await userEvent.tab();
		await expect(details).toHaveFocus();
		await expect(details).toHaveAttribute("data-active", "true");
		await userEvent.click(details);
		await expect(details).toHaveAttribute("aria-pressed", "true");
	},
};
export const ClampedInitialIndex: Story = {
	args: { count: 3, children: <CycleItems /> },
	render: () => (
		<AutoCycle.Root count={3} initialIndex={99} autoCycle={false}>
			<CycleItems />
		</AutoCycle.Root>
	),
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("button", { name: "History" }),
		).toHaveAttribute("aria-pressed", "true");
	},
};

export const TimedCycle: Story = {
	args: { count: 3, children: <CycleItems /> },
	render: () => (
		<AutoCycle.Root count={3} intervalMs={1600}>
			<CycleItems />
		</AutoCycle.Root>
	),
	play: async ({ canvas }) => {
		const overview = canvas.getByRole("button", { name: "Overview" });
		const details = canvas.getByRole("button", { name: "Details" });
		await expect(overview).toHaveAttribute("aria-pressed", "true");
		await waitFor(
			() => expect(details).toHaveAttribute("aria-pressed", "true"),
			{ timeout: 3000 },
		);
		await expect(canvas.getByTestId("cycle-progress")).toBeVisible();
	},
};

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

export const WorkflowComposition: Story = {
	args: { count: 3, children: <WorkflowCycleItems /> },
	render: () => (
		<AutoCycle.Root count={3} intervalMs={1800}>
			<WorkflowCycleItems />
		</AutoCycle.Root>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByText("Brief")).toBeVisible();
		await expect(canvas.getByText(/Pause on hover or focus/i)).toBeVisible();
		await expect(canvas.getByTestId("workflow-progress")).toBeVisible();
	},
};
