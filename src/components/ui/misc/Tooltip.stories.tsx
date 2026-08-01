import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, userEvent, waitFor } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Tooltip } from "./Tooltip";
import { catalogContract } from "./Tooltip.catalog";

const meta = {
	id: "ui-misc-tooltip",
	title: "UI/Misc/Tooltip",
	component: Tooltip,
	excludeStories: ["catalogContract"],
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;
export const DisclosureContract: Story = {
	args: {
		content: "Copies the public URL",
		children: <button type="button">Share</button>,
		width: 260,
	},
	parameters: { a11y: { test: "error" } },
	play: async ({ canvas }) => {
		const trigger = canvas.getByRole("button", { name: "Share" });
		await userEvent.hover(trigger);
		const tooltip = await screen.findByText("Copies the public URL");
		await waitFor(() => expect(tooltip).toBeVisible());
		const tooltipOwner = tooltip.closest('[role="tooltip"]');
		await expect(tooltipOwner).toHaveAttribute("id");
		await expect(trigger).toHaveAttribute("aria-describedby", tooltipOwner?.id);
		const surface = tooltip.closest('[data-surface-role="float"]');
		await expect(surface).toHaveAttribute("data-elevation", "panel");
		await expect(surface).toHaveClass("bg-popover", "shadow-none");
		await expect(surface).toHaveStyle({
			position: "fixed",
			width: "260px",
		});
		await userEvent.unhover(trigger);
		trigger.focus();
		await expect(trigger).toHaveFocus();
		await waitFor(() => expect(tooltip).toBeVisible());
	},
};
