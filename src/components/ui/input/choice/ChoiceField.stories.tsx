import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ChoiceField } from "./ChoiceField";
import { catalogContract } from "./ChoiceField.catalog";
import { ChoiceIndicatorMulti } from "./ChoiceIndicators";

function ChoiceFieldExample() {
	const [checked, setChecked] = useState(false);
	return (
		<ChoiceField
			checked={checked}
			description="Receive release notes by email."
			id="choice-field-updates"
			indicator={<ChoiceIndicatorMulti checked={checked} />}
			inputType="checkbox"
			label="Product updates"
			onChange={(_, nextChecked) => setChecked(nextChecked)}
			value="updates"
		/>
	);
}

const meta = {
	id: "ui-input-choice-field",
	excludeStories: ["catalogContract"],
	title: "UI/Input/Choice/ChoiceField",
	component: ChoiceField,
	subcomponents: { "ChoiceField.Skeleton": ChoiceField.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof ChoiceField>;

export default meta;
type Story = StoryObj;

export const InteractionContract: Story = {
	render: () => <ChoiceFieldExample />,
	play: async ({ canvas }) => {
		const input = canvas.getByRole("checkbox", { name: /product updates/i });
		await expect(input).not.toBeChecked();
		await userEvent.click(canvas.getByText("Product updates"));
		await expect(input).toBeChecked();
		input.focus();
		await expect(input).toHaveFocus();
	},
};

export const SkeletonParity: Story = {
	render: () => (
		<ChoiceField.Skeleton
			description="Receive release notes by email."
			indicator="checkbox"
			label="Product updates"
		/>
	),
};
