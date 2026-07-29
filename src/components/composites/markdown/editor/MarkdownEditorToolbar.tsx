import {
	activeEditor$,
	applyBlockType$,
	applyFormat$,
	applyListType$,
	currentBlockType$,
	currentFormat$,
	currentListType$,
	IS_BOLD,
	IS_CODE,
	IS_ITALIC,
	IS_STRIKETHROUGH,
	IS_UNDERLINE,
	insertCodeBlock$,
	insertImage$,
	insertMarkdown$,
	insertTable$,
	insertThematicBreak$,
	type MDXEditorMethods,
	markdownProcessingError$,
	openLinkEditDialog$,
	rootEditor$,
	useCellValue,
	usePublisher,
	viewMode$,
} from "@mdxeditor/editor";
import * as React from "react";
import { useModal } from "@/components/ui/overlays/modal/useModal";
import {
	Dropdown,
	type DropdownMenuOption,
} from "@/components/ui/primitives/dropdown";
import type { ListboxOption } from "@/components/ui/primitives/Listbox";
import { createMarkdownUserMention } from "@/lib/markdown-mentions";
import { useMarkdownToolbarCollapse } from "../markdownToolbarLayout";
import { MarkdownImageInsertModal } from "./MarkdownImageInsertModal";
import {
	MarkdownToolbarButton,
	MarkdownToolbarSection,
	MarkdownToolbarTrailingActions,
	markdownToolbarIcon as toolbarIcon,
} from "./MarkdownToolbarControls";
import type {
	MarkdownEditorMentionOption,
	MarkdownToolbarInsertOption,
} from "./types";

const toolbarInsertOptions: MarkdownToolbarInsertOption[] = [
	{ id: "image", icon: "image", label: "Image URL" },
	{ id: "table", icon: "table", label: "Table" },
	{ id: "code", icon: "code", label: "Code block" },
	{ id: "divider", icon: "minus", label: "Divider" },
	{ id: "button", icon: "ellipsis", label: "Button" },
];

function isActiveFormat(currentFormat: number, format: number) {
	return (currentFormat & format) !== 0;
}

export function MarkdownEditorToolbar({
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
	const insertOptions: ListboxOption<MarkdownToolbarInsertOption>[] =
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

	function insert(option: MarkdownToolbarInsertOption) {
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
			<MarkdownToolbarTrailingActions
				commandsDisabled={commandsDisabled}
				disabled={disabled}
				editorOptions={editorOptions}
				insertOptions={insertOptions}
				mentionOptions={mentionOptions}
				onInsert={insert}
				onMention={(member) =>
					focusAndRun(() =>
						insertMarkdown(createMarkdownUserMention(member.id)),
					)
				}
				trailingActionsRef={trailingActionsRef}
			/>
		</div>
	);
}
