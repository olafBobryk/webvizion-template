"use client";

import {
	activeEditor$,
	applyBlockType$,
	applyFormat$,
	applyListType$,
	type CodeBlockEditorDescriptor,
	type CodeBlockEditorProps,
	CodeMirrorEditor,
	cancelLinkEdit$,
	codeBlockPlugin,
	codeMirrorPlugin,
	currentBlockType$,
	currentFormat$,
	currentListType$,
	type DirectiveEditorProps,
	diffSourcePlugin,
	directivesPlugin,
	headingsPlugin,
	IS_BOLD,
	IS_CODE,
	IS_ITALIC,
	IS_STRIKETHROUGH,
	IS_UNDERLINE,
	imagePlugin,
	insertCodeBlock$,
	insertImage$,
	insertMarkdown$,
	insertTable$,
	insertThematicBreak$,
	linkDialogPlugin,
	linkDialogState$,
	linkPlugin,
	listsPlugin,
	MDXEditor,
	type MDXEditorMethods,
	markdownProcessingError$,
	markdownShortcutPlugin,
	openLinkEditDialog$,
	quotePlugin,
	readOnly$,
	removeLink$,
	rootEditor$,
	tablePlugin,
	thematicBreakPlugin,
	toolbarPlugin,
	updateLink$,
	useCellValue,
	useCodeBlockEditorContext,
	useMdastNodeUpdater,
	usePublisher,
	viewMode$,
} from "@mdxeditor/editor";
import { micromark } from "micromark";
import { directive } from "micromark-extension-directive";
import { mdxJsx } from "micromark-extension-mdx-jsx";
import { mdxMd } from "micromark-extension-mdx-md";
import * as React from "react";
import { Icon, type IconName } from "@/components/ui/icons/Icon";
import {
	SelectInput,
	type SelectOption,
	TextInput,
} from "@/components/ui/input";
import { ModalForm } from "@/components/ui/overlays/modal/ModalForm";
import {
	ModalHeader,
	ModalTitle,
} from "@/components/ui/overlays/modal/ModalShell";
import { useModal } from "@/components/ui/overlays/modal/useModal";
import { Button, type ButtonProps } from "@/components/ui/primitives/Button";
import {
	Dropdown,
	type DropdownMenuOption,
} from "@/components/ui/primitives/Dropdown";
import type { ListboxOption } from "@/components/ui/primitives/Listbox";
import { Panel } from "@/components/ui/primitives/Panel";
import { Text } from "@/components/ui/primitives/Text";
import { createMarkdownUserMention } from "@/lib/markdown-mentions";
import type {
	MarkdownEditorDensity,
	MarkdownEditorMentionOption,
} from "./MarkdownEditor";
import { getMarkdownContentClassName } from "./markdownContent";
import { useMarkdownToolbarCollapse } from "./markdownToolbarLayout";

type MarkdownEditorClientProps = {
	ariaLabel: string;
	density: MarkdownEditorDensity;
	disabled: boolean;
	markdown: string;
	mentions?: MarkdownEditorMentionOption[];
	onChange: (markdown: string) => void;
	placeholder?: string;
};

type ToolbarInsertOption = {
	id: "button" | "code" | "divider" | "image" | "table";
	icon: IconName;
	label: string;
};

type DirectiveButtonVariant = NonNullable<ButtonProps["variant"]>;
type DirectiveButtonTone = NonNullable<ButtonProps["tone"]>;
type DirectiveButtonSize = Extract<
	NonNullable<ButtonProps["size"]>,
	"lg" | "md" | "sm" | "xl"
>;

const toolbarInsertOptions: ToolbarInsertOption[] = [
	{ id: "image", icon: "image", label: "Image URL" },
	{ id: "table", icon: "table", label: "Table" },
	{ id: "code", icon: "code", label: "Code block" },
	{ id: "divider", icon: "minus", label: "Divider" },
	{ id: "button", icon: "ellipsis", label: "Button" },
];

const directiveVariantOptions: SelectOption<DirectiveButtonVariant>[] = [
	{ label: "Primary", value: "primary" },
	{ label: "Secondary", value: "secondary" },
	{ label: "Ghost", value: "ghost" },
	{ label: "Inverse", value: "inverse" },
];

const directiveToneOptions: SelectOption<DirectiveButtonTone>[] = [
	{ label: "Default", value: "default" },
	{ label: "Danger", value: "danger" },
];

const directiveSizeOptions: SelectOption<DirectiveButtonSize>[] = [
	{ label: "Small", value: "sm" },
	{ label: "Medium", value: "md" },
	{ label: "Large", value: "lg" },
	{ label: "Extra large", value: "xl" },
];

