"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import * as Assistant from "@/components/domain/assistant";
import { Icon } from "@/components/ui/icons/Icon";
import { EditableTextField } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/misc/Skeleton";
import { useConfirmationModal } from "@/components/ui/overlays/modal/useConfirmationModal";
import { Button } from "@/components/ui/primitives/Button";
import type {
	AssistantFixtureScenario,
	AssistantMessage,
	AssistantStagedAttachment,
	AssistantThread,
	AssistantToolMode,
	AssistantToolPart,
} from "@/lib/assistant/contracts";
import { showToast } from "@/lib/feedback";

const assistantConversationHeaderClassName =
	"relative z-10 -mb-10 flex min-h-24 shrink-0 items-center gap-2 bg-[linear-gradient(to_bottom,rgb(var(--color-background-rgb))_0%,rgb(var(--color-background-rgb)/0)_100%)] px-4 pb-10 sm:px-6";
const MIN_LOADING_PHASE_MS = 240;

type AssistantRunPhase = "idle" | "loading" | "streaming" | "thinking";

function notifySidebar() {
	window.dispatchEvent(new Event("assistant:threads-changed"));
}

export function AssistantThreadSurface({
	canWrite,
	fixtureEnabled,
	initialThread,
}: {
	canWrite: boolean;
	fixtureEnabled: boolean;
	initialThread: AssistantThread;
}) {
	const [thread, setThread] = React.useState(initialThread);
	const [attachments, setAttachments] = React.useState<
		AssistantStagedAttachment[]
	>([]);
	const [busy, setBusy] = React.useState(false);
	const [runPhase, setRunPhase] = React.useState<AssistantRunPhase>("idle");
	const [decisionPending, setDecisionPending] = React.useState(false);
	const [toolMode, setToolMode] = React.useState<AssistantToolMode>(
		canWrite ? "read_write" : "read_only",
	);
	const abortRef = React.useRef<AbortController | null>(null);
	const router = useRouter();
	const { openConfirmation } = useConfirmationModal();

	const patchThread = async (patch: { pinned?: boolean; title?: string }) => {
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
		setThread(body.thread);
		notifySidebar();
	};

	const addFiles = async (files: File[]) => {
		const available = Math.max(0, 5 - attachments.length);
		for (const file of files.slice(0, available)) {
			const form = new FormData();
			form.set("file", file);
			try {
				const response = await fetch("/api/assistant/files", {
					body: form,
					method: "POST",
				});
				const body = await response.json();
				if (!response.ok) throw new Error(body.error ?? "Upload failed.");
				setAttachments((current) => [
					...current,
					{ ...body.attachment, accessUrl: body.accessUrl },
				]);
			} catch (error) {
				showToast.error(
					error instanceof Error ? error.message : "Upload failed.",
				);
			}
		}
	};

	const removeAttachment = async (attachment: AssistantStagedAttachment) => {
		setAttachments((current) =>
			current.filter((item) => item.id !== attachment.id),
		);
		await fetch(`/api/assistant/files/${encodeURIComponent(attachment.id)}`, {
			method: "DELETE",
		});
	};

	const submit = async (
		text: string,
		fixtureScenario?: AssistantFixtureScenario,
	) => {
		const submittedAttachments = attachments;
		const optimisticMessageId = `optimistic-${crypto.randomUUID()}`;
		const optimisticMessage: AssistantMessage = {
			createdAt: new Date().toISOString(),
			id: optimisticMessageId,
			parts: [
				...(text.trim()
					? [
							{
								id: crypto.randomUUID(),
								text: text.trim(),
								type: "text" as const,
							},
						]
					: []),
				...submittedAttachments.map((attachment) => ({
					attachment,
					id: crypto.randomUUID(),
					type: "file" as const,
				})),
			],
			role: "user",
		};
		setThread((current) => ({
			...current,
			messages: [...current.messages, optimisticMessage],
		}));
		setAttachments([]);
		setBusy(true);
		setRunPhase("loading");
		const loadingStartedAt = performance.now();
		const controller = new AbortController();
		abortRef.current = controller;
		let streamedMessageId: string | null = null;
		try {
			const response = await fetch("/api/assistant/chat", {
				body: JSON.stringify({
					attachmentIds: submittedAttachments.map(
						(attachment) => attachment.id,
					),
					fixtureScenario,
					text,
					threadId: thread.id,
					toolMode,
				}),
				headers: { "Content-Type": "application/json" },
				method: "POST",
				signal: controller.signal,
			});
			if (!response.ok || !response.body) {
				const body = await response.json().catch(() => ({}));
				throw new Error(body.error ?? "Assistant request failed.");
			}
			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = "";
			while (true) {
				const { done, value } = await reader.read();
				buffer += decoder.decode(value, { stream: !done });
				const lines = buffer.split("\n");
				buffer = lines.pop() ?? "";
				for (const line of lines) {
					if (!line) continue;
					const event = JSON.parse(line) as {
						delta?: string;
						error?: string;
						message?: AssistantMessage;
						part?: AssistantToolPart;
						partId?: string;
						response?: AssistantMessage;
						type: string;
					};
					if (event.type === "start" && event.message && event.response) {
						const serverUserMessage = event.message;
						const serverAssistantMessage = event.response;
						const remainingLoadingMs =
							MIN_LOADING_PHASE_MS - (performance.now() - loadingStartedAt);
						if (remainingLoadingMs > 0) {
							await new Promise((resolve) =>
								setTimeout(resolve, remainingLoadingMs),
							);
						}
						if (controller.signal.aborted)
							throw new Error("Assistant run stopped.");
						streamedMessageId = serverAssistantMessage.id;
						setRunPhase("thinking");
						setThread((current) => {
							const hasOptimisticMessage = current.messages.some(
								(message) => message.id === optimisticMessageId,
							);
							const reconciledMessages = hasOptimisticMessage
								? current.messages.map((message) =>
										message.id === optimisticMessageId
											? serverUserMessage
											: message,
									)
								: [...current.messages, serverUserMessage];
							return {
								...current,
								messages: [...reconciledMessages, serverAssistantMessage],
							};
						});
					}
					if (event.type === "delta" && event.delta && streamedMessageId) {
						setRunPhase("streaming");
						const messageId = streamedMessageId;
						const delta = event.delta;
						const textPartId = event.partId;
						setThread((current) => ({
							...current,
							messages: current.messages.map((message) => {
								if (message.id !== messageId || message.role !== "assistant")
									return message;
								if (
									textPartId &&
									!message.parts.some((part) => part.id === textPartId)
								) {
									return {
										...message,
										parts: [
											...message.parts,
											{
												id: textPartId,
												text: delta,
												type: "text" as const,
											},
										],
									};
								}
								return {
									...message,
									parts: message.parts.map((part) =>
										part.type === "text" &&
										(!textPartId || part.id === textPartId)
											? { ...part, text: part.text + delta }
											: part,
									),
								};
							}),
						}));
					}
					if (event.type === "tool" && event.part && streamedMessageId) {
						setRunPhase("streaming");
						const messageId = streamedMessageId;
						setThread((current) => ({
							...current,
							messages: current.messages.map((message) => {
								if (message.id !== messageId || message.role !== "assistant")
									return message;
								const exists = message.parts.some(
									(part) => part.id === event.part?.id,
								);
								return {
									...message,
									parts: exists
										? message.parts.map((part) =>
												part.id === event.part?.id ? event.part : part,
											)
										: [...message.parts, event.part as AssistantToolPart],
								};
							}),
						}));
					}
					if (event.type === "done" && event.message) {
						setRunPhase("idle");
						setThread((current) => ({
							...current,
							messages: current.messages.map((message) =>
								message.id === event.message?.id
									? (event.message as AssistantMessage)
									: message,
							),
						}));
					}
					if (event.type === "error")
						throw new Error(event.error ?? "Assistant request failed.");
				}
				if (done) break;
			}
			notifySidebar();
		} catch (error) {
			if (controller.signal.aborted && streamedMessageId) {
				const messageId = streamedMessageId;
				setThread((current) => ({
					...current,
					messages: current.messages.map((message) =>
						message.id === messageId && message.role === "assistant"
							? {
									...message,
									parts: message.parts.map((part) =>
										part.type === "tool" &&
										(part.state === "input-streaming" ||
											part.state === "input-available")
											? {
													...part,
													error: "Tool preparation was stopped.",
													state: "error" as const,
												}
											: part,
									),
								}
							: message,
					),
				}));
			}
			if (!controller.signal.aborted)
				showToast.error(
					error instanceof Error ? error.message : "Assistant request failed.",
				);
		} finally {
			abortRef.current = null;
			setBusy(false);
			setRunPhase("idle");
		}
	};

	const decideTool = async (
		message: AssistantMessage,
		part: AssistantToolPart,
		approved: boolean,
	) => {
		if (!part.approvalId) return;
		setDecisionPending(true);
		try {
			const response = await fetch("/api/assistant/tools", {
				body: JSON.stringify({
					approvalId: part.approvalId,
					approved,
					messageId: message.id,
					partId: part.id,
					threadId: thread.id,
				}),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			});
			const body = await response.json();
			if (!response.ok)
				throw new Error(body.error ?? "Could not record approval.");
			setThread((current) => ({
				...current,
				messages: current.messages.map((item) =>
					item.id === message.id
						? {
								...item,
								parts: item.parts.map((candidate) =>
									candidate.id === part.id ? body.part : candidate,
								),
							}
						: item,
				),
			}));
			showToast.success(
				approved ? "Record action completed." : "Record action declined.",
			);
		} catch (error) {
			showToast.error(
				error instanceof Error ? error.message : "Could not record approval.",
			);
		} finally {
			setDecisionPending(false);
		}
	};

	const deleteThread = () =>
		openConfirmation({
			confirmLabel: "Delete conversation",
			confirmTone: "danger",
			description: `Delete “${thread.title}” and all of its messages?`,
			onConfirm: async () => {
				const response = await fetch(
					`/api/assistant/threads/${encodeURIComponent(thread.id)}`,
					{ method: "DELETE" },
				);
				if (!response.ok) return false;
				notifySidebar();
				router.replace("/dashboard/assistant/conversations");
				return true;
			},
			title: "Delete conversation?",
			warning: "This action cannot be undone.",
		});

	return (
		<section
			className="flex h-full min-h-0 flex-col bg-background"
			aria-label="Assistant conversation"
		>
			<Assistant.Conversation
				header={
					<header className={assistantConversationHeaderClassName}>
						<EditableTextField
							ariaLabel="Edit conversation title"
							className="min-w-0 max-w-md"
							displayClassName="text-sm font-semibold hover:text-primary"
							editAriaLabel="Conversation title"
							onSave={(nextTitle) => patchThread({ title: nextTitle })}
							presentation="inline"
							required
							value={thread.title}
						/>
						<div className="ml-auto flex gap-1">
							<Button
								aria-label={
									thread.pinned ? "Unpin conversation" : "Pin conversation"
								}
								onClick={() =>
									void patchThread({ pinned: !thread.pinned }).catch((error) =>
										showToast.error(error.message),
									)
								}
								size="icon-sm"
								variant="ghost"
							>
								<Icon name="pin" weight={thread.pinned ? "fill" : "regular"} />
							</Button>
							<Button
								aria-label="View conversations"
								href="/dashboard/assistant/conversations"
								leadingIcon="history"
								size="icon-sm"
								variant="ghost"
							/>
							<Button
								aria-label="Delete conversation"
								leadingIcon="trash"
								onClick={deleteThread}
								size="icon-sm"
								tone="danger"
								variant="ghost"
							/>
						</div>
					</header>
				}
			>
				{thread.messages.length === 0 ? (
					<div className="mx-auto grid max-w-xl gap-2 px-6 py-20 text-center">
						<div className="text-lg font-semibold">
							What would you like to work on?
						</div>
						<p className="text-muted-foreground text-sm">
							Ask about Records, attach a private file, or prepare a change for
							approval.
						</p>
					</div>
				) : null}
				{thread.messages.map((message) => (
					<Assistant.Message
						decisionPending={decisionPending}
						key={message.id}
						message={message}
						onToolDecision={(part, approved) =>
							void decideTool(message, part, approved)
						}
						streaming={
							busy &&
							message.id === thread.messages.at(-1)?.id &&
							message.role === "assistant"
						}
					/>
				))}
				{runPhase === "loading" ? <Assistant.Loading /> : null}
				{runPhase === "thinking" ? <Assistant.Thinking /> : null}
			</Assistant.Conversation>
			<Assistant.Composer
				attachments={attachments}
				busy={busy}
				canWrite={canWrite}
				disabled={decisionPending}
				fixtureEnabled={fixtureEnabled}
				onAddFiles={(files) => void addFiles(files)}
				onRemoveAttachment={(attachment) => void removeAttachment(attachment)}
				onStop={() => abortRef.current?.abort()}
				onSubmit={(text, fixtureScenario) => void submit(text, fixtureScenario)}
				onToolModeChange={setToolMode}
				toolMode={toolMode}
			/>
		</section>
	);
}

export function AssistantThreadSurfaceSkeleton() {
	return (
		<section className="flex h-full min-h-0 flex-col">
			<div className={assistantConversationHeaderClassName}>
				<Skeleton className="h-5 w-56" />
				<div className="ml-auto flex gap-1">
					<Button.Skeleton size="icon-sm" variant="ghost" />
					<Button.Skeleton size="icon-sm" variant="ghost" />
					<Button.Skeleton size="icon-sm" variant="ghost" />
				</div>
			</div>
			<div className="mx-auto grid w-full max-w-3xl flex-1 content-start gap-8 px-4 py-10 sm:px-6">
				<Skeleton className="h-24 w-4/5" />
				<Skeleton className="ml-auto h-20 w-2/3" />
				<Skeleton className="h-36 w-full" />
			</div>
			<div className="mx-auto w-full max-w-3xl px-4 pb-4 sm:px-6">
				<Skeleton className="h-28 w-full rounded-2xl" />
			</div>
		</section>
	);
}
