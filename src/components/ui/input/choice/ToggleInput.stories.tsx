import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ToggleInput } from "./ToggleInput";
import { catalogContract } from "./ToggleInput.catalog";

const onChange = fn();
const options = [
	{
		value: "marketing",
		label: "Marketing email",
		description: "Occasional product news.",
	},
];
const meta = {
	id: "ui-input-toggle-input",
	excludeStories: ["catalogContract"],
	title: "UI/Input/Choice/ToggleInput",
	component: ToggleInput,
	subcomponents: { "ToggleInput.Skeleton": ToggleInput.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof ToggleInput>;
export default meta;
type Story = StoryObj;

export const SelectionContract: Story = {
	render: () => (
		<ToggleInput
			label="Preferences"
			name="preferences"
			onChange={onChange}
			options={options}
		/>
	),
	play: async ({ canvas }) => {
		onChange.mockClear();
		const toggle = canvas.getByRole("checkbox", {
			name: /marketing email/i,
		});
		await userEvent.click(toggle);
		await expect(toggle).toBeChecked();
		await expect(onChange).toHaveBeenCalledWith(["marketing"]);
	},
};

export const SkeletonParity: Story = {
	render: () => <ToggleInput.Skeleton label="Preferences" options={options} />,
};
