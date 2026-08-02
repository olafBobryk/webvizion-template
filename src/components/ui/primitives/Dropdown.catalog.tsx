"use client";

import { useRef, useState } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Button } from "./Button";
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
const editProject = () => undefined;
const archiveProject = () => undefined;
const removeMemberAccess = () => undefined;
const factorySelection = () => undefined;
const chooseWorkspace = () => undefined;
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
function ContextualDestructiveActionPreview() {
	return (
		<div className="flex max-w-xl items-center justify-between rounded-xl border border-border bg-card p-4">
			<div className="grid gap-0.5">
				<strong>Avery Chen</strong>
				<span className="text-sm text-muted-foreground">
					Admin · Access active
				</span>
			</div>
			<Dropdown.Menu
				ariaLabel="Manage Avery Chen"
				openOnHover={false}
				options={[
					{ id: "view", label: "View member" },
					{
						id: "remove",
						label: "Remove access",
						onSelect: removeMemberAccess,
						tone: "danger",
					},
				]}
			/>
		</div>
	);
}
function CatalogPreview1() {
	const render = () => (
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
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview2() {
	const render = () => (
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
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview3() {
	const render = () => (
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
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview4() {
	const render = () => <ControlledPanelExample />;
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview5() {
	const render = () => (
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
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview6() {
	const render = () => (
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
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-primitives-dropdown",
	name: "Dropdown",
	role: "Portal-backed trigger-plus-surface family for actions, selection, and independently controlled anchored content.",
	importStatement:
		'import { Dropdown } from "@/components/ui/primitives/dropdown";',
	chooseWhen: [
		"A menu, selectable list, specialized editable trigger, or controlled anchored panel needs shared positioning and dismissal.",
		"A destructive action is contextual rather than the primary goal of the entire page; keep it inside the More menu and order it last.",
	],
	chooseInstead: [
		"Use a finished SelectInput or combobox for ordinary form selection, and a shared modal for focused blocking content.",
	],
	compounds: ["Dropdown.Menu", "Dropdown.Listbox", "Dropdown.Panel"],
	exclusions: [
		"DropdownSurface, root/collection/controller/positioning internals, and raw surface modules as public imports.",
		"Page-local portal, dismissal, or recursive-cascade implementations.",
	],
	guarantees: [
		{
			label: "Contextual destructive action stays in the More menu",
			storyId: "ui-primitives-dropdown--contextual-destructive-action",
		},
		{
			label: "Menu ordering, selection, and dismissal",
			storyId: "ui-primitives-dropdown--menu-ordering-selection-and-dismissal",
		},
		{
			label: "Menu factories, semantic ordering, and composition",
			storyId:
				"ui-primitives-dropdown--menu-factories-semantic-ordering-and-composition",
		},
		{
			label: "Selectable listbox",
			storyId: "ui-primitives-dropdown--selectable-listbox",
		},
		{
			label: "Independently controlled panel",
			storyId: "ui-primitives-dropdown--independently-controlled-panel",
		},
		{
			label: "Recursive portal cascade focus and dismissal",
			storyId: "ui-primitives-dropdown--recursive-menu",
		},
		{
			label: "Recursive pointer and disabled-branch ownership",
			storyId: "ui-primitives-dropdown--recursive-pointer-ownership",
		},
	],

	family: "UI",
	group: "Primitives",
	sweepSpan: "full",
	previewTargets: [
		{
			id: "contextual-destructive-action",
			name: "Contextual destructive action",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: ContextualDestructiveActionPreview,
		},
		{
			id: "menu-ordering-selection-and-dismissal",
			name: "Menu ordering, selection, and dismissal",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "menu-factories-semantic-ordering-and-composition",
			name: "Menu factories, semantic ordering, and composition",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
		{
			id: "selectable-listbox",
			name: "Selectable listbox",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview3,
		},
		{
			id: "independently-controlled-panel",
			name: "Independently controlled panel",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview4,
		},
		{
			id: "recursive-menu",
			name: "Recursive portal cascade focus and dismissal",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview5,
		},
		{
			id: "recursive-pointer-ownership",
			name: "Recursive pointer and disabled-branch ownership",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview6,
		},
	],
});
