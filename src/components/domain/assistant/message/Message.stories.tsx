import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import * as Assistant from "@/components/domain/assistant";
import { IconProvider } from "@/components/ui/icons/iconRegistry";
import { phosphorIconRegistry } from "@/components/ui/icons/phosphorRegistry";
import type {
	AssistantMessage as AssistantMessageContract,
	AssistantResponseMessage,
	AssistantSystemMessage,
	AssistantUserMessage,
} from "@/lib/assistant/contracts";
import { catalogContract } from "./Message.catalog";

const createdAt = "2026-08-01T09:00:00.000Z";

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
			attachment: {
				contentType: "application/pdf",
				createdAt,
				filename: "launch-brief.pdf",
				id: "attachment-user",
				size: 84_000,
				status: "ready",
			},
			id: "part-user-file",
			type: "file",
		},
	],
	role: "user",
};

const singleLineUserMessage: AssistantUserMessage = {
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
			attachment: {
				contentType: "text/plain",
				createdAt,
				filename: "record-summary.txt",
				id: "attachment-assistant",
				size: 2_400,
				status: "ready",
			},
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

const groupedToolMessage: AssistantResponseMessage = {
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

const completedMarkdownMessage: AssistantResponseMessage = {
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

const streamingMarkdownMessage: AssistantResponseMessage = {
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

const streamingGeometryMessage: AssistantResponseMessage = {
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

const systemMessage: AssistantSystemMessage = {
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

const meta = {
	id: "domain-assistant-message",
	title: "Domain/Assistant/Message",
	component: Assistant.Message,
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<IconProvider registry={phosphorIconRegistry}>
				<Story />
			</IconProvider>
		),
	],
	parameters: {
		catalogContract,
		layout: "fullscreen",
		a11y: { test: "error" },
		docs: {
			description: {
				component:
					"The public Assistant message dispatcher. Role-specific renderers stay private while user and Assistant messages share one conversation axis.",
			},
		},
	},
	beforeEach: () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = fn(
			async (input: RequestInfo | URL, init?: RequestInit) => {
				const url = String(input);
				if (url.endsWith("/api/assistant/files/attachment-user/access")) {
					return new Response(
						JSON.stringify({
							expiresAt: "2099-01-01T00:00:00.000Z",
							url: "data:application/pdf;base64,",
						}),
						{ headers: { "Content-Type": "application/json" }, status: 200 },
					);
				}
				return originalFetch(input, init);
			},
		);
		return () => {
			globalThis.fetch = originalFetch;
		};
	},
} satisfies Meta<typeof Assistant.Message>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RolePresentation: Story = {
	args: { message: userMessage },
	// FileInput owns the existing Uploaded-chip contrast finding; keep it visible
	// here without making the Assistant composition redefine that visual token.
	parameters: { a11y: { test: "todo" } },
	render: () => <MessageColumn messages={[userMessage, assistantMessage]} />,
	play: async ({ canvas }) => {
		const userArticle = canvas.getByRole("article", { name: "You" });
		const assistantArticle = canvas.getByRole("article", {
			name: "Assistant",
		});
		const userBody = userArticle.firstElementChild?.firstElementChild;
		const assistantBody = assistantArticle.firstElementChild?.firstElementChild;

		await expect(userArticle).toBeVisible();
		await expect(assistantArticle).toBeVisible();
		await expect(canvas.queryByText(/^You$/u)).toBeNull();
		await expect(canvas.queryByText(/^Assistant$/u)).toBeNull();
		const userFiles = await within(userArticle).findByRole("group", {
			name: "File list",
		});
		await expect(userFiles).toBeVisible();
		await expect(
			within(userArticle).getByRole("button", {
				name: "Open launch-brief.pdf",
			}),
		).toBeInTheDocument();
		await expect(
			within(userArticle).queryByRole("button", {
				name: "Remove launch-brief.pdf",
			}),
		).toBeNull();
		const userText = userArticle.querySelector("p");
		if (!(userText instanceof HTMLElement)) {
			throw new Error("User message text missing");
		}
		await expect(
			Boolean(
				userText.compareDocumentPosition(userFiles) &
					Node.DOCUMENT_POSITION_FOLLOWING,
			),
		).toBe(true);
		await expect(canvas.getByText("record-summary.txt")).toBeVisible();
		const toolTrigger = canvas.getByRole("button", {
			name: "Record tool · 1 call · Pending",
		});
		await expect(toolTrigger).toHaveAttribute("aria-expanded", "false");
		await userEvent.click(toolTrigger);
		await expect(toolTrigger).toHaveAttribute("aria-expanded", "true");
		await expect(canvas.getByText("List records")).toBeInTheDocument();

		const userRect = userArticle.getBoundingClientRect();
		const assistantRect = assistantArticle.getBoundingClientRect();
		await expect(userRect.left).toBe(assistantRect.left);
		await expect(userRect.width).toBe(assistantRect.width);
		await expect(userBody).not.toBeNull();
		await expect(assistantBody).not.toBeNull();
		if (
			!(userBody instanceof HTMLElement) ||
			!(assistantBody instanceof HTMLElement)
		)
			return;
		const userBodyRect = userBody.getBoundingClientRect();
		const assistantBodyRect = assistantBody.getBoundingClientRect();
		const userLeftInset = userBodyRect.left - userRect.left;
		const assistantRightInset = assistantRect.right - assistantBodyRect.right;
		const userStyle = getComputedStyle(userBody);
		await expect(Math.abs(userLeftInset - assistantRightInset)).toBeLessThan(1);
		await expect(userStyle.borderRadius).toBe("22px");
		await expect(userStyle.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
	},
};

export const GroupedToolLifecycle: Story = {
	args: { message: groupedToolMessage },
	render: () => <Assistant.Message message={groupedToolMessage} />,
	play: async ({ canvas }) => {
		const trigger = canvas.getByRole("button", {
			name: "Record tools · 2 calls · Failed",
		});
		await expect(trigger).toHaveAttribute("aria-expanded", "false");
		await userEvent.click(trigger);
		await expect(trigger).toHaveAttribute("aria-expanded", "true");
		await expect(canvas.getByText("List records")).toBeInTheDocument();
		await expect(canvas.getByText("Get record")).toBeInTheDocument();
	},
};

export const SystemMessagesStayInternal: Story = {
	args: { message: systemMessage },
	render: () => <MessageColumn messages={[systemMessage]} />,
	play: async ({ canvas }) => {
		await expect(canvas.queryByRole("article")).toBeNull();
		await expect(
			canvas.queryByText("This prompt state stays internal."),
		).toBeNull();
	},
};

export const CompactSingleLineUser: Story = {
	args: { message: singleLineUserMessage },
	render: () => <MessageColumn messages={[singleLineUserMessage]} />,
	play: async ({ canvas }) => {
		const userArticle = canvas.getByRole("article", { name: "You" });
		const messageAxis = userArticle.firstElementChild;
		const userBody = messageAxis?.firstElementChild;
		await expect(messageAxis).not.toBeNull();
		await expect(userBody).not.toBeNull();
		if (
			!(messageAxis instanceof HTMLElement) ||
			!(userBody instanceof HTMLElement)
		)
			return;
		const axisRect = messageAxis.getBoundingClientRect();
		const bodyRect = userBody.getBoundingClientRect();
		await expect(bodyRect.height).toBe(36);
		await expect(bodyRect.width).toBeLessThan(axisRect.width);
		await expect(Math.abs(bodyRect.right - axisRect.right)).toBeLessThan(1);
		await expect(getComputedStyle(userBody).borderRadius).toBe("22px");
	},
};

export const CompletedMarkdownPresentation: Story = {
	args: { message: completedMarkdownMessage },
	render: () => <Assistant.Message message={completedMarkdownMessage} />,
	play: async ({ canvas }) => {
		const article = canvas.getByRole("article", { name: "Assistant" });
		const renderer = article.querySelector<HTMLElement>(
			'[data-slot="markdown-renderer"][data-variant="result"]',
		);

		await expect(renderer).not.toBeNull();
		await expect(renderer).toHaveClass("markdown-content--compact");
		await expect(
			canvas.getByRole("heading", { name: "Review summary" }),
		).toBeVisible();
		await expect(
			canvas.getByRole("link", { name: "record link" }),
		).toBeVisible();
		await expect(canvas.getByText("inlineCode")).toBeVisible();
		await expect(canvas.getByText("const status = 'ready';")).toBeVisible();
		await expect(canvas.getByRole("table")).toBeVisible();
		await expect(canvas.getByRole("checkbox")).toBeChecked();
		await expect(
			canvas.getByRole("img", {
				name: "Abstract blue portrait composition",
			}),
		).toBeVisible();
		await expect(canvas.getByText("@Unknown member")).toBeVisible();
		await expect(canvas.getByText("underlined copy").tagName).toBe("U");
		await expect(
			canvas.getByRole("link", { name: "Open records" }),
		).toBeVisible();
	},
};

export const StreamingIncompleteMarkdown: Story = {
	args: { message: streamingMarkdownMessage, streaming: true },
	render: () => (
		<Assistant.Message message={streamingMarkdownMessage} streaming />
	),
	play: async ({ canvas }) => {
		const article = canvas.getByRole("article", { name: "Assistant" });
		const renderers = article.querySelectorAll<HTMLElement>(
			'[data-slot="markdown-renderer"][data-variant="result"]',
		);

		await expect(renderers).toHaveLength(3);
		for (const renderer of renderers) {
			await expect(renderer).toHaveClass("markdown-content--compact");
		}
		await expect(
			canvas.getByRole("heading", { name: "Streaming response" }),
		).toBeVisible();
		await expect(
			getComputedStyle(
				canvas.getByRole("heading", { name: "Streaming response" }),
			).marginTop,
		).toBe("0px");
		await expect(canvas.getByText("First item")).toBeVisible();
		await expect(canvas.getByText("Second item")).toBeVisible();
		await expect(canvas.getByText(/Incomplete link/u)).toBeVisible();
		await expect(canvas.getByText("const status = 'streaming';")).toBeVisible();
		await expect(article.textContent).not.toContain("**");
		await expect(article.textContent).not.toContain("```");
		await expect(article.textContent).not.toContain("[blocked]");
		await expect(article.querySelector("[data-streamdown-caret]")).toBeNull();
		await expect(article.querySelector("[data-sd-animate]")).toBeNull();
		for (const controlName of ["Copy", "Download", "Fullscreen"]) {
			await expect(
				canvas.queryByRole("button", { name: new RegExp(controlName, "iu") }),
			).toBeNull();
		}
	},
};

export const StreamingCompletionGeometry: Story = {
	args: { message: streamingGeometryMessage },
	render: () => (
		<div className="grid gap-7 py-6">
			<div data-state="streaming">
				<Assistant.Message message={streamingGeometryMessage} streaming />
			</div>
			<div data-state="complete">
				<Assistant.Message message={streamingGeometryMessage} />
			</div>
		</div>
	),
	play: async ({ canvasElement }) => {
		const streaming = canvasElement.querySelector<HTMLElement>(
			'[data-state="streaming"] [data-slot="markdown-renderer"]',
		);
		const complete = canvasElement.querySelector<HTMLElement>(
			'[data-state="complete"] [data-slot="markdown-renderer"]',
		);
		await expect(streaming).not.toBeNull();
		await expect(complete).not.toBeNull();
		if (!streaming || !complete) return;
		await expect(streaming.getBoundingClientRect().height).toBe(
			complete.getBoundingClientRect().height,
		);
		const streamingTopInset =
			(streaming.firstElementChild?.getBoundingClientRect().top ?? 0) -
			streaming.getBoundingClientRect().top;
		const completeTopInset =
			(complete.firstElementChild?.getBoundingClientRect().top ?? 0) -
			complete.getBoundingClientRect().top;
		await expect(Math.abs(streamingTopInset - completeTopInset)).toBeLessThan(
			0.2,
		);
	},
};
