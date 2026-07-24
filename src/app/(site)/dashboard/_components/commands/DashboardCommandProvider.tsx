"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { focusRing } from "@/components/ui/foundations/focus";
import { Icon } from "@/components/ui/icons/Icon";
import { ModalCard } from "@/components/ui/overlays/modal/ModalCard";
import {
	ModalDescription,
	ModalShell,
	ModalTitle,
} from "@/components/ui/overlays/modal/ModalShell";
import { Button } from "@/components/ui/primitives/Button";
import {
	InputFrame,
	inputVariants,
} from "@/components/ui/primitives/InputFrame";
import type { Organization } from "@/lib/auth/contracts";
import {
	type DashboardCapability,
	getDashboardNavigationCommands,
	hasDashboardCapability,
} from "../../_registry/surfaceRegistry";

import type { DashboardContextualCommand } from "./DashboardCommandContracts";
import {
	buildDashboardCommandTree,
	DashboardCommandTree,
	dashboardCommandMatches,
	getDashboardCommandOptionId,
	getNextDashboardCommandId,
} from "./DashboardCommandTree";

export type { DashboardContextualCommand } from "./DashboardCommandContracts";

type DashboardCommandContextValue = {
	open: () => void;
	register: (
		ownerId: string,
		commands: readonly DashboardContextualCommand[],
	) => () => void;
};

type DashboardCommandRegistration = {
	commands: readonly DashboardContextualCommand[];
	ownerId: string;
};

const DashboardCommandContext =
	React.createContext<DashboardCommandContextValue | null>(null);

