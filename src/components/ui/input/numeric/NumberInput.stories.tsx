import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { NumberInput } from "./NumberInput";
import { catalogContract } from "./NumberInput.catalog";

const onChange = fn();
const meta = {
	id: "ui-input-number-input",
	excludeStories: ["catalogContract"],
	title: "UI/Input/Numeric/NumberInput",
	component: NumberInput,
	subcomponents: { "NumberInput.Skeleton": NumberInput.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof NumberInput>;
export default meta;
type Story = StoryObj;

export const NumericContract: Story = {
	parameters: { a11y: { test: "error" } },
	render: () => (
		<NumberInput
			description="Whole numbers from one to ten."
			label="Seats"
			max={10}
			min={1}
			onChange={onChange}
			validate={(value) =>
				value !== null && value > 10 ? "Maximum is 10." : null
			}
		/>
	),
	play: async ({ canvas }) => {
		onChange.mockClear();
		const input = canvas.getByRole("spinbutton", { name: "Seats" });
		await userEvent.type(input, "12");
		await expect(onChange).toHaveBeenLastCalledWith(12);
		await userEvent.tab();
		await expect(canvas.getByRole("alert")).toHaveTextContent("Maximum is 10.");
	},
};

export const SkeletonParity: Story = {
	render: () => <NumberInput.Skeleton label="Seats" />,
};
