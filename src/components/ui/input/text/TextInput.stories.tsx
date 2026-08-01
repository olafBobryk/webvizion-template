import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { TextInput } from "./TextInput";
import { catalogContract } from "./TextInput.catalog";

const onChange = fn();
const meta = {
	id: "ui-input-text-input",
	excludeStories: ["catalogContract"],
	title: "UI/Input/Text/TextInput",
	component: TextInput,
	subcomponents: { "TextInput.Skeleton": TextInput.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof TextInput>;
export default meta;
type Story = StoryObj;

export const FieldContract: Story = {
	parameters: { a11y: { test: "error" } },
	render: () => (
		<TextInput
			description="Use at least three characters."
			label="Project name"
			onChange={onChange}
			required
			validate={(value) =>
				value.length >= 3 ? null : "Enter at least three characters."
			}
		/>
	),
	play: async ({ canvas }) => {
		onChange.mockClear();
		const input = canvas.getByRole("textbox", { name: /project name/i });
		await userEvent.type(input, "A");
		await userEvent.tab();
		await expect(onChange).toHaveBeenCalledWith("A");
		await expect(input).toHaveAccessibleDescription(
			/use at least three characters.*enter at least three characters/i,
		);
		await expect(input).toHaveAttribute("aria-invalid", "true");
	},
};

export const CopyAndSkeleton: Story = {
	render: () => (
		<div className="grid gap-4">
			<TextInput
				copy
				copyToastMessage={false}
				defaultValue="averlo"
				label="Slug"
			/>
			<TextInput.Skeleton label="Slug" />
		</div>
	),
};
