import {
	type CodeBlockEditorDescriptor,
	type CodeBlockEditorProps,
	CodeMirrorEditor,
	readOnly$,
	useCellValue,
	useCodeBlockEditorContext,
} from "@mdxeditor/editor";
import type { MouseEvent } from "react";
import { Button } from "@/components/ui/primitives/Button";
import { Dropdown } from "@/components/ui/primitives/dropdown";
import type { ListboxOption } from "@/components/ui/primitives/Listbox";
import { markdownToolbarIcon } from "./MarkdownToolbarControls";

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

	function removeCodeBlock(event: MouseEvent<HTMLButtonElement>) {
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
					triggerContent={markdownToolbarIcon("code")}
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
					{markdownToolbarIcon("trash")}
				</Button>
			</div>
			<CodeMirrorEditor {...props} />
		</div>
	);
}

export const markdownCodeBlockEditorDescriptor = {
	Editor: MarkdownCodeBlockEditor,
	match: () => true,
	priority: 2,
} satisfies CodeBlockEditorDescriptor;
