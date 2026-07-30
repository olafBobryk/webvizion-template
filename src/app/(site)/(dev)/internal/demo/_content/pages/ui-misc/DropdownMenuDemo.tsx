"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icons/Icon";
import { Dropdown } from "@/components/ui/primitives/dropdown";
import { Text } from "@/components/ui/primitives/Text";

export function DropdownMenuDemo() {
	const [selectedAction, setSelectedAction] = useState("None");
	const selectAction = (label: string) => () => setSelectedAction(label);
	const recursiveOptions = [
		{
			id: "projects",
			label: "Projects",
			onSelect: selectAction("Projects branch"),
			children: [
				{
					id: "recent",
					label: "Recent",
					onSelect: selectAction("Recent branch"),
					children: [
						{
							id: "apollo",
							label: "Apollo",
							onSelect: selectAction("Apollo"),
						},
						{
							id: "borealis",
							label: "Borealis",
							onSelect: selectAction("Borealis"),
						},
					],
				},
				{
					id: "templates",
					label: "Templates",
					onSelect: selectAction("Templates"),
				},
			],
		},
		{
			id: "helper-factories",
			label: "Helper factories",
			onSelect: selectAction("Helper factories branch"),
			children: [
				{
					...Dropdown.menuOptions.open({
						href: "#dropdown-menu-contract-target",
					}),
					id: "helper-open-default",
					label: "Open — default icon",
				},
				{
					...Dropdown.menuOptions.open({
						href: "/internal/demo",
						leadingIcon: <Icon name="arrow-right" size="sm" />,
					}),
					id: "helper-open-custom-icon",
					label: "Open — custom icon",
				},
				{
					...Dropdown.menuOptions.edit({
						onSelect: selectAction("Edit helper"),
					}),
					id: "helper-edit",
				},
				{
					...Dropdown.menuOptions.edit({
						disabled: true,
						onSelect: selectAction("Disabled edit helper"),
					}),
					id: "helper-edit-disabled",
					label: "Edit — disabled",
				},
				{
					...Dropdown.menuOptions.warning({
						onSelect: selectAction("Warning helper"),
					}),
					id: "helper-warning",
				},
				{
					...Dropdown.menuOptions.warning({
						disabled: true,
						label: "Warning — disabled",
						onSelect: selectAction("Disabled warning helper"),
					}),
					id: "helper-warning-disabled",
				},
				{
					...Dropdown.menuOptions.delete({
						onSelect: selectAction("Delete helper"),
					}),
					id: "helper-delete",
				},
				{
					...Dropdown.menuOptions.delete({
						disabled: true,
						label: "Delete permanently — disabled",
						onSelect: selectAction("Disabled delete helper"),
					}),
					id: "helper-delete-disabled",
				},
				{
					...Dropdown.menuOptions.delete({
						label: "Delete — no handler",
					}),
					id: "helper-delete-without-handler",
				},
			],
		},
		{
			id: "states-and-tones",
			label: "States and tones",
			onSelect: selectAction("States and tones branch"),
			children: [
				{
					id: "default-action",
					label: "Default action",
					onSelect: selectAction("Default action"),
				},
				{
					active: true,
					id: "active-action",
					label: "Active action",
					onSelect: selectAction("Active action"),
				},
				{
					disabled: true,
					id: "disabled-action",
					label: "Disabled action",
					onSelect: selectAction("Disabled action"),
				},
				{
					id: "empty-children-leaf",
					label: "Empty children — leaf",
					onSelect: selectAction("Empty children leaf"),
					children: [],
				},
				{
					id: "warning-action",
					label: "Warning action",
					leadingIcon: <Icon name="warning" size="sm" />,
					onSelect: selectAction("Warning action"),
					tone: "warning" as const,
				},
				{
					disabled: true,
					id: "disabled-warning-action",
					label: "Warning action — disabled",
					onSelect: selectAction("Disabled warning action"),
					tone: "warning" as const,
				},
				{
					id: "danger-action",
					label: "Danger action",
					onSelect: selectAction("Danger action"),
					tone: "danger" as const,
				},
				{
					disabled: true,
					id: "disabled-danger-action",
					label: "Danger action — disabled",
					onSelect: selectAction("Disabled danger action"),
					tone: "danger" as const,
				},
			],
		},
		{
			id: "composition",
			label: "Composition",
			onSelect: selectAction("Composition branch"),
			children: [
				{
					dividerAfter: true,
					id: "leading-icon",
					label: "Leading icon + divider after",
					leadingIcon: <Icon name="gear" size="sm" />,
					onSelect: selectAction("Leading icon"),
				},
				{
					id: "trailing-icon",
					label: "Trailing icon",
					onSelect: selectAction("Trailing icon"),
					trailingIcon: <Icon name="arrow-right" size="sm" />,
				},
				{
					dividerBefore: true,
					id: "both-icons",
					label: "Both icons + divider before",
					leadingIcon: <Icon name="archive" size="sm" />,
					onSelect: selectAction("Both icons"),
					trailingIcon: <Icon name="check" size="sm" />,
				},
				{
					className: "font-medium",
					id: "class-extensions",
					label: "Class extensions",
					onSelect: selectAction("Class extensions"),
					textClassName: "uppercase tracking-wide",
				},
				{
					id: "presentation-layout",
					label: (
						<span className="flex min-w-0 flex-col">
							<span className="font-medium">Presentation layout</span>
							<span className="text-xs text-muted/60">
								Multi-line React node label
							</span>
						</span>
					),
					layout: "presentation" as const,
					onSelect: selectAction("Presentation layout"),
				},
			],
		},
		{
			id: "disabled-branch",
			label: "Disabled branch",
			disabled: true,
			children: [
				{
					id: "disabled-branch-child",
					label: "Unreachable child",
					onSelect: selectAction("Unreachable child"),
				},
			],
		},
		{
			id: "settings",
			label: "Settings",
			onSelect: selectAction("Settings"),
		},
	];

	return (
		<div className="flex flex-col items-start gap-3">
			<div className="flex flex-wrap items-end gap-6">
				<div className="flex flex-col items-start gap-1.5">
					<Text variant="caption" tone="muted">
						Flat baseline
					</Text>
					<Dropdown.Menu
						ariaLabel="Open overflow menu"
						options={[
							{ label: "Edit", href: "/" },
							{ label: "Duplicate", onSelect: () => {} },
							{ label: "Archive", onSelect: () => {} },
						]}
					/>
				</div>
				<div className="flex flex-col items-start gap-1.5">
					<Text variant="caption" tone="muted">
						Recursive contract matrix
					</Text>
					<Dropdown.Menu
						ariaLabel="Open recursive action menu"
						openOnHover={false}
						options={recursiveOptions}
					/>
				</div>
			</div>
			<div className="flex flex-col gap-0.5">
				<Text id="dropdown-menu-contract-target" variant="caption" tone="muted">
					Selected: {selectedAction}
				</Text>
				<Text variant="caption" tone="muted">
					Supported tones: default, warning, and danger.
				</Text>
			</div>
		</div>
	);
}
