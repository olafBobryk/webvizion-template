"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Listbox, type ListboxOption } from "./Listbox";
import { Text } from "./Text";

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
const semanticSelect = () => undefined;
const keyboardSelect = () => undefined;
const pointerActiveChange = () => undefined;
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
function CatalogPreview1() {
	const render = () => (
		<Listbox
			ariaLabel="Workspace states"
			listTabIndex={0}
			onSelect={semanticSelect}
			options={stateOptions}
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
		<Listbox
			ariaLabel="Keyboard workspaces"
			listId="keyboard-listbox"
			listTabIndex={0}
			onSelect={keyboardSelect}
			options={stateOptions.slice(0, 2)}
		/>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview3() {
	const render = () => (
		<Listbox
			ariaLabel="Pointer and keyboard workspaces"
			listTabIndex={0}
			onActiveIndexChange={pointerActiveChange}
			options={stateOptions.slice(0, 2)}
		/>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview4() {
	const render = () => (
		<Listbox
			ariaLabel="Share destinations"
			listId="recursive-listbox"
			listTabIndex={0}
			options={recursiveOptions}
		/>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-primitives-listbox",
	name: "Listbox",
	role: "Accessible option-list owner for active, selected, disabled, semantic, and recursive behavior.",
	importStatement:
		'import { Listbox } from "@/components/ui/primitives/Listbox";',
	chooseWhen: [
		"An owned option list needs selection semantics, keyboard navigation, semantic rows, or recursive cascades.",
	],
	chooseInstead: [
		"Use Dropdown.Listbox when the list also needs a trigger and positioned portal surface.",
	],
	compounds: [],
	exclusions: [
		"Caller-owned row geometry, hover transitions, or page-local keyboard state.",
		"Treating active and selected state as the same contract.",
	],
	guarantees: [
		{
			label: "Selection and semantic states",
			storyId: "ui-primitives-listbox--selection-and-semantic-states",
		},
		{
			label: "Keyboard selection",
			storyId: "ui-primitives-listbox--keyboard-selection",
		},
		{
			label: "Pointer and keyboard ownership",
			storyId: "ui-primitives-listbox--pointer-and-keyboard-ownership",
		},
		{
			label: "Recursive keyboard navigation",
			storyId: "ui-primitives-listbox--recursive-keyboard-navigation",
		},
	],

	family: "UI",
	group: "Primitives",
	previewTargets: [
		{
			id: "selection-and-semantic-states",
			name: "Selection and semantic states",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "keyboard-selection",
			name: "Keyboard selection",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
		{
			id: "pointer-and-keyboard-ownership",
			name: "Pointer and keyboard ownership",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview3,
		},
		{
			id: "recursive-keyboard-navigation",
			name: "Recursive keyboard navigation",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview4,
		},
	],
});
