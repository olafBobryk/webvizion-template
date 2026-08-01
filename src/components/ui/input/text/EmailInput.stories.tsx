import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { EmailInput } from "./EmailInput";
import { catalogContract } from "./EmailInput.catalog";

const onChange = fn();
const meta = {
	id: "ui-input-email-input",
	excludeStories: ["catalogContract"],
	title: "UI/Input/Text/EmailInput",
	component: EmailInput,
	subcomponents: { "EmailInput.Skeleton": EmailInput.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof EmailInput>;
export default meta;
type Story = StoryObj;

export const EmailContract: Story = {
	parameters: { a11y: { test: "error" } },
	render: () => (
		<EmailInput
			label="Work email"
			onChange={onChange}
			validate={(value) =>
				value.includes("@") ? null : "Enter a valid email."
			}
		/>
	),
	play: async ({ canvas }) => {
		onChange.mockClear();
		const input = canvas.getByRole("textbox", { name: "Work email" });
		await expect(input).toHaveAttribute("type", "email");
		await expect(input).toHaveAttribute("inputmode", "email");
		await userEvent.type(input, "hello");
		await userEvent.tab();
		await expect(canvas.getByRole("alert")).toHaveTextContent(
			"Enter a valid email.",
		);
	},
};

export const SkeletonParity: Story = {
	render: () => <EmailInput.Skeleton label="Work email" />,
};
