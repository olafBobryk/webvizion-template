"use client";

import { Icon } from "@/components/ui/icons/Icon";
import { Button } from "@/components/ui/primitives/Button";
import { getDropdownOptionClassName } from "@/components/ui/primitives/dropdownStyles";
import type { DashboardContextualCommand } from "./DashboardCommandContracts";

type DashboardCommandTreeNode = {
	children: DashboardCommandTreeNode[];
	command: DashboardContextualCommand;
	directlyMatched: boolean;
};

export function getDashboardCommandOptionId(commandId: string) {
	return `dashboard-command-option-${commandId.replaceAll(".", "-")}`;
}

export function getNextDashboardCommandId({
	currentId,
	direction,
	resultIds,
}: {
	currentId?: string;
	direction: "next" | "previous";
	resultIds: string[];
}) {
	if (resultIds.length === 0) return undefined;
	if (!currentId) return resultIds[0];
	const currentIndex = resultIds.indexOf(currentId);
	if (currentIndex === -1) return resultIds[0];
	const offset = direction === "next" ? 1 : -1;
	return resultIds[
		(currentIndex + offset + resultIds.length) % resultIds.length
	];
}

function collapseRedundantCommandTreeContext(
	nodes: DashboardCommandTreeNode[],
): DashboardCommandTreeNode[] {
	const collapsedNodes = nodes.map((node) => ({
		...node,
		children: collapseRedundantCommandTreeContext(node.children),
	}));
	if (collapsedNodes.length !== 1) return collapsedNodes;
	const [onlyNode] = collapsedNodes;
	if (!onlyNode || onlyNode.directlyMatched || onlyNode.children.length === 0)
		return collapsedNodes;
	return onlyNode.children;
}

export function buildDashboardCommandTree({
	commands,
	matchedCommands,
}: {
	commands: DashboardContextualCommand[];
	matchedCommands: DashboardContextualCommand[];
}) {
	const commandById = new Map(commands.map((command) => [command.id, command]));
	const directlyMatchedIds = new Set(
		matchedCommands.map((command) => command.id),
	);
	const includedIds = new Set<string>();
	for (const matchedCommand of matchedCommands) {
		let current: DashboardContextualCommand | undefined = matchedCommand;
		const visited = new Set<string>();
		while (current && !visited.has(current.id)) {
			visited.add(current.id);
			includedIds.add(current.id);
			current = current.parentId
				? commandById.get(current.parentId)
				: undefined;
		}
	}
	const treeNodeById = new Map<string, DashboardCommandTreeNode>();
	for (const command of commands) {
		if (!includedIds.has(command.id)) continue;
		treeNodeById.set(command.id, {
			children: [],
			command,
			directlyMatched: directlyMatchedIds.has(command.id),
		});
	}
	const roots: DashboardCommandTreeNode[] = [];
	for (const command of commands) {
		const treeNode = treeNodeById.get(command.id);
		if (!treeNode) continue;
		const parent = command.parentId
			? treeNodeById.get(command.parentId)
			: undefined;
		if (parent) parent.children.push(treeNode);
		else roots.push(treeNode);
	}
	return collapseRedundantCommandTreeContext(roots);
}

export function dashboardCommandMatches(
	command: DashboardContextualCommand,
	query: string,
) {
	const normalized = query.trim().toLowerCase();
	if (!normalized) return true;
	return [command.label, command.description, ...(command.keywords ?? [])]
		.join(" ")
		.toLowerCase()
		.includes(normalized);
}

export function DashboardCommandTree({
	activeCommandId,
	executeCommand,
	nodes,
	onActiveCommandChange,
}: {
	activeCommandId?: string;
	executeCommand: (command: DashboardContextualCommand) => void;
	nodes: DashboardCommandTreeNode[];
	onActiveCommandChange: (commandId: string) => void;
}) {
	return (
		<div className="grid gap-1">
			{nodes.map((node) => (
				<DashboardCommandTreeItem
					activeCommandId={activeCommandId}
					executeCommand={executeCommand}
					key={node.command.id}
					onActiveCommandChange={onActiveCommandChange}
					treeNode={node}
				/>
			))}
		</div>
	);
}

function DashboardCommandTreeItem({
	activeCommandId,
	executeCommand,
	onActiveCommandChange,
	treeNode,
}: {
	activeCommandId?: string;
	executeCommand: (command: DashboardContextualCommand) => void;
	onActiveCommandChange: (commandId: string) => void;
	treeNode: DashboardCommandTreeNode;
}) {
	const { command, directlyMatched } = treeNode;
	const isActive = activeCommandId === command.id;
	const rowContent = (
		<>
			<span
				className={[
					"grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors motion-interactive",
					directlyMatched
						? "group-hover:text-foreground group-focus-visible:text-foreground group-data-[active=true]:text-foreground"
						: undefined,
				]
					.filter(Boolean)
					.join(" ")}
			>
				<Icon className="!size-[18px]" name={command.icon ?? "search"} />
			</span>
			<span className="grid min-w-0 gap-0.5">
				<span className="block truncate font-medium text-foreground">
					{command.label}
				</span>
				<span className="line-clamp-2 text-xs leading-4 text-muted-foreground">
					{command.description}
				</span>
			</span>
		</>
	);
	return (
		<div className="grid gap-1" role="presentation">
			{directlyMatched ? (
				<Button
					align="left"
					aria-selected={isActive}
					className={getDropdownOptionClassName({
						active: isActive,
						selected: isActive,
						className:
							"group !items-start !rounded-md !py-2 !pr-3 !pl-2 motion-interactive",
					})}
					contentClassName="gap-3"
					data-active={isActive ? "true" : undefined}
					data-command-result=""
					id={getDashboardCommandOptionId(command.id)}
					onClick={() => executeCommand(command)}
					onMouseDown={(event) => event.preventDefault()}
					onMouseMove={() => onActiveCommandChange(command.id)}
					role="option"
					size="none"
					tabIndex={-1}
					type="button"
					variant="ghost"
				>
					{rowContent}
				</Button>
			) : (
				<div className="flex items-start gap-3 rounded-md py-2 pr-3 pl-2 text-left text-sm">
					{rowContent}
				</div>
			)}
			{treeNode.children.length > 0 ? (
				<div className="relative ml-4 grid gap-1 pl-5 before:absolute before:bottom-1 before:left-0 before:top-0 before:w-px before:bg-border">
					<DashboardCommandTree
						activeCommandId={activeCommandId}
						executeCommand={executeCommand}
						nodes={treeNode.children}
						onActiveCommandChange={onActiveCommandChange}
					/>
				</div>
			) : null}
		</div>
	);
}
