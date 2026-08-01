import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { DateAgo } from "./DateAgo";
import { catalogContract } from "./DateAgo.catalog";

const meta = {
	id: "ui-time-date-ago",
	excludeStories: ["catalogContract"],
	title: "UI/Time/DateAgo",
	component: DateAgo,
	subcomponents: { "DateAgo.Skeleton": DateAgo.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof DateAgo>;

export default meta;
type Story = StoryObj;

export const PastAndFuture: Story = {
	render: () => (
		<div className="grid gap-2">
			<DateAgo
				date={new Date(Date.now() - 5 * 60_000)}
				updateIntervalMs={60_000}
			/>
			<DateAgo
				date={new Date(Date.now() + 2 * 60 * 60_000)}
				updateIntervalMs={60_000}
			/>
		</div>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByText("5 minutes ago")).toBeInTheDocument();
		await expect(canvas.getByText(/^in \d hours?$/)).toBeInTheDocument();
	},
};

export const InvalidDateFallback: Story = {
	args: { date: "not-a-date", placeholder: "Date unavailable" },
	play: async ({ canvas }) => {
		await expect(canvas.getByText("Date unavailable")).toBeInTheDocument();
	},
};
