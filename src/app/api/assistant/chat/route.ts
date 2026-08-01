import { randomUUID } from "node:crypto";
import { parsePartialJson } from "ai";
import { resolveAssistantActor } from "@/lib/assistant/access.server";
import { createAssistantApprovalId } from "@/lib/assistant/approval.server";
import { startAssistantRun } from "@/lib/assistant/runs.server";
import {
	type AssistantMessage,
	type AssistantResponseMessage,
	type AssistantTextPart,
	type AssistantToolMode,
	type AssistantToolPart,
	assistantAdapters,
	assistantLimits,
	isAssistantFixtureScenario,
	isAssistantToolName,
	isAssistantWriteTool,
} from "@/lib/assistant/server";

export const maxDuration = 60;

export async function POST(request: Request) {
	const access = await resolveAssistantActor();
	if (!access) return Response.json({ error: "Unauthorized" }, { status: 401 });
	const body = (await request.json().catch(() => null)) as {
		attachmentIds?: unknown;
		fixtureScenario?: unknown;
		text?: unknown;
		threadId?: unknown;
		toolMode?: unknown;
	} | null;
	if (
		!body ||
		typeof body.threadId !== "string" ||
		typeof body.text !== "string"
	) {
		return Response.json(
			{ error: "Conversation and text are required." },
			{ status: 400 },
		);
	}
	const text = body.text.trim();
	const requestedAttachmentIds = Array.isArray(body.attachmentIds)
		? body.attachmentIds.filter((id): id is string => typeof id === "string")
		: [];
	if (requestedAttachmentIds.length > assistantLimits.maxFilesPerMessage) {
		return Response.json(
			{
				error: `Attach up to ${assistantLimits.maxFilesPerMessage} files per message.`,
			},
			{ status: 400 },
		);
	}
	const attachmentIds = [...new Set(requestedAttachmentIds)];
	const toolMode: AssistantToolMode = [
		"off",
		"read_only",
		"read_write",
	].includes(String(body.toolMode))
		? (body.toolMode as AssistantToolMode)
		: "read_only";
	const fixtureScenario =
		access.capabilities.has("debug.use") &&
		isAssistantFixtureScenario(body.fixtureScenario)
			? body.fixtureScenario
			: undefined;
	if (!text && attachmentIds.length === 0) {
		return Response.json(
			{ error: "Write a message or attach a file." },
			{ status: 400 },
		);
	}
	const thread = await assistantAdapters.conversations.getThread(
		access.actor,
		body.threadId,
	);
	if (!thread) {
		return Response.json({ error: "Conversation not found." }, { status: 404 });
	}
	const files = await Promise.all(
		attachmentIds.map((fileId) =>
			assistantAdapters.files.get(access.actor, fileId),
		),
	);
	if (files.some((file) => !file)) {
		return Response.json(
			{ error: "One or more attachments are unavailable." },
			{ status: 400 },
		);
	}
	const referencedFileIds = new Set(
		thread.messages.flatMap((message) =>
			message.parts.flatMap((part) =>
				part.type === "file" ? [part.attachment.id] : [],
			),
		),
	);
	const existingThreadBytes = thread.messages.reduce(
		(total, message) =>
			total +
			message.parts.reduce(
				(messageTotal, part) =>
					part.type === "file" && referencedFileIds.delete(part.attachment.id)
						? messageTotal + part.attachment.size
						: messageTotal,
				0,
			),
		0,
	);
	const incomingBytes = files.reduce(
		(total, file) => total + (file?.attachment.size ?? 0),
		0,
	);
	if (existingThreadBytes + incomingBytes > assistantLimits.maxThreadBytes) {
		return Response.json(
			{ error: "This conversation has reached its 50 MiB attachment limit." },
			{ status: 400 },
		);
	}
	const userMessage: AssistantMessage = {
		createdAt: new Date().toISOString(),
		id: randomUUID(),
		parts: [
			...(text ? [{ id: randomUUID(), text, type: "text" as const }] : []),
			...files.flatMap((file) =>
				file
					? [
							{
								attachment: file.attachment,
								id: randomUUID(),
								type: "file" as const,
							},
						]
					: [],
			),
		],
		role: "user",
	};
	const updated = await assistantAdapters.conversations.appendMessage(
		access.actor,
		thread.id,
		userMessage,
	);
	if (thread.messages.length === 0) {
		await assistantAdapters.conversations.updateThread(
			access.actor,
			thread.id,
			{
				title: text || files[0]?.attachment.filename || "New conversation",
			},
		);
	}

	let finishRun: (() => void) | null = null;
	try {
		finishRun = startAssistantRun(access.actor);
	} catch (error) {
		return Response.json(
			{
				error:
					error instanceof Error ? error.message : "Assistant unavailable.",
			},
			{ status: 429 },
		);
	}
	const assistantMessage: AssistantResponseMessage = {
		createdAt: new Date().toISOString(),
		id: randomUUID(),
		parts: [],
		role: "assistant",
	};
	const encoder = new TextEncoder();
	const stream = new ReadableStream({
		async start(controller) {
			const send = (value: unknown) =>
				controller.enqueue(encoder.encode(`${JSON.stringify(value)}\n`));
			let activeTextPart: AssistantTextPart | null = null;
			const toolParts = new Map<string, AssistantToolPart>();
			const toolInputTexts = new Map<string, string>();
			const createToolPart = (
				name: AssistantToolPart["name"],
				toolCallId: string,
			) => {
				const existing = toolParts.get(toolCallId);
				if (existing) return existing;
				activeTextPart = null;
				const partId = randomUUID();
				const write = isAssistantWriteTool(name);
				const part: AssistantToolPart = {
					approvalId: write
						? createAssistantApprovalId({
								actor: access.actor,
								partId,
								threadId: thread.id,
								toolName: name,
							})
						: null,
					error: null,
					id: partId,
					input: null,
					name,
					output: null,
					state: "input-streaming",
					type: "tool",
				};
				toolParts.set(toolCallId, part);
				toolInputTexts.set(toolCallId, "");
				assistantMessage.parts.push(part);
				return part;
			};
			try {
				send({
					message: userMessage,
					response: assistantMessage,
					type: "start",
				});
				const chunks = await assistantAdapters.runtime.stream({
					actor: access.actor,
					canWrite: access.capabilities.has("records.write"),
					fixtureScenario,
					messages: updated.messages,
					signal: request.signal,
					toolMode,
				});
				for await (const event of chunks) {
					if (event.type === "text-delta") {
						if (!activeTextPart) {
							activeTextPart = {
								id: randomUUID(),
								text: "",
								type: "text",
							};
							assistantMessage.parts.push(activeTextPart);
						}
						activeTextPart.text += event.delta;
						send({
							delta: event.delta,
							partId: activeTextPart.id,
							type: "delta",
						});
					}
					if (
						event.type === "tool-input-start" &&
						isAssistantToolName(event.name)
					) {
						const part = createToolPart(event.name, event.toolCallId);
						send({ part, type: "tool" });
					}
					if (event.type === "tool-input-delta") {
						const part = toolParts.get(event.toolCallId);
						if (part) {
							const inputText = `${toolInputTexts.get(event.toolCallId) ?? ""}${event.delta}`;
							toolInputTexts.set(event.toolCallId, inputText);
							const partial = await parsePartialJson(inputText);
							if (partial.value !== undefined) part.input = partial.value;
							send({ part, type: "tool" });
						}
					}
					if (
						event.type === "tool-input-available" &&
						isAssistantToolName(event.name)
					) {
						const part = createToolPart(event.name, event.toolCallId);
						part.input = event.input;
						part.state = isAssistantWriteTool(event.name)
							? "approval-requested"
							: "input-available";
						send({ part, type: "tool" });
					}
					if (event.type === "tool-result") {
						const part = toolParts.get(event.toolCallId);
						if (part) {
							part.error = event.error ?? null;
							part.output = event.output ?? null;
							part.state = event.error ? "error" : "completed";
							send({ part, type: "tool" });
						}
					}
				}
				for (const part of toolParts.values()) {
					if (
						part.state === "input-streaming" ||
						part.state === "input-available"
					) {
						part.error = "The tool stopped before producing a result.";
						part.state = "error";
						send({ part, type: "tool" });
					}
				}
				await assistantAdapters.conversations.appendMessage(
					access.actor,
					thread.id,
					assistantMessage,
				);
				send({ message: assistantMessage, type: "done" });
			} catch (error) {
				send({
					error:
						error instanceof Error
							? error.message
							: "Assistant response failed.",
					type: "error",
				});
			} finally {
				finishRun?.();
				controller.close();
			}
		},
	});
	return new Response(stream, {
		headers: {
			"Cache-Control": "no-store",
			"Content-Type": "application/x-ndjson; charset=utf-8",
		},
	});
}
