import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { RadioInput } from "./RadioInput";
import { catalogContract } from "./RadioInput.catalog";

const onChange = fn();
const options = [
	{ value: "weekly", label: "Weekly", description: "A weekly summary." },
	{ value: "monthly", label: "Monthly" },
];

const meta = {
	id: "ui-input-radio-input",
	excludeStories: ["catalogContract"],
	title: "UI/Input/Choice/RadioInput",
	component: RadioInput,
	subcomponents: { "RadioInput.Skeleton": RadioInput.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof RadioInput>;

export default meta;
type Story = StoryObj;

export const SelectionContract: Story = {
	render: () => (
		<RadioInput
			description="Choose a cadence."
			label="Digest"
			name="digest"
			onChange={onChange}
			options={options}
		/>
	),
	play: async ({ canvas }) => {
		onChange.mockClear();
		const monthly = canvas.getByRole("radio", { name: "Monthly" });
		await userEvent.click(monthly);
		await expect(monthly).toBeChecked();
		await expect(onChange).toHaveBeenCalledWith("monthly");
		await expect(monthly).toHaveAccessibleDescription("Choose a cadence.");
	},
};

export const SkeletonParity: Story = {
	render: () => <RadioInput.Skeleton label="Digest" options={options} />,
};
