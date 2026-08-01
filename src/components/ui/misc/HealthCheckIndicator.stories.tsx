import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { HealthCheckIndicator } from "./HealthCheckIndicator";
import { catalogContract } from "./HealthCheckIndicator.catalog";

const healthyResponse = {
	status: "healthy",
	checkedAt: "2026-08-01T12:00:00.000Z",
	services: {
		app: { status: "healthy", message: "App is available." },
		supabase: {
			status: "healthy",
			message: "Database is available.",
			latencyMs: 18,
		},
	},
};
const meta = {
	id: "ui-misc-health-check-indicator",
	title: "UI/Misc/HealthCheckIndicator",
	component: HealthCheckIndicator,
	excludeStories: ["catalogContract", "healthyResponse"],
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
	beforeEach: () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = fn(
			async () =>
				new Response(JSON.stringify(healthyResponse), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
		);
		return () => {
			globalThis.fetch = originalFetch;
		};
	},
} satisfies Meta<typeof HealthCheckIndicator>;
export default meta;
type Story = StoryObj<typeof meta>;
export const OperationalContract: Story = {
	args: { endpoint: "/storybook-health", label: "Database" },
	parameters: { a11y: { test: "error" } },
	play: async ({ canvas }) => {
		const label = await canvas.findByText("Database: Operational");
		const status = label.closest('[aria-live="polite"]');
		await expect(status).toHaveAttribute("aria-live", "polite");
		await expect(label).toBeVisible();
		await expect(status).toHaveAttribute(
			"title",
			"Database is available. 18ms",
		);
		await userEvent.click(canvas.getByRole("button", { name: "Refresh" }));
		await expect(
			await canvas.findByText("Database: Operational"),
		).toBeVisible();
	},
};
export const CompactContract: Story = {
	args: { endpoint: "/storybook-health", label: "API", variant: "sm" },
	parameters: { a11y: { test: "error" } },
	play: async ({ canvas }) => {
		await expect(await canvas.findByText("API: Operational")).toBeVisible();
		await expect(
			canvas.queryByRole("button", { name: "Refresh" }),
		).not.toBeInTheDocument();
	},
};