const codeBlockLanguageOptions = [
	{ label: "Plain text", value: "" },
	{ label: "JavaScript", value: "js" },
	{ label: "JavaScript (React)", value: "jsx" },
	{ label: "TypeScript", value: "ts" },
	{ label: "TypeScript (React)", value: "tsx" },
	{ label: "JSON", value: "json" },
	{ label: "CSS", value: "css" },
	{ label: "HTML", value: "html" },
	{ label: "Markdown", value: "md" },
	{ label: "Shell", value: "bash" },
	{ label: "SQL", value: "sql" },
] as const;

const editorSyntaxExtensions = [mdxJsx(), mdxMd(), directive()];

function isMarkdownSyntaxParseable(markdown: string) {
	try {
		micromark(markdown, { extensions: editorSyntaxExtensions });
		return true;
	} catch {
		return false;
	}
}

function isActiveFormat(currentFormat: number, format: number) {
	return (currentFormat & format) !== 0;
}

function toolbarIcon(name: IconName) {
	return <Icon aria-hidden name={name} size="sm" />;
}

function MarkdownToolbarButton({
	active = false,
	disabled,
	icon,
	onClick,
	title,
}: {
	active?: boolean;
	disabled?: boolean;
	icon: IconName;
	onClick: () => void;
	title: string;
}) {
	return (
		<Button
			aria-label={title}
			aria-pressed={active || undefined}
			className={active ? "!bg-foreground/10 !text-foreground" : undefined}
			disabled={disabled}
			onClick={onClick}
			size="icon-sm"
			title={title}
			type="button"
			variant="ghost"
		>
			{toolbarIcon(icon)}
		</Button>
	);
}

function MarkdownCodeBlockEditor(props: CodeBlockEditorProps) {
	const readOnly = useCellValue(readOnly$);
	const { lexicalNode, parentEditor, setLanguage } =
		useCodeBlockEditorContext();
	const currentLanguage = props.language;
	const hasCurrentLanguage = codeBlockLanguageOptions.some(
		(option) => option.value === currentLanguage,
	);
	const languageOptions: ListboxOption<string>[] = [
		...codeBlockLanguageOptions.map((option) => ({
			content: option.label,
			key: option.value || "plain-text",
			selected: option.value === currentLanguage,
			value: option.value,
		})),
		...(hasCurrentLanguage
			? []
			: [
					{
						content: currentLanguage,
						key: currentLanguage,
						selected: true,
						value: currentLanguage,
					},
				]),
	];
	const currentLanguageLabel =
		codeBlockLanguageOptions.find((option) => option.value === currentLanguage)
			?.label ?? currentLanguage;

	function removeCodeBlock(event: React.MouseEvent<HTMLButtonElement>) {
		event.preventDefault();
		parentEditor.update(() => lexicalNode.remove());
	}

	return (
		<div className="markdown-editor-code-block" data-slot="markdown-code-block">
			<div
				aria-label="Code block actions"
				className="markdown-editor-code-block-toolbar"
				role="toolbar"
			>
				<Dropdown.Listbox
					align="end"
					ariaLabel="Code block language"
					disabled={readOnly}
					menuClassName="w-52 p-0"
					onSelect={setLanguage}
					options={languageOptions}
					positionStrategy="fixed"
					triggerButtonProps={{
						size: "icon-sm",
						title: `Code language: ${currentLanguageLabel}`,
						type: "button",
						variant: "ghost",
					}}
					triggerContent={toolbarIcon("code")}
				/>
				<Button
					aria-label="Delete code block"
					disabled={readOnly}
					onClick={removeCodeBlock}
					size="icon-sm"
					title="Delete code block"
					type="button"
					variant="ghost"
				>
					{toolbarIcon("trash")}
				</Button>
			</div>
			<CodeMirrorEditor {...props} />
		</div>
	);
}

const markdownCodeBlockEditorDescriptor = {
	Editor: MarkdownCodeBlockEditor,
	match: () => true,
	priority: 2,
} satisfies CodeBlockEditorDescriptor;

function MarkdownToolbarSection({
	ariaLabel,
	children,
	collapsed,
	disabled,
	merged,
	options,
	triggerIcon,
}: {
	ariaLabel: string;
	children: React.ReactNode;
	collapsed: boolean;
	disabled: boolean;
	merged: boolean;
	options: DropdownMenuOption[];
	triggerIcon: IconName;
}) {
	if (merged) return null;

	return (
		<div
			className={
				collapsed
					? "flex shrink-0 items-center"
					: "flex shrink-0 items-center gap-1 border-border/70 border-r pr-1.5 last:border-r-0"
			}
		>
			{collapsed ? (
				<Dropdown.Menu
					ariaLabel={ariaLabel}
					disabled={disabled}
					menuClassName="w-56 p-0"
					openOnHover={false}
					options={options}
					positionStrategy="fixed"
					triggerButtonProps={{
						size: "icon-sm",
						title: ariaLabel,
						type: "button",
						variant: "ghost",
					}}
					triggerContent={toolbarIcon(triggerIcon)}
				/>
			) : (
				children
			)}
		</div>
	);
}

