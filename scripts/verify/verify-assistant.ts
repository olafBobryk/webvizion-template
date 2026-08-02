import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
	getRecordToolPresentation,
	recordStatusPresentation,
} from "../../src/app/(site)/dashboard/_lib/entities/record/presentation";
import type { AssistantToolState } from "../../src/lib/assistant/contracts";
import { createAssistantToolInputEvents } from "../../src/lib/assistant/tool-input-stream.server";

const root = process.cwd();

const toolInputEvents = createAssistantToolInputEvents({
	input: { id: "launch-brief", title: "Updated launch brief" },
	name: "record_update",
	toolCallId: "tool-call-fixture",
});
assert.equal(toolInputEvents[0]?.type, "tool-input-start");
assert.equal(toolInputEvents.at(-1)?.type, "tool-input-available");
assert.ok(
	toolInputEvents.filter((event) => event.type === "tool-input-delta").length >
		1,
);
assert.equal(
	toolInputEvents
		.filter((event) => event.type === "tool-input-delta")
		.map((event) => event.delta)
		.join(""),
	JSON.stringify({ id: "launch-brief", title: "Updated launch brief" }),
);
const required = [
	"src/app/(site)/dashboard/assistant/page.tsx",
	"src/app/(site)/dashboard/assistant/_components/AssistantNewThreadSurface.tsx",
	"src/app/(site)/dashboard/assistant/[threadId]/page.tsx",
	"src/app/(site)/dashboard/assistant/conversations/page.tsx",
	"src/app/api/assistant/chat/route.ts",
	"src/app/api/assistant/files/route.ts",
	"src/app/api/assistant/tools/route.ts",
	"src/components/domain/assistant/index.ts",
	"src/components/domain/assistant/attachment/index.ts",
	"src/components/domain/assistant/message/index.ts",
	"src/components/domain/assistant/message/Message.tsx",
	"src/components/domain/assistant/message/user/index.ts",
	"src/components/domain/assistant/message/user/UserMessage.tsx",
	"src/components/domain/assistant/message/user/UserMessageAttachments.tsx",
	"src/components/domain/assistant/message/assistant/index.ts",
	"src/components/domain/assistant/message/assistant/AssistantMessage.tsx",
	"src/components/domain/assistant/message/assistant/response/index.ts",
	"src/components/domain/assistant/message/assistant/response/Response.tsx",
	"src/components/domain/assistant/message/assistant/tool-call/index.ts",
	"src/components/domain/assistant/message/assistant/tool-call/ToolCall.tsx",
	"src/components/domain/assistant/message/assistant/tool-call/ToolCallGroup.tsx",
	"src/components/domain/assistant/message/assistant/tool-call/ToolPresentationFrame.tsx",
	"src/components/domain/assistant/message/frame/index.ts",
	"src/components/domain/assistant/message/frame/MessageFrame.tsx",
	"src/lib/assistant/contracts.ts",
	"src/lib/assistant/codex-harness.server.ts",
	"src/lib/assistant/server.ts",
	"src/lib/assistant/tool-input-stream.server.ts",
];

for (const path of required) {
	assert.equal(
		existsSync(resolve(root, path)),
		true,
		`Missing Assistant path: ${path}`,
	);
}

const assistantEntryPage = readFileSync(
	resolve(root, "src/app/(site)/dashboard/assistant/page.tsx"),
	"utf8",
);
const assistantNewThreadSurface = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/assistant/_components/AssistantNewThreadSurface.tsx",
	),
	"utf8",
);
assert.match(assistantEntryPage, /<AssistantNewThreadSurface \/>/u);
assert.doesNotMatch(assistantEntryPage, /AssistantHomeSurface|listThreads/u);
assert.match(assistantNewThreadSurface, /method: "POST"/u);
assert.match(assistantNewThreadSurface, /router\.replace/u);
assert.match(assistantNewThreadSurface, /requestRef\.current \?\?=/u);

