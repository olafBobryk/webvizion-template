import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ArrowAction } from "./ArrowAction";
import { catalogContract } from "./ArrowAction.catalog";

const meta = {
	id: "ui-helpers-arrow-action",
	excludeStories: ["catalogContract"],
	title: "UI/Helpers/ArrowAction",
	component: ArrowAction,
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: {
				component: formatCatalogOwnerContract(catalogContract),
			},
		},
	},
} satisfies Meta<typeof ArrowAction>;

export default meta;
type Story = StoryObj;

export const InteractiveAndNavigation: Story = {
	render: () => (
		<div className="flex items-center gap-3">
			<ArrowAction aria-label="Open project" />
			<ArrowAction aria-label="Open dashboard" href="/dashboard" />
		</div>
	),
	play: async ({ canvas }) => {
		const button = canvas.getByRole("button", { name: "Open project" });
		const link = canvas.getByRole("link", { name: "Open dashboard" });
		await expect(link).toHaveAttribute("href", "/dashboard");
		button.focus();
		await expect(button).toHaveFocus();
		await userEvent.hover(button);
		await expect(
			button.querySelector('[data-arrow-action-outgoing="true"]'),
		).toBeInTheDocument();
	},
};

export const DecorativeComposition: Story = {
	render: () => (
		<div className="flex items-center gap-3">
			<ArrowAction decorative variant="secondary" />
			<ArrowAction decorative variant="primary" />
			<ArrowAction decorative variant="inverse" />
		</div>
	),
	play: async ({ canvas }) => {
		const roots = canvas.getAllByTestId("decorative-arrow-action");
		await expect(roots).toHaveLength(3);
		for (const root of roots) {
			await expect(root).toHaveAttribute("aria-hidden", "true");
		}
	},
};

export const ReducedMotionFallback: Story = {
	beforeEach: () => {
		const previous = document.documentElement.dataset.motionOverride;
		document.documentElement.dataset.motionOverride = "off";
		return () => {
			if (previous === undefined) {
				delete document.documentElement.dataset.motionOverride;
			} else {
				document.documentElement.dataset.motionOverride = previous;
			}
		};
	},
	render: () => <ArrowAction aria-label="Open project" />,
	play: async ({ canvas }) => {
		const outgoing = canvas
			.getByRole("button", { name: "Open project" })
			.querySelector('[data-arrow-action-outgoing="true"]');
		await expect(outgoing).not.toBeNull();
		await expect(
			window.getComputedStyle(outgoing as Element).transitionDuration,
		).toMatch(/^(0|0\.001)s$/);
	},
};
