"use client";

import { Icon } from "@/components/ui/icons/Icon";
import { Button } from "@/components/ui/primitives/Button";
import { getDropdownOptionClassName } from "@/components/ui/primitives/dropdownStyles";
import type { DashboardContextualCommand } from "./DashboardCommandContracts";

export type DashboardCommandTreeNode = {
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
	depth = 0,
	executeCommand,
	nodes,
	onActiveCommandChange,
}: {
	activeCommandId?: string;
	depth?: number;
	executeCommand: (command: DashboardContextualCommand) => void;
	nodes: DashboardCommandTreeNode[];
	onActiveCommandChange: (commandId: string) => void;
}) {
	return (
		<div className="grid gap-0.5" data-command-tree-level={depth}>
			{nodes.map((node, index) => (
				<DashboardCommandTreeItem
					activeCommandId={activeCommandId}
					depth={depth}
					executeCommand={executeCommand}
					isLast={index === nodes.length - 1}
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
	depth,
	executeCommand,
	isLast,
	onActiveCommandChange,
	treeNode,
}: {
	activeCommandId?: string;
	depth: number;
	executeCommand: (command: DashboardContextualCommand) => void;
	isLast: boolean;
	onActiveCommandChange: (commandId: string) => void;
	treeNode: DashboardCommandTreeNode;
}) {
	const { command, directlyMatched } = treeNode;
	const isActive = activeCommandId === command.id;
	const isNested = depth > 0;
	const rowContent = (
		<>
			<span
				className={[
					"relative z-10 mt-0.5 grid shrink-0 place-items-center rounded-lg border border-border/60 bg-muted/45 text-muted-foreground transition-colors motion-interactive",
					isNested ? "size-7" : "size-8",
					directlyMatched
						? "group-hover:border-border group-hover:bg-muted group-hover:text-foreground group-focus-visible:text-foreground group-data-[active=true]:border-border group-data-[active=true]:bg-background/70 group-data-[active=true]:text-foreground"
						: undefined,
				]
					.filter(Boolean)
					.join(" ")}
				data-command-icon-well=""
			>
				<Icon
					className={isNested ? "!size-3.5" : "!size-4"}
					name={command.icon ?? "search"}
				/>
			</span>
			<span className="grid min-w-0 gap-0.5 py-0.5">
				<span className="block truncate font-medium text-foreground">
					{command.label}
				</span>
				<span className="line-clamp-2 text-xs leading-4 text-muted-foreground">
					{command.description}
				</span>
			</span>
		</>
	);
	const row = directlyMatched ? (
		<Button
			align="left"
			aria-selected={isActive}
			className={getDropdownOptionClassName({
				active: isActive,
				selected: isActive,
				className:
					"group !min-h-12 !items-start !rounded-lg !px-2 !py-1.5 motion-interactive",
			})}
			contentClassName="gap-2.5"
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
		<div className="flex min-h-12 items-start gap-2.5 rounded-lg bg-muted/35 px-2 py-1.5 text-left text-sm">
			{rowContent}
		</div>
	);
	return (
		<div
			className={
				isNested
					? "relative grid grid-cols-[1.25rem_minmax(0,1fr)] grid-rows-[auto_auto_0.125rem]"
					: "relative grid grid-rows-[auto_auto_0.125rem]"
			}
			data-command-depth={depth}
			data-command-tree-item=""
			role="presentation"
		>
			{isNested && isLast ? (
				<div
					aria-hidden="true"
					className="relative col-start-1 row-start-1"
					data-command-tree-elbow=""
				>
					<span
						className="absolute left-0 top-0 h-[calc(50%+1px)] w-4 rounded-bl-md border-b border-l border-foreground/40"
						data-command-tree-elbow-incoming=""
					/>
				</div>
			) : null}
			{isNested && !isLast ? (
				<span
					aria-hidden="true"
					className="absolute -bottom-0.5 left-0 top-0 w-px bg-foreground/40"
					data-command-tree-continuation-rail=""
				/>
			) : null}
			<div
				className={
					isNested
						? "relative col-start-2 row-start-1 min-w-0"
						: "relative row-start-1 min-w-0"
				}
				data-command-tree-row=""
			>
				{row}
			</div>
			{treeNode.children.length > 0 ? (
				<div
					className={
						isNested
							? "relative col-start-2 row-start-2 ml-[1.8125rem] min-w-0 pt-1.5"
							: "relative row-start-2 ml-[1.9375rem] min-w-0 pt-1.5"
					}
					data-command-tree-branch=""
				>
					<span
						aria-hidden="true"
						className="absolute left-0 top-1 h-0.5 w-px bg-foreground/40"
						data-command-tree-branch-rail=""
					/>
					<DashboardCommandTree
						activeCommandId={activeCommandId}
						depth={depth + 1}
						executeCommand={executeCommand}
						nodes={treeNode.children}
						onActiveCommandChange={onActiveCommandChange}
					/>
				</div>
			) : null}
			<div
				aria-hidden="true"
				className={isNested ? "col-start-2 row-start-3" : "row-start-3"}
			/>
		</div>
	);
}
