import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { TextAreaInput } from "./TextAreaInput";
import { catalogContract } from "./TextAreaInput.catalog";

const onChange = fn();
const meta = {
	id: "ui-input-text-area-input",
	excludeStories: ["catalogContract"],
	title: "UI/Input/Text/TextAreaInput",
	component: TextAreaInput,
	subcomponents: { "TextAreaInput.Skeleton": TextAreaInput.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof TextAreaInput>;
export default meta;
type Story = StoryObj;

export const TextareaContract: Story = {
	parameters: { a11y: { test: "error" } },
	render: () => (
		<div className="w-96">
			<TextAreaInput
				description="At least ten characters."
				label="Summary"
				onChange={onChange}
				validate={(value) => (value.length >= 10 ? null : "Add more detail.")}
			/>
		</div>
	),
	play: async ({ canvas }) => {
		onChange.mockClear();
		const input = canvas.getByRole("textbox", { name: "Summary" });
		await userEvent.type(input, "Short");
		await userEvent.tab();
		await expect(onChange).toHaveBeenLastCalledWith("Short");
		await expect(canvas.getByRole("alert")).toHaveTextContent(
			"Add more detail.",
		);
	},
};

export const SizesAndSkeleton: Story = {
	render: () => (
		<div className="grid w-96 gap-4">
			<TextAreaInput label="Summary" size="lg" />
			<TextAreaInput.Skeleton label="Summary" />
		</div>
	),
};