const componentSources = [
	"src/components/domain/assistant/attachment/Attachment.tsx",
	"src/components/domain/assistant/Composer.tsx",
	"src/components/domain/assistant/Conversation.tsx",
	"src/components/domain/assistant/message/Message.tsx",
	"src/components/domain/assistant/message/user/UserMessage.tsx",
	"src/components/domain/assistant/message/user/UserMessageAttachments.tsx",
	"src/components/domain/assistant/message/assistant/AssistantMessage.tsx",
	"src/components/domain/assistant/message/assistant/response/Response.tsx",
	"src/components/domain/assistant/message/assistant/tool-call/ToolCall.tsx",
	"src/components/domain/assistant/message/assistant/tool-call/ToolCallGroup.tsx",
	"src/components/domain/assistant/message/assistant/tool-call/ToolPresentationFrame.tsx",
	"src/components/domain/assistant/message/frame/MessageFrame.tsx",
].map((path) => readFileSync(resolve(root, path), "utf8"));

for (const source of componentSources) {
	const sourceWithoutSupportedInputFacade = source.replace(
		/from "@\/components\/ui\/input";/gu,
		"",
	);
	assert.doesNotMatch(
		sourceWithoutSupportedInputFacade,
		/components\/ai-elements|components\/ui\/(?:button|card|dropdown-menu|input|textarea|tooltip)["']/u,
	);
}

const composer = readFileSync(
	resolve(root, "src/components/domain/assistant/Composer.tsx"),
	"utf8",
);
assert.match(composer, /<IconSwap/u);
assert.match(composer, /<Dropdown\.Menu/u);
assert.match(composer, /function ComposerAddMenu/u);
assert.match(composer, /<FileInput/u);
assert.match(composer, /label=\{null\}/u);
assert.match(composer, /showAddControl=\{false\}/u);
assert.match(composer, /unoptimized: true/u);
assert.doesNotMatch(composer, /<Attachment/u);

const inspectableImage = readFileSync(
	resolve(root, "src/components/ui/misc/InspectableImage.tsx"),
	"utf8",
);
const imageInspectModal = readFileSync(
	resolve(root, "src/components/ui/overlays/modal/ImageInspectModal.tsx"),
	"utf8",
);
assert.match(inspectableImage, /unoptimized: imageProps\.unoptimized/u);
assert.match(imageInspectModal, /unoptimized=\{unoptimized\}/u);
assert.match(composer, /ariaLabel="Add context"/u);
assert.match(composer, /label: "Attach files"/u);
assert.match(composer, /triggerContent=\{<Icon name="plus" \/>\}/u);
assert.doesNotMatch(composer, /aria-label="Attach files"/u);
for (const permissionLabel of ["No tools", "Read only", "Read & edit"]) {
	assert.match(composer, new RegExp(permissionLabel, "u"));
}
assert.doesNotMatch(
	composer,
	/description:|layout: "presentation"|menuWidth=/u,
);
assert.match(composer, /<Dropdown\.Listbox/u);
assert.match(composer, /selected: mode === value/u);
assert.match(composer, /tone: mode === "read_write" \? "warning"/u);
assert.match(composer, /value === "read_write" \? "!text-warning"/u);
assert.match(composer, /<Icon name=\{option\.icon\} size="sm" \/>/u);
assert.match(composer, /triggerContent=\{<Icon name=\{current\.icon\} \/>\}/u);
assert.match(composer, /activeIndex=\{busy \? 1 : 0\}/u);
assert.match(composer, /fixtureScenarioPresentation/u);
assert.match(composer, /Fixture: \$\{fixture\.label\}/u);
for (const fixtureLabel of [
	"Random lifecycle turn",
	"Tool call + approval",
	"Plain response",
	"Markdown stress test",
]) {
	assert.match(composer, new RegExp(fixtureLabel.replace("+", "\\+"), "u"));
}

const runtimeAdapter = readFileSync(
	resolve(root, "src/lib/assistant/runtime.server.ts"),
	"utf8",
);
const codexHarness = readFileSync(
	resolve(root, "src/lib/assistant/codex-harness.server.ts"),
	"utf8",
);
assert.match(runtimeAdapter, /requestedMode === "codex_harness"/u);
assert.match(runtimeAdapter, /process\.env\.NODE_ENV === "production"/u);
assert.match(runtimeAdapter, /return codexHarnessResponse\(input\)/u);
assert.match(
	runtimeAdapter,
	/if \(input\.fixtureScenario\) return fixtureResponse\(input\)/u,
);
assert.match(runtimeAdapter, /fixtureScenarioToolCall/u);
assert.match(runtimeAdapter, /randomFixtureTurns/u);
assert.match(runtimeAdapter, /fixtureMarkdownStressResponse/u);
assert.match(runtimeAdapter, /fixturePlainResponse/u);
assert.match(runtimeAdapter, /event\.type === "tool-input-start"/u);
assert.match(runtimeAdapter, /event\.type === "tool-input-delta"/u);
assert.match(runtimeAdapter, /type: "tool-input-available"/u);
assert.match(runtimeAdapter, /streamAssistantToolInput/u);
const chatRoute = readFileSync(
	resolve(root, "src/app/api/assistant/chat/route.ts"),
	"utf8",
);
assert.match(chatRoute, /access\.capabilities\.has\("debug\.use"\)/u);
assert.match(chatRoute, /isAssistantFixtureScenario\(body\.fixtureScenario\)/u);
assert.match(chatRoute, /parsePartialJson/u);
assert.match(chatRoute, /event\.type === "tool-input-start"/u);
assert.match(chatRoute, /event\.type === "tool-input-delta"/u);
assert.match(chatRoute, /event\.type === "tool-input-available"/u);
assert.match(chatRoute, /state: "input-streaming"/u);
assert.match(chatRoute, /: "input-available"/u);
assert.match(codexHarness, /--ephemeral/u);
assert.match(codexHarness, /--ignore-user-config/u);
assert.match(codexHarness, /--ignore-rules/u);
assert.match(codexHarness, /"read-only"/u);
assert.match(codexHarness, /"shell_tool"/u);
assert.match(codexHarness, /MAX_CONTEXT_MESSAGES = 20/u);
assert.match(codexHarness, /DEFAULT_LIFECYCLE_DELAY_MS = 90/u);
assert.match(codexHarness, /yield\* streamHarnessText/u);
assert.match(codexHarness, /codexToolFollowUp/u);
assert.match(codexHarness, /Math\.max\(700, delayMs \* 8\)/u);
assert.match(codexHarness, /activeHarnessRuns >= 1/u);
assert.match(codexHarness, /executeRecordTool/u);
assert.match(composer, /aria-label=\{busy \? "Stop" : "Send message"\}/u);
assert.match(composer, /onClick=\{busy \? onStop : submit\}/u);
assert.match(composer, /<Icon name="arrow-up"/u);
assert.match(composer, /variant="primary"/u);
assert.doesNotMatch(composer, /variant="secondary">\s*Stop/u);

const assistantFacade = readFileSync(
	resolve(root, "src/components/domain/assistant/index.ts"),
	"utf8",
);
assert.match(assistantFacade, /export \{ Message \} from "\.\/message";/u);
assert.doesNotMatch(
	assistantFacade,
	/Attachment|Response|ToolCall|UserMessage|AssistantMessage/u,
);

const messageFacade = readFileSync(
	resolve(root, "src/components/domain/assistant/message/index.ts"),
	"utf8",
);
assert.match(messageFacade, /export \{ Message \} from "\.\/Message";/u);
assert.doesNotMatch(
	messageFacade,
	/UserMessage|AssistantMessage|MessageFrame/u,
);

const privateFamilyFacades = new Map<string, RegExp>([
	[
		"src/components/domain/assistant/attachment/index.ts",
		/export \{ Attachment \} from "\.\/Attachment";/u,
	],
	[
		"src/components/domain/assistant/message/user/index.ts",
		/export \{ UserMessage \} from "\.\/UserMessage";/u,
	],
	[
		"src/components/domain/assistant/message/assistant/index.ts",
		/export \{ AssistantMessage \} from "\.\/AssistantMessage";/u,
	],
	[
		"src/components/domain/assistant/message/assistant/response/index.ts",
		/export \{ Response \} from "\.\/Response";/u,
	],
	[
		"src/components/domain/assistant/message/assistant/tool-call/index.ts",
		/export \{ ToolCall \} from "\.\/ToolCall";/u,
	],
	[
		"src/components/domain/assistant/message/frame/index.ts",
		/export \{ MessageFrame \} from "\.\/MessageFrame";/u,
	],
]);
for (const [path, contract] of privateFamilyFacades) {
	const source = readFileSync(resolve(root, path), "utf8");
	assert.match(source, contract);
	assert.doesNotMatch(source, /export \*/u);
	if (path.endsWith("tool-call/index.ts")) {
		assert.doesNotMatch(source, /ToolPresentationFrame/u);
	}
}

const messageDispatcher = readFileSync(
	resolve(root, "src/components/domain/assistant/message/Message.tsx"),
	"utf8",
);
for (const role of ["user", "assistant", "system"]) {
	assert.match(messageDispatcher, new RegExp(`case "${role}"`, "u"));
}
assert.match(messageDispatcher, /message satisfies never/u);
assert.match(messageDispatcher, /return <UserMessage/u);
assert.match(messageDispatcher, /<AssistantMessage/u);
assert.match(messageDispatcher, /case "system":\s*return null;/u);

const userMessageSource = readFileSync(
	resolve(root, "src/components/domain/assistant/message/user/UserMessage.tsx"),
	"utf8",
);
assert.match(userMessageSource, /AssistantUserMessage/u);
assert.match(userMessageSource, /case "text"/u);
assert.match(userMessageSource, /case "file"/u);
assert.match(userMessageSource, /<UserMessageAttachments/u);
assert.doesNotMatch(userMessageSource, /<Attachment/u);
assert.doesNotMatch(userMessageSource, /ToolCall|<Response/u);

const userMessageAttachmentsSource = readFileSync(
	resolve(
		root,
		"src/components/domain/assistant/message/user/UserMessageAttachments.tsx",
	),
	"utf8",
);
assert.match(userMessageAttachmentsSource, /<FileInput/u);
assert.match(userMessageAttachmentsSource, /mode="read"/u);
assert.match(
	userMessageAttachmentsSource,
	/\/api\/assistant\/files\/.*\/access/u,
);
assert.match(userMessageAttachmentsSource, /unoptimized: true/u);

const assistantMessageSource = readFileSync(
	resolve(
		root,
		"src/components/domain/assistant/message/assistant/AssistantMessage.tsx",
	),
	"utf8",
);
assert.match(assistantMessageSource, /AssistantResponseMessage/u);
assert.match(assistantMessageSource, /case "text"/u);
assert.match(assistantMessageSource, /case "file"/u);
assert.match(assistantMessageSource, /case "tool"/u);
assert.match(assistantMessageSource, /<Response/u);
assert.match(assistantMessageSource, /<Attachment/u);
assert.match(assistantMessageSource, /<ToolCallGroup/u);
assert.match(assistantMessageSource, /renderedToolCalls/u);
assert.match(assistantMessageSource, /part is AssistantToolPart/u);

const toolCallGroupSource = readFileSync(
	resolve(
		root,
		"src/components/domain/assistant/message/assistant/tool-call/ToolCallGroup.tsx",
	),
	"utf8",
);
for (const contract of [
	/<Accordion/u,
	/<ToolCall/u,
	/hasActionableApproval/u,
	/setOpen\(true\)/u,
	/Record tools/u,
	/Approval required/u,
	/"input-available": "Running"/u,
	/"input-streaming": "Pending"/u,
	/variant="caption"/u,
]) {
	assert.match(toolCallGroupSource, contract);
}

const assistantResponseSource = readFileSync(
	resolve(
		root,
		"src/components/domain/assistant/message/assistant/response/Response.tsx",
	),
	"utf8",
);
assert.match(assistantResponseSource, /import \* as Markdown/u);
assert.match(assistantResponseSource, /<Markdown\.Render/u);
assert.match(assistantResponseSource, /density="compact"/u);
assert.match(assistantResponseSource, /streaming=\{streaming\}/u);
assert.match(assistantResponseSource, /variant="result"/u);
assert.doesNotMatch(assistantResponseSource, /streamdown|className=/u);

const toolCallSource = readFileSync(
	resolve(
		root,
		"src/components/domain/assistant/message/assistant/tool-call/ToolCall.tsx",
	),
	"utf8",
);
for (const tool of [
	"records_list",
	"record_get",
	"record_create",
	"record_update",
	"record_archive",
	"record_delete",
]) {
	assert.match(toolCallSource, new RegExp(`case "${tool}"`, "u"));
}
assert.match(toolCallSource, /part\.name satisfies never/u);
assert.doesNotMatch(toolCallSource, /as RecordTool(?:Name|State)|registry/iu);

const toolFrameSource = readFileSync(
	resolve(
		root,
		"src/components/domain/assistant/message/assistant/tool-call/ToolPresentationFrame.tsx",
	),
	"utf8",
);
for (const contract of [
	/<Card/u,
	/<Card\.Header/u,
	/<Card\.Content/u,
	/<Chip/u,
	/presentation\.state === "approval-requested"/u,
	/<ToolApprovalActions/u,
	/<Text\.Skeleton/u,
	/<Chip\.Skeleton/u,
]) {
	assert.match(toolFrameSource, contract);
}

const toolApprovalActionsSource = readFileSync(
	resolve(
		root,
		"src/components/domain/assistant/message/assistant/tool-call/ToolApprovalActions.tsx",
	),
	"utf8",
);
for (const contract of [
	/<Card\.Footer/u,
	/disabled=\{disabled\}/u,
	/>\s*Decline/u,
	/Delete permanently/u,
	/<Button\.Skeleton/u,
]) {
	assert.match(toolApprovalActionsSource, contract);
}

const recordToolCallSource = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/_components/entities/record/RecordToolCall.tsx",
	),
	"utf8",
);
for (const contract of [
	/<ToolPresentationFrame/u,
	/<RecordIdentity presentation=\{item\} variant="default"/u,
	/<RecordStatusChip/u,
	/>\s*Open/u,
	/<ToolPresentationFrame\.Skeleton/u,
	/<RecordIdentity\.Skeleton/u,
	/<RecordStatusChip\.Skeleton/u,
	/sm:grid-cols-\[minmax\(0,1fr\)_auto\]/u,
	/<RecordToolProposal/u,
	/<ErrorState/u,
]) {
	assert.match(recordToolCallSource, contract);
}
assert.doesNotMatch(recordToolCallSource, /<Skeleton/u);
assert.doesNotMatch(recordToolCallSource, /fetch\(|\/api\/assistant/u);

const recordToolProposalSource = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/_components/entities/record/RecordToolProposal.tsx",
	),
	"utf8",
);
for (const contract of [
	/<RecordIdentity/u,
	/<RecordStatusChip/u,
	/<Markdown\.Render/u,
	/<StatusMessage tone="danger"/u,
	/Skeleton: RecordToolProposalSkeleton/u,
	/Current/u,
	/Proposed/u,
	/No changes proposed/u,
	/data-record-tool-proposal-diff/u,
]) {
	assert.match(recordToolProposalSource, contract);
}
assert.doesNotMatch(recordToolProposalSource, /<Card/u);
for (const contract of [
	/api\/assistant\/presentation\/record-tool/u,
	/useRecordProposalPreview/u,
	/proposalPreview=\{proposal\.preview\}/u,
]) {
	assert.match(toolCallSource, contract);
}

