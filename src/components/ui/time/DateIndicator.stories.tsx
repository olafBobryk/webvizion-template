import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { DateIndicator } from "./DateIndicator";
import { catalogContract } from "./DateIndicator.catalog";

const meta = {
	id: "ui-time-date-indicator",
	excludeStories: ["catalogContract"],
	title: "UI/Time/DateIndicator",
	component: DateIndicator,
	subcomponents: { "DateIndicator.Skeleton": DateIndicator.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof DateIndicator>;

export default meta;
type Story = StoryObj;

export const CalendarOutput: Story = {
	args: {
		date: "2025-01-13T12:00:00Z",
		interactive: false,
		leadingText: "Published",
		tone: "muted",
		variant: "caption",
	},
	play: async ({ canvas }) => {
		await expect(
			canvas.getByText("Published Monday, 13th January"),
		).toBeInTheDocument();
	},
};
