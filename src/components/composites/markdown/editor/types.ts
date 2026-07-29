import type { IconName } from "@/components/ui/icons/Icon";
import type { MarkdownContentDensity } from "../markdownContent";

export type MarkdownEditorDensity = MarkdownContentDensity;

export type MarkdownEditorMentionOption = {
	id: string;
	label: string;
};

export type MarkdownEditorProps = {
	ariaLabel: string;
	className?: string;
	defaultMarkdown?: string;
	density?: MarkdownEditorDensity;
	disabled?: boolean;
	mentions?: MarkdownEditorMentionOption[];
	name?: string;
	onChange?: (markdown: string) => void;
	placeholder?: string;
};

export type MarkdownEditorClientProps = {
	ariaLabel: string;
	density: MarkdownEditorDensity;
	disabled: boolean;
	markdown: string;
	mentions?: MarkdownEditorMentionOption[];
	onChange: (markdown: string) => void;
	placeholder?: string;
};

export type MarkdownToolbarInsertOption = {
	id: "button" | "code" | "divider" | "image" | "table";
	icon: IconName;
	label: string;
};
