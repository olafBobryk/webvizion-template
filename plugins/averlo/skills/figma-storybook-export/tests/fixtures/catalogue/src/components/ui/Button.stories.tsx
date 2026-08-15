import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

function defineCatalogOwnerContract<const Contract>(contract: Contract) {
	return contract;
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-primitives-button",
	name: "Button",
	role: "Canonical action primitive.",
	importStatement: 'import { Button } from "./Button";',
	chooseWhen: ["A shared action is needed."],
	chooseInstead: [],
	compounds: ["Button.Skeleton"],
	exclusions: [],
	guarantees: [
		{
			label: "Action hierarchy",
			storyId: "ui-primitives-button--action-hierarchy",
		},
	],
});

const meta = {
	id: "ui-primitives-button",
	title: "UI/Primitives/Button",
	component: Button,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ActionHierarchy: Story = {
	globals: { appearance: "dark" },
};
