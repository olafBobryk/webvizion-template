import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import Portal from "./Portal";
import { catalogContract } from "./Portal.catalog";

const meta = {
	id: "ui-overlays-portal",
	excludeStories: ["catalogContract"],
	title: "UI/Overlays/Portal",
	component: Portal,
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof Portal>;

export default meta;
type Story = StoryObj;

export const ConfiguredTarget: Story = {
	render: () => (
		<div className="grid gap-2">
			<p>Source location</p>
			<div
				className="rounded-md border border-dashed p-3"
				id="catalog-portal-target"
			/>
			<Portal target="catalog-portal-target">
				<p>Portaled into the configured target</p>
			</Portal>
		</div>
	),
	play: async ({ canvas }) => {
		const content = await canvas.findByText(
			"Portaled into the configured target",
		);
		await expect(content.parentElement).toHaveAttribute(
			"id",
			"catalog-portal-target",
		);
	},
};

export const BodyFallback: Story = {
	render: () => (
		<Portal target="missing-catalog-target">
			<p data-testid="body-portal-content">Portaled to the document body</p>
		</Portal>
	),
	play: async () => {
		const content = await within(document.body).findByTestId(
			"body-portal-content",
		);
		await expect(content.parentElement).toBe(document.body);
	},
};