const markdownRendererSource = readFileSync(
	resolve(root, "src/components/composites/markdown/MarkdownRenderer.tsx"),
	"utf8",
);
for (const contract of [
	/streaming\?: boolean/u,
	/<ReactMarkdown/u,
	/<Streamdown/u,
	/animated=\{false\}/u,
	/controls=\{false\}/u,
	/className="markdown-streaming-engine"/u,
	/linkSafety=\{\{ enabled: false \}\}/u,
	/mode="streaming"/u,
	/parseIncompleteMarkdown/u,
	/rehypePlugins=\{\[\]\}/u,
	/markdownRemarkPlugins/u,
	/createMarkdownComponents/u,
]) {
	assert.match(markdownRendererSource, contract);
}
assert.doesNotMatch(
	markdownRendererSource,
	/caret=|plugins=|streamdown\/styles/u,
);

const markdownFacade = readFileSync(
	resolve(root, "src/components/composites/markdown/index.ts"),
	"utf8",
);
assert.doesNotMatch(markdownFacade, /Streamdown|streamdown/u);

const messageFrameSource = readFileSync(
	resolve(
		root,
		"src/components/domain/assistant/message/frame/MessageFrame.tsx",
	),
	"utf8",
);
assert.match(messageFrameSource, /<article/u);
assert.match(messageFrameSource, /aria-label=\{ariaLabel\}/u);

