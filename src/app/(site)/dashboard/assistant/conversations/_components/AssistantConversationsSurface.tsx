"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Skeleton } from "@/components/ui/misc/Skeleton";
import { useConfirmationModal } from "@/components/ui/overlays/modal/useConfirmationModal";
import { Button } from "@/components/ui/primitives/Button";
import {
	Dropdown,
	type DropdownMenuOption,
} from "@/components/ui/primitives/dropdown";
import { Text } from "@/components/ui/primitives/Text";
import type { AssistantThreadSummary } from "@/lib/assistant/contracts";
import { showToast } from "@/lib/feedback";
import { DashboardTablePanel } from "../../../_components/data/DashboardTablePanel";
import { DashboardEntityState } from "../../../_components/entities/DashboardEntityState";
import { DashboardSection } from "../../../_components/layout/DashboardSection";

export function AssistantConversationsSurface({
	initialThreads,
}: {
	initialThreads: AssistantThreadSummary[];
}) {
	const [threads, setThreads] = React.useState(initialThreads);
	const [creating, setCreating] = React.useState(false);
	const router = useRouter();
	const { openConfirmation } = useConfirmationModal();
	const notifySidebar = () =>
		window.dispatchEvent(new Event("assistant:threads-changed"));
	const createThread = async () => {
		setCreating(true);
		try {
			const response = await fetch("/api/assistant/threads", {
				body: JSON.stringify({}),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			});
			const body = await response.json();
			if (!response.ok)
				throw new Error(body.error ?? "Could not create conversation.");
			notifySidebar();
			router.push(`/dashboard/assistant/${body.thread.id}`);
		} catch (error) {
			showToast.error(
				error instanceof Error
					? error.message
					: "Could not create conversation.",
			);
			setCreating(false);
		}
	};
	const patchThread = async (
		thread: AssistantThreadSummary,
		patch: { pinned?: boolean },
	) => {
		const response = await fetch(
			`/api/assistant/threads/${encodeURIComponent(thread.id)}`,
			{
				body: JSON.stringify(patch),
				headers: { "Content-Type": "application/json" },
				method: "PATCH",
			},
		);
		const body = await response.json();
		if (!response.ok)
			throw new Error(body.error ?? "Could not update conversation.");
		setThreads((current) =>
			current.map((item) =>
				item.id === thread.id ? { ...item, ...body.thread } : item,
			),
		);
		notifySidebar();
	};
	const deleteThread = (thread: AssistantThreadSummary) =>
		openConfirmation({
			confirmLabel: "Delete conversation",
			confirmTone: "danger",
			description: `Delete “${thread.title}” and its fixture messages?`,
			onConfirm: async () => {
				const response = await fetch(
					`/api/assistant/threads/${encodeURIComponent(thread.id)}`,
					{ method: "DELETE" },
				);
				if (!response.ok) return false;
				setThreads((current) =>
					current.filter((item) => item.id !== thread.id),
				);
				notifySidebar();
				showToast.success("Conversation deleted.");
				return true;
			},
			title: "Delete conversation?",
			warning:
				"This removes the conversation from the non-durable fixture store.",
		});
	return (
		<DashboardSection
			actions={
				<Button
					loading={creating}
					onClick={createThread}
					leadingIcon="plus"
					variant="primary"
				>
					New conversation
				</Button>
			}
			description="Pinned conversations appear first in the dashboard sidebar, followed by recent activity."
			title="Conversations"
		>
			<DashboardTablePanel
				columns={[
					{
						header: "Conversation",
						id: "conversation",
						render: (thread) => (
							<span className="grid min-w-0">
								<Text as="span" className="truncate" variant="bodyStrong">
									{thread.title}
								</Text>
								<Text
									as="span"
									className="truncate"
									tone="muted"
									variant="caption"
								>
									{thread.lastMessagePreview || "No messages yet"}
								</Text>
							</span>
						),
					},
					{
						header: "Pinned",
						id: "pinned",
						render: (thread) => (thread.pinned ? "Pinned" : "—"),
						responsivePriority: 2,
					},
					{
						header: "Updated",
						id: "updated",
						render: (thread) => new Date(thread.updatedAt).toLocaleString(),
						responsivePriority: 1,
					},
					{
						align: "right",
						header: "Actions",
						id: "actions",
						kind: "action",
						render: (thread) => (
							<ConversationRowActions
								onDelete={() => deleteThread(thread)}
								onTogglePinned={() =>
									void patchThread(thread, {
										pinned: !thread.pinned,
									}).catch((error) => showToast.error(error.message))
								}
								thread={thread}
							/>
						),
						rowLink: false,
						sortable: false,
					},
				]}
				emptyState={
					<DashboardEntityState
						action={
							<Button
								loading={creating}
								onClick={createThread}
								leadingIcon="plus"
								variant="primary"
							>
								New conversation
							</Button>
						}
						description="Start a conversation to ask questions, attach files, or use approved Record tools."
						iconName="chat"
						title="No conversations yet"
					/>
				}
				getRowAriaLabel={(thread) => `Open ${thread.title}`}
				getRowHref={(thread) =>
					`/dashboard/assistant/${encodeURIComponent(thread.id)}`
				}
				getRowKey={(thread) => thread.id}
				id="assistant-conversations"
				rows={threads}
			/>
		</DashboardSection>
	);
}

