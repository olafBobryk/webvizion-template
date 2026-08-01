import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ModalStepIndicator, StepIndicator } from "./StepIndicator";
import { catalogContract } from "./StepIndicator.catalog";

const steps = [
	{ id: "details", label: "Details" },
	{ id: "review", label: "Review" },
	{ id: "publish", label: "Publish", disabled: true },
] as const;
const meta = {
	id: "ui-misc-step-indicator",
	title: "UI/Misc/StepIndicator",
	component: StepIndicator,
	subcomponents: { ModalStepIndicator },
	excludeStories: ["catalogContract", "steps"],
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
	args: { currentStep: "review", steps, onStepChange: fn() },
} satisfies Meta<typeof StepIndicator>;
export default meta;
type Story = StoryObj<typeof meta>;
export const StepContract: Story = {
	parameters: { a11y: { test: "error" } },
	play: async ({ args, canvas }) => {
		await expect(
			canvas.getByRole("button", { name: "Review" }),
		).toHaveAttribute("aria-current", "step");
		await expect(
			canvas.getByRole("button", { name: "Publish" }),
		).toBeDisabled();
		await userEvent.click(canvas.getByRole("button", { name: "Details" }));
		await expect(args.onStepChange).toHaveBeenCalledWith("details");
	},
};
export const ModalComposition: Story = {
	render: () => (
		<ModalStepIndicator
			aria-label="Account setup"
			currentStep="details"
			onStepChange={fn()}
			steps={steps}
		/>
	),
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("navigation", { name: "Account setup" }),
		).toHaveClass("border-b");
	},
};
