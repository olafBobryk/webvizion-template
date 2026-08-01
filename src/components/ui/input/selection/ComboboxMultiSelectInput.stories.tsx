import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ComboboxMultiSelectInput } from "./ComboboxMultiSelectInput";
import { catalogContract } from "./ComboboxMultiSelectInput.catalog";

const options = [
	{ value: "amsterdam", label: "Amsterdam" },
	{ value: "berlin", label: "Berlin" },
	{ value: "copenhagen", label: "Copenhagen" },
];
function ComboboxExample() {
	const [value, setValue] = useState<string[]>(["amsterdam"]);
	return (
		<div className="w-96">
			<ComboboxMultiSelectInput
				label="Offices"
				onChange={setValue}
				options={options}
				placeholder="Search offices"
				value={value}
			/>
		</div>
	);
}
const meta = {
	id: "ui-input-combobox-multi-select-input",
	excludeStories: ["catalogContract"],
	title: "UI/Input/Selection/ComboboxMultiSelectInput",
	component: ComboboxMultiSelectInput,
	subcomponents: {
		"ComboboxMultiSelectInput.Skeleton": ComboboxMultiSelectInput.Skeleton,
	},
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof ComboboxMultiSelectInput>;
export default meta;
type Story = StoryObj;

export const ComboboxContract: Story = {
	render: () => <ComboboxExample />,
	play: async ({ canvas, canvasElement }) => {
		const input = canvas.getByRole("combobox", { name: "Offices" });
		await userEvent.click(input);
		await userEvent.type(input, "ber");
		const body = within(canvasElement.ownerDocument.body);
		await userEvent.click(await body.findByRole("option", { name: /Berlin/i }));
		await expect(canvas.getByText("Berlin")).toBeVisible();
		await userEvent.click(
			canvas.getByRole("button", { name: /remove berlin/i }),
		);
		await waitFor(() =>
			expect(
				canvas.queryByRole("button", { name: /remove berlin/i }),
			).not.toBeInTheDocument(),
		);
		await userEvent.keyboard("{Escape}");
		await waitFor(() =>
			expect(body.queryByRole("listbox")).not.toBeInTheDocument(),
		);
	},
};

export const SkeletonParity: Story = {
	render: () => <ComboboxMultiSelectInput.Skeleton label="Offices" />,
};