const conversationSource = readFileSync(
	resolve(root, "src/components/domain/assistant/Conversation.tsx"),
	"utf8",
);
assert.match(conversationSource, /header\?: React\.ReactNode/u);
assert.match(conversationSource, /absolute inset-x-0 top-0 z-10/u);
assert.match(conversationSource, /pt-20 pb-6/u);

const privateFiles = readFileSync(
	resolve(root, "src/lib/auth/private-files.ts"),
	"utf8",
);
assert.match(privateFiles, /maxBytes:\s*10 \* 1024 \* 1024/u);
assert.match(privateFiles, /application\/pdf/u);

const recordPresentation = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/_lib/entities/record/presentation.ts",
	),
	"utf8",
);
for (const tool of [
	"records_list",
	"record_get",
	"record_create",
	"record_update",
	"record_archive",
	"record_delete",
]) {
	assert.match(recordPresentation, new RegExp(`\\b${tool}\\b`, "u"));
}

const stateExpectations = {
	"approval-requested": { label: "Approval required", tone: "neutral" },
	approved: { label: "Approved", tone: "neutral" },
	completed: { label: "Completed", tone: "success" },
	denied: { label: "Declined", tone: "neutral" },
	error: { label: "Failed", tone: "danger" },
	"input-available": { label: "Running", tone: "neutral" },
	"input-streaming": { label: "Pending", tone: "neutral" },
} as const satisfies Record<
	AssistantToolState,
	{ label: string; tone: string }
