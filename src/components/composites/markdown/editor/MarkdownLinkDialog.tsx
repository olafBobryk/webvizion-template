import {
	activeEditor$,
	cancelLinkEdit$,
	linkDialogState$,
	removeLink$,
	rootEditor$,
	updateLink$,
	useCellValue,
	usePublisher,
} from "@mdxeditor/editor";
import * as React from "react";
import { TextInput } from "@/components/ui/input";
import { Button } from "@/components/ui/primitives/Button";
import { Panel } from "@/components/ui/primitives/Panel";
import { Text } from "@/components/ui/primitives/Text";

export function MarkdownLinkDialog() {
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
