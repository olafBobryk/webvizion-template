"use client";

import { useState } from "react";
import { Button } from "@/components/ui/primitives/Button";
import { Dropdown } from "@/components/ui/primitives/dropdown";
import { Listbox } from "@/components/ui/primitives/Listbox";
import { Text } from "@/components/ui/primitives/Text";

export function RecursiveListboxDemo() {
	const [selectedValue, setSelectedValue] = useState("none");
	const [workspaceState, setWorkspaceState] = useState<
		"enabled" | "disabled" | "removed"
	>("enabled");
	const queueWorkspaceState = (nextState: "disabled" | "removed") => {
		setWorkspaceState("enabled");
		window.setTimeout(() => setWorkspaceState(nextState), 500);
	};
	const workspaceOption = {
		value: "workspace",
		content: <span className="truncate">Workspace</span>,
		disabled: workspaceState === "disabled",
		children: [
			{
				value: "design",
				content: <span className="truncate">Design</span>,
				children: [
					{
						value: "tokens",
						content: <span className="truncate">Tokens</span>,
					},
					{
						value: "components",
						content: <span className="truncate">Components</span>,
					},
				],
			},
			{
				value: "engineering",
				content: <span className="truncate">Engineering</span>,
				children: [
					{
						value: "web",
						content: <span className="truncate">Web</span>,
					},
					{
						value: "platform",
						content: <span className="truncate">Platform</span>,
					},
				],
			},
		],
	};
	const options = [
		...(workspaceState === "removed" ? [] : [workspaceOption]),
		{
			value: "disabled",
			content: <span className="truncate">Disabled branch</span>,
			disabled: true,
			children: [
				{
					value: "unavailable",
					content: <span className="truncate">Unavailable</span>,
				},
			],
		},
		{
			value: "overview",
			content: <span className="truncate">Overview</span>,
		},
		{
			value: "needs-review",
			content: <span className="truncate">Needs review</span>,
			tone: "warning" as const,
		},
		{
			value: "blocked",
			content: <span className="truncate">Blocked</span>,
			tone: "danger" as const,
		},
	];

	return (
		<div className="flex flex-col items-start gap-3">
			<Dropdown.Listbox
				ariaLabel="Choose recursive destination"
				onSelect={(value) => setSelectedValue(value)}
				options={options}
				positionStrategy="fixed"
				triggerContent={
					selectedValue === "none" ? "Choose destination" : selectedValue
				}
			/>
			<Text variant="caption" tone="muted">
				Selected: {selectedValue}
			</Text>
			<div className="flex flex-wrap gap-2">
				<Button onClick={() => queueWorkspaceState("disabled")} size="sm">
					Disable open branch
				</Button>
				<Button onClick={() => queueWorkspaceState("removed")} size="sm">
					Remove open branch
				</Button>
			</div>
			<div className="w-full max-w-64">
				<Listbox
					options={options}
					onSelect={(option) => setSelectedValue(option.value)}
				/>
			</div>
		</div>
	);
}