function MarkdownImageInsertModal({
	onCancel,
	onInsert,
}: {
	onCancel: () => void;
	onInsert: (src: string, altText: string) => void;
}) {
	const [altText, setAltText] = React.useState("");
	const [src, setSrc] = React.useState("");
	const [error, setError] = React.useState<string>();

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const normalizedSrc = src.trim();
		if (!normalizedSrc) {
			setError("Enter an image URL.");
			return;
		}
		onInsert(normalizedSrc, altText.trim());
		onCancel();
	}

	return (
		<>
			<ModalHeader leadingIcon={toolbarIcon("image")}>
				<ModalTitle>Insert image</ModalTitle>
			</ModalHeader>
			<ModalForm
				contentClassName="grid gap-3"
				footer={
					<>
						<Button onClick={onCancel} type="button" variant="ghost">
							Cancel
						</Button>
						<Button type="submit" variant="primary">
							Insert
						</Button>
					</>
				}
				onSubmit={handleSubmit}
			>
				<TextInput
					error={error}
					inputMode="url"
					label="Image URL"
					onChange={(value) => {
						setSrc(value);
						if (error) setError(undefined);
					}}
					placeholder="https://example.com/image.jpg"
					value={src}
				/>
				<TextInput
					label="Alternative text"
					onChange={setAltText}
					placeholder="Describe the image"
					value={altText}
				/>
			</ModalForm>
		</>
	);
}

function MarkdownLinkDialog() {
	const state = useCellValue(linkDialogState$);
	type LinkPreviewState = Extract<typeof state, { type: "preview" }>;
	type LinkEditDraft = Omit<LinkPreviewState, "type"> & {
		initialUrl: string;
		text: string;
		type: "edit";
		withAnchorText: boolean;
	};
	const rootEditor = useCellValue(rootEditor$);
	const cancelLinkEdit = usePublisher(cancelLinkEdit$);
	const setActiveEditor = usePublisher(activeEditor$);
	const setLinkDialogState = usePublisher(linkDialogState$);
	const updateLink = usePublisher(updateLink$);
	const removeLink = usePublisher(removeLink$);
	const [linkEditDraft, setLinkEditDraft] =
		React.useState<LinkEditDraft | null>(null);
	const [url, setUrl] = React.useState("");
	const [text, setText] = React.useState("");

	function restoreRootEditor() {
		if (rootEditor) setActiveEditor(rootEditor);
	}

	function switchLinkPreviewToEdit() {
		if (!rootEditor || state.type !== "preview") return;

		const links = Array.from(
			rootEditor.getRootElement()?.querySelectorAll("a") ?? [],
		);
		const anchor =
			links.find((link) => {
				const rectangle = link.getBoundingClientRect();
				return (
					link.getAttribute("href") === state.url &&
					Math.abs(rectangle.left + window.scrollX - state.rectangle.left) <
						2 &&
					Math.abs(rectangle.top + window.scrollY - state.rectangle.top) < 2
				);
			}) ?? links.find((link) => link.getAttribute("href") === state.url);
		const text = anchor?.textContent?.trim() ?? "";
		setUrl(state.url);
		setText(text);
		setLinkEditDraft({
			initialUrl: state.url,
			linkNodeKey: state.linkNodeKey,
			rectangle: state.rectangle,
			text,
			title: state.title,
			type: "edit",
			url: state.url,
			withAnchorText: text.length > 0,
		});
	}

	React.useEffect(() => {
		if (state.type !== "edit") return;
		setUrl(state.url);
		setText(state.text ?? "");
	}, [state]);

	const displayState = linkEditDraft ?? state;
	if (displayState.type === "inactive") return <span className="hidden" />;

	const viewportLeft =
		displayState.rectangle.left -
		(typeof window === "undefined" ? 0 : window.scrollX);
	const viewportTop =
		displayState.rectangle.top -
		(typeof window === "undefined" ? 0 : window.scrollY) +
		displayState.rectangle.height +
		8;
	const style = {
		left: Math.max(16, viewportLeft),
		maxWidth: "calc(100vw - 2rem)",
		top: Math.max(16, viewportTop),
	} satisfies React.CSSProperties;

	if (displayState.type === "preview") {
		return (
			<Panel
				background="card"
				border="default"
				className="markdown-editor-link-dialog fixed z-[120] flex items-center gap-2"
				padding="sm"
				shadow="lg"
				style={{ ...style, width: "18rem" }}
			>
				<Text className="min-w-0 flex-1 truncate" variant="support">
					{displayState.url}
				</Text>
				<Button
					onMouseDown={(event) => event.preventDefault()}
					onClick={() => {
						restoreRootEditor();
						switchLinkPreviewToEdit();
					}}
					size="chip"
					type="button"
					variant="ghost"
				>
					Edit
				</Button>
				<Button
					onMouseDown={(event) => event.preventDefault()}
					onClick={() => {
						restoreRootEditor();
						setLinkEditDraft(null);
						removeLink();
					}}
					size="chip"
					type="button"
					variant="ghost"
				>
					Remove
				</Button>
			</Panel>
		);
	}

	return (
		<Panel
			background="card"
			border="default"
			className="markdown-editor-link-dialog fixed z-[120] grid gap-3"
			padding="sm"
			shadow="lg"
			style={{ ...style, width: "20rem" }}
		>
			<form
				className="grid gap-3"
				onSubmit={(event) => {
					event.preventDefault();
					restoreRootEditor();
					setLinkDialogState(displayState);
					updateLink({
						text: displayState.withAnchorText ? text.trim() : undefined,
						title: undefined,
						url: url.trim(),
					});
					setLinkEditDraft(null);
				}}
			>
				<TextInput
					inputMode="url"
					label="URL"
					onChange={setUrl}
					placeholder="https://example.com"
					value={url}
				/>
				{displayState.withAnchorText ? (
					<TextInput label="Text" onChange={setText} value={text} />
				) : null}
				<div className="flex justify-end gap-2">
					<Button
						onClick={() => {
							setLinkEditDraft(null);
							cancelLinkEdit();
						}}
						type="button"
						variant="ghost"
					>
						Cancel
					</Button>
					<Button type="submit" variant="primary">
						Save
					</Button>
				</div>
			</form>
		</Panel>
	);
}

