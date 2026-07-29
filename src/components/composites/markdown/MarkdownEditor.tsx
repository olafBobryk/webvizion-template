"use client";

import clsx from "clsx";
import dynamic from "next/dynamic";
import * as React from "react";
import { Skeleton } from "@/components/ui/misc";
import { ModalForm } from "@/components/ui/overlays/modal/ModalForm";
import { useModalSubmission } from "@/components/ui/overlays/modal/ModalShell";
import { Button } from "@/components/ui/primitives/Button";
import { Field } from "@/components/ui/primitives/Field";
import type { MarkdownEditorProps } from "./editor/types";
import { useMarkdownToolbarCollapse } from "./markdownToolbarLayout";

export type {
	MarkdownEditorDensity,
	MarkdownEditorMentionOption,
	MarkdownEditorProps,
} from "./editor/types";

const MarkdownEditorClient = dynamic(
	() =>
		import("./editor/MarkdownEditorClient").then(
			(module) => module.MarkdownEditorClient,
		),
	{ ssr: false },
);

function MarkdownEditorRoot({
	ariaLabel,
	className,
	defaultMarkdown = "",
	density = "default",
	disabled = false,
	error,
	mentions,
	name,
	onChange,
	placeholder,
}: MarkdownEditorProps) {
	const [markdown, setMarkdown] = React.useState(defaultMarkdown);
	const errorId = React.useId();

	React.useEffect(() => {
		setMarkdown(defaultMarkdown);
	}, [defaultMarkdown]);

	function handleChange(nextMarkdown: string) {
		setMarkdown(nextMarkdown);
		onChange?.(nextMarkdown);
	}

	return (
		<Field
			className={clsx("min-w-0 w-full", className)}
			message={error}
			messageId={errorId}
			tone={error ? "error" : "default"}
		>
			<div className="min-w-0 w-full">
				{name ? <input name={name} type="hidden" value={markdown} /> : null}
				<MarkdownEditorClient
					ariaDescribedBy={error ? errorId : undefined}
					ariaLabel={ariaLabel}
					density={density}
					disabled={disabled}
					invalid={Boolean(error)}
					markdown={markdown}
					mentions={mentions}
					onChange={handleChange}
					placeholder={placeholder}
				/>
			</div>
		</Field>
	);
}

function MarkdownEditorSkeleton({
	className,
	density = "default",
}: Pick<MarkdownEditorProps, "className" | "density">) {
	const isCompact = density === "compact";
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

	return (
		<Field className={clsx("min-w-0 w-full", className)} disableMessage>
			<div aria-hidden className="min-w-0 w-full">
				<div className="markdown-editor" data-density={density}>
					<div
						className={clsx(
							"flex w-full items-center overflow-hidden rounded-md",
							isCompact ? "h-9 px-1" : "h-10",
						)}
					>
						<div
							className="flex w-full min-w-0 items-center overflow-hidden"
							data-slot="markdown-editor-toolbar-skeleton"
							ref={toolbarRef}
						>
							<div
								className="flex min-w-0 flex-1 items-center overflow-hidden"
								ref={commandRegionRef}
							>
								<MarkdownToolbarSkeletonSection
									collapsed={historyCollapsed}
									controlCount={2}
									merged={mergeHistoryMenu}
								/>
								<MarkdownToolbarSkeletonSection
									collapsed={textCollapsed}
									controlCount={7}
									merged={mergeTextMenu}
								/>
								<MarkdownToolbarSkeletonSection
									collapsed={structureCollapsed}
									controlCount={4}
									merged={mergeStructureMenu}
								/>
							</div>
							<div
								className="ml-auto flex shrink-0 items-center gap-1 pl-1.5"
								ref={trailingActionsRef}
							>
								<MarkdownToolbarGhostSkeleton />
								<span
									aria-hidden
									className="mx-0.5 h-5 border-border/70 border-l"
								/>
								<Button.Skeleton size="icon-sm" variant="secondary" />
							</div>
						</div>
					</div>
					<Skeleton
						className={clsx(
							"w-full border border-transparent",
							isCompact ? "h-[98px]" : "h-[194px]",
							isCompact ? "mt-1.5" : "mt-2",
						)}
						data-slot="markdown-editor-body-skeleton"
						radius="md"
					/>
				</div>
			</div>
		</Field>
	);
}

const markdownToolbarSkeletonKeys = [
	"first",
	"second",
	"third",
	"fourth",
	"fifth",
	"sixth",
	"seventh",
] as const;

function MarkdownToolbarSkeletonSection({
	collapsed,
	controlCount,
	merged,
}: {
	collapsed: boolean;
	controlCount: number;
	merged: boolean;
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
			{markdownToolbarSkeletonKeys
				.slice(0, collapsed ? 1 : controlCount)
				.map((key) => (
					<MarkdownToolbarGhostSkeleton key={key} />
				))}
		</div>
	);
}

function MarkdownToolbarGhostSkeleton() {
	return (
		<Button.Skeleton className="opacity-0" size="icon-sm" variant="ghost" />
	);
}

export const MarkdownEditor = Object.assign(MarkdownEditorRoot, {
	Skeleton: MarkdownEditorSkeleton,
});

export type MarkdownEditorModalFormProps = MarkdownEditorProps & {
	cancelLabel?: React.ReactNode;
	onCancel: () => void;
	onSubmitMarkdown: (markdown: string) => unknown;
	submitLabel?: React.ReactNode;
};

export function MarkdownEditorModalForm({
	cancelLabel = "Cancel",
	defaultMarkdown = "",
	onCancel,
	onSubmitMarkdown,
	submitLabel = "Save",
	...editorProps
}: MarkdownEditorModalFormProps) {
	const [markdown, setMarkdown] = React.useState(defaultMarkdown);
	const { beginSubmission, endSubmission, isSubmitting } = useModalSubmission();

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!beginSubmission()) return;
		try {
			await onSubmitMarkdown(markdown);
		} finally {
			endSubmission();
		}
	}

	return (
		<ModalForm
			contentClassName="grid gap-3"
			footer={
				<>
					<Button
						disabled={isSubmitting}
						onClick={onCancel}
						type="button"
						variant="ghost"
					>
						{cancelLabel}
					</Button>
					<Button loading={isSubmitting} type="submit" variant="primary">
						{submitLabel}
					</Button>
				</>
			}
			onSubmit={handleSubmit}
		>
			<MarkdownEditor
				{...editorProps}
				defaultMarkdown={defaultMarkdown}
				disabled={editorProps.disabled || isSubmitting}
				onChange={setMarkdown}
			/>
		</ModalForm>
	);
}
