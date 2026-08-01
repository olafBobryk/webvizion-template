"use client";

import type * as React from "react";
import { focusRing } from "@/components/ui/foundations/focus";
import { Icon } from "@/components/ui/icons/Icon";
import {
	ModalDescription,
	ModalTitle,
} from "@/components/ui/overlays/modal/ModalShell";
import {
	InputFrame,
	inputVariants,
} from "@/components/ui/primitives/InputFrame";
import type { DashboardContextualCommand } from "./DashboardCommandContracts";
import {
	DashboardCommandTree,
	type DashboardCommandTreeNode,
	getDashboardCommandOptionId,
} from "./DashboardCommandTree";

export type DashboardCommandPaletteProps = {
	activeCommandId?: string;
	commandTree: DashboardCommandTreeNode[];
	filteredCommandCount: number;
	inputRef: React.RefObject<HTMLInputElement | null>;
	onActiveCommandChange: (commandId: string) => void;
	onClearQuery: () => void;
	onExecuteCommand: (command: DashboardContextualCommand) => void;
	onInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
	onQueryChange: (query: string) => void;
	organizationName: string;
	query: string;
};

export function DashboardCommandPalette({
	activeCommandId,
	commandTree,
	filteredCommandCount,
	inputRef,
	onActiveCommandChange,
	onClearQuery,
	onExecuteCommand,
	onInputKeyDown,
	onQueryChange,
	organizationName,
	query,
}: DashboardCommandPaletteProps) {
	return (
		<>
			<div className="sr-only">
				<ModalTitle>Commands</ModalTitle>
				<ModalDescription>
					{organizationName} · navigation and current-page actions
				</ModalDescription>
			</div>
			<div className="flex max-h-[min(620px,82vh)] flex-col">
				<div className="border-b border-border/75 p-3">
					<InputFrame
						contentClassName="flex min-w-0 items-center"
						fullWidth
						start={<Icon className="text-muted-foreground" name="search" />}
					>
						<input
							aria-activedescendant={
								activeCommandId
									? getDashboardCommandOptionId(activeCommandId)
									: undefined
							}
							aria-controls="dashboard-command-results"
							aria-autocomplete="list"
							aria-expanded="true"
							aria-label="Search dashboard commands"
							autoComplete="off"
							className={inputVariants({
								hasEnd: Boolean(query),
								hasStart: true,
							})}
							onChange={(event) => onQueryChange(event.target.value)}
							onKeyDown={onInputKeyDown}
							placeholder="Search pages and actions"
							ref={inputRef}
							role="combobox"
							type="text"
							value={query}
						/>
						{query ? (
							<button
								aria-label="Clear search"
								className={[
									"mr-2 grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors motion-interactive hover:bg-background-hover hover:text-foreground",
									focusRing.visibleDefault,
								]
									.filter(Boolean)
									.join(" ")}
								onClick={onClearQuery}
								type="button"
							>
								<Icon className="!size-4" name="close" />
							</button>
						) : null}
					</InputFrame>
				</div>
				<div
					className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2"
					id="dashboard-command-results"
				>
					{filteredCommandCount > 0 ? (
						<div aria-label="Dashboard commands" role="listbox">
							<DashboardCommandTree
								activeCommandId={activeCommandId}
								executeCommand={onExecuteCommand}
								nodes={commandTree}
								onActiveCommandChange={onActiveCommandChange}
							/>
						</div>
					) : (
						<p className="px-3 py-10 text-center text-sm text-muted-foreground">
							No matching commands.
						</p>
					)}
				</div>
			</div>
		</>
	);
}
