import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import {
	ColorSwatchInput,
	SEMANTIC_COLOR_SWATCH_PRESETS,
} from "./ColorSwatchInput";
import { catalogContract } from "./ColorSwatchInput.catalog";

const onChange = fn();
const meta = {
	id: "ui-input-color-swatch-input",
	excludeStories: ["catalogContract"],
	title: "UI/Input/Color/ColorSwatchInput",
	component: ColorSwatchInput,
	subcomponents: { "ColorSwatchInput.Skeleton": ColorSwatchInput.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof ColorSwatchInput>;
export default meta;
type Story = StoryObj;

export const SelectionContract: Story = {
	render: () => (
		<ColorSwatchInput
			defaultValue="neutral"
			label="Status color"
			name="statusColor"
			onChange={onChange}
			presets={SEMANTIC_COLOR_SWATCH_PRESETS}
		/>
	),
	play: async ({ canvas }) => {
		onChange.mockClear();
		const green = canvas.getByRole("radio", { name: "Green" });
		await userEvent.click(green);
		await expect(green).toBeChecked();
		await expect(onChange).toHaveBeenCalledWith({
			customColorHex: null,
			value: "success",
		});
	},
};

export const SkeletonParity: Story = {
	render: () => <ColorSwatchInput.Skeleton label="Status color" />,
};
