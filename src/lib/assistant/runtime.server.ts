import "server-only";

import { createOpenAI } from "@ai-sdk/openai";
import { jsonSchema, stepCountIs, streamText, tool } from "ai";
import { codexHarnessResponse } from "@/lib/assistant/codex-harness.server";
import {
	type AssistantFixtureScenario,
	type AssistantMessage,
	type AssistantRuntimeAdapter,
	type AssistantRuntimeEvent,
	type AssistantToolName,
	isAssistantToolName,
} from "./contracts";
import { executeRecordTool } from "./records.server";
import { streamAssistantToolInput } from "./tool-input-stream.server";

function messageText(message: AssistantMessage) {
	const lines: string[] = [];
	for (const part of message.parts) {
		if (part.type === "text") lines.push(part.text);
	}
	return lines.join("\n");
}

function fixtureToolCall(prompt: string): {
	input: unknown;
	name: AssistantToolName;
} | null {
	const normalized = prompt.trim();
	const patterns: Array<{
		match: RegExp;
		name: AssistantToolName;
		toInput: (match: RegExpMatchArray) => unknown;
	}> = [
		{
			match: /\bdelete\s+record\s+([\w-]+)/iu,
			name: "record_delete",
			toInput: (match) => ({ id: match[1] }),
		},
		{
			match: /\barchive\s+record\s+([\w-]+)/iu,
			name: "record_archive",
			toInput: (match) => ({ id: match[1] }),
		},
		{
			match: /\bupdate\s+record\s+([\w-]+)\s+(?:title\s+)?[“"']?(.+?)[”"']?$/iu,
			name: "record_update",
			toInput: (match) => ({ id: match[1], title: match[2]?.trim() }),
		},
		{
			match: /\bcreate\s+record\s+[“"']?(.+?)[”"']?$/iu,
			name: "record_create",
			toInput: (match) => ({ title: match[1]?.trim() }),
		},
		{
			match: /\b(?:get|show|open)\s+record\s+([\w-]+)/iu,
			name: "record_get",
			toInput: (match) => ({ id: match[1] }),
		},
		{
			match:
				/\b(?:list|show|find)\b.*\brecords?\b|\brecords?\b.*\b(?:list|attention)\b/iu,
			name: "records_list",
			toInput: () => ({}),
		},
	];
	for (const pattern of patterns) {
		const match = normalized.match(pattern.match);
		if (match) return { input: pattern.toInput(match), name: pattern.name };
	}
	return null;
}

function fixtureScenarioToolCall(scenario: AssistantFixtureScenario): {
	input: unknown;
	name: AssistantToolName;
} | null {
	switch (scenario) {
		case "random_turn":
		case "plain_response":
		case "markdown_stress":
			return null;
		case "tool_approval":
			return {
				input: {
					descriptionMarkdown:
						"Created by the Assistant lifecycle fixture after explicit approval.",
					status: "draft",
					title: "Fixture approval review",
				},
				name: "record_create",
			};
		case "records_list":
			return { input: {}, name: "records_list" };
		case "record_get":
			return { input: { id: "launch-brief" }, name: "record_get" };
		case "record_error":
			return { input: { id: "missing-record" }, name: "record_get" };
		case "record_create":
			return { input: { title: "Fixture record" }, name: "record_create" };
		case "record_update":
			return {
				input: { id: "launch-brief", title: "Updated launch brief" },
				name: "record_update",
			};
		case "record_archive":
			return { input: { id: "launch-brief" }, name: "record_archive" };
		case "record_delete":
			return { input: { id: "customer-notes" }, name: "record_delete" };
	}

	scenario satisfies never;
}

const randomFixtureTurns = [
	"tool_approval",
	"plain_response",
	"markdown_stress",
] as const satisfies readonly AssistantFixtureScenario[];

function resolveFixtureScenario(
	scenario: AssistantFixtureScenario | undefined,
): AssistantFixtureScenario | undefined {
	if (scenario !== "random_turn") return scenario;
	return randomFixtureTurns[
		Math.floor(Math.random() * randomFixtureTurns.length)
	];
}

const fixturePlainResponse =
	"This is a fixture response without tool calls. It exercises the complete loading, thinking, streaming, and persisted-response lifecycle.";

const fixtureMarkdownStressResponse = `## Markdown rendering check

This streamed response exercises **bold**, *emphasis*, ~~strikethrough~~, <u>safe underline</u>, \`inline code\`, and [an internal link](/dashboard/records).

> A blockquote should remain visually distinct while using the shared design system.

- A regular list item
- A nested list:
  1. First ordered item
  2. Second ordered item
- [x] Completed task
- [ ] Incomplete task

\`\`\`ts
type FixtureState = "loading" | "thinking" | "streaming" | "complete";
const state: FixtureState = "complete";
\`\`\`

| Surface | Expected owner |
| --- | --- |
| Typography | Halo Markdown |
| Streaming recovery | Streamdown |
| Completed output | ReactMarkdown |

---

The fixture is complete.`;

async function* fixtureTextResponse(
	text: string,
): AsyncGenerator<AssistantRuntimeEvent> {
	for (const delta of text.match(/.{1,24}(?:\s|$)|.{1,24}/gu) ?? []) {
		yield { delta, type: "text-delta" };
		await new Promise((resolve) => setTimeout(resolve, 60));
	}
}

function fixtureToolSummary(
	name: AssistantToolName,
	output: unknown,
	error?: string,
) {
	if (error) return `I couldn't complete that lookup. ${error}`;
	const result =
		typeof output === "object" && output !== null
			? (output as Record<string, unknown>)
			: {};
	if (name === "records_list") {
		const items = Array.isArray(result.items) ? result.items : [];
		const titles = items.flatMap((item) =>
			typeof item === "object" &&
			item !== null &&
			"title" in item &&
			typeof item.title === "string"
				? [item.title]
				: [],
		);
		return titles.length > 0
			? `I found ${titles.length} records: ${titles.map((title) => `**${title}**`).join(", ")}.`
			: "I didn't find any matching records.";
	}
	if (name === "record_get") {
		const record =
			typeof result.record === "object" && result.record !== null
				? (result.record as Record<string, unknown>)
				: null;
		return record && typeof record.title === "string"
			? `I found **${record.title}**. Its current status is ${String(record.status ?? "unknown")}.`
			: "I found the requested record.";
	}
	return "The Record tool completed successfully.";
}

async function* fixtureResponse({
	actor,
	canWrite,
	fixtureScenario,
	messages,
	signal,
	toolMode,
}: Parameters<
	AssistantRuntimeAdapter["stream"]
>[0]): AsyncGenerator<AssistantRuntimeEvent> {
	const prompt = messageText(
		messages.at(-1) ?? { createdAt: "", id: "", parts: [], role: "user" },
	);
	const resolvedFixtureScenario = resolveFixtureScenario(fixtureScenario);
	if (resolvedFixtureScenario === "plain_response") {
		yield* fixtureTextResponse(fixturePlainResponse);
		return;
	}
	if (resolvedFixtureScenario === "markdown_stress") {
		yield* fixtureTextResponse(fixtureMarkdownStressResponse);
		return;
	}
	const requestedTool = resolvedFixtureScenario
		? fixtureScenarioToolCall(resolvedFixtureScenario)
		: fixtureToolCall(prompt);
	if (requestedTool) {
		const isWrite = !["records_list", "record_get"].includes(
			requestedTool.name,
		);
		if (toolMode === "off") {
			yield {
				delta:
					"Tool access is disabled. Choose read only or read and edit to run this fixture.",
				type: "text-delta",
			};
			return;
		}
		if (isWrite && toolMode !== "read_write") {
			yield {
				delta:
					"Switch tool access to read and write to prepare that Record change.",
				type: "text-delta",
			};
			return;
		}
		const toolCallId = crypto.randomUUID();
		yield* streamAssistantToolInput({
			delayMs: 160,
			input: requestedTool.input,
			name: requestedTool.name,
			signal,
			toolCallId,
		});
		if (!isWrite) {
			let error: string | undefined;
			let output: unknown;
			try {
				output = await executeRecordTool(
					requestedTool.name,
					requestedTool.input,
					{
						canWrite,
						organizationId: actor.organizationId,
					},
				);
			} catch (caughtError) {
				error =
					caughtError instanceof Error
						? caughtError.message
						: "Record tool failed.";
			}
			await new Promise((resolve) => setTimeout(resolve, 700));
			yield { error, output, toolCallId, type: "tool-result" };
			yield* fixtureTextResponse(
				fixtureToolSummary(requestedTool.name, output, error),
			);
		}
		return;
	}
	const response = prompt.toLowerCase().includes("record")
		? "I can inspect and manage Records. Try “list records” or a specific action such as “archive record launch-brief”."
		: "This template is using its non-durable Assistant fixture. Configure `OPENAI_API_KEY` to connect the provider adapter.";
	yield* fixtureTextResponse(response);
}

const recordInputSchemas = {
	id: jsonSchema<{ id: string }>({
		additionalProperties: false,
		properties: { id: { type: "string" } },
		required: ["id"],
		type: "object",
	}),
	list: jsonSchema<{ includeArchived?: boolean; query?: string }>({
		additionalProperties: false,
		properties: {
			includeArchived: { type: "boolean" },
			query: { type: "string" },
		},
		type: "object",
	}),
	write: jsonSchema<Record<string, unknown>>({ type: "object" }),
};

function providerTools(
	actor: Parameters<AssistantRuntimeAdapter["stream"]>[0]["actor"],
	canWrite: boolean,
	toolMode: Parameters<AssistantRuntimeAdapter["stream"]>[0]["toolMode"],
) {
	if (toolMode === "off") return undefined;
	const readTools = {
		record_get: tool({
			description: "Get one Record by id.",
			execute: (input) =>
				executeRecordTool("record_get", input, {
					canWrite,
					organizationId: actor.organizationId,
				}),
			inputSchema: recordInputSchemas.id,
		}),
		records_list: tool({
			description: "List and search Records in the current organization.",
			execute: (input) =>
				executeRecordTool("records_list", input, {
					canWrite,
					organizationId: actor.organizationId,
				}),
			inputSchema: recordInputSchemas.list,
		}),
	};
	if (toolMode === "read_only") return readTools;
	return {
		...readTools,
		record_archive: tool({
			description: "Prepare archiving a Record. User approval is required.",
			inputSchema: recordInputSchemas.id,
		}),
		record_create: tool({
			description: "Prepare creating a Record. User approval is required.",
			inputSchema: recordInputSchemas.write,
		}),
		record_delete: tool({
			description:
				"Prepare permanently deleting a Record. User approval is required.",
			inputSchema: recordInputSchemas.id,
		}),
		record_update: tool({
			description: "Prepare updating a Record. User approval is required.",
			inputSchema: recordInputSchemas.write,
		}),
	};
}

async function* providerResponse(
	input: Parameters<AssistantRuntimeAdapter["stream"]>[0],
): AsyncGenerator<AssistantRuntimeEvent> {
	const provider = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
	const result = streamText({
		abortSignal: input.signal,
		maxOutputTokens: 1800,
		maxRetries: 1,
		messages: input.messages
			.filter((message) => message.role !== "system")
			.map((message) => ({
				content: messageText(message),
				role: message.role as "assistant" | "user",
			})),
		model: provider(process.env.OPENAI_MODEL ?? "gpt-5.6-terra"),
		system:
			"You are the product Assistant. Be concise, use Markdown, use Record tools when they help, and never claim a tool ran unless the application provides its result. Record writes require explicit user approval.",
		timeout: { totalMs: 55_000 },
		stopWhen: stepCountIs(3),
		tools: providerTools(input.actor, input.canWrite, input.toolMode),
	});
	const startedToolInputs = new Set<string>();
	for await (const event of result.fullStream) {
		if (event.type === "text-delta")
			yield { delta: event.text, type: "text-delta" };
		if (
			event.type === "tool-input-start" &&
			isAssistantToolName(event.toolName)
		) {
			startedToolInputs.add(event.id);
			yield {
				name: event.toolName,
				toolCallId: event.id,
				type: "tool-input-start",
			};
		}
		if (event.type === "tool-input-delta")
			yield {
				delta: event.delta,
				toolCallId: event.id,
				type: "tool-input-delta",
			};
		if (event.type === "tool-call" && isAssistantToolName(event.toolName)) {
			if (!startedToolInputs.has(event.toolCallId)) {
				yield {
					name: event.toolName,
					toolCallId: event.toolCallId,
					type: "tool-input-start",
				};
			}
			yield {
				input: event.input,
				name: event.toolName,
				toolCallId: event.toolCallId,
				type: "tool-input-available",
			};
		}
		if (event.type === "tool-result")
			yield {
				output: event.output,
				toolCallId: event.toolCallId,
				type: "tool-result",
			};
		if (event.type === "tool-error")
			yield {
				error:
					event.error instanceof Error
						? event.error.message
						: "Record tool failed.",
				toolCallId: event.toolCallId,
				type: "tool-result",
			};
	}
}

export const assistantRuntimeAdapter: AssistantRuntimeAdapter = {
	async stream(input) {
		const requestedMode = process.env.ASSISTANT_RUNTIME;
		if (input.fixtureScenario) return fixtureResponse(input);
		if (requestedMode === "codex_harness") {
			if (process.env.NODE_ENV === "production") {
				throw new Error("The local Codex harness is disabled in production.");
			}
			return codexHarnessResponse(input);
		}
		if (requestedMode === "fixture") return fixtureResponse(input);
		if (requestedMode === "openai") {
			if (!process.env.OPENAI_API_KEY) {
				throw new Error("OPENAI_API_KEY is required for the OpenAI runtime.");
			}
			return providerResponse(input);
		}
		if (requestedMode) {
			throw new Error(`Unknown Assistant runtime: ${requestedMode}.`);
		}
		return process.env.OPENAI_API_KEY
			? providerResponse(input)
			: fixtureResponse(input);
	},
};