function isDirectiveVariant(value: string): value is DirectiveButtonVariant {
	return directiveVariantOptions.some((option) => option.value === value);
}

function isDirectiveTone(value: string): value is DirectiveButtonTone {
	return directiveToneOptions.some((option) => option.value === value);
}

function isDirectiveSize(value: string): value is DirectiveButtonSize {
	return directiveSizeOptions.some((option) => option.value === value);
}

function MarkdownButtonDirectiveEditor({ mdastNode }: DirectiveEditorProps) {
	const updateNode = useMdastNodeUpdater<never>();
	const [isEditing, setIsEditing] = React.useState(false);
	const attributes = mdastNode.attributes ?? {};
	const label =
		mdastNode.children
			?.map((child) =>
				"value" in child && typeof child.value === "string" ? child.value : "",
			)
			.join("")
			.trim() || "Button";
	const href = typeof attributes.href === "string" ? attributes.href : "/";
	const rawVariant =
		typeof attributes.variant === "string" ? attributes.variant : "";
	const rawTone = typeof attributes.tone === "string" ? attributes.tone : "";
	const rawSize = typeof attributes.size === "string" ? attributes.size : "";
	const variant = isDirectiveVariant(rawVariant) ? rawVariant : "primary";
	const tone = isDirectiveTone(rawTone) ? rawTone : "default";
	const size = isDirectiveSize(rawSize) ? rawSize : "md";

	function updateButton(next: {
		href?: string;
		label?: string;
		size?: DirectiveButtonSize;
		tone?: DirectiveButtonTone;
		variant?: DirectiveButtonVariant;
	}) {
		updateNode({
			attributes: {
				href: next.href ?? href,
				size: next.size ?? size,
				tone: next.tone ?? tone,
				variant: next.variant ?? variant,
			},
			children: [{ type: "text", value: next.label ?? label }],
		} as never);
	}

	return (
		<div className="not-prose my-3 grid gap-2" contentEditable={false}>
			<Button
				onClick={(event) => {
					event.preventDefault();
					setIsEditing(true);
				}}
				size={size}
				tone={tone}
				type="button"
				variant={variant}
			>
				{label}
			</Button>
			{isEditing ? (
				<Panel
					background="muted"
					border="subtle"
					className="grid max-w-xl gap-3"
					padding="sm"
				>
					<TextInput
						label="Label"
						onChange={(value) => updateButton({ label: value })}
						value={label}
					/>
					<TextInput
						inputMode="url"
						label="URL"
						onChange={(value) => updateButton({ href: value })}
						value={href}
					/>
					<div className="grid gap-3 sm:grid-cols-3">
						<SelectInput
							label="Variant"
							onChange={(value) => updateButton({ variant: value })}
							options={directiveVariantOptions}
							value={variant}
						/>
						<SelectInput
							label="Tone"
							onChange={(value) => updateButton({ tone: value })}
							options={directiveToneOptions}
							value={tone}
						/>
						<SelectInput
							label="Size"
							onChange={(value) => updateButton({ size: value })}
							options={directiveSizeOptions}
							value={size}
						/>
					</div>
					<div className="flex justify-end">
						<Button
							onClick={() => setIsEditing(false)}
							size="chip"
							type="button"
							variant="ghost"
						>
							Done
						</Button>
					</div>
				</Panel>
			) : null}
		</div>
	);
}

