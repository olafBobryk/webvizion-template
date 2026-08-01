import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { SelectInput } from "./SelectInput";
import { catalogContract } from "./SelectInput.catalog";

const options = [
	{ value: "draft", label: "Draft" },
	{ value: "published", label: "Published" },
	{ value: "archived", label: "Archived", disabled: true },
];
function SelectExample() {
	const [value, setValue] = useState<string | null>(null);
	return (
		<div className="w-80">
			<SelectInput
				description="Choose the public state."
				label="Status"
				onChange={setValue}
				options={options}
				value={value}
			/>
		</div>
	);
}

const presentationOptions = [
	{
		dropdownContent: (
			<span className="grid gap-0.5 text-foreground">
				<span>Ada Lovelace</span>
				<span>ada@example.com</span>
			</span>
		),
		label: "Ada Lovelace",
		searchText: "Ada Lovelace ada@example.com",
		value: "ada",
	},
	{
		dropdownContent: (
			<span className="grid gap-0.5 text-foreground">
				<span>Grace Hopper</span>
				<span>grace@example.com</span>
			</span>
		),
		label: "Grace Hopper",
		searchText: "Grace Hopper grace@example.com",
		value: "grace",
	},
];

function PresentationSelectExample() {
	const [value, setValue] = useState<string | null>("ada");
	return (
		<div className="w-80">
			<SelectInput
				label="Member"
				onChange={setValue}
				options={presentationOptions}
				value={value}
			/>
		</div>
	);
}
const meta = {
	id: "ui-input-select-input",
	excludeStories: ["catalogContract"],
	title: "UI/Input/Selection/SelectInput",
	component: SelectInput,
	subcomponents: { "SelectInput.Skeleton": SelectInput.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof SelectInput>;
export default meta;
type Story = StoryObj;

export const SelectionContract: Story = {
	// Keep the known dark-mode option contrast finding visible without allowing it
	// to mask the strict selection, ARIA, and interaction assertions below.
	parameters: { a11y: { test: "error" } },
	render: () => <SelectExample />,
	play: async ({ canvas, canvasElement }) => {
		const input = canvas.getByRole("combobox", { name: "Status" });
		await userEvent.click(input);
		const body = within(canvasElement.ownerDocument.body);
		await userEvent.click(
			await body.findByRole("option", { name: "Published" }),
		);
		await expect(input).toHaveValue("Published");
		await expect(input).toHaveAccessibleDescription("Choose the public state.");
		await expect(input).toHaveAttribute("aria-expanded", "false");
	},
};

export const PresentationOptionContract: Story = {
	render: () => <PresentationSelectExample />,
	play: async ({ canvas, canvasElement }) => {
		const input = canvas.getByRole("combobox", { name: "Member" });
		await expect(input).toHaveValue("Ada Lovelace");
		await expect(canvas.queryByText("ada@example.com")).not.toBeInTheDocument();

		await userEvent.click(input);
		const body = within(canvasElement.ownerDocument.body);
		const ada = await body.findByRole("option", { name: /Ada Lovelace/ });
		await expect(ada).toHaveClass("!h-auto", "!min-h-16");
		await expect(ada).toHaveTextContent("ada@example.com");
		await userEvent.click(
			await body.findByRole("option", { name: /Grace Hopper/ }),
		);
		await expect(input).toHaveValue("Grace Hopper");
		await waitFor(() =>
			expect(
				body.queryByRole("option", { name: /Grace Hopper/ }),
			).not.toBeInTheDocument(),
		);
	},
};

export const SkeletonParity: Story = {
	render: () => <SelectInput.Skeleton label="Status" />,
};
