import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { SliderInput } from "./SliderInput";
import { catalogContract } from "./SliderInput.catalog";

function SliderExample() {
	const [value, setValue] = useState<number | null>(40);
	return (
		<SliderInput
			label="Volume"
			max={100}
			min={0}
			onChange={setValue}
			unit="%"
			value={value}
		/>
	);
}
const meta = {
	id: "ui-input-slider-input",
	excludeStories: ["catalogContract"],
	title: "UI/Input/Numeric/SliderInput",
	component: SliderInput,
	subcomponents: { "SliderInput.Skeleton": SliderInput.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof SliderInput>;
export default meta;
type Story = StoryObj;

export const RangeContract: Story = {
	render: () => <SliderExample />,
	play: async ({ canvas }) => {
		const range = canvas.getByRole("slider", { name: "Volume slider" });
		const number = canvas.getByRole("spinbutton", { name: "Volume" });
		await expect(range).toHaveValue("40");
		await userEvent.clear(number);
		await userEvent.type(number, "65");
		await expect(range).toHaveValue("65");
	},
};

export const SkeletonParity: Story = {
	render: () => <SliderInput.Skeleton label="Volume" />,
};
