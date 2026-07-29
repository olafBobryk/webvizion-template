import type { ButtonProps } from "@/components/ui/primitives/Button";
import { splitMarkdownUserMentions } from "@/lib/markdown-mentions";

type MarkdownAstNode = {
	children?: MarkdownAstNode[];
	data?: {
		hName?: string;
		hProperties?: Record<string, unknown>;
	};
	type: string;
	value?: string;
};

const mentionExcludedNodeTypes = new Set([
	"code",
	"html",
	"inlineCode",
	"link",
]);

function transformMarkdownMentions(node: MarkdownAstNode) {
	if (!node.children || mentionExcludedNodeTypes.has(node.type)) return;
	const nextChildren: MarkdownAstNode[] = [];
	for (const child of node.children) {
		if (child.type !== "text" || typeof child.value !== "string") {
			transformMarkdownMentions(child);
			nextChildren.push(child);
			continue;
		}
		const segments = splitMarkdownUserMentions(child.value);
		if (!segments.some((segment) => segment.type === "mention")) {
			nextChildren.push(child);
			continue;
		}
		for (const segment of segments) {
			nextChildren.push(
				segment.type === "text"
					? { type: "text", value: segment.value }
					: {
							data: {
								hName: "span",
								hProperties: { "data-user-mention-id": segment.memberId },
							},
							type: "text",
							value: "@Unknown member",
						},
			);
		}
	}
	node.children = nextChildren;
}

export function remarkUserMentions() {
	return (tree: MarkdownAstNode) => transformMarkdownMentions(tree);
}

const underlineOpenTagPattern = /^<u>$/i;
const underlineCloseTagPattern = /^<\/u>$/i;

function isUnderlineHtmlNode(node: MarkdownAstNode, pattern: RegExp): boolean {
	return (
		node.type === "html" &&
		typeof node.value === "string" &&
		pattern.test(node.value.trim())
	);
}

function findUnderlineClose(children: MarkdownAstNode[], startIndex: number) {
	let depth = 1;
	for (let index = startIndex + 1; index < children.length; index += 1) {
		const child = children[index];
		if (!child) continue;
		if (isUnderlineHtmlNode(child, underlineOpenTagPattern)) {
			depth += 1;
			continue;
		}
		if (!isUnderlineHtmlNode(child, underlineCloseTagPattern)) continue;
		depth -= 1;
		if (depth === 0) return index;
	}
	return -1;
}

function transformMarkdownUnderline(node: MarkdownAstNode) {
	if (!node.children) return;
	const nextChildren: MarkdownAstNode[] = [];

	for (let index = 0; index < node.children.length; index += 1) {
		const child = node.children[index];
		if (!child) continue;

		if (isUnderlineHtmlNode(child, underlineOpenTagPattern)) {
			const closeIndex = findUnderlineClose(node.children, index);
			if (closeIndex >= 0) {
				const underlineNode: MarkdownAstNode = {
					children: node.children.slice(index + 1, closeIndex),
					data: { hName: "u" },
					type: "underline",
				};
				transformMarkdownUnderline(underlineNode);
				nextChildren.push(underlineNode);
				index = closeIndex;
				continue;
			}
		}

		transformMarkdownUnderline(child);
		nextChildren.push(child);
	}

	node.children = nextChildren;
}

export function remarkSafeUnderline() {
	return (tree: MarkdownAstNode) => transformMarkdownUnderline(tree);
}

export function getUserMentionId(node: unknown) {
	if (!node || typeof node !== "object" || !("properties" in node)) return null;
	const properties = node.properties;
	if (!properties || typeof properties !== "object") return null;
	const memberId =
		"dataUserMentionId" in properties
			? properties.dataUserMentionId
			: "data-user-mention-id" in properties
				? properties["data-user-mention-id"]
				: null;
	return typeof memberId === "string" ? memberId : null;
}

type MarkdownSegment =
	| {
			type: "markdown";
			markdown: string;
	  }
	| {
			type: "button";
			button: MarkdownButtonDirective;
	  };

export type MarkdownButtonDirective = {
	href: string;
	label: string;
	size?: MarkdownButtonSize;
	tone?: MarkdownButtonTone;
	variant?: MarkdownButtonVariant;
};

type MarkdownButtonTone = NonNullable<ButtonProps["tone"]>;
type MarkdownButtonVariant = NonNullable<ButtonProps["variant"]>;
type MarkdownButtonSize = Extract<
	NonNullable<ButtonProps["size"]>,
	"lg" | "md" | "sm" | "xl"
>;

const buttonDirectivePattern = /^::button\[([^\]]+)\](?:\{([^}]*)\})?\s*$/;
const directiveOptionPattern =
	/([A-Za-z][A-Za-z0-9_-]*)=(?:"([^"]*)"|'([^']*)'|([^\s}]+))/g;
const buttonVariants = new Set<MarkdownButtonVariant>([
	"ghost",
	"inverse",
	"primary",
	"secondary",
]);
const buttonTones = new Set<MarkdownButtonTone>(["danger", "default"]);
const buttonSizes = new Set<MarkdownButtonSize>(["lg", "md", "sm", "xl"]);

export function isExternalHref(href?: string) {
	return Boolean(href && /^(https?:)?\/\//.test(href));
}

function getOptionValue(match: RegExpExecArray) {
	return match[2] ?? match[3] ?? match[4] ?? "";
}

function parseDirectiveOptions(value?: string) {
	const options = new Map<string, string>();
	if (!value) return options;

	for (const match of value.matchAll(directiveOptionPattern)) {
		options.set(match[1], getOptionValue(match).trim());
	}

	return options;
}

function parseButtonVariant(value?: string) {
	if (!value) return undefined;
	return buttonVariants.has(value as MarkdownButtonVariant)
		? (value as MarkdownButtonVariant)
		: undefined;
}

function parseButtonSize(value?: string) {
	if (!value) return undefined;
	return buttonSizes.has(value as MarkdownButtonSize)
		? (value as MarkdownButtonSize)
		: undefined;
}

function parseButtonTone(value?: string) {
	if (!value) return undefined;
	return buttonTones.has(value as MarkdownButtonTone)
		? (value as MarkdownButtonTone)
		: undefined;
}

function parseButtonDirective(line: string): MarkdownButtonDirective | null {
	const match = line.match(buttonDirectivePattern);
	if (!match) return null;

	const label = match[1]?.trim();
	const options = parseDirectiveOptions(match[2]);
	const href = options.get("href")?.trim();

	if (!label || !href) return null;

	return {
		label,
		href,
		size: parseButtonSize(options.get("size")),
		tone: parseButtonTone(options.get("tone")),
		variant: parseButtonVariant(options.get("variant")),
	};
}

export function splitMarkdownByButtonDirectives(
	markdown: string,
): MarkdownSegment[] {
	const segments: MarkdownSegment[] = [];
	const markdownLines: string[] = [];

	const flushMarkdown = () => {
		if (markdownLines.length === 0) return;

		segments.push({
			type: "markdown",
			markdown: markdownLines.join("\n"),
		});
		markdownLines.length = 0;
	};

	for (const line of markdown.split(/\r?\n/)) {
		const button = parseButtonDirective(line);

		if (!button) {
			markdownLines.push(line);
			continue;
		}

		flushMarkdown();
		segments.push({ type: "button", button });
	}

	flushMarkdown();

	return segments;
}
