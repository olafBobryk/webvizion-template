import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { MultiselectInput } from "./MultiselectInput";
import { catalogContract } from "./MultiselectInput.catalog";

const onChange = fn();
const options = [
	{ value: "email", label: "Email" },
	{ value: "sms", label: "SMS" },
];
const meta = {
	id: "ui-input-multiselect-input",
	excludeStories: ["catalogContract"],
	title: "UI/Input/Choice/MultiselectInput",
	component: MultiselectInput,
	subcomponents: { "MultiselectInput.Skeleton": MultiselectInput.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof MultiselectInput>;
export default meta;
type Story = StoryObj;

export const SelectionContract: Story = {
	render: () => (
		<MultiselectInput
			defaultValue={["email"]}
			label="Notifications"
			name="notifications"
			onChange={onChange}
			options={options}
		/>
	),
	play: async ({ canvas }) => {
		onChange.mockClear();
		const sms = canvas.getByRole("checkbox", { name: "SMS" });
		await userEvent.click(sms);
		await expect(sms).toBeChecked();
		await expect(onChange).toHaveBeenCalledWith(["email", "sms"]);
	},
};

export const SkeletonParity: Story = {
	render: () => (
		<MultiselectInput.Skeleton label="Notifications" options={options} />
	),
};
