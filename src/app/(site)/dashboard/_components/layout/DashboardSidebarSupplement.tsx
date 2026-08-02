"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Icon, type IconName } from "@/components/ui/icons/Icon";
import type { AssistantThreadSummary } from "@/lib/assistant/contracts";
import {
	DashboardSidebarBranch,
	DashboardSidebarItem,
} from "./DashboardSidebarBranch";
import { DashboardSidebarThreadActionsMenu } from "./DashboardSidebarThreadActionsMenu";

function isAssistantThreadSummary(
	value: unknown,
): value is AssistantThreadSummary {
	if (!value || typeof value !== "object") return false;
	const thread = value as Partial<AssistantThreadSummary>;
	return (
		typeof thread.id === "string" &&
		typeof thread.title === "string" &&
		typeof thread.pinned === "boolean" &&
		typeof thread.updatedAt === "string"
	);
}

export function DashboardSidebarSupplement({
	active,
	collapsed,
	defaultOpen,
	endpoint,
	href,
	icon,
	label,
	mobileExpanded,
	onNavigate,
	pathname,
	storageId,
}: {
	active: boolean;
	collapsed: boolean;
	defaultOpen: boolean;
	endpoint: string;
	href: string;
	icon?: IconName;
	label: string;
	mobileExpanded: boolean;
	onNavigate: () => void;
	pathname: string;
	storageId: string;
}) {
	const router = useRouter();
	const [threads, setThreads] = React.useState<AssistantThreadSummary[]>([]);
	const retryRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
	const load = React.useCallback(
		(attempt = 0) => {
			void (async () => {
				try {
					const response = await fetch(endpoint, {
						cache: "no-store",
						credentials: "same-origin",
					});
					if (response.status === 401 && attempt < 2) {
						retryRef.current = setTimeout(() => load(attempt + 1), 500);
						return;
					}
					if (response.status === 401 || response.status === 403) {
						router.replace("/login");
						return;
					}
					if (!response.ok) {
						setThreads([]);
						return;
					}
					const body = (await response.json()) as { threads?: unknown };
					setThreads(
						Array.isArray(body.threads)
							? body.threads.filter(isAssistantThreadSummary)
							: [],
					);
				} catch {
					setThreads([]);
				}
			})();
		},
		[endpoint, router],
	);
	React.useEffect(() => {
		load();
		const reload = () => load();
		window.addEventListener("assistant:threads-changed", reload);
		return () => {
			window.removeEventListener("assistant:threads-changed", reload);
			if (retryRef.current) clearTimeout(retryRef.current);
		};
	}, [load]);

	const pinnedThreads = threads.filter((thread) => thread.pinned);
	const recentThreads = threads.filter((thread) => !thread.pinned).slice(0, 5);
	const visibleThreads = [...pinnedThreads, ...recentThreads];
	const updateThread = (updatedThread: AssistantThreadSummary) =>
		setThreads((current) =>
			current.map((thread) =>
				thread.id === updatedThread.id ? updatedThread : thread,
			),
		);
	const deleteThread = (threadId: string) =>
		setThreads((current) => current.filter((thread) => thread.id !== threadId));
	if (visibleThreads.length === 0) {
		return (
			<DashboardSidebarItem
				active={active}
				collapsed={collapsed}
				href={href}
				icon={icon}
				label={label}
				mobileExpanded={mobileExpanded}
				onNavigate={onNavigate}
			/>
		);
	}

	return (
		<DashboardSidebarBranch
			active={active}
			collapsed={collapsed}
			defaultOpen={defaultOpen}
			href={href}
			icon={icon}
			label={label}
			mobileExpanded={mobileExpanded}
			onNavigate={onNavigate}
			storageId={storageId}
		>
			<div className="grid gap-1">
				{visibleThreads.map((thread) => {
					const href = `/dashboard/assistant/${encodeURIComponent(thread.id)}`;
					return (
						<DashboardSidebarItem
							active={pathname === href}
							actions={
								<>
									{thread.pinned ? (
										<span
											aria-label="Pinned conversation"
											role="img"
											title="Pinned conversation"
										>
											<Icon name="pin" size="sm" weight="fill" />
										</span>
									) : null}
									<DashboardSidebarThreadActionsMenu
										active={pathname === href}
										onDelete={deleteThread}
										onUpdate={updateThread}
										thread={thread}
									/>
								</>
							}
							href={href}
							key={thread.id}
							label={thread.title}
							onNavigate={onNavigate}
						/>
					);
				})}
			</div>
		</DashboardSidebarBranch>
	);
}
