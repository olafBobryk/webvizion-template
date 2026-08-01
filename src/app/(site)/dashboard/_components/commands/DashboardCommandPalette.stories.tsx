import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ModalHost } from "@/components/ui/overlays/modal/ModalHost";
import { useModal } from "@/components/ui/overlays/modal/useModal";
import type { DashboardContextualCommand } from "./DashboardCommandContracts";
import { DashboardCommandPalette } from "./DashboardCommandPalette";
import { catalogContract } from "./DashboardCommandPalette.catalog";
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

async function expectHierarchyConnectorAlignment(dialog: HTMLElement) {
	const nestedItems = Array.from(
		dialog.querySelectorAll<HTMLElement>(
			'[data-command-tree-item]:not([data-command-depth="0"])',
		),
	);
	await expect(nestedItems.length).toBeGreaterThan(0);
	for (const item of nestedItems) {
		const row = item.querySelector<HTMLElement>(
			":scope > [data-command-tree-row]",
		);
		const iconWell = row?.querySelector<HTMLElement>(
			"[data-command-icon-well]",
		);
		const terminalElbow = item.querySelector<HTMLElement>(
			":scope > [data-command-tree-elbow] > [data-command-tree-elbow-incoming]",
		);
		const continuationRail = item.querySelector<HTMLElement>(
			":scope > [data-command-tree-continuation-rail]",
		);
		const nextItem = item.nextElementSibling as HTMLElement | null;
		await expect(row).not.toBeNull();
		await expect(iconWell).not.toBeNull();
		if (nextItem) {
			await expect(continuationRail).not.toBeNull();
			await expect(terminalElbow).toBeNull();
			const itemRect = item.getBoundingClientRect();
			const nextItemRect = nextItem.getBoundingClientRect();
			const continuationRect = continuationRail?.getBoundingClientRect();
			await expect(continuationRect?.width ?? 0).toBeGreaterThan(0.7);
			await expect(continuationRect?.width ?? 0).toBeLessThan(1.5);
			await expect(
				Math.abs((continuationRect?.top ?? 0) - itemRect.top),
			).toBeLessThan(1.5);
			await expect(
				Math.abs((continuationRect?.bottom ?? 0) - nextItemRect.top),
			).toBeLessThan(1.5);
			continue;
		}

		await expect(continuationRail).toBeNull();
		await expect(terminalElbow).not.toBeNull();
		const rowRect = row?.getBoundingClientRect();
		const iconRect = iconWell?.getBoundingClientRect();
		const elbowRect = terminalElbow?.getBoundingClientRect();
		const iconCenter = iconRect ? iconRect.top + iconRect.height / 2 : 0;
		await expect(iconRect?.width ?? 0).toBeGreaterThan(0);
		await expect(elbowRect?.height ?? 0).toBeGreaterThan(0);
		await expect(Math.abs((elbowRect?.bottom ?? 0) - iconCenter)).toBeLessThan(
			1.5,
		);
		await expect(elbowRect?.width ?? 0).toBeGreaterThan(1.5);
		await expect(
			Math.abs((rowRect?.left ?? 0) - (elbowRect?.right ?? 0) - 4),
		).toBeLessThan(1.5);
		await expect(
			Number.parseFloat(
				getComputedStyle(terminalElbow as HTMLElement).borderBottomLeftRadius,
			),
		).toBeGreaterThan(0);
		const terminalStroke = Number.parseFloat(
			getComputedStyle(terminalElbow as HTMLElement).borderLeftWidth,
		);
		await expect(terminalStroke).toBeGreaterThan(0.7);
		await expect(terminalStroke).toBeLessThan(1.5);
	}

	const parentItems = Array.from(
		dialog.querySelectorAll<HTMLElement>("[data-command-tree-item]"),
	).filter((item) => item.querySelector(":scope > [data-command-tree-branch]"));
	await expect(parentItems.length).toBeGreaterThan(0);
	for (const parentItem of parentItems) {
		const parentRow = parentItem.querySelector<HTMLElement>(
			":scope > [data-command-tree-row]",
		);
		const parentIcon = parentItem.querySelector<HTMLElement>(
			":scope > [data-command-tree-row] [data-command-icon-well]",
		);
		const branch = parentItem.querySelector<HTMLElement>(
			":scope > [data-command-tree-branch]",
		);
		const branchRail = branch?.querySelector<HTMLElement>(
			":scope > [data-command-tree-branch-rail]",
		);
		const firstItem = branch?.querySelector<HTMLElement>(
			":scope > [data-command-tree-level] > [data-command-tree-item]:first-child",
		);
		const firstConnector = firstItem?.querySelector<HTMLElement>(
			":scope > [data-command-tree-continuation-rail], :scope > [data-command-tree-elbow] > [data-command-tree-elbow-incoming]",
		);
		await expect(parentRow).not.toBeNull();
		await expect(parentIcon).not.toBeNull();
		await expect(branchRail).not.toBeNull();
		await expect(firstConnector).not.toBeNull();
		const parentRowRect = parentRow?.getBoundingClientRect();
		const parentIconRect = parentIcon?.getBoundingClientRect();
		const branchRailRect = branchRail?.getBoundingClientRect();
		const firstConnectorRect = firstConnector?.getBoundingClientRect();
		const parentIconCenterX = parentIconRect
			? parentIconRect.left + parentIconRect.width / 2
			: 0;
		await expect(
			Math.abs((branchRailRect?.left ?? 0) - parentIconCenterX),
		).toBeLessThan(1.5);
		await expect(
			Math.abs((branchRailRect?.top ?? 0) - (parentRowRect?.bottom ?? 0) - 4),
		).toBeLessThan(1.5);
		await expect(
			Math.abs((firstConnectorRect?.left ?? 0) - (branchRailRect?.left ?? 0)),
		).toBeLessThan(1.5);
		await expect(
			Math.abs((firstConnectorRect?.top ?? 0) - (branchRailRect?.bottom ?? 0)),
		).toBeLessThan(1.5);
		await expect(branchRailRect?.width ?? 0).toBeGreaterThan(0.7);
		await expect(branchRailRect?.width ?? 0).toBeLessThan(1.5);
	}
}

