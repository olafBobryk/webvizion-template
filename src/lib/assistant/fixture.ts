import "server-only";

import {
	createHmac,
	randomBytes,
	randomUUID,
	timingSafeEqual,
} from "node:crypto";
import { privateFilePolicy } from "@/lib/auth/private-files";
import { createAssistantApprovalId } from "./approval.server";
import {
	type AssistantActor,
	type AssistantAttachment,
	type AssistantConversationAdapter,
	type AssistantFileAdapter,
	type AssistantMessage,
	type AssistantThread,
	type AssistantThreadSummary,
	assistantLimits,
} from "./contracts";

type StoredFile = {
	actor: AssistantActor;
	attachment: AssistantAttachment;
	bytes: Uint8Array;
	expiresAt: number | null;
};
type AssistantFixtureState = {
	files: Map<string, StoredFile>;
	secret: string;
	threads: Map<string, AssistantThread>;
};

declare global {
	var __averloAssistantFixtureState: AssistantFixtureState | undefined;
}

function cloneThread(thread: AssistantThread): AssistantThread {
	return structuredClone(thread);
}

function normalizeTitle(value: string) {
	return value.trim().replace(/\s+/g, " ").slice(0, 120) || "New conversation";
}

function messagePreview(message?: AssistantMessage) {
	const text = message?.parts.find((part) => part.type === "text");
	if (text?.type === "text" && text.text.trim())
		return text.text.trim().slice(0, 90);
	const file = message?.parts.find((part) => part.type === "file");
	return file?.type === "file" ? file.attachment.filename : "No messages yet";
}

function createSeedThread(actor: AssistantActor): AssistantThread {
	const createdAt = "2026-07-29T09:15:00.000Z";
	const recordOutput = {
		items: [
			{
				id: "north-star",
				status: "active",
				title: "North star",
				url: "/dashboard/records/north-star",
			},
			{
				id: "launch-brief",
				status: "draft",
				title: "Launch brief",
				url: "/dashboard/records/launch-brief",
			},
		],
		total: 2,
	};
	const threadId = "assistant-welcome";
	const approvalPartId = "part-record-archive";
	return {
		createdAt,
		id: threadId,
		messages: [
			{
				createdAt,
				id: "message-welcome-user",
				parts: [
					{
						id: "part-welcome-user",
						text: "Show me the records that need attention, then prepare an archive action for the launch brief.",
						type: "text",
					},
				],
				role: "user",
			},
			{
				createdAt: "2026-07-29T09:15:02.000Z",
				id: "message-welcome-assistant",
				parts: [
					{
						id: "part-welcome-text",
						text: "I found two relevant records. **Launch brief** is still a draft and has not been updated recently.",
						type: "text",
					},
					{
						approvalId: null,
						error: null,
						id: "part-record-list",
						input: { query: "attention" },
						name: "records_list",
						output: recordOutput,
						state: "completed",
						type: "tool",
					},
					{
						approvalId: createAssistantApprovalId({
							actor,
							partId: approvalPartId,
							threadId,
							toolName: "record_archive",
						}),
						error: null,
						id: approvalPartId,
						input: { id: "launch-brief" },
						name: "record_archive",
						output: null,
						state: "approval-requested",
						type: "tool",
					},
				],
				role: "assistant",
			},
		],
		organizationId: actor.organizationId,
		pinned: true,
		title: "Records needing attention",
		updatedAt: "2026-07-29T09:15:02.000Z",
		userId: actor.userId,
	};
}

function getState() {
	globalThis.__averloAssistantFixtureState ??= {
		files: new Map(),
		secret:
			process.env.ASSISTANT_TOOL_APPROVAL_SECRET ??
			randomBytes(32).toString("hex"),
		threads: new Map(),
	};
	return globalThis.__averloAssistantFixtureState;
}

function ensureActorSeed(actor: AssistantActor) {
	const state = getState();
	const seedKey = `${actor.organizationId}:${actor.userId}:assistant-welcome`;
	if (!state.threads.has(seedKey))
		state.threads.set(seedKey, createSeedThread(actor));
}

function key(actor: AssistantActor, id: string) {
	return `${actor.organizationId}:${actor.userId}:${id}`;
}

function actorOwns(actor: AssistantActor, thread: AssistantThread) {
	return (
		thread.organizationId === actor.organizationId &&
		thread.userId === actor.userId
	);
}

