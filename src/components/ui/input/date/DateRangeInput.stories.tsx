import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { DateRangeInput } from "./DateRangeInput";
import { catalogContract } from "./DateRangeInput.catalog";

const onChange = fn();
const meta = {
	id: "ui-input-date-range-input",
	excludeStories: ["catalogContract"],
	title: "UI/Input/Date/DateRangeInput",
	component: DateRangeInput,
	subcomponents: { "DateRangeInput.Skeleton": DateRangeInput.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof DateRangeInput>;
export default meta;
type Story = StoryObj;

export const RangeContract: Story = {
	render: () => (
		<DateRangeInput
			defaultValue={{ start: "2026-08-01", end: "2026-08-07" }}
			endName="endDate"
			label="Reporting period"
			onChange={onChange}
			presets={["last_7_days"]}
			startName="startDate"
		/>
	),
	play: async ({ canvas, canvasElement }) => {
		onChange.mockClear();
		await userEvent.click(
			canvas.getByRole("button", { name: "Reporting period" }),
		);
		const body = within(canvasElement.ownerDocument.body);
		await expect(
			await body.findByRole("dialog", { name: "Choose date range" }),
		).toBeInTheDocument();
		await userEvent.click(body.getByRole("button", { name: /last 7 days/i }));
		await expect(onChange).toHaveBeenCalledOnce();
		const [range, reason] = onChange.mock.calls[0] as unknown as [
			{ end: string; start: string },
			string,
		];
		await expect(reason).toBe("last_7_days");
		await expect(range.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		await expect(range.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		await expect(
			canvasElement.querySelector('input[name="startDate"]'),
		).toHaveValue(range.start);
	},
};

export const SkeletonParity: Story = {
	render: () => <DateRangeInput.Skeleton label="Reporting period" />,
};
