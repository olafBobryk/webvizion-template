import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ComboboxTextInput } from "./ComboboxTextInput";
import { catalogContract } from "./ComboboxTextInput.catalog";

const onChange = fn();
const onSelect = fn();
const options = [
	{ id: "apple", label: "Apple" },
	{ id: "banana", label: "Banana" },
	{ id: "pear", label: "Pear" },
];
const meta = {
	id: "ui-input-combobox-text-input",
	excludeStories: ["catalogContract"],
	title: "UI/Input/Selection/ComboboxTextInput",
	component: ComboboxTextInput,
	subcomponents: { "ComboboxTextInput.Skeleton": ComboboxTextInput.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof ComboboxTextInput>;
export default meta;
type Story = StoryObj;

export const ComboboxContract: Story = {
	render: () => (
		<div className="w-80">
			<ComboboxTextInput
				label="Fruit"
				onChange={onChange}
				onSelect={onSelect}
				options={options}
				placeholder="Type a fruit"
			/>
		</div>
	),
	play: async ({ canvas, canvasElement }) => {
		onChange.mockClear();
		onSelect.mockClear();
		const input = canvas.getByRole("combobox", { name: "Fruit" });
		await userEvent.type(input, "ban");
		await expect(input).toHaveAttribute("aria-expanded", "true");
		await userEvent.click(
			await within(canvasElement.ownerDocument.body).findByRole("option", {
				name: "Banana",
			}),
		);
		await expect(input).toHaveValue("Banana");
		await expect(onSelect).toHaveBeenCalledWith(
			expect.objectContaining({ id: "banana" }),
		);
		await waitFor(() =>
			expect(
				within(canvasElement.ownerDocument.body).queryByRole("listbox"),
			).not.toBeInTheDocument(),
		);
	},
};

export const SkeletonParity: Story = {
	render: () => <ComboboxTextInput.Skeleton label="Fruit" />,
};
