import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { EditableTextField } from "./EditableTextField";
import { catalogContract } from "./EditableTextField.catalog";

const onSave = fn(async () => {});
const meta = {
	id: "ui-input-editable-text-field",
	excludeStories: ["catalogContract"],
	title: "UI/Input/Editable/EditableTextField",
	component: EditableTextField,
	subcomponents: { "EditableTextField.Skeleton": EditableTextField.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof EditableTextField>;
export default meta;
type Story = StoryObj;

export const EditingContract: Story = {
	render: () => (
		<div className="w-80">
			<EditableTextField
				label="Project name"
				onSave={onSave}
				required
				value="Averlo"
			/>
		</div>
	),
	play: async ({ canvas }) => {
		onSave.mockClear();
		const edit = canvas.getByRole("button", { name: "Edit Project name" });
		await userEvent.click(edit);
		const input = canvas.getByRole("textbox", { name: "Project name" });
		await waitFor(() => expect(input).toHaveFocus());
		await userEvent.clear(input);
		await userEvent.type(input, "Averlo Studio{Enter}");
		await expect(onSave).toHaveBeenCalledWith("Averlo Studio");
		await waitFor(() =>
			expect(
				canvas.getByRole("button", { name: "Edit Project name" }),
			).toHaveFocus(),
		);
	},
};

export const PresentationsAndSkeletons: Story = {
	render: () => (
		<div className="grid w-80 gap-4">
			<EditableTextField label="Project name" onSave={onSave} value="Averlo" />
			<EditableTextField
				ariaLabel="Edit title"
				onSave={onSave}
				presentation="inline"
				value="Inline title"
			/>
			<EditableTextField.Skeleton label="Project name" value="Averlo" />
		</div>
	),
};