const buttonDirectiveDescriptor = {
	Editor: MarkdownButtonDirectiveEditor,
	attributes: ["href", "size", "tone", "variant"],
	hasChildren: true,
	name: "button",
	testNode: (node: { name?: string; type?: string }) =>
		node.name === "button" && node.type === "leafDirective",
	type: "leafDirective" as const,
};

function MarkdownEditorToolbar({
	disabled,
	editorRef,
	mentions,
	parseable,
}: {
	disabled: boolean;
	editorRef: React.RefObject<MDXEditorMethods | null>;
	mentions: MarkdownEditorMentionOption[];
	parseable: boolean;
}) {
	const { openModal } = useModal();
	const {
		commandRegionRef,
		historyCollapsed,
		mergeHistoryMenu,
		mergeStructureMenu,
		mergeTextMenu,
		structureCollapsed,
		textCollapsed,
		toolbarRef,
		trailingActionsRef,
	} = useMarkdownToolbarCollapse();
	const activeEditor = useCellValue(activeEditor$);
	const rootEditor = useCellValue(rootEditor$);
	const currentBlockType = useCellValue(currentBlockType$);
	const currentFormat = useCellValue(currentFormat$);
	const currentListType = useCellValue(currentListType$);
	const markdownProcessingError = useCellValue(markdownProcessingError$);
	const viewMode = useCellValue(viewMode$);
	const applyBlockType = usePublisher(applyBlockType$);
	const applyFormat = usePublisher(applyFormat$);
	const applyListType = usePublisher(applyListType$);
	const insertCodeBlock = usePublisher(insertCodeBlock$);
	const insertImage = usePublisher(insertImage$);
	const insertMarkdown = usePublisher(insertMarkdown$);
	const insertTable = usePublisher(insertTable$);
	const insertThematicBreak = usePublisher(insertThematicBreak$);
	const openLinkDialog = usePublisher(openLinkEditDialog$);
	const setViewMode = usePublisher(viewMode$);
	const commandEditor = activeEditor ?? rootEditor;
	const commandsDisabled = disabled || viewMode !== "rich-text";

	function focusAndRun(command: () => void) {
		if (commandsDisabled) return;
		requestAnimationFrame(() => {
			editorRef.current?.focus(command, {
				defaultSelection: "rootEnd",
				preventScroll: true,
			});
		});
	}

	function dispatchHistoryShortcut(direction: "redo" | "undo") {
		const rootElement = commandEditor?.getRootElement();
		if (!rootElement) return;
		const usesMetaKey = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
		rootElement.dispatchEvent(
			new KeyboardEvent("keydown", {
				bubbles: true,
				cancelable: true,
				code: "KeyZ",
				ctrlKey: !usesMetaKey,
				key: "z",
				metaKey: usesMetaKey,
				shiftKey: direction === "redo",
			}),
		);
	}

	function switchViewMode() {
		if (disabled || (viewMode === "source" && !parseable)) return;
		const nextViewMode = viewMode === "source" ? "rich-text" : "source";
		setViewMode(nextViewMode);
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				editorRef.current?.focus(undefined, {
					defaultSelection: "rootEnd",
					preventScroll: true,
				});
			});
		});
	}

	React.useEffect(() => {
		if (parseable || !markdownProcessingError || viewMode === "source") return;
		setViewMode("source");
	}, [markdownProcessingError, parseable, setViewMode, viewMode]);

	const blockOptions: ListboxOption<"h2" | "h3" | "paragraph" | "quote">[] = [
		{ content: "Text", key: "paragraph", value: "paragraph" },
		{ content: "Heading 2", key: "h2", value: "h2" },
		{ content: "Heading 3", key: "h3", value: "h3" },
		{ content: "Quote", key: "quote", value: "quote" },
	];
	const insertOptions: ListboxOption<ToolbarInsertOption>[] =
		toolbarInsertOptions.map((option) => ({
			content: (
				<span className="inline-flex items-center gap-2">
					{toolbarIcon(option.icon)}
					{option.label}
				</span>
			),
			key: option.id,
			value: option,
		}));
	const mentionOptions: ListboxOption<MarkdownEditorMentionOption>[] =
		mentions.map((member) => ({
			content: <span className="truncate">{member.label}</span>,
			key: member.id,
			value: member,
		}));

	function insert(option: ToolbarInsertOption) {
		switch (option.id) {
			case "button":
				focusAndRun(() =>
					insertMarkdown(
						"::button[Button]{href=/ variant=primary tone=default size=md}",
					),
				);
				return;
			case "code":
				focusAndRun(() => insertCodeBlock({ code: "", language: "" }));
				return;
			case "divider":
				focusAndRun(() => insertThematicBreak());
				return;
			case "image":
				openModal(
					({ close }) => (
						<MarkdownImageInsertModal
							onCancel={close}
							onInsert={(src, altText) =>
								focusAndRun(() => insertImage({ altText, src }))
							}
						/>
					),
					{
						ariaLabel: "Insert image",
						cardProps: { maxWidth: "md" },
						id: "markdown-editor-image",
					},
				);
				return;
			case "table":
				focusAndRun(() => insertTable({ columns: 3, rows: 3 }));
				return;
		}
	}

	const historyOptions: DropdownMenuOption[] = [
		{
			disabled: commandsDisabled,
			id: "undo",
			label: "Undo",
			leadingIcon: toolbarIcon("undo"),
			onSelect: () => focusAndRun(() => dispatchHistoryShortcut("undo")),
		},
		{
			disabled: commandsDisabled,
			id: "redo",
			label: "Redo",
			leadingIcon: toolbarIcon("redo"),
			onSelect: () => focusAndRun(() => dispatchHistoryShortcut("redo")),
		},
	];
	const textOptions: DropdownMenuOption[] = [
		{
			active: currentBlockType === "paragraph",
			disabled: commandsDisabled,
			id: "text",
			label: "Text",
			leadingIcon: toolbarIcon("heading"),
			onSelect: () => focusAndRun(() => applyBlockType("paragraph")),
		},
		{
			active: currentBlockType === "h2",
			disabled: commandsDisabled,
			id: "heading-2",
			label: "Heading 2",
			leadingIcon: toolbarIcon("heading"),
			onSelect: () => focusAndRun(() => applyBlockType("h2")),
		},
		{
			active: currentBlockType === "h3",
			disabled: commandsDisabled,
			id: "heading-3",
			label: "Heading 3",
			leadingIcon: toolbarIcon("heading"),
			onSelect: () => focusAndRun(() => applyBlockType("h3")),
		},
		{
			active: isActiveFormat(currentFormat, IS_BOLD),
			disabled: commandsDisabled,
			id: "bold",
			label: "Bold",
			leadingIcon: toolbarIcon("bold"),
			onSelect: () => focusAndRun(() => applyFormat("bold")),
		},
		{
			active: isActiveFormat(currentFormat, IS_ITALIC),
			disabled: commandsDisabled,
			id: "italic",
			label: "Italic",
			leadingIcon: toolbarIcon("italic"),
			onSelect: () => focusAndRun(() => applyFormat("italic")),
		},
		{
			active: isActiveFormat(currentFormat, IS_UNDERLINE),
			disabled: commandsDisabled,
			id: "underline",
			label: "Underline",
			leadingIcon: toolbarIcon("underline"),
			onSelect: () => focusAndRun(() => applyFormat("underline")),
		},
		{
			active: isActiveFormat(currentFormat, IS_STRIKETHROUGH),
			disabled: commandsDisabled,
			id: "strikethrough",
			label: "Strikethrough",
			leadingIcon: toolbarIcon("strikethrough"),
			onSelect: () => focusAndRun(() => applyFormat("strikethrough")),
		},
		{
			active: isActiveFormat(currentFormat, IS_CODE),
			disabled: commandsDisabled,
			id: "inline-code",
			label: "Inline code",
			leadingIcon: toolbarIcon("code"),
			onSelect: () => focusAndRun(() => applyFormat("code")),
		},
		{
			disabled: commandsDisabled,
			id: "link",
			label: "Link",
			leadingIcon: toolbarIcon("link"),
			onSelect: () => focusAndRun(() => openLinkDialog()),
		},
	];
	const structureOptions: DropdownMenuOption[] = [
		{
			active: currentListType === "bullet",
			disabled: commandsDisabled,
			id: "bulleted-list",
			label: "Bulleted list",
			leadingIcon: toolbarIcon("list-bulleted"),
			onSelect: () => focusAndRun(() => applyListType("bullet")),
		},
		{
			active: currentListType === "number",
			disabled: commandsDisabled,
			id: "numbered-list",
			label: "Numbered list",
			leadingIcon: toolbarIcon("list-numbered"),
			onSelect: () => focusAndRun(() => applyListType("number")),
		},
		{
			active: currentListType === "check",
			disabled: commandsDisabled,
			id: "task-list",
			label: "Task list",
			leadingIcon: toolbarIcon("list-checks"),
			onSelect: () => focusAndRun(() => applyListType("check")),
		},
		{
			active: currentBlockType === "quote",
			disabled: commandsDisabled,
			id: "quote",
			label: "Quote",
			leadingIcon: toolbarIcon("quote"),
			onSelect: () => focusAndRun(() => applyBlockType("quote")),
		},
	];
	const mergedSectionOptions = [
		...(mergeHistoryMenu ? historyOptions : []),
		...(mergeTextMenu ? textOptions : []),
		...(mergeStructureMenu ? structureOptions : []),
	];
	const editorOptions: DropdownMenuOption[] = [
		...mergedSectionOptions,
		{
			active: viewMode === "source",
			disabled: disabled || (viewMode === "source" && !parseable),
			dividerBefore: mergedSectionOptions.length > 0,
			id: "source",
			label: viewMode === "source" ? "Formatted text" : "Source",
			leadingIcon: toolbarIcon("code"),
			onSelect: switchViewMode,
		},
	];

	return (
		<div
			className="markdown-editor-toolbar flex w-full min-w-0 items-center overflow-hidden"
			ref={toolbarRef}
		>
			<div
				className="flex min-w-0 flex-1 items-center overflow-hidden"
				ref={commandRegionRef}
			>
				<MarkdownToolbarSection
					ariaLabel="History actions"
					collapsed={historyCollapsed}
					disabled={commandsDisabled}
					merged={mergeHistoryMenu}
					options={historyOptions}
					triggerIcon="history"
				>
					<MarkdownToolbarButton
						disabled={commandsDisabled}
						icon="undo"
						onClick={() => focusAndRun(() => dispatchHistoryShortcut("undo"))}
						title="Undo"
					/>
					<MarkdownToolbarButton
						disabled={commandsDisabled}
						icon="redo"
						onClick={() => focusAndRun(() => dispatchHistoryShortcut("redo"))}
						title="Redo"
					/>
				</MarkdownToolbarSection>
				<MarkdownToolbarSection
					ariaLabel="Text actions"
					collapsed={textCollapsed}
					disabled={commandsDisabled}
					merged={mergeTextMenu}
					options={textOptions}
					triggerIcon="text-format"
				>
					<Dropdown.Listbox
						ariaLabel="Block style"
						disabled={commandsDisabled}
						menuClassName="w-44 p-0"
						onSelect={(value) => focusAndRun(() => applyBlockType(value))}
						options={blockOptions}
						positionStrategy="fixed"
						triggerButtonProps={{
							size: "icon-sm",
							title: "Block style",
							type: "button",
							variant: "ghost",
						}}
						triggerContent={toolbarIcon("heading")}
					/>
					<MarkdownToolbarButton
						active={isActiveFormat(currentFormat, IS_BOLD)}
						disabled={commandsDisabled}
						icon="bold"
						onClick={() => focusAndRun(() => applyFormat("bold"))}
						title="Bold"
					/>
					<MarkdownToolbarButton
						active={isActiveFormat(currentFormat, IS_ITALIC)}
						disabled={commandsDisabled}
						icon="italic"
						onClick={() => focusAndRun(() => applyFormat("italic"))}
						title="Italic"
					/>
					<MarkdownToolbarButton
						active={isActiveFormat(currentFormat, IS_UNDERLINE)}
						disabled={commandsDisabled}
						icon="underline"
						onClick={() => focusAndRun(() => applyFormat("underline"))}
						title="Underline"
					/>
					<MarkdownToolbarButton
						active={isActiveFormat(currentFormat, IS_STRIKETHROUGH)}
						disabled={commandsDisabled}
						icon="strikethrough"
						onClick={() => focusAndRun(() => applyFormat("strikethrough"))}
						title="Strikethrough"
					/>
					<MarkdownToolbarButton
						active={isActiveFormat(currentFormat, IS_CODE)}
						disabled={commandsDisabled}
						icon="code"
						onClick={() => focusAndRun(() => applyFormat("code"))}
						title="Inline code"
					/>
					<MarkdownToolbarButton
						disabled={commandsDisabled}
						icon="link"
						onClick={() => focusAndRun(() => openLinkDialog())}
						title="Link"
					/>
				</MarkdownToolbarSection>
				<MarkdownToolbarSection
					ariaLabel="Structure actions"
					collapsed={structureCollapsed}
					disabled={commandsDisabled}
					merged={mergeStructureMenu}
					options={structureOptions}
					triggerIcon="list-structure"
				>
					<MarkdownToolbarButton
						active={currentListType === "bullet"}
						disabled={commandsDisabled}
						icon="list-bulleted"
						onClick={() => focusAndRun(() => applyListType("bullet"))}
						title="Bulleted list"
					/>
					<MarkdownToolbarButton
						active={currentListType === "number"}
						disabled={commandsDisabled}
						icon="list-numbered"
						onClick={() => focusAndRun(() => applyListType("number"))}
						title="Numbered list"
					/>
					<MarkdownToolbarButton
						active={currentListType === "check"}
						disabled={commandsDisabled}
						icon="list-checks"
						onClick={() => focusAndRun(() => applyListType("check"))}
						title="Task list"
					/>
					<MarkdownToolbarButton
						active={currentBlockType === "quote"}
						disabled={commandsDisabled}
						icon="quote"
						onClick={() => focusAndRun(() => applyBlockType("quote"))}
						title="Quote"
					/>
				</MarkdownToolbarSection>
			</div>
			<div
				className="ml-auto flex shrink-0 items-center gap-1 pl-1.5"
				ref={trailingActionsRef}
			>
				<Dropdown.Listbox
					align="end"
					ariaLabel="Insert"
					disabled={commandsDisabled}
					menuClassName="w-48 p-0"
					onSelect={insert}
					options={insertOptions}
					positionStrategy="fixed"
					triggerButtonProps={{
						size: "icon-sm",
						title: "Insert",
						type: "button",
						variant: "ghost",
					}}
					triggerContent={toolbarIcon("plus")}
				/>
				{mentions.length > 0 ? (
					<Dropdown.Listbox
						align="end"
						ariaLabel="Mention a member"
						disabled={commandsDisabled}
						menuClassName="w-56 p-0"
						onSelect={(member) =>
							focusAndRun(() =>
								insertMarkdown(createMarkdownUserMention(member.id)),
							)
						}
						options={mentionOptions}
						positionStrategy="fixed"
						triggerButtonProps={{
							size: "icon-sm",
							title: "Mention a member",
							type: "button",
							variant: "ghost",
						}}
						triggerContent={toolbarIcon("at")}
					/>
				) : null}
				<span aria-hidden className="mx-0.5 h-5 border-border/70 border-l" />
				<Dropdown.Menu
					align="end"
					ariaLabel="Editor options"
					disabled={disabled}
					menuClassName="w-56 p-0"
					openOnHover={false}
					options={editorOptions}
					positionStrategy="fixed"
					triggerButtonProps={{
						size: "icon-sm",
						title: "Editor options",
						type: "button",
						variant: "ghost",
					}}
					triggerContent={toolbarIcon("ellipsis")}
				/>
			</div>
		</div>
	);
}

