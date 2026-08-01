import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { InteractionGate } from "./InteractionGate";
import { catalogContract } from "./InteractionGate.catalog";

const meta = {
	id: "ui-misc-interaction-gate",
	title: "UI/Misc/InteractionGate",
	component: InteractionGate,
	excludeStories: ["catalogContract"],
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "fullscreen",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof InteractionGate>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ActivationContract: Story = {
	args: {
		active: true,
		title: "Enable map",
		description: "The map loads third-party content.",
		actionLabel: "Enable map",
		onActivate: fn(),
	},
	parameters: { a11y: { test: "error" } },
	render: (args) => (
		<div className="relative h-80 bg-muted">
			<InteractionGate {...args} />
		</div>
	),
	play: async ({ args, canvas }) => {
		const button = canvas.getByRole("button", { name: "Enable map" });
		button.focus();
		await expect(button).toHaveFocus();
		await userEvent.click(button);
		await expect(args.onActivate).toHaveBeenCalledOnce();
	},
};
