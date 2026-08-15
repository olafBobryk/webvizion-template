import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { HealthCheckIndicator } from "./HealthCheckIndicator";
import { catalogContract } from "./HealthCheckIndicator.catalog";

const fixtureResponses = {
	auth: {
		label: "Fixture sign-in",
		message: "Fixture credentials and session storage are available.",
		status: "available",
	},
	platform: {
		label: "Platform fixtures",
		message: "Support and report fixtures are ready for internal review.",
		status: "available",
	},
};

const meta = {
	id: "ui-misc-health-check-indicator",
	title: "UI/Misc/HealthCheckIndicator",
	component: HealthCheckIndicator,
	excludeStories: ["catalogContract", "fixtureResponses"],
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
		globalThis.fetch = fn(async (input) => {
			const url = new URL(`${input}`, "https://storybook.local");
			if (url.pathname.endsWith("-checking")) {
				return new Promise<Response>(() => undefined);
			}
			if (url.pathname.endsWith("-unavailable")) {
				return new Response(
					JSON.stringify({ message: "Fixture service is unavailable." }),
					{
						status: 503,
						headers: { "Content-Type": "application/json" },
					},
				);
			}
			const service = url.searchParams.get("service");
			const response =
				service === "platform"
					? fixtureResponses.platform
					: fixtureResponses.auth;
			return new Response(JSON.stringify({ service: response }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		});
		return () => {
			globalThis.fetch = originalFetch;
		};
	},
} satisfies Meta<typeof HealthCheckIndicator>;
export default meta;
type Story = StoryObj<typeof meta>;

export const OperationalContract: Story = {
	args: { endpoint: "/storybook-health", service: "auth" },
	parameters: { a11y: { test: "error" } },
	play: async ({ canvas }) => {
		const label = await canvas.findByText("Fixture sign-in: Available");
		const status = label.closest('[aria-live="polite"]');
		await expect(status).toHaveAttribute("aria-live", "polite");
		await expect(label).toBeVisible();
		await expect(status).toHaveAttribute(
			"title",
			"Fixture credentials and session storage are available.",
		);
	},
};

export const CheckingContract: Story = {
	args: { endpoint: "/storybook-health-checking", service: "auth" },
	parameters: { a11y: { test: "error" } },
	play: async ({ canvas }) => {
		const label = await canvas.findByText("Fixture sign-in: Checking");
		const status = label.closest('[aria-live="polite"]');
		await expect(label).toBeVisible();
		await expect(status).toHaveAttribute("title", "Checking fixture sign-in.");
	},
};

export const PlatformFixtureContract: Story = {
	args: { endpoint: "/storybook-health", service: "platform" },
	parameters: { a11y: { test: "error" } },
	play: async ({ canvas }) => {
		await expect(
			await canvas.findByText("Platform fixtures: Available"),
		).toBeVisible();
		await expect(
			canvas.queryByRole("button", { name: "Refresh" }),
		).not.toBeInTheDocument();
	},
};

export const UnavailableContract: Story = {
	args: { endpoint: "/storybook-health-unavailable", service: "platform" },
	parameters: { a11y: { test: "error" } },
	play: async ({ canvas }) => {
		const label = await canvas.findByText("Platform fixtures: Unavailable");
		const status = label.closest('[aria-live="polite"]');
		await expect(label).toBeVisible();
		await expect(status).toHaveAttribute(
			"title",
			"Fixture service is unavailable.",
		);
	},
};
