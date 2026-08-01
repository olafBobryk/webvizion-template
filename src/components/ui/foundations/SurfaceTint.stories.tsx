import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { catalogContract } from "./SurfaceTint.catalog";
import { createSurfaceTint } from "./surfaceTint";

const meta = {
	id: "ui-foundations-surface-tint",
	excludeStories: ["catalogContract"],
	title: "UI/Foundations/Surface Tint",
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const StableRecipe: Story = {
	render: () => {
		const tint = createSurfaceTint({
			surface: "var(--surface)",
			space: "oklab",
			tint: "var(--primary)",
			tintPercentage: 12,
		});
		return (
			<div
				className="grid gap-3 rounded-md border p-4"
				style={{ background: tint }}
			>
				<strong>Tinted surface</strong>
				<code data-testid="tint-recipe">{tint}</code>
			</div>
		);
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByTestId("tint-recipe")).toHaveTextContent(
			"color-mix(in oklab,var(--primary) 12%,var(--surface))",
		);
	},
};
