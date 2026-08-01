import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { PasswordInput } from "./PasswordInput";
import { catalogContract } from "./PasswordInput.catalog";

const meta = {
	id: "ui-input-password-input",
	excludeStories: ["catalogContract"],
	title: "UI/Input/Text/PasswordInput",
	component: PasswordInput,
	subcomponents: { "PasswordInput.Skeleton": PasswordInput.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof PasswordInput>;
export default meta;
type Story = StoryObj;

export const PasswordContract: Story = {
	render: () => (
		<PasswordInput
			autoComplete="new-password"
			label="Create password"
			showStrength
		/>
	),
	play: async ({ canvas }) => {
		const input = canvas.getByLabelText("Create password");
		await expect(input).toHaveAttribute("type", "password");
		await userEvent.type(input, "Averlo1!");
		await expect(
			canvas.getByRole("progressbar", { name: "Password strength" }),
		).toHaveAttribute("aria-valuenow", "100");
		await userEvent.click(
			canvas.getByRole("button", { name: "Show password" }),
		);
		await expect(input).toHaveAttribute("type", "text");
		await expect(
			canvas.getByRole("button", { name: "Hide password" }),
		).toHaveAttribute("aria-pressed", "true");
	},
};

export const LoginAndSkeleton: Story = {
	render: () => (
		<div className="grid gap-4">
			<PasswordInput autoComplete="current-password" label="Password" />
			<PasswordInput.Skeleton label="Password" />
		</div>
	),
};