>;
for (const [state, expected] of Object.entries(stateExpectations) as Array<
	[AssistantToolState, (typeof stateExpectations)[AssistantToolState]]
>) {
	const presentation = getRecordToolPresentation({
		error: state === "error" ? "Record tool failed." : null,
		input: { id: "north-star" },
		state,
		toolName: "record_get",
	});
	assert.equal(presentation.stateLabel, expected.label);
	assert.equal(presentation.tone, expected.tone);
}

const normalizedToolItem = {
	descriptionMarkdown: "",
	href: "/dashboard/records/north-star",
	id: "north-star",
	slugLabel: "north-star",
	status: recordStatusPresentation.active,
	title: "North star",
	updatedAtLabel: null,
};
const recordOutput = {
	id: normalizedToolItem.id,
	slug: normalizedToolItem.slugLabel,
	status: "active",
	title: normalizedToolItem.title,
	url: normalizedToolItem.href,
};
for (const toolName of [
	"records_list",
	"record_get",
	"record_create",
	"record_update",
	"record_archive",
	"record_delete",
] as const) {
	const output =
		toolName === "records_list"
			? { items: [recordOutput], total: 1 }
			: { record: recordOutput };
	const presentation = getRecordToolPresentation({
		input: { id: "north-star" },
		output,
		state: "completed",
		toolName,
	});
	assert.deepEqual(presentation.items, [normalizedToolItem]);
}

