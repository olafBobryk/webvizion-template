"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Icon } from "@/components/ui/icons/Icon";
import { useConfirmationModal } from "@/components/ui/overlays/modal/useConfirmationModal";
import {
	Dropdown,
	type DropdownMenuOption,
} from "@/components/ui/primitives/dropdown";
import type { AssistantThreadSummary } from "@/lib/assistant/contracts";
import { showToast } from "@/lib/feedback";

export function DashboardSidebarThreadActionsMenu({
	active,
	onDelete,
	onUpdate,
	thread,
}: {
	active: boolean;
	onDelete: (threadId: string) => void;
	onUpdate: (thread: AssistantThreadSummary) => void;
	thread: AssistantThreadSummary;
}) {
	const router = useRouter();
	const { openConfirmation } = useConfirmationModal();
	const [pending, setPending] = React.useState(false);

	async function togglePinned() {
		if (pending) return;
		setPending(true);
		try {
			const response = await fetch(
				`/api/assistant/threads/${encodeURIComponent(thread.id)}`,
				{
					body: JSON.stringify({ pinned: !thread.pinned }),
					headers: { "Content-Type": "application/json" },
					method: "PATCH",
				},
			);
			const body = (await response.json().catch(() => ({}))) as {
				error?: string;
				thread?: AssistantThreadSummary;
			};
			if (!response.ok || !body.thread) {
				throw new Error(body.error ?? "Conversation could not be updated.");
			}
			onUpdate(body.thread);
			window.dispatchEvent(new Event("assistant:threads-changed"));
			showToast.success(
				thread.pinned ? "Conversation unpinned." : "Conversation pinned.",
			);
		} catch (error) {
			showToast.error(
				error instanceof Error
					? error.message
					: "Conversation could not be updated.",
			);
		} finally {
			setPending(false);
		}
	}

	function confirmDelete() {
		openConfirmation({
			confirmLabel: "Delete conversation",
			confirmTone: "danger",
			description: `Delete “${thread.title}” and its fixture messages?`,
			onConfirm: async () => {
				setPending(true);
				try {
					const response = await fetch(
						`/api/assistant/threads/${encodeURIComponent(thread.id)}`,
						{ method: "DELETE" },
					);
					if (!response.ok) {
						const body = (await response.json().catch(() => ({}))) as {
							error?: string;
						};
						throw new Error(body.error ?? "Conversation could not be deleted.");
					}
					onDelete(thread.id);
					window.dispatchEvent(new Event("assistant:threads-changed"));
					if (active) router.push("/dashboard/assistant");
					showToast.success("Conversation deleted.");
					return true;
				} catch (error) {
					showToast.error(
						error instanceof Error
							? error.message
							: "Conversation could not be deleted.",
					);
					return false;
				} finally {
					setPending(false);
				}
			},
			title: "Delete conversation?",
			warning:
				"This removes the conversation from the non-durable fixture store.",
		});
	}

	const options: DropdownMenuOption[] = [
		{
			disabled: pending,
			id: thread.pinned ? "unpin" : "pin",
			label: thread.pinned ? "Unpin" : "Pin",
			leadingIcon: (
				<Icon
					name="pin"
					size="sm"
					weight={thread.pinned ? "fill" : "regular"}
				/>
			),
			onSelect: () => void togglePinned(),
		},
		{
			disabled: pending,
			id: "delete",
			label: "Delete",
			leadingIcon: <Icon name="trash" size="sm" />,
			onSelect: confirmDelete,
			tone: "danger",
		},
	];

	return (
		<Dropdown.Menu
			align="end"
			ariaLabel={`Manage ${thread.title}`}
			options={options}
			positionStrategy="fixed"
			triggerButtonProps={{
				className: clsx(
					"shrink-0 text-inherit",
					active ? "opacity-100" : "opacity-55 hover:opacity-100",
				),
				size: "none",
				variant: "ghost",
			}}
		/>
	);
}
