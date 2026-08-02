import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Listbox, type ListboxOption } from "./Listbox";
import { catalogContract } from "./Listbox.catalog";
import { Text } from "./Text";

const meta = {
	id: "ui-primitives-listbox",
	excludeStories: ["catalogContract"],
	title: "UI/Primitives/Listbox",
	component: Listbox,
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "padded",
		a11y: { test: "error" },
		docs: {
			description: {
				component: formatCatalogOwnerContract(catalogContract),
			},
		},
	},
} satisfies Meta;

export default meta;
type Story = StoryObj;

const stateOptions: ListboxOption<string>[] = [
	{ value: "alpha", content: "Alpha workspace", selected: true },
	{ value: "disabled", content: "Archived workspace", disabled: true },
	{
		value: "warning",
		content: "Needs review",
		tone: "warning",
		dividerBefore: true,
	},
	{ value: "danger", content: "Remove access", tone: "danger" },
	{
		value: "presentation",
		layout: "presentation",
		content: (
			<div className="grid gap-1">
				<Text variant="bodyStrong">Presentation row</Text>
				<Text tone="muted" variant="caption">
					Allows owned multi-line content.
				</Text>
			</div>
		),
	},
];

const semanticSelect = fn();

export const SelectionAndSemanticStates: Story = {
	parameters: {
		a11y: { test: "error" },
	},
	render: () => (
		<Listbox
			ariaLabel="Workspace states"
			listTabIndex={0}
			onSelect={semanticSelect}
			options={stateOptions}
		/>
	),
	play: async ({ canvas }) => {
		semanticSelect.mockClear();
		await expect(
			canvas.getAllByRole("option").map((option) => option.textContent?.trim()),
		).toEqual([
			"Alpha workspace",
			"Archived workspace",
			"Needs review",
			"Remove access",
			"Presentation rowAllows owned multi-line content.",
		]);
		await expect(
			canvas.getByRole("option", { name: "Alpha workspace" }),
		).toHaveAttribute("aria-selected", "true");
		await expect(
			canvas.getByRole("option", { name: "Alpha workspace" }),
		).toHaveClass(
			"focus-visible:ring-inset",
			"first:focus-visible:rounded-t-md",
		);
		await expect(
			canvas.getByRole("option", { name: /Presentation row/ }),
		).toHaveClass("last:focus-visible:rounded-b-md");
		await expect(
			canvas.getByRole("option", { name: "Archived workspace" }),
		).toHaveAttribute("aria-disabled", "true");
		await expect(
			canvas.getByRole("option", { name: "Needs review" }),
		).toHaveClass("!text-warning", "!border-t");
		await expect(
			canvas.getByRole("option", { name: "Remove access" }),
		).toHaveClass("!text-danger-text");
		await userEvent.click(canvas.getByRole("option", { name: "Needs review" }));
		await expect(semanticSelect).toHaveBeenCalledWith(
			expect.objectContaining({ value: "warning" }),
			2,
			expect.anything(),
		);
	},
};

const keyboardSelect = fn();

export const KeyboardSelection: Story = {
	render: () => (
		<Listbox
			ariaLabel="Keyboard workspaces"
			listId="keyboard-listbox"
			listTabIndex={0}
			onSelect={keyboardSelect}
			options={stateOptions.slice(0, 2)}
		/>
	),
	play: async ({ canvas }) => {
		keyboardSelect.mockClear();
		const listbox = canvas.getByRole("listbox");
		listbox.focus();
		await userEvent.keyboard("{ArrowDown}{Enter}");
		await expect(keyboardSelect).toHaveBeenCalledWith(
			expect.objectContaining({ value: "alpha" }),
			0,
			expect.anything(),
		);
	},
};

const pointerActiveChange = fn();

export const PointerAndKeyboardOwnership: Story = {
	render: () => (
		<Listbox
			ariaLabel="Pointer and keyboard workspaces"
			listTabIndex={0}
			onActiveIndexChange={pointerActiveChange}
			options={stateOptions.slice(0, 2)}
		/>
	),
	play: async ({ canvas }) => {
		pointerActiveChange.mockClear();
		const listbox = canvas.getByRole("listbox");
		const selected = canvas.getByRole("option", { name: "Alpha workspace" });

		await userEvent.hover(selected);
		await waitFor(() =>
			expect(pointerActiveChange).toHaveBeenLastCalledWith(0),
		);
		await userEvent.unhover(selected);
		await waitFor(() =>
			expect(pointerActiveChange).toHaveBeenLastCalledWith(-1),
		);

		pointerActiveChange.mockClear();
		listbox.focus();
		await userEvent.keyboard("{ArrowDown}");
		await expect(pointerActiveChange).toHaveBeenLastCalledWith(0);
		await userEvent.unhover(listbox);
		await expect(pointerActiveChange).not.toHaveBeenCalledWith(-1);
	},
};

const recursiveOptions: ListboxOption<string>[] = [
	{
		value: "share",
		content: "Share",
		children: [
			{ value: "copy-link", content: "Copy link" },
			{ value: "invite", content: "Invite member" },
		],
	},
	{ value: "duplicate", content: "Duplicate" },
];

export const RecursiveKeyboardNavigation: Story = {
	render: () => (
		<Listbox
			ariaLabel="Share destinations"
			listId="recursive-listbox"
			listTabIndex={0}
			options={recursiveOptions}
		/>
	),
	play: async ({ canvas, canvasElement }) => {
		const root = canvas.getByRole("listbox");
		root.focus();
		await userEvent.keyboard("{ArrowDown}{ArrowRight}");
		const body = within(canvasElement.ownerDocument.body);
		await waitFor(() => expect(body.getAllByRole("listbox")).toHaveLength(2));
		await waitFor(() => expect(body.getByText("Copy link")).toBeVisible());
		await userEvent.keyboard("{Escape}");
		await waitFor(() => expect(body.getAllByRole("listbox")).toHaveLength(1));
	},
};