function ConversationRowActions({
	onDelete,
	onTogglePinned,
	thread,
}: {
	onDelete: () => void;
	onTogglePinned: () => void;
	thread: AssistantThreadSummary;
}) {
	const options: DropdownMenuOption[] = [
		Dropdown.menuOptions.open({
			href: `/dashboard/assistant/${encodeURIComponent(thread.id)}`,
		}),
		{
			id: thread.pinned ? "unpin" : "pin",
			label: thread.pinned ? "Unpin" : "Pin",
			onSelect: onTogglePinned,
		},
		Dropdown.menuOptions.delete({ onSelect: onDelete }),
	];
	return (
		<Dropdown.Menu
			ariaLabel={`Actions for ${thread.title}`}
			openOnHover={false}
			options={options}
			positionStrategy="fixed"
		/>
	);
}

export function AssistantConversationsSurfaceSkeleton() {
	return (
		<DashboardSection
			actions={
				<Button.Skeleton variant="primary">New conversation</Button.Skeleton>
			}
			description="Pinned conversations appear first in the dashboard sidebar, followed by recent activity."
			title="Conversations"
		>
			<DashboardTablePanel.Skeleton
				columns={[
					{ header: "Conversation", id: "conversation" },
					{ header: "Pinned", id: "pinned", responsivePriority: 2 },
					{ header: "Updated", id: "updated", responsivePriority: 1 },
					{
						align: "right",
						header: "Actions",
						id: "actions",
						kind: "action",
					},
				]}
				id="assistant-conversations"
			>
				{["alpha", "bravo", "charlie"].map((key) => (
					<tr key={key}>
						<td
							className="border-b border-border/70 px-4 py-3"
							data-dashboard-table-column-index="0"
							data-dashboard-table-kind="data"
							data-dashboard-table-required="true"
						>
							<div className="grid gap-1">
								<Skeleton className="h-4 w-44" />
								<Skeleton className="h-3 w-72 max-w-full" />
							</div>
						</td>
						<td
							className="border-b border-border/70 px-4 py-3"
							data-dashboard-table-column-index="1"
							data-dashboard-table-kind="data"
							data-dashboard-table-responsive-priority="2"
						>
							<Skeleton className="h-4 w-12" />
						</td>
						<td
							className="border-b border-border/70 px-4 py-3"
							data-dashboard-table-column-index="2"
							data-dashboard-table-kind="data"
							data-dashboard-table-responsive-priority="1"
						>
							<Skeleton className="h-4 w-32" />
						</td>
						<td
							className="sticky right-0 z-10 w-px border-b border-border/70 bg-card px-4 py-3 text-right"
							data-dashboard-table-column-index="3"
							data-dashboard-table-kind="action"
							data-dashboard-table-required="true"
						>
							<Button.Skeleton size="icon-sm" variant="ghost" />
						</td>
					</tr>
				))}
			</DashboardTablePanel.Skeleton>
		</DashboardSection>
	);
}
