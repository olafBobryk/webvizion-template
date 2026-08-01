import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { UnitNumberInput } from "./UnitNumberInput";
import { catalogContract } from "./UnitNumberInput.catalog";

const onChange = fn();
const meta = {
	id: "ui-input-unit-number-input",
	excludeStories: ["catalogContract"],
	title: "UI/Input/Numeric/UnitNumberInput",
	component: UnitNumberInput,
	subcomponents: { "UnitNumberInput.Skeleton": UnitNumberInput.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof UnitNumberInput>;
export default meta;
type Story = StoryObj;

export const UnitContract: Story = {
	render: () => (
		<UnitNumberInput label="Distance" onChange={onChange} unit="km" />
	),
	play: async ({ canvas }) => {
		onChange.mockClear();
		await userEvent.type(
			canvas.getByRole("spinbutton", { name: "Distance" }),
			"42",
		);
		await expect(onChange).toHaveBeenLastCalledWith(42);
		await expect(canvas.getByText("km")).toBeVisible();
	},
};

export const SkeletonParity: Story = {
	render: () => <UnitNumberInput.Skeleton label="Distance" />,
};
