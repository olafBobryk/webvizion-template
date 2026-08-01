import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { SegmentedControl } from "./SegmentedControl";
import { catalogContract } from "./SegmentedControl.catalog";

const options = [
	{ value: "day", label: "Day" },
	{ value: "week", label: "Week" },
	{ value: "month", label: "Month", disabled: true },
] as const;
const meta = {
	id: "ui-misc-segmented-control",
	title: "UI/Misc/SegmentedControl",
	component: SegmentedControl,
	excludeStories: ["catalogContract", "options"],
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
	args: {
		options,
		defaultValue: "day",
		onChange: fn(),
		ariaLabel: "Report period",
	},
} satisfies Meta<typeof SegmentedControl>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SelectionContract: Story = {
	play: async ({ args, canvas }) => {
		const day = canvas.getByRole("button", { name: "Day" });
		const week = canvas.getByRole("button", { name: "Week" });
		await expect(day).toHaveAttribute("aria-pressed", "true");
		await userEvent.click(week);
		await expect(week).toHaveAttribute("aria-pressed", "true");
		await expect(args.onChange).toHaveBeenCalledWith("week");
	},
};
export const LayoutContract: Story = {
	render: () => (
		<div className="grid w-[30rem] max-w-full gap-4">
			<SegmentedControl
				ariaLabel="Equal periods"
				options={options}
				defaultValue="day"
			/>
			<SegmentedControl
				ariaLabel="Automatic periods"
				options={options}
				defaultValue="week"
				layout="auto"
			/>
		</div>
	),
	play: async ({ canvas }) => {
		for (const month of canvas.getAllByRole("button", { name: "Month" }))
			await expect(month).toBeDisabled();
	},
};
