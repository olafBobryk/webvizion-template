"use client";

import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { MemberSelector } from "@/app/(site)/dashboard/_components/entities/member/MemberSelector";
import { Icon } from "@/components/ui/icons/Icon";
import { SelectInput, TextInput } from "@/components/ui/input";
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
import { hrefFor } from "@/lib/routes";
import type { MemberPresentation } from "../../../_lib/entities/member/presentation";
import type {
	ReferenceRecord,
	ReferenceRecordStatus,
} from "../../../_lib/entities/record/domain";
import {
	getRecordPresentation,
	recordPresentationDefinition,
	recordStatusPresentation,
} from "../../../_lib/entities/record/presentation";
import {
	deleteReferenceRecordAction,
	updateReferenceRecordAction,
} from "../../../records/_actions";
import { EntityDeletionDetailMenu } from "../EntityDeletion";

const editableStatuses = ["active", "draft", "review"] as const;

function RecordDetailActionsRoot({
	canWrite,
	members,
	record,
}: {
	canWrite: boolean;
	members: readonly MemberPresentation[];
	record: ReferenceRecord;
}) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const simulateFailure = searchParams.get("debug-mutation") === "fail";
	const { openModal } = useModal();
	const presentation = getRecordPresentation(record);
	if (!canWrite) return null;
	return (
		<div className="flex items-center gap-2">
			<Button
				onClick={() =>
					openModal(
						({ close }) => (
							<RecordEditForm
								members={members}
								onCancel={close}
								onSaved={() => {
									close();
									router.refresh();
								}}
								record={record}
								simulateFailure={simulateFailure}
							/>
						),
						{
							ariaLabel: `Edit ${record.title}`,
							id: `edit-record-${record.id}`,
						},
					)
				}
				size="sm"
				variant="secondary"
			>
				Edit record
			</Button>
			<EntityDeletionDetailMenu
				completion={{
					href: hrefFor("dashboard.records"),
					replace: true,
					type: "navigate",
				}}
				deleteEntity={() =>
					deleteReferenceRecordAction(record.id, simulateFailure)
				}
				definition={{
					entityLabel: presentation.title,
					entityTypeLabel: recordPresentationDefinition.nouns.singular,
					impacts: [
						{
							description: "Removed from list, detail, and command surfaces.",
							label: "Record",
						},
						{
							description: "Markdown and custom properties are removed.",
							label: "Content",
						},
					],
					warning: "The fixture adapter does not retain a recycle bin.",
				}}
			/>
		</div>
	);
}

function RecordDetailActionsSkeleton({
	canWrite = true,
}: {
	canWrite?: boolean;
}) {
	if (!canWrite) return null;
	return (
		<div className="flex items-center gap-2">
			<Button.Skeleton size="sm" variant="secondary">
				Edit record
			</Button.Skeleton>
			<Button.Skeleton size="icon-sm" variant="secondary" />
		</div>
	);
}

export const RecordDetailActions = Object.assign(RecordDetailActionsRoot, {
	Skeleton: RecordDetailActionsSkeleton,
});

function RecordEditForm({
	members,
	onCancel,
	onSaved,
	record,
	simulateFailure,
}: {
	members: readonly MemberPresentation[];
	onCancel: () => void;
	onSaved: () => void;
	record: ReferenceRecord;
	simulateFailure: boolean;
}) {
	const [title, setTitle] = React.useState(record.title);
	const [ownerMemberId, setOwnerMemberId] = React.useState(
		record.ownerMemberId,
	);
	const [status, setStatus] = React.useState<ReferenceRecordStatus>(
		record.status,
	);
	const [error, setError] = React.useState<string>();
	const { beginSubmission, endSubmission, isSubmitting } = useModalSubmission();

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!beginSubmission()) return;
		setError(undefined);
		let shouldEndSubmission = true;
		try {
			const result = await updateReferenceRecordAction(
				record.id,
				{ ownerMemberId, status, title },
				simulateFailure,
			);
			if (!result.ok) {
				setError(result.fieldErrors?.title);
				showToast.error(result.message, { title: "Save failed" });
				return;
			}
			showToast.success(result.message);
			shouldEndSubmission = false;
			onSaved();
		} catch {
			showToast.error("The record could not be saved. Try again.", {
				title: "Save failed",
			});
		} finally {
			if (shouldEndSubmission) endSubmission();
		}
	}
	return (
		<>
			<ModalHeader leadingIcon={<Icon name="pencil" size="sm" />}>
				<ModalTitle>Edit {record.title}</ModalTitle>
				<ModalDescription>
					Updates the active organization fixture.
				</ModalDescription>
			</ModalHeader>
			<ModalForm
				contentClassName="grid gap-4"
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
							Save changes
						</Button>
					</>
				}
				onSubmit={handleSubmit}
			>
				<TextInput
					error={error}
					label="Title"
					onChange={setTitle}
					required
					value={title}
				/>
				<MemberSelector
					members={members}
					onChange={setOwnerMemberId}
					value={ownerMemberId}
				/>
				<SelectInput
					label="Status"
					onChange={setStatus}
					options={editableStatuses.map((value) => ({
						label: recordStatusPresentation[value].shortLabel,
						searchText: recordStatusPresentation[value].description,
						value,
					}))}
					value={status}
				/>
				{simulateFailure ? (
					<StatusMessage tone="warning">
						This save will fail intentionally.
					</StatusMessage>
				) : null}
			</ModalForm>
		</>
	);
}