const unknownRecordValues = getRecordToolPresentation({
	input: {},
	output: {
		record: {
			id: "fallback-id",
			status: "unknown",
			title: "Fallback record",
		},
	},
	state: "completed",
	toolName: "record_get",
}).items[0];
assert.equal(unknownRecordValues?.slugLabel, "fallback-id");
assert.equal(unknownRecordValues?.status, null);

const deleteApproval = getRecordToolPresentation({
	input: { id: "north-star" },
	state: "approval-requested",
	toolName: "record_delete",
});
assert.equal(deleteApproval.destructive, true);
assert.equal(deleteApproval.tone, "danger");
assert.match(deleteApproval.description, /cannot be undone/iu);

const assistantIndex = readFileSync(
	resolve(root, "src/components/domain/assistant/index.ts"),
	"utf8",
);
assert.doesNotMatch(assistantIndex, /export \*/u);

const assistantContracts = readFileSync(
	resolve(root, "src/lib/assistant/contracts.ts"),
	"utf8",
);
assert.match(assistantContracts, /maxThreadBytes:\s*50 \* 1024 \* 1024/u);
assert.match(assistantContracts, /type: "tool-input-start"/u);
assert.match(assistantContracts, /type: "tool-input-delta"/u);
assert.match(assistantContracts, /type: "tool-input-available"/u);
assert.doesNotMatch(assistantContracts, /type: "tool-call"/u);
assert.match(assistantContracts, /type: "tool-result"/u);
assert.match(assistantContracts, /export type AssistantUserMessage/u);
assert.match(assistantContracts, /role: "user"/u);
assert.match(
	assistantContracts,
	/Array<AssistantTextPart \| AssistantFilePart>/u,
);
assert.match(assistantContracts, /export type AssistantResponseMessage/u);
assert.match(assistantContracts, /role: "assistant"/u);
assert.match(assistantContracts, /parts: AssistantPart\[\]/u);
assert.match(assistantContracts, /export type AssistantSystemMessage/u);
assert.match(assistantContracts, /role: "system"/u);
assert.match(assistantContracts, /parts: AssistantTextPart\[\]/u);

