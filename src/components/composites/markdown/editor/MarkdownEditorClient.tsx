"use client";

import {
	codeBlockPlugin,
	codeMirrorPlugin,
	diffSourcePlugin,
	directivesPlugin,
	headingsPlugin,
	imagePlugin,
	linkDialogPlugin,
	linkPlugin,
	listsPlugin,
	MDXEditor,
	type MDXEditorMethods,
	markdownShortcutPlugin,
	quotePlugin,
	tablePlugin,
	thematicBreakPlugin,
	toolbarPlugin,
} from "@mdxeditor/editor";
import { micromark } from "micromark";
import { directive } from "micromark-extension-directive";
import { mdxJsx } from "micromark-extension-mdx-jsx";
import { mdxMd } from "micromark-extension-mdx-md";
import * as React from "react";
import { Text } from "@/components/ui/primitives/Text";
import { getMarkdownContentClassName } from "../markdownContent";
import { buttonDirectiveDescriptor } from "./MarkdownButtonDirectiveEditor";
import { markdownCodeBlockEditorDescriptor } from "./MarkdownCodeBlockEditor";
import { MarkdownEditorToolbar } from "./MarkdownEditorToolbar";
import { MarkdownLinkDialog } from "./MarkdownLinkDialog";
import type { MarkdownEditorClientProps } from "./types";

const editorSyntaxExtensions = [mdxJsx(), mdxMd(), directive()];

function isMarkdownSyntaxParseable(markdown: string) {
	try {
		micromark(markdown, { extensions: editorSyntaxExtensions });
		return true;
	} catch {
		return false;
	}
}

export function MarkdownEditorClient({
	ariaDescribedBy,
	ariaLabel,
	density,
	disabled,
	invalid = false,
	markdown,
	mentions = [],
	onChange,
	placeholder,
}: MarkdownEditorClientProps) {
	const editorRef = React.useRef<MDXEditorMethods>(null);
	const editorRootRef = React.useRef<HTMLDivElement>(null);
	const syntaxErrorId = React.useId();
	const onChangeRef = React.useRef(onChange);
	const pendingInitialChangeRef = React.useRef<string | null>(null);
	const mountedRef = React.useRef(false);
	const markdownSyntaxIsParseable = React.useMemo(
		() => isMarkdownSyntaxParseable(markdown),
		[markdown],
	);
	const describedBy = [
		ariaDescribedBy,
		markdownSyntaxIsParseable ? undefined : syntaxErrorId,
	]
		.filter(Boolean)
		.join(" ");
	onChangeRef.current = onChange;

	React.useLayoutEffect(() => {
		const editorRoot = editorRootRef.current;
		if (!editorRoot) return;

		function syncAccessibleEditorAttributes() {
			const richTextSurface = editorRoot?.querySelector<HTMLElement>(
				'.markdown-editor-content[contenteditable="true"]',
			);
			const sourceSurface = richTextSurface
				? null
				: editorRoot?.querySelector<HTMLElement>(
						'.cm-editor [role="textbox"], textarea',
					);
			const editableSurface = richTextSurface ?? sourceSurface;
			if (!editableSurface) return;

			editableSurface.setAttribute("aria-label", ariaLabel);

			if (describedBy) {
				editableSurface.setAttribute("aria-describedby", describedBy);
			} else {
				editableSurface.removeAttribute("aria-describedby");
			}

			if (invalid || !markdownSyntaxIsParseable) {
				editableSurface.setAttribute("aria-invalid", "true");
			} else {
				editableSurface.removeAttribute("aria-invalid");
			}
		}

		syncAccessibleEditorAttributes();
		const observer = new MutationObserver(syncAccessibleEditorAttributes);
		observer.observe(editorRoot, { childList: true, subtree: true });

		return () => observer.disconnect();
	}, [ariaLabel, describedBy, invalid, markdownSyntaxIsParseable]);

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
			data-invalid={invalid || !markdownSyntaxIsParseable || undefined}
			ref={editorRootRef}
		>
			<MDXEditor
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
					id={syntaxErrorId}
					theme="inherit"
					variant="caption"
				>
					Fix the Markdown syntax before returning to formatted text.
				</Text>
			) : null}
		</div>
	);
}