export function DashboardCommandProvider({
	capabilities,
	children,
	organization,
}: {
	capabilities: ReadonlySet<DashboardCapability>;
	children: React.ReactNode;
	organization: Organization;
}) {
	const router = useRouter();
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [activeCommandId, setActiveCommandId] = React.useState<string>();
	const [open, setOpen] = React.useState(false);
	const [query, setQuery] = React.useState("");
	const [registrations, setRegistrations] = React.useState(
		new Map<symbol, DashboardCommandRegistration>(),
	);
	const staticCommands = React.useMemo(
		() => getDashboardNavigationCommands(capabilities),
		[capabilities],
	);
	const contextualCommands = React.useMemo(
		() =>
			[...registrations.values()].flatMap(({ commands, ownerId }) => {
				const parentCommand = staticCommands
					.filter(
						(command) =>
							command.id.startsWith("navigate.") &&
							ownerId.startsWith(command.id.slice("navigate.".length)),
					)
					.sort((a, b) => b.id.length - a.id.length)[0];
				return commands
					.filter((command) =>
						hasDashboardCapability(capabilities, command.capability),
					)
					.map((command) => ({
						...command,
						parentId: command.parentId ?? parentCommand?.id,
					}));
			}),
		[capabilities, registrations, staticCommands],
	);
	const commands = React.useMemo(
		() => [...contextualCommands, ...staticCommands],
		[contextualCommands, staticCommands],
	);
	const filteredCommands = React.useMemo(
		() => commands.filter((command) => dashboardCommandMatches(command, query)),
		[commands, query],
	);
	const resultIds = React.useMemo(
		() => filteredCommands.map((command) => command.id),
		[filteredCommands],
	);
	const effectiveActiveCommandId = resultIds.includes(activeCommandId ?? "")
		? activeCommandId
		: resultIds[0];
	const activeCommand = filteredCommands.find(
		(command) => command.id === effectiveActiveCommandId,
	);
	const commandTree = React.useMemo(
		() =>
			buildDashboardCommandTree({
				commands,
				matchedCommands: filteredCommands,
			}),
		[commands, filteredCommands],
	);

	const close = React.useCallback(() => {
		setOpen(false);
		setQuery("");
		setActiveCommandId(undefined);
	}, []);

	React.useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key.toLowerCase() !== "k") return;
			if (!event.metaKey && !event.ctrlKey) return;
			event.preventDefault();
			setOpen((current) => !current);
		}
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	React.useEffect(() => {
		if (!open) return;
		let frame = 0;
		let attempts = 0;
		const focusInput = () => {
			if (inputRef.current) {
				inputRef.current.focus({ preventScroll: true });
				return;
			}
			attempts += 1;
			if (attempts < 4) frame = window.requestAnimationFrame(focusInput);
		};
		frame = window.requestAnimationFrame(focusInput);
		return () => window.cancelAnimationFrame(frame);
	}, [open]);

	const register = React.useCallback(
		(ownerId: string, nextCommands: readonly DashboardContextualCommand[]) => {
			const token = Symbol(ownerId);
			setRegistrations((current) => {
				const next = new Map(current);
				next.set(token, { commands: nextCommands, ownerId });
				return next;
			});
			return () => {
				setRegistrations((current) => {
					if (!current.has(token)) return current;
					const next = new Map(current);
					next.delete(token);
					return next;
				});
			};
		},
		[],
	);
	const openCommands = React.useCallback(() => setOpen(true), []);
	const contextValue = React.useMemo(
		() => ({ open: openCommands, register }),
		[openCommands, register],
	);

	function execute(command: DashboardContextualCommand) {
		close();
		if (command.run) {
			window.requestAnimationFrame(command.run);
			return;
		}
		if (command.href) router.push(command.href);
	}

	function clearQuery() {
		setQuery("");
		setActiveCommandId(undefined);
		inputRef.current?.focus();
	}

	function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.key === "Escape") {
			event.preventDefault();
			close();
			return;
		}
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
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
			return;
		}
		if (event.key === "Enter" && activeCommand) {
			event.preventDefault();
			execute(activeCommand);
		}
	}

	return (
		<DashboardCommandContext.Provider value={contextValue}>
			{children}
			{open ? (
				<ModalShell
					ariaLabel="Dashboard commands"
					onClose={close}
					placement="top"
				>
					<ModalCard
						background="transparent"
						border="default"
						className="max-h-[min(760px,82vh)] border-border/80 bg-popover/94 backdrop-blur-xl shadow-foreground/15"
						maxWidth="2xl"
						shadow="2xl"
						style={{
							backgroundColor:
								"color-mix(in oklab, var(--color-popover) 94%, transparent)",
						}}
					>
						<div className="sr-only">
							<ModalTitle>Commands</ModalTitle>
							<ModalDescription>
								{organization.name} · navigation and current-page actions
							</ModalDescription>
						</div>
						<div className="flex max-h-[min(760px,82vh)] flex-col">
							<div className="border-b border-border/75 p-3">
								<InputFrame
									contentClassName="flex min-w-0 items-center"
									fullWidth
									start={
										<Icon className="text-muted-foreground" name="search" />
									}
								>
									<input
										aria-activedescendant={
											effectiveActiveCommandId
												? getDashboardCommandOptionId(effectiveActiveCommandId)
												: undefined
										}
										aria-controls="dashboard-command-results"
										aria-label="Search dashboard commands"
										autoComplete="off"
										className={inputVariants({
											hasEnd: Boolean(query),
											hasStart: true,
										})}
										onChange={(event) => {
											setQuery(event.target.value);
											setActiveCommandId(undefined);
										}}
										onKeyDown={handleInputKeyDown}
										placeholder="Search pages and actions"
										ref={inputRef}
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
											onClick={clearQuery}
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
								{filteredCommands.length > 0 ? (
									<div aria-label="Dashboard commands" role="listbox">
										<DashboardCommandTree
											activeCommandId={effectiveActiveCommandId}
											executeCommand={execute}
											nodes={commandTree}
											onActiveCommandChange={setActiveCommandId}
										/>
									</div>
								) : (
									<p className="px-3 py-8 text-center text-sm text-muted-foreground">
										No matching commands.
									</p>
								)}
							</div>
						</div>
					</ModalCard>
				</ModalShell>
			) : null}
		</DashboardCommandContext.Provider>
	);
}

export function DashboardCommandTrigger() {
	const context = React.useContext(DashboardCommandContext);
	if (!context) return null;
	return (
		<>
			<InputFrame className="hidden !w-[280px] min-w-[280px] max-w-[280px] bg-input/50 md:flex">
				<button
					aria-label="Open dashboard commands"
					className="flex h-full w-full min-w-0 items-center gap-2 px-3 text-left text-sm text-muted-foreground outline-none transition-colors motion-interactive hover:text-foreground"
					onClick={context.open}
					type="button"
				>
					<Icon className="!size-4 shrink-0" name="search" />
					<span className="min-w-0 flex-1 truncate">Search</span>
					<span className="inline-flex shrink-0 items-center text-2xs leading-none text-muted-foreground">
						⌘K
					</span>
				</button>
			</InputFrame>
			<Button
				aria-label="Open dashboard commands"
				className="md:hidden"
				onClick={context.open}
				size="icon-sm"
				variant="ghost"
			>
				<Icon className="!size-4" name="search" />
			</Button>
		</>
	);
}

export function useDashboardCommands(
	ownerId: string,
	commands: readonly DashboardContextualCommand[],
) {
	const context = React.useContext(DashboardCommandContext);
	const commandsRef = React.useRef(commands);
	commandsRef.current = commands;
	React.useEffect(() => {
		if (!context) return;
		return context.register(ownerId, commandsRef.current);
	}, [context, ownerId]);
}