const assistantFixture = readFileSync(
	resolve(root, "src/lib/assistant/fixture.ts"),
	"utf8",
);
for (const state of ["pending", "ready", "cleanup-required"]) {
	assert.match(assistantFixture, new RegExp(`status: "${state}"`, "u"));
}

const assistantRuntime = readFileSync(
	resolve(root, "src/lib/assistant/runtime.server.ts"),
	"utf8",
);
assert.match(assistantRuntime, /result\.fullStream/u);
assert.match(assistantRuntime, /totalMs:\s*55_000/u);
assert.match(assistantRuntime, /maxRetries:\s*1/u);

const conversationsSurface = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/assistant/conversations/_components/AssistantConversationsSurface.tsx",
	),
	"utf8",
);
assert.match(conversationsSurface, /<DashboardTablePanel/u);
assert.match(conversationsSurface, /<Dropdown\.Menu/u);
assert.match(conversationsSurface, /header: "Conversation"/u);
assert.doesNotMatch(
	conversationsSurface,
	/threads\.map\(\(thread\) => \(\s*<Card/u,
);

const sidebarSupplement = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/_components/layout/DashboardSidebarSupplement.tsx",
	),
	"utf8",
);
assert.match(sidebarSupplement, /AssistantThreadSummary/u);
assert.match(sidebarSupplement, /pinnedThreads/u);
assert.match(sidebarSupplement, /recentThreads/u);
assert.match(sidebarSupplement, /\.slice\(0, 5\)/u);
assert.match(sidebarSupplement, /DashboardSidebarThreadActionsMenu/u);
assert.match(sidebarSupplement, /Pinned conversation/u);
assert.doesNotMatch(sidebarSupplement, /label="All conversations"/u);
assert.doesNotMatch(
	sidebarSupplement,
	/parseSupplementGroup|variant="section"/u,
);

const sidebarNav = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/_components/layout/DashboardSidebarNav.tsx",
	),
	"utf8",
);
assert.match(sidebarNav, /data-sidebar-tier="assistant"/u);
assert.match(sidebarNav, /const assistantSurfaces = group\.surfaces\.filter/u);
assert.match(sidebarNav, /const regularSurfaces = group\.surfaces\.filter/u);
assert.match(sidebarNav, /DashboardSidebarItem/u);
assert.match(sidebarNav, /label="All conversations"/u);
assert.doesNotMatch(
	sidebarNav,
	/pathname !== "\/dashboard\/assistant\/conversations"/u,
);

