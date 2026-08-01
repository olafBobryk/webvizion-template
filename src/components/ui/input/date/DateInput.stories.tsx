import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { DateInput } from "./DateInput";
import { catalogContract } from "./DateInput.catalog";

const onChange = fn();
const meta = {
	id: "ui-input-date-input",
	excludeStories: ["catalogContract"],
	title: "UI/Input/Date/DateInput",
	component: DateInput,
	subcomponents: { "DateInput.Skeleton": DateInput.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof DateInput>;
export default meta;
type Story = StoryObj;

export const CalendarContract: Story = {
	render: () => (
		<DateInput
			defaultValue="2026-08-01"
			description="Stored as a UTC calendar date."
			label="Launch date"
			name="launchDate"
			onChange={onChange}
		/>
	),
	play: async ({ canvas, canvasElement }) => {
		const trigger = canvas.getByRole("button", { name: "Launch date" });
		await userEvent.click(trigger);
		await expect(
			await within(canvasElement.ownerDocument.body).findByRole("dialog", {
				name: "Choose date",
			}),
		).toBeInTheDocument();
		await userEvent.keyboard("{Escape}");
		await waitFor(() => expect(trigger).toHaveFocus());
		await expect(
			canvasElement.querySelector('input[name="launchDate"]'),
		).toHaveValue("2026-08-01");
	},
};

export const EmptyAndSkeleton: Story = {
	parameters: { a11y: { test: "error" } },
	render: () => (
		<div className="grid gap-4">
			<DateInput label="Launch date" />
			<DateInput.Skeleton label="Launch date" />
		</div>
	),
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("button", { name: "Launch date" }),
		).toBeVisible();
		await expect(canvas.getAllByText("Launch date")).toHaveLength(2);
	},
};