export function MarkdownEditorClient({
	ariaLabel,
	density,
	disabled,
	markdown,
	mentions = [],
	onChange,
	placeholder,
}: MarkdownEditorClientProps) {
	const editorRef = React.useRef<MDXEditorMethods>(null);
	const onChangeRef = React.useRef(onChange);
	const pendingInitialChangeRef = React.useRef<string | null>(null);
	const mountedRef = React.useRef(false);
	const markdownSyntaxIsParseable = React.useMemo(
		() => isMarkdownSyntaxParseable(markdown),
		[markdown],
	);
	onChangeRef.current = onChange;

	function handleEditorChange(
		nextMarkdown: string,
		initialMarkdownNormalize: boolean,
	) {
		if (initialMarkdownNormalize && !mountedRef.current) {
			pendingInitialChangeRef.current = nextMarkdown;
			return;
		}

		onChangeRef.current(nextMarkdown);
	}

	React.useEffect(() => {
		mountedRef.current = true;
		if (pendingInitialChangeRef.current !== null) {
			const nextMarkdown = pendingInitialChangeRef.current;
			pendingInitialChangeRef.current = null;
			onChangeRef.current(nextMarkdown);
		}

		return () => {
			mountedRef.current = false;
		};
	}, []);

	React.useEffect(() => {
		const editor = editorRef.current;
		if (!editor || editor.getMarkdown() === markdown) return;
		editor.setMarkdown(markdown);
	}, [markdown]);

	return (
		<div
			className="markdown-editor"
			data-density={density}
			data-disabled={disabled || undefined}
			data-invalid={!markdownSyntaxIsParseable || undefined}
		>
			<MDXEditor
				aria-label={ariaLabel}
				contentEditableClassName={`${getMarkdownContentClassName(density)} markdown-editor-content`}
				markdown={markdown}
				onChange={handleEditorChange}
				placeholder={placeholder ?? "Start writing"}
				plugins={[
					headingsPlugin({ allowedHeadingLevels: [2, 3, 4] }),
					quotePlugin(),
					listsPlugin(),
					linkPlugin(),
					linkDialogPlugin({ LinkDialog: MarkdownLinkDialog }),
					imagePlugin(),
					tablePlugin(),
					codeBlockPlugin({
						codeBlockEditorDescriptors: [markdownCodeBlockEditorDescriptor],
						defaultCodeBlockLanguage: "",
					}),
					codeMirrorPlugin({ codeBlockLanguages: {} }),
					thematicBreakPlugin(),
					directivesPlugin({
						directiveDescriptors: [buttonDirectiveDescriptor],
					}),
					markdownShortcutPlugin(),
					diffSourcePlugin({
						viewMode: markdownSyntaxIsParseable ? "rich-text" : "source",
					}),
					toolbarPlugin({
						toolbarClassName: "markdown-editor-toolbar-shell",
						toolbarContents: () => (
							<MarkdownEditorToolbar
								disabled={disabled}
								editorRef={editorRef}
								mentions={mentions}
								parseable={markdownSyntaxIsParseable}
							/>
						),
					}),
				]}
				readOnly={disabled}
				ref={editorRef}
			/>
			{!markdownSyntaxIsParseable ? (
				<Text
					aria-live="polite"
					className="mt-2 block text-danger"
					theme="inherit"
					variant="caption"
				>
					Fix the Markdown syntax before returning to formatted text.
				</Text>
			) : null}
		</div>
	);
}