const sidebarThreadActions = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/_components/layout/DashboardSidebarThreadActionsMenu.tsx",
	),
	"utf8",
);
for (const contract of [
	/<Dropdown\.Menu/u,
	/label: thread\.pinned \? "Unpin" : "Pin"/u,
	/label: "Delete"/u,
	/method: "PATCH"/u,
	/method: "DELETE"/u,
	/useConfirmationModal/u,
	/showToast\.success/u,
	/weight=\{thread\.pinned \? "fill" : "regular"\}/u,
]) {
	assert.match(sidebarThreadActions, contract);
}

const assistantThreadSurface = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/assistant/[threadId]/_components/AssistantThreadSurface.tsx",
	),
	"utf8",
);
assert.match(
	assistantThreadSurface,
	/weight=\{thread\.pinned \? "fill" : "regular"\}/u,
);

const sidebarBranch = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/_components/layout/DashboardSidebarBranch.tsx",
	),
	"utf8",
);
assert.match(sidebarBranch, /renderTrigger/u);
assert.match(sidebarBranch, /export function DashboardSidebarItem/u);
assert.doesNotMatch(sidebarBranch, /DashboardSidebarLeafLink/u);
assert.match(sidebarBranch, /aria-label=.*Collapse.*Expand/u);
assert.match(sidebarBranch, /actions\?: React\.ReactNode/u);
assert.match(sidebarBranch, /actions=\{\s*<Button/u);

const accordionContract = readFileSync(
	resolve(root, "src/components/ui/misc/accordion/Accordion.shared.ts"),
	"utf8",
);
assert.match(accordionContract, /AccordionTriggerRenderProps/u);
assert.match(accordionContract, /renderTrigger/u);

const sidebarDisclosure = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/_components/layout/sidebarDisclosure.ts",
	),
	"utf8",
);
assert.match(sidebarDisclosure, /window\.localStorage/u);

const sidebarShell = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/_components/layout/DashboardSidebarShell.tsx",
	),
	"utf8",
);
for (const contract of [
	/id="dashboard-sidebar"/u,
	/data-dashboard-sidebar-header/u,
	/data-dashboard-sidebar-body/u,
	/data-dashboard-sidebar-footer/u,
	/"pl-\[56px\] lg:pl-\[72px\]"/u,
	/"pl-\[56px\] lg:pl-\[240px\]"/u,
	/"left-\[56px\] lg:left-\[72px\]"/u,
	/"left-\[56px\] lg:left-\[240px\]"/u,
]) {
	assert.match(sidebarShell, contract);
}

const dashboardFrame = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/_components/layout/DashboardFrame.tsx",
	),
	"utf8",
);
assert.match(dashboardFrame, /<DashboardSidebarShell/u);
assert.match(dashboardFrame, /getDashboardSidebarOffsetClassNames/u);
assert.doesNotMatch(dashboardFrame, /placement="footer"/u);
assert.match(dashboardFrame, /<DashboardAccountMenu/u);
assert.match(dashboardFrame, /DashboardFooterActions/u);
assert.match(dashboardFrame, /hrefFor\("dashboard\.support"\)/u);
assert.match(dashboardFrame, /hrefFor\("dashboard\.platform"\)/u);
assert.doesNotMatch(dashboardFrame, /<aside\b/u);
assert.doesNotMatch(dashboardFrame, /id="dashboard-sidebar"/u);

const accountMenu = readFileSync(
	resolve(
		root,
		"src/app/(site)/dashboard/_components/layout/DashboardAccountMenu.tsx",
	),
	"utf8",
);
for (const action of ["Support", "Report issue", "Manage platform"]) {
	assert.doesNotMatch(accountMenu, new RegExp(action, "u"));
}

const assistantThreadsRoute = readFileSync(
	resolve(root, "src/app/api/assistant/threads/route.ts"),
	"utf8",
);
assert.match(assistantThreadsRoute, /NextResponse\.json\(\{ threads \}\)/u);
assert.doesNotMatch(assistantThreadsRoute, /navigation|groups:/u);

console.log("Assistant capability verification passed.");
