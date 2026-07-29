"use client";

import * as React from "react";
import * as Markdown from "@/components/composites/markdown";
import { Icon } from "@/components/ui/icons/Icon";
import { ModalForm } from "@/components/ui/overlays/modal/ModalForm";
import {
	ModalDescription,
	ModalHeader,
	ModalTitle,
	useModalSubmission,
} from "@/components/ui/overlays/modal/ModalShell";
import { useModal } from "@/components/ui/overlays/modal/useModal";
import { Button } from "@/components/ui/primitives/Button";
import { StatusMessage } from "@/components/ui/primitives/StatusMessage";
import { showToast } from "@/lib/feedback/toast";

export type DashboardMarkdownSaveResult = {
	error?: string;
	fieldErrors?: { markdown?: string };
	message?: string;
	ok: boolean;
};

function DashboardMarkdownEditorModalButtonRoot({
	description,
	disabled = false,
	initialMarkdown = "",
	mentions,
	modalId,
	onSave,
	successMessage = "Saved.",
	title,
}: {
	description?: string;
	disabled?: boolean;
	initialMarkdown?: string;
	mentions?: readonly { id: string; label: string }[];
	modalId: string;
	onSave: (markdown: string) => Promise<DashboardMarkdownSaveResult>;
	successMessage?: string;
	title: string;
}) {
	const { openModal } = useModal();
	return (
		<Button
			disabled={disabled}
			onClick={() => {
				if (disabled) return;
				openModal(
					({ close }) => (
						<DashboardMarkdownEditorModalForm
							description={description}
							initialMarkdown={initialMarkdown}
							mentions={mentions}
							onCancel={close}
							onSave={onSave}
							onSaved={(message) => {
								showToast.success(message ?? successMessage);
								close();
							}}
							title={title}
						/>
					),
					{
						ariaLabel: title,
						cardProps: { maxWidth: "4xl" },
						id: modalId,
					},
				);
			}}
			type="button"
			variant="ghost"
		>
			Edit
		</Button>
	);
}

function DashboardMarkdownEditorModalButtonSkeleton() {
	return <Button.Skeleton variant="ghost">Edit</Button.Skeleton>;
}

export const DashboardMarkdownEditorModalButton = Object.assign(
	DashboardMarkdownEditorModalButtonRoot,
	{ Skeleton: DashboardMarkdownEditorModalButtonSkeleton },
);

function DashboardMarkdownEditorModalForm({
	description,
	initialMarkdown,
	mentions,
	onCancel,
	onSave,
	onSaved,
	title,
}: {
	description?: string;
	initialMarkdown: string;
	mentions?: readonly { id: string; label: string }[];
	onCancel: () => void;
	onSave: (markdown: string) => Promise<DashboardMarkdownSaveResult>;
	onSaved: (message?: string) => void;
	title: string;
}) {
	const [markdown, setMarkdown] = React.useState(initialMarkdown);
	const [error, setError] = React.useState<string>();
	const { beginSubmission, endSubmission, isSubmitting } = useModalSubmission();

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!beginSubmission()) return;
		setError(undefined);
		let shouldEndSubmission = true;
		try {
			const result = await onSave(markdown);
			if (!result.ok) {
				const message =
					result.fieldErrors?.markdown ??
					result.message ??
					result.error ??
					"Could not save changes.";
				setError(message);
				showToast.error(result.message ?? result.error ?? message);
				return;
			}
			shouldEndSubmission = false;
			onSaved(result.message);
		} catch {
			const message = "Could not save changes.";
			setError(message);
			showToast.error(message);
		} finally {
			if (shouldEndSubmission) endSubmission();
		}
	}
	return (
		<>
			<ModalHeader leadingIcon={<Icon name="pencil" size="sm" />}>
				<ModalTitle>{title}</ModalTitle>
				{description ? (
					<ModalDescription>{description}</ModalDescription>
				) : null}
			</ModalHeader>
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
							Cancel
						</Button>
						<Button loading={isSubmitting} type="submit">
							Save
						</Button>
					</>
				}
				onSubmit={handleSubmit}
			>
				<Markdown.Editor
					ariaLabel={title}
					defaultMarkdown={initialMarkdown}
					density="compact"
					disabled={isSubmitting}
					mentions={mentions ? [...mentions] : undefined}
					onChange={setMarkdown}
					placeholder="Write a description"
				/>
				{error ? (
					<StatusMessage role="alert" tone="danger">
						{error}
					</StatusMessage>
				) : null}
			</ModalForm>
		</>
	);
}
