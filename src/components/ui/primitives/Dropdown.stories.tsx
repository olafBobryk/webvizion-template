import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useRef, useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Button } from "./Button";
import { catalogContract } from "./Dropdown.catalog";
import {
	Dropdown,
	type DropdownListboxProps,
	type DropdownMenuProps,
	type DropdownSurfaceProps,
} from "./dropdown";

function DropdownMenuContract(props: DropdownMenuProps) {
	return <Dropdown.Menu {...props} />;
}
DropdownMenuContract.displayName = "Dropdown.Menu";

function DropdownListboxContract(props: DropdownListboxProps<string>) {
	return <Dropdown.Listbox {...props} />;
}
DropdownListboxContract.displayName = "Dropdown.Listbox";

function DropdownPanelContract(props: DropdownSurfaceProps) {
	return <Dropdown.Panel {...props} />;
}
DropdownPanelContract.displayName = "Dropdown.Panel";

const meta = {
	id: "ui-primitives-dropdown",
	excludeStories: ["catalogContract"],
	title: "UI/Primitives/Dropdown",
	component: Dropdown,
	subcomponents: {
		"Dropdown.Menu": DropdownMenuContract,
		"Dropdown.Listbox": DropdownListboxContract,
		"Dropdown.Panel": DropdownPanelContract,
	},
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

const editProject = fn();
const archiveProject = fn();

export const MenuOrderingSelectionAndDismissal: Story = {
	render: () => (
		<Dropdown.Menu
			ariaLabel="Project actions"
			openOnHover={false}
			options={[
				{ id: "edit", label: "Edit", onSelect: editProject },
				{ id: "details", label: "Details", disabled: true },
				{
					id: "warning",
					label: "Archive",
					tone: "warning",
					onSelect: archiveProject,
				},
				Dropdown.menuOptions.delete({ label: "Delete project" }),
			]}
		/>
	),
	play: async ({ canvas, canvasElement }) => {
		editProject.mockClear();
		const trigger = canvas.getByRole("button", { name: "Project actions" });
		await userEvent.click(trigger);
		const menu = await canvas.findByRole("menu", { name: "Project actions" });
		await waitFor(() => expect(menu).toBeVisible());
		const body = within(canvasElement.ownerDocument.body);
		await expect(
			body.getAllByRole("menuitem").map((item) => item.textContent?.trim()),
		).toEqual(["Edit", "Details", "Archive", "Delete project"]);
		await expect(menu.closest(".absolute")).not.toBeNull();
		await userEvent.keyboard("{Escape}");
		await waitFor(() =>
			expect(
				canvas.queryByRole("menu", { name: "Project actions" }),
			).not.toBeInTheDocument(),
		);
		await expect(trigger).toHaveFocus();
		await userEvent.click(trigger);
		await userEvent.click(
			await canvas.findByRole("menuitem", { name: "Edit" }),
		);
		await expect(editProject).toHaveBeenCalledOnce();
		await waitFor(() =>
			expect(
				canvas.queryByRole("menu", { name: "Project actions" }),
			).not.toBeInTheDocument(),
		);
	},
};

const factorySelection = fn();

export const MenuFactoriesSemanticOrderingAndComposition: Story = {
	render: () => (
		<div id="dropdown-menu-contract-target">
			<Dropdown.Menu
				ariaLabel="Factory actions"
				openOnHover={false}
				options={[
					{
						id: "default",
						label: "Default action",
						onSelect: factorySelection,
					},
					Dropdown.menuOptions.open({
						href: "#dropdown-menu-contract-target",
					}),
					Dropdown.menuOptions.edit({
						disabled: true,
						onSelect: factorySelection,
					}),
					{
						id: "presentation",
						label: (
							<span className="grid gap-0.5">
								<strong>Presentation layout</strong>
								<small>Multi-line React node label</small>
							</span>
						),
						layout: "presentation",
						leadingIcon: <span aria-hidden>←</span>,
						trailingIcon: <span aria-hidden>→</span>,
						className: "font-medium",
						textClassName: "uppercase",
						onSelect: factorySelection,
					},
					Dropdown.menuOptions.warning({
						label: "Review action",
						onSelect: factorySelection,
					}),
					Dropdown.menuOptions.delete({
						label: "Delete permanently",
						onSelect: factorySelection,
					}),
				]}
			/>
		</div>
	),
	play: async ({ canvas, canvasElement }) => {
		factorySelection.mockClear();
		await userEvent.click(
			canvas.getByRole("button", { name: "Factory actions" }),
		);
		const body = within(canvasElement.ownerDocument.body);
		const items = await body.findAllByRole("menuitem");
		await expect(items.map((item) => item.textContent?.trim())).toEqual([
			"Default action",
			"Open",
			"Edit",
			"←Presentation layoutMulti-line React node label→",
			"Review action",
			"Delete permanently",
		]);
		await expect(body.getByRole("menuitem", { name: "Open" })).toHaveAttribute(
			"href",
			"#dropdown-menu-contract-target",
		);
		await expect(body.getByRole("menuitem", { name: "Edit" })).toHaveAttribute(
			"aria-disabled",
			"true",
		);
		await expect(
			body.getByRole("menuitem", { name: /Presentation layout/ }),
		).toHaveClass("font-medium");
		await expect(
			body.getByRole("menuitem", { name: "Review action" }),
		).toHaveClass("!text-warning", "!border-t");
		await expect(
			body.getByRole("menuitem", { name: "Delete permanently" }),
		).toHaveClass("!text-danger-text");
		await userEvent.click(body.getByRole("menuitem", { name: "Edit" }));
		await expect(
			body.getByRole("menu", { name: "Factory actions" }),
		).toBeVisible();
		await userEvent.click(
			body.getByRole("menuitem", { name: "Review action" }),
		);
		await expect(factorySelection).toHaveBeenCalledOnce();
		await waitFor(() =>
			expect(
				body.queryByRole("menu", { name: "Factory actions" }),
			).not.toBeInTheDocument(),
		);
	},
};

const chooseWorkspace = fn();

export const SelectableListbox: Story = {
	render: () => (
		<Dropdown.Listbox
			ariaLabel="Workspace"
			onSelect={chooseWorkspace}
			openOnHover={false}
			options={[
				{ value: "personal", content: "Personal", selected: true },
				{ value: "studio", content: "Studio" },
				{ value: "archive", content: "Archive", disabled: true },
			]}
			triggerContent="Choose workspace"
		/>
	),
	play: async ({ canvas }) => {
		chooseWorkspace.mockClear();
		await userEvent.click(canvas.getByRole("button", { name: "Workspace" }));
		const listbox = await canvas.findByRole("listbox", { name: "Workspace" });
		const studio = await canvas.findByRole("option", { name: "Studio" });
		await expect(listbox).not.toHaveAttribute("aria-activedescendant");
		await userEvent.hover(studio);
		await waitFor(() =>
			expect(listbox).toHaveAttribute("aria-activedescendant", studio.id),
		);
		await userEvent.click(studio);
		await expect(chooseWorkspace).toHaveBeenCalledWith(
			"studio",
			expect.objectContaining({ value: "studio" }),
			expect.anything(),
		);
		await waitFor(() =>
			expect(
				canvas.queryByRole("listbox", { name: "Workspace" }),
			).not.toBeInTheDocument(),
		);
	},
};

function ControlledPanelExample() {
	const [open, setOpen] = useState(false);
	const anchorRef = useRef<HTMLElement | null>(null);
	return (
		<div className="relative min-h-64">
			<Button ref={anchorRef} onClick={() => setOpen(true)}>
				Choose color
			</Button>
			{open ? (
				<Dropdown.Panel
					anchorRef={anchorRef}
					aria-label="Color picker"
					padding="sm"
					positionStrategy="fixed"
					role="dialog"
				>
					<div className="grid gap-3">
						<fieldset className="flex gap-2">
							<legend className="sr-only">Available colors</legend>
							<Button aria-label="Blue" size="icon-sm">
								<span aria-hidden className="size-4 rounded-full bg-primary" />
							</Button>
							<Button aria-label="Red" size="icon-sm">
								<span aria-hidden className="size-4 rounded-full bg-danger" />
							</Button>
						</fieldset>
						<Button size="sm" onClick={() => setOpen(false)}>
							Close picker
						</Button>
					</div>
				</Dropdown.Panel>
			) : null}
		</div>
	);
}

export const IndependentlyControlledPanel: Story = {
	render: () => <ControlledPanelExample />,
	play: async ({ canvas, canvasElement }) => {
		await userEvent.click(canvas.getByRole("button", { name: "Choose color" }));
		const body = within(canvasElement.ownerDocument.body);
		const panel = await body.findByRole("dialog", { name: "Color picker" });
		await waitFor(() => expect(panel).toBeVisible());
		await userEvent.click(body.getByRole("button", { name: "Close picker" }));
		await waitFor(() =>
			expect(
				body.queryByRole("dialog", { name: "Color picker" }),
			).not.toBeInTheDocument(),
		);
	},
};

export const RecursiveMenu: Story = {
	render: () => (
		<Dropdown.Menu
			ariaLabel="Share actions"
			openOnHover={false}
			options={[
				{
					id: "share",
					label: "Share",
					children: [
						{
							id: "copy-link",
							label: "Copy link",
							children: [
								{ id: "public-link", label: "Public link" },
								{ id: "restricted-link", label: "Restricted link" },
							],
						},
						{ id: "invite", label: "Invite member" },
					],
				},
				{
					id: "disabled-branch",
					label: "Disabled branch",
					disabled: true,
					children: [{ id: "hidden-child", label: "Hidden child" }],
				},
				{ id: "duplicate", label: "Duplicate" },
			]}
		/>
	),
	play: async ({ canvas, canvasElement }) => {
		const trigger = canvas.getByRole("button", { name: "Share actions" });
		await userEvent.click(trigger);
		const body = within(canvasElement.ownerDocument.body);
		const rootMenu = await body.findByRole("menu", { name: "Share actions" });
		await expect(rootMenu.closest(".fixed")).not.toBeNull();
		rootMenu.focus();
		await userEvent.keyboard("{ArrowDown}{ArrowRight}");
		await waitFor(() => expect(body.getAllByRole("menu")).toHaveLength(2));
		await waitFor(() => expect(body.getByText("Copy link")).toBeVisible());
		await userEvent.keyboard("{ArrowRight}");
		await waitFor(() => expect(body.getAllByRole("menu")).toHaveLength(3));
		await waitFor(() => expect(body.getByText("Public link")).toBeVisible());
		await userEvent.keyboard("{Escape}");
		await waitFor(() => expect(body.getAllByRole("menu")).toHaveLength(2));
		await waitFor(() => expect(body.getAllByRole("menu")[1]).toHaveFocus());
		await userEvent.keyboard("{ArrowLeft}");
		await waitFor(() => expect(body.getAllByRole("menu")).toHaveLength(1));
		await waitFor(() => expect(rootMenu).toHaveFocus());
		await userEvent.keyboard("{Escape}");
		await waitFor(() =>
			expect(
				body.queryByRole("menu", { name: "Share actions" }),
			).not.toBeInTheDocument(),
		);
		await expect(trigger).toHaveFocus();
	},
};

export const RecursivePointerOwnership: Story = {
	parameters: { a11y: { test: "error" } },
	render: () => (
		<Dropdown.Menu
			ariaLabel="Pointer cascade"
			openOnHover={false}
			options={[
				{
					id: "projects",
					label: "Projects",
					children: [
						{
							id: "recent",
							label: "Recent",
							children: [{ id: "apollo", label: "Apollo" }],
						},
					],
				},
				{
					id: "disabled",
					label: "Disabled branch",
					disabled: true,
					children: [{ id: "never", label: "Never opens" }],
				},
				{ id: "other", label: "Other action" },
			]}
		/>
	),
	play: async ({ canvas, canvasElement }) => {
		await userEvent.click(
			canvas.getByRole("button", { name: "Pointer cascade" }),
		);
		const body = within(canvasElement.ownerDocument.body);
		const projects = await body.findByRole("menuitem", { name: "Projects" });
		await expect(projects).toHaveAttribute("aria-haspopup", "menu");
		await expect(projects).toHaveAttribute("aria-expanded", "false");
		await userEvent.hover(projects);
		await waitFor(() => expect(body.getAllByRole("menu")).toHaveLength(2));
		await userEvent.hover(body.getByRole("menuitem", { name: "Recent" }));
		await waitFor(() => expect(body.getAllByRole("menu")).toHaveLength(3));
		await userEvent.hover(body.getByRole("menuitem", { name: "Other action" }));
		await waitFor(() => expect(body.getAllByRole("menu")).toHaveLength(1));
		const disabled = body.getByRole("menuitem", { name: "Disabled branch" });
		await expect(disabled).toHaveAttribute("aria-disabled", "true");
		await userEvent.hover(disabled);
		await waitFor(() => expect(body.getAllByRole("menu")).toHaveLength(1));
		await userEvent.keyboard("{Escape}");
		await expect(
			canvas.getByRole("button", { name: "Pointer cascade" }),
		).toHaveFocus();
	},
};