const meta = {
	id: "dashboard-commands-command-palette",
	title: "Dashboard/Commands/Command Palette",
	component: DashboardCommandPalette,
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		layout: "fullscreen",
	},
} satisfies Meta<typeof DashboardCommandPalette>;

export default meta;
type Story = StoryObj;

export const AllCommands: Story = {
	render: () => <CommandPaletteHarness />,
	play: async () => {
		const body = within(document.body);
		const dialog = await body.findByRole("dialog", {
			name: "Dashboard commands",
		});
		const palette = within(dialog);
		await waitFor(() => expect(dialog).toBeVisible());
		const search = palette.getByRole("combobox", {
			name: "Search dashboard commands",
		});
		await expect(search).toHaveAttribute("aria-autocomplete", "list");
		await expect(search).toHaveAttribute("aria-expanded", "true");
		await expect(search).toHaveAttribute(
			"aria-controls",
			"dashboard-command-results",
		);
		await expect(search).toHaveAttribute(
			"placeholder",
			"Search pages and actions",
		);
		await expect(
			dialog.querySelector('[data-surface-role="card"]'),
		).toHaveAttribute("data-elevation", "overlay");
		await expect(palette.getByText("Create record")).toBeVisible();
		await expect(
			palette.getByText(
				"Open the record collection with its create action ready.",
			),
		).toBeVisible();
		await expect(
			dialog.querySelectorAll("[data-command-tree-branch]"),
		).toHaveLength(2);
		await expect(
			dialog.querySelectorAll('[data-command-depth="1"]'),
		).toHaveLength(3);
		await expectHierarchyConnectorAlignment(dialog);
		await userEvent.click(search);
		await userEvent.keyboard("{ArrowDown}");
		await waitFor(() =>
			expect(
				dialog.querySelector(
					"#dashboard-command-option-navigate-dashboard-records",
				),
			).toHaveAttribute("aria-selected", "true"),
		);
	},
};

export const FilteredHierarchy: Story = {
	render: () => <CommandPaletteHarness initialQuery="member" />,
	play: async () => {
		const body = within(document.body);
		const dialog = await body.findByRole("dialog", {
			name: "Dashboard commands",
		});
		const palette = within(dialog);
		await expect(
			palette.getByRole("combobox", {
				name: "Search dashboard commands",
			}),
		).toHaveValue("member");
		await waitFor(() =>
			expect(
				palette.getByRole("button", { name: "Clear search" }),
			).toBeVisible(),
		);
		await expect(
			palette.getByRole("option", {
				name: "Administration Manage organization invitations, memberships, and ownership.",
			}),
		).toBeVisible();
		await expect(
			palette.getByRole("option", {
				name: "Invite member Open Administration and create a local organization invitation.",
			}),
		).toBeVisible();
		await expect(
			palette.getByRole("option", {
				name: "Member Review one organization-scoped member presentation.",
			}),
		).toBeVisible();
		await expect(
			dialog.querySelector("[data-command-tree-branch]"),
		).toBeVisible();
		await expect(
			dialog.querySelectorAll('[data-command-depth="1"]'),
		).toHaveLength(2);
	},
};

export const LargeTextHierarchy: Story = {
	render: () => <CommandPaletteHarness initialQuery="member" textScale={1.1} />,
	play: async () => {
		const dialog = await within(document.body).findByRole("dialog", {
			name: "Dashboard commands",
		});
		await expect(
			within(dialog).getByRole("combobox", {
				name: "Search dashboard commands",
			}),
		).toHaveValue("member");
		await expectHierarchyConnectorAlignment(dialog);
	},
};

export const EmptyResults: Story = {
	render: () => <CommandPaletteHarness initialQuery="no-such-command" />,
	play: async () => {
		const body = within(document.body);
		const dialog = await body.findByRole("dialog", {
			name: "Dashboard commands",
		});
		const palette = within(dialog);
		await waitFor(() =>
			expect(palette.getByText("No matching commands.")).toBeVisible(),
		);
		await expect(
			palette.queryByRole("listbox", { name: "Dashboard commands" }),
		).not.toBeInTheDocument();
	},
};
