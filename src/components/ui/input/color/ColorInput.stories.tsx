import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ColorInput } from "./ColorInput";
import { catalogContract } from "./ColorInput.catalog";

const onChange = fn();
const meta = {
	id: "ui-input-color-input",
	excludeStories: ["catalogContract"],
	title: "UI/Input/Color/ColorInput",
	component: ColorInput,
	subcomponents: { "ColorInput.Skeleton": ColorInput.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof ColorInput>;
export default meta;
type Story = StoryObj;

export const PickerContract: Story = {
	render: () => (
		<ColorInput
			defaultValue="#3567EA"
			description="Choose a brand accent."
			label="Accent color"
			name="accent"
			onChange={onChange}
		/>
	),
	play: async ({ canvas, canvasElement }) => {
		const trigger = canvas.getByRole("button", { name: "Accent color" });
		await expect(trigger).toHaveAttribute("aria-expanded", "false");
		await userEvent.click(trigger);
		await expect(trigger).toHaveAttribute("aria-expanded", "true");
		await expect(
			await within(canvasElement.ownerDocument.body).findByRole("button", {
				name: "Choose accent color",
			}),
		).toBeInTheDocument();
		await userEvent.keyboard("{Escape}");
		await waitFor(() =>
			expect(trigger).toHaveAttribute("aria-expanded", "false"),
		);
		await expect(
			canvasElement.querySelector('input[name="accent"]'),
		).toHaveValue("#3567EA");
	},
};

export const SkeletonParity: Story = {
	render: () => <ColorInput.Skeleton label="Accent color" />,
};