export const fixtureConversationAdapter: AssistantConversationAdapter = {
	async appendMessage(actor, threadId, message) {
		const state = getState();
		const existing = state.threads.get(key(actor, threadId));
		if (!existing || !actorOwns(actor, existing))
			throw new Error("Conversation not found.");
		if (existing.messages.length >= assistantLimits.maxMessagesPerThread)
			throw new Error("This conversation has reached its message limit.");
		const next = {
			...existing,
			messages: [...existing.messages, structuredClone(message)],
			updatedAt: message.createdAt,
		};
		state.threads.set(key(actor, threadId), next);
		return cloneThread(next);
	},
	async createThread(actor, title) {
		const now = new Date().toISOString();
		const thread: AssistantThread = {
			createdAt: now,
			id: randomUUID(),
			messages: [],
			organizationId: actor.organizationId,
			pinned: false,
			title: normalizeTitle(title ?? "New conversation"),
			updatedAt: now,
			userId: actor.userId,
		};
		getState().threads.set(key(actor, thread.id), thread);
		return cloneThread(thread);
	},
	async deleteThread(actor, threadId) {
		return getState().threads.delete(key(actor, threadId));
	},
	async getThread(actor, threadId) {
		ensureActorSeed(actor);
		const thread = getState().threads.get(key(actor, threadId));
		return thread && actorOwns(actor, thread) ? cloneThread(thread) : null;
	},
	async listThreads(actor) {
		ensureActorSeed(actor);
		return [...getState().threads.values()]
			.filter((thread) => actorOwns(actor, thread))
			.sort(
				(left, right) =>
					Number(right.pinned) - Number(left.pinned) ||
					right.updatedAt.localeCompare(left.updatedAt),
			)
			.map((thread): AssistantThreadSummary => {
				const { messages, ...summary } = cloneThread(thread);
				return {
					...summary,
					lastMessagePreview: messagePreview(messages.at(-1)),
				};
			});
	},
	async replaceMessage(actor, threadId, message) {
		const state = getState();
		const existing = state.threads.get(key(actor, threadId));
		if (!existing || !actorOwns(actor, existing))
			throw new Error("Conversation not found.");
		const messageIndex = existing.messages.findIndex(
			(candidate) => candidate.id === message.id,
		);
		if (messageIndex < 0) throw new Error("Message not found.");
		const messages = [...existing.messages];
		messages[messageIndex] = structuredClone(message);
		const next = { ...existing, messages, updatedAt: new Date().toISOString() };
		state.threads.set(key(actor, threadId), next);
		return cloneThread(next);
	},
	async updateThread(actor, threadId, patch) {
		const state = getState();
		const existing = state.threads.get(key(actor, threadId));
		if (!existing || !actorOwns(actor, existing)) return null;
		const next = {
			...existing,
			pinned: patch.pinned ?? existing.pinned,
			title:
				patch.title === undefined
					? existing.title
					: normalizeTitle(patch.title),
			updatedAt: new Date().toISOString(),
		};
		state.threads.set(key(actor, threadId), next);
		return cloneThread(next);
	},
};

export const fixtureFileAdapter: AssistantFileAdapter = {
	async create(actor, file) {
		cleanupExpiredFileReservations();
		if (!privateFilePolicy.allowedContentTypes.includes(file.type as never))
			throw new Error("Attach a PDF, JPEG, PNG, or WebP file.");
		if (file.size > privateFilePolicy.maxBytes)
			throw new Error("Attachments must be 10 MiB or smaller.");
		const id = randomUUID();
		const attachment: AssistantAttachment = {
			contentType: file.type,
			createdAt: new Date().toISOString(),
			filename: file.name.slice(0, 180),
			id,
			size: file.size,
			status: "pending",
		};
		const stored: StoredFile = {
			actor,
			attachment,
			bytes: new Uint8Array(),
			expiresAt: Date.now() + 15 * 60 * 1000,
		};
		getState().files.set(key(actor, id), stored);
		try {
			stored.bytes = new Uint8Array(await file.arrayBuffer());
			stored.attachment = { ...attachment, status: "ready" };
			stored.expiresAt = null;
			return { ...stored.attachment };
		} catch (error) {
			stored.attachment = { ...attachment, status: "cleanup-required" };
			stored.expiresAt = Date.now();
			throw error;
		}
	},
	async delete(actor, fileId) {
		return getState().files.delete(key(actor, fileId));
	},
	async get(actor, fileId) {
		const stored = getState().files.get(key(actor, fileId));
		return stored
			? { attachment: { ...stored.attachment }, bytes: stored.bytes.slice() }
			: null;
	},
	async getAccessUrl(actor, fileId) {
		if (!getState().files.has(key(actor, fileId))) return null;
		const expires =
			Math.floor(Date.now() / 1000) +
			privateFilePolicy.signedAccessLifetimeSeconds;
		const token = signFileAccess(actor, fileId, expires);
		return {
			expiresAt: new Date(expires * 1000).toISOString(),
			url: `/api/assistant/files/${encodeURIComponent(fileId)}?expires=${expires}&token=${token}`,
		};
	},
};

function cleanupExpiredFileReservations() {
	const now = Date.now();
	for (const [fileKey, stored] of getState().files) {
		if (stored.expiresAt !== null && stored.expiresAt <= now)
			getState().files.delete(fileKey);
	}
}

function signFileAccess(
	actor: AssistantActor,
	fileId: string,
	expires: number,
) {
	return createHmac("sha256", getState().secret)
		.update(`${actor.organizationId}:${actor.userId}:${fileId}:${expires}`)
		.digest("hex");
}

export function verifyFileAccess(
	actor: AssistantActor,
	fileId: string,
	expires: number,
	token: string,
) {
	if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000))
		return false;
	const expected = signFileAccess(actor, fileId, expires);
	const left = Buffer.from(expected);
	const right = Buffer.from(token);
	return left.length === right.length && timingSafeEqual(left, right);
}
