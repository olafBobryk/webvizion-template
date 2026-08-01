"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Icon } from "@/components/ui/icons/Icon";
import { useModal } from "@/components/ui/overlays/modal/useModal";
import { Button } from "@/components/ui/primitives/Button";
import { InputFrame } from "@/components/ui/primitives/InputFrame";
import type { Organization } from "@/lib/auth/contracts";
import {
	type DashboardCapability,
	getDashboardNavigationCommands,
	hasDashboardCapability,
} from "../../_registry/surfaceRegistry";

import type { DashboardContextualCommand } from "./DashboardCommandContracts";
import { DashboardCommandPalette } from "./DashboardCommandPalette";
import {
	buildDashboardCommandTree,
	dashboardCommandMatches,
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
	canSwitchOrganizations,
	capabilities,
	children,
	organization,
}: {
	canSwitchOrganizations: boolean;
	capabilities: ReadonlySet<DashboardCapability>;
	children: React.ReactNode;
	organization: Organization;
}) {
	const [registrations, setRegistrations] = React.useState(
		new Map<symbol, DashboardCommandRegistration>(),
	);
	const modalIdRef = React.useRef<string | null>(null);
	const { closeModal, openModal } = useModal();
	const staticCommands = React.useMemo(
		() =>
			getDashboardNavigationCommands(capabilities, {
				canSwitchOrganizations,
			}),
		[canSwitchOrganizations, capabilities],
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
	const openCommands = React.useCallback(() => {
		if (modalIdRef.current) return;
		const modalId = openModal(
			({ close }) => (
				<DashboardCommandSession
					commands={commands}
					onClose={() => {
						modalIdRef.current = null;
						close();
					}}
					onDismiss={() => {
						if (modalIdRef.current === modalId) modalIdRef.current = null;
					}}
					organizationName={organization.name}
				/>
			),
			{
				ariaLabel: "Dashboard commands",
				cardProps: {
					className: "max-h-[min(620px,82vh)]",
					maxWidth: "2xl",
				},
				id: "dashboard-command-palette",
				placement: "top",
			},
		);
		modalIdRef.current = modalId;
	}, [commands, openModal, organization.name]);
	const toggleCommands = React.useCallback(() => {
		const activeModalId = modalIdRef.current;
		if (activeModalId) {
			modalIdRef.current = null;
			closeModal(activeModalId);
			return;
		}
		openCommands();
	}, [closeModal, openCommands]);

	React.useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key.toLowerCase() !== "k") return;
			if (!event.metaKey && !event.ctrlKey) return;
			event.preventDefault();
			toggleCommands();
		}
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [toggleCommands]);

	React.useEffect(
		() => () => {
			if (modalIdRef.current) closeModal(modalIdRef.current);
		},
		[closeModal],
	);

	const contextValue = React.useMemo(
		() => ({ open: openCommands, register }),
		[openCommands, register],
	);

	return (
		<DashboardCommandContext.Provider value={contextValue}>
			{children}
		</DashboardCommandContext.Provider>
	);
}

function DashboardCommandSession({
	commands,
	onClose,
	onDismiss,
	organizationName,
}: {
	commands: readonly DashboardContextualCommand[];
	onClose: () => void;
	onDismiss: () => void;
	organizationName: string;
}) {
	const router = useRouter();
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [activeCommandId, setActiveCommandId] = React.useState<string>();
	const [query, setQuery] = React.useState("");
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
				commands: [...commands],
				matchedCommands: filteredCommands,
			}),
		[commands, filteredCommands],
	);

	React.useEffect(() => {
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
	}, []);
	React.useEffect(() => onDismiss, [onDismiss]);

	function execute(command: DashboardContextualCommand) {
		onClose();
		if (command.run) {
			window.requestAnimationFrame(command.run);
			return;
		}
		if (command.href) router.push(command.href);
	}

	function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.key === "Escape") {
			event.preventDefault();
			onClose();
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
			onExecuteCommand={execute}
			onInputKeyDown={handleInputKeyDown}
			onQueryChange={(nextQuery) => {
				setQuery(nextQuery);
				setActiveCommandId(undefined);
			}}
			organizationName={organizationName}
			query={query}
		/>
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
