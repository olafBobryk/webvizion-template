import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ButtonMultiSelectInput } from "./ButtonMultiSelectInput";
import { catalogContract } from "./ButtonMultiSelectInput.catalog";

const onChange = fn();
const options = [
	{ value: "design", label: "Design" },
	{ value: "engineering", label: "Engineering" },
	{ value: "research", label: "Research" },
];
const meta = {
	id: "ui-input-button-multi-select-input",
	excludeStories: ["catalogContract"],
	title: "UI/Input/Selection/ButtonMultiSelectInput",
	component: ButtonMultiSelectInput,
	subcomponents: {
		"ButtonMultiSelectInput.Skeleton": ButtonMultiSelectInput.Skeleton,
	},
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof ButtonMultiSelectInput>;
export default meta;
type Story = StoryObj;

export const SelectionContract: Story = {
	render: () => (
		<ButtonMultiSelectInput
			defaultValue={["design"]}
			label="Teams"
			name="teams"
			onChange={onChange}
			options={options}
		/>
	),
	play: async ({ canvas, canvasElement }) => {
		onChange.mockClear();
		const engineering = canvas.getByRole("button", { name: "Engineering" });
		await userEvent.click(engineering);
		await expect(engineering).toHaveAttribute("aria-pressed", "true");
		await expect(onChange).toHaveBeenCalledWith(["design", "engineering"]);
		await expect(
			canvasElement.querySelectorAll('input[name="teams"]'),
		).toHaveLength(2);
	},
};

export const SkeletonParity: Story = {
	render: () => (
		<ButtonMultiSelectInput.Skeleton label="Teams" options={options} />
	),
};
