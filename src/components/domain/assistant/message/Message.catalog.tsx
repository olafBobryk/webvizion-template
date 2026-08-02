"use client";

import * as Assistant from "@/components/domain/assistant";
import type {
	AssistantMessage as AssistantMessageContract,
	AssistantResponseMessage,
	AssistantStagedAttachment,
	AssistantSystemMessage,
	AssistantUserMessage,
} from "@/lib/assistant/contracts";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";

const createdAt = "2026-08-01T09:00:00.000Z";
const userAttachment: AssistantStagedAttachment = {
	accessUrl: "data:application/pdf;base64,",
	contentType: "application/pdf",
	createdAt,
	filename: "launch-brief.pdf",
	id: "attachment-user",
	size: 84_000,
	status: "ready",
};
const assistantAttachment: AssistantStagedAttachment = {
	accessUrl: "data:text/plain;base64,",
	contentType: "text/plain",
	createdAt,
	filename: "record-summary.txt",
	id: "attachment-assistant",
	size: 2_400,
	status: "ready",
};
const userMessage: AssistantUserMessage = {
	createdAt,
	id: "message-user",
	parts: [
		{
			id: "part-user-text",
			text: "Review the attached brief and list the records needing attention.",
			type: "text",
		},
		{
			attachment: userAttachment,
			id: "part-user-file",
			type: "file",
		},
	],
	role: "user",
};
const _singleLineUserMessage: AssistantUserMessage = {
	createdAt,
	id: "message-user-single-line",
	parts: [
		{
			id: "part-user-single-line",
			text: "A compact one-line message.",
			type: "text",
		},
	],
	role: "user",
};
const assistantMessage: AssistantResponseMessage = {
	createdAt,
	id: "message-assistant",
	parts: [
		{
			id: "part-assistant-text",
			text: "I found one record that needs attention.",
			type: "text",
		},
		{
			attachment: assistantAttachment,
			id: "part-assistant-file",
			type: "file",
		},
		{
			approvalId: null,
			error: null,
			id: "part-assistant-tool",
			input: { query: "attention" },
			name: "records_list",
			output: null,
			state: "input-streaming",
			type: "tool",
		},
	],
	role: "assistant",
};
const _groupedToolMessage: AssistantResponseMessage = {
	createdAt,
	id: "message-assistant-grouped-tools",
	parts: [
		{
			approvalId: null,
			error: null,
			id: "part-tool-streaming",
			input: { query: "launch" },
			name: "records_list",
			output: null,
			state: "input-streaming",
			type: "tool",
		},
		{
			approvalId: null,
			error: "The fixture could not load this record.",
			id: "part-tool-error",
			input: { id: "north-star" },
			name: "record_get",
			output: null,
			state: "error",
			type: "tool",
		},
	],
	role: "assistant",
};
const _completedMarkdownMessage: AssistantResponseMessage = {
	createdAt,
	id: "message-assistant-completed-markdown",
	parts: [
		{
			id: "part-assistant-completed-markdown",
			text: [
				"## Review summary",
				"",
				"A [record link](/dashboard/records) with **strong copy**, <u>underlined copy</u>, `inlineCode`, and @[user:4b533f14-6dd0-4dbf-9f73-212be08f5211].",
				"",
				"- [x] Reviewed task",
				"- Ordinary item",
				"",
				"```ts",
				"const status = 'ready';",
				"```",
				"",
				"![Abstract blue portrait composition](/test/placeholder-portrait.jpg)",
				"",
				"| Record | State |",
				"| --- | --- |",
				"| Launch brief | Ready |",
				"",
				"::button[Open records]{href=/dashboard/records variant=ghost size=sm}",
			].join("\n"),
			type: "text",
		},
	],
	role: "assistant",
};
const _streamingMarkdownMessage: AssistantResponseMessage = {
	createdAt,
	id: "message-assistant-streaming-markdown",
	parts: [
		{
			id: "part-assistant-streaming-list",
			text: [
				"## Streaming response",
				"",
				"- First item",
				"- **Second item",
			].join("\n"),
			type: "text",
		},
		{
			id: "part-assistant-streaming-link",
			text: "[Incomplete link](https://example.com",
			type: "text",
		},
		{
			id: "part-assistant-streaming-code",
			text: ["```ts", "const status = 'streaming';"].join("\n"),
			type: "text",
		},
	],
	role: "assistant",
};
const _streamingGeometryMessage: AssistantResponseMessage = {
	createdAt,
	id: "message-assistant-streaming-geometry",
	parts: [
		{
			id: "part-assistant-streaming-geometry",
			text: "A stable one-line Assistant response.",
			type: "text",
		},
	],
	role: "assistant",
};
const _systemMessage: AssistantSystemMessage = {
	createdAt,
	id: "message-system",
	parts: [
		{
			id: "part-system-text",
			text: "This prompt state stays internal.",
			type: "text",
		},
	],
	role: "system",
};
function MessageColumn({ messages }: { messages: AssistantMessageContract[] }) {
	return (
		<div className="grid w-full gap-7 py-6">
			{messages.map((message) => (
				<Assistant.Message key={message.id} message={message} />
			))}
		</div>
	);
}
function CatalogPreview() {
	const render = () => (
		<MessageColumn messages={[userMessage, assistantMessage]} />
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{ message: userMessage } } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "domain-assistant-message",
	name: "Message",
	role: "Role-aware assistant conversation message renderer for text, reasoning, attachments, tools, approvals, and streaming states.",
	importStatement:
		'import * as Assistant from "@/components/domain/assistant";',
	chooseWhen: [
		"Persisted or streaming assistant-thread content must render with the correct user, assistant, attachment, and tool-part treatment.",
	],
	chooseInstead: [
		"Use Assistant.Loading or Assistant.Thinking before a message exists, and Composer for authoring a new turn.",
	],
	compounds: [],
	exclusions: [
		"Page-local chat bubbles that duplicate role or tool-state rendering.",
		"Generic status feedback unrelated to an assistant conversation turn.",
	],
	guarantees: [
		{
			label: "Role Presentation",
			storyId: "domain-assistant-message--role-presentation",
		},
	],
	family: "Domain",
	group: "Assistant",
	previewTargets: [
		{
			id: "role-presentation",
			name: "Role Presentation",
			baseline: {},
			axes: [],
			stage: "wide",
			Render: CatalogPreview,
		},
	],
});
