"use client";

import * as React from "react";
import { ModalHost } from "@/components/ui/overlays/modal/ModalHost";
import { useModal } from "@/components/ui/overlays/modal/useModal";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import type { DashboardContextualCommand } from "./DashboardCommandContracts";
import { DashboardCommandPalette } from "./DashboardCommandPalette";
import {
	buildDashboardCommandTree,
	dashboardCommandMatches,
	getNextDashboardCommandId,
} from "./DashboardCommandTree";

const commands: DashboardContextualCommand[] = [
	{
		description: "Open the organization overview and recent product activity.",
		href: "/dashboard",
		icon: "home",
		id: "navigate.dashboard.overview",
		keywords: ["home", "activity"],
		label: "Overview",
	},
	{
		description: "Browse the organization-scoped reference record collection.",
		href: "/dashboard/records",
		icon: "database",
		id: "navigate.dashboard.records",
		keywords: ["collection", "data"],
		label: "Records",
	},
	{
		description: "Open the record collection with its create action ready.",
		href: "/dashboard/records?action=create",
		icon: "database",
		id: "action.dashboard.records.create",
		keywords: ["new", "add"],
		label: "Create record",
		parentId: "navigate.dashboard.records",
	},
	{
		description: "Manage organization invitations, memberships, and ownership.",
		href: "/dashboard/administration",
		icon: "shield",
		id: "navigate.dashboard.administration",
		keywords: ["members", "roles"],
		label: "Administration",
	},
	{
		description:
			"Open Administration and create a local organization invitation.",
		href: "/dashboard/administration?action=invite",
		icon: "users",
		id: "action.dashboard.administration.invite",
		keywords: ["member", "invite"],
		label: "Invite member",
		parentId: "navigate.dashboard.administration",
	},
	{
		description: "Review one organization-scoped member presentation.",
		href: "/dashboard/organization/members/member-1",
		icon: "user",
		id: "navigate.dashboard.organization.member",
		keywords: ["person", "member"],
		label: "Member",
		parentId: "navigate.dashboard.administration",
	},
];
function CommandPaletteContent({
	initialQuery = "",
}: {
	initialQuery?: string;
}) {
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [activeCommandId, setActiveCommandId] = React.useState<string>();
	const [executedCommand, setExecutedCommand] = React.useState("");
	const [query, setQuery] = React.useState(initialQuery);
	const filteredCommands = commands.filter((command) =>
		dashboardCommandMatches(command, query),
	);
	const resultIds = filteredCommands.map((command) => command.id);
	const effectiveActiveCommandId = resultIds.includes(activeCommandId ?? "")
		? activeCommandId
		: resultIds[0];
	const commandTree = buildDashboardCommandTree({
		commands,
		matchedCommands: filteredCommands,
	});

	function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
		event.preventDefault();
		setActiveCommandId((currentId) =>
			getNextDashboardCommandId({
				currentId: resultIds.includes(currentId ?? "")
					? currentId
					: effectiveActiveCommandId,
				direction: event.key === "ArrowDown" ? "next" : "previous",
				resultIds,
			}),
		);
	}

	return (
		<>
			<DashboardCommandPalette
				activeCommandId={effectiveActiveCommandId}
				commandTree={commandTree}
				filteredCommandCount={filteredCommands.length}
				inputRef={inputRef}
				onActiveCommandChange={setActiveCommandId}
				onClearQuery={() => {
					setQuery("");
					setActiveCommandId(undefined);
					inputRef.current?.focus();
				}}
				onExecuteCommand={(command) => setExecutedCommand(command.label)}
				onInputKeyDown={handleInputKeyDown}
				onQueryChange={(nextQuery) => {
					setQuery(nextQuery);
					setActiveCommandId(undefined);
				}}
				organizationName="Product sandbox"
				query={query}
			/>
			<output className="sr-only" data-testid="executed-command">
				{executedCommand}
			</output>
		</>
	);
}
function CommandPaletteHarness({
	initialQuery = "",
	textScale = 1,
}: {
	initialQuery?: string;
	textScale?: number;
}) {
	const { closeModal, openModal } = useModal();
	React.useEffect(() => {
		const id = openModal(
			() => <CommandPaletteContent initialQuery={initialQuery} />,
			{
				ariaLabel: "Dashboard commands",
				cardProps: {
					className: "max-h-[min(620px,82vh)]",
					maxWidth: "2xl",
				},
				placement: "top",
			},
		);
		return () => closeModal(id);
	}, [closeModal, initialQuery, openModal]);
	return (
		<>
			<div
				id="modal-root"
				style={{ "--text-scale": textScale } as React.CSSProperties}
			/>
			<ModalHost />
		</>
	);
}
function CatalogPreview() {
	const render = () => <CommandPaletteHarness />;
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "dashboard-commands-command-palette",
	name: "Command Palette",
	role: "Hosted dashboard command finder with contextual hierarchy, keyboard navigation, and searchable listbox semantics.",
	importStatement:
		'import { DashboardCommandPalette } from "./DashboardCommandPalette";',
	chooseWhen: [
		"Dashboard navigation and route-owned actions need one keyboard-searchable hierarchy in the shared modal stack.",
	],
	chooseInstead: [
		"Use Dropdown.Menu for a small control-local action set, or Dropdown.Listbox for persistent single selection.",
	],
	compounds: [],
	exclusions: [
		"Page-local ModalShell instances that bypass ModalHost stacking.",
		"Flat action lists that discard registered parent-child command relationships.",
	],
	guarantees: [
		{
			label: "All Commands",
			storyId: "dashboard-commands-command-palette--all-commands",
		},
	],
	family: "Dashboard",
	group: "Commands",
	previewTargets: [
		{
			id: "all-commands",
			name: "All Commands",
			baseline: {},
			axes: [],
			stage: "overlay",
			Render: CatalogPreview,
		},
	],
});
