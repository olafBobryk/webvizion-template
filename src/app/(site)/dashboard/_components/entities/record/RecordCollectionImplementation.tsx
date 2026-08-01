"use client";

import { useSearchParams } from "next/navigation";
import * as React from "react";
import { Icon } from "@/components/ui/icons/Icon";
import { TextInput, ToggleInput } from "@/components/ui/input";
import { Chip } from "@/components/ui/misc";
import { ModalForm } from "@/components/ui/overlays/modal/ModalForm";
import {
	ModalDescription,
	ModalHeader,
	ModalTitle,
	useModalSubmission,
} from "@/components/ui/overlays/modal/ModalShell";
import { useModal } from "@/components/ui/overlays/modal/useModal";
import { Button } from "@/components/ui/primitives/Button";
import {
	Dropdown,
	type DropdownMenuOption,
} from "@/components/ui/primitives/dropdown";
import { StatusMessage } from "@/components/ui/primitives/StatusMessage";
import { Card } from "@/components/ui/primitives/surfaces";
import { Text } from "@/components/ui/primitives/Text";
import { showToast } from "@/lib/feedback/toast";
import { surfaceHref } from "@/lib/routes";
import type { MemberPresentation } from "../../../_lib/entities/member/presentation";
import type { ReferenceRecord } from "../../../_lib/entities/record/domain";
import {
	getRecordPresentation,
	recordColumnDefinitions,
	recordPresentationDefinition,
} from "../../../_lib/entities/record/presentation";
import {
	archiveReferenceRecordAction,
	createReferenceRecordAction,
	deleteReferenceRecordAction,
} from "../../../records/_actions";
import { DashboardTablePanel } from "../../data/DashboardTablePanel";
import { DashboardEntityState } from "../DashboardEntityState";
import { useEntityDeletionOption } from "../EntityDeletion";
import { MemberIdentity } from "../member/MemberIdentity";
import { MemberSelector } from "../member/MemberSelector";
import { RecordStatusChip } from "./RecordStatusChip";

const columns = recordColumnDefinitions;
export function RecordCollectionClientRoot({
	canWrite,
	initialRecords,
	members,
	organizationName,
}: {
	canWrite: boolean;
	initialRecords: readonly ReferenceRecord[];
	members: readonly MemberPresentation[];
	organizationName: string;
}) {
	const searchParams = useSearchParams();
	const simulateFailure = searchParams.get("debug-mutation") === "fail";
	const [records, setRecords] = React.useState(initialRecords);
	React.useEffect(() => setRecords(initialRecords), [initialRecords]);
	const memberById = new Map(members.map((member) => [member.id, member]));
	return (
		<div className="grid gap-4">
			{simulateFailure ? (
				<div className="flex items-center justify-between gap-3 rounded-lg border border-warning-accent/25 bg-warning-accent/10 px-4 py-3">
					<Text tone="muted" variant="support">
						Mutation failure mode is active. Optimistic changes will roll back.
					</Text>
					<Chip tone="warning">Debug failure</Chip>
				</div>
			) : null}
			<DashboardTablePanel
				columns={[
					{
						header: columns[0].label,
						id: columns[0].id,
						render: (record) => {
							const presentation = getRecordPresentation(record);
							return (
								<span className="grid min-w-0">
									<Text as="span" className="truncate" variant="bodyStrong">
										{presentation.title}
									</Text>
									<Text
										as="span"
										className="truncate"
										tone="muted"
										variant="caption"
									>
										{presentation.slugLabel}
									</Text>
								</span>
							);
						},
					},
					{
						header: "Owner",
						id: "owner",
						render: (record) => {
							const member = record.ownerMemberId
								? memberById.get(record.ownerMemberId)
								: null;
							return member ? (
								<MemberIdentity
									avatarSize="sm"
									href
									presentation={member}
									variant="actor"
								/>
							) : (
								<span>Unassigned</span>
							);
						},
						rowLink: false,
					},
					{
						header: columns[1].label,
						id: columns[1].id,
						render: (record) => {
							const status = getRecordPresentation(record).status;
							return (
								<RecordStatusChip
									label={status.shortLabel}
									tone={status.tone}
								/>
							);
						},
						rowLink: false,
					},
					{
						header: columns[2].label,
						id: columns[2].id,
						render: (record) => getRecordPresentation(record).updatedAtLabel,
					},
					{
						align: "right",
						header: "Actions",
						id: "actions",
						kind: "action",
						render: (record) => (
							<RecordRowActions
								canWrite={canWrite}
								onArchived={() =>
									setRecords((current) =>
										current.filter((item) => item.id !== record.id),
									)
								}
								onDeleted={() =>
									setRecords((current) =>
										current.filter((item) => item.id !== record.id),
									)
								}
								onRollback={() =>
									setRecords((current) =>
										current.some((item) => item.id === record.id)
											? current
											: [record, ...current],
									)
								}
								record={record}
								simulateFailure={simulateFailure}
							/>
						),
						rowLink: false,
						sortable: false,
					},
				]}
				emptyState={
					<DashboardEntityState
						action={
							canWrite ? (
								<RecordCreateButton
									members={members}
									onCreated={(record) => setRecords([record])}
									simulateFailure={simulateFailure}
								/>
							) : null
						}
						description={recordPresentationDefinition.emptyState.description}
						iconName={recordPresentationDefinition.emptyState.icon}
						title={recordPresentationDefinition.emptyState.title}
					/>
				}
				getRowAriaLabel={(record) => `Open ${record.title}`}
				getRowHref={(record) =>
					surfaceHref("dashboard.record", { recordId: record.id })
				}
				getRowKey={(record) => record.id}
				header={
					<Card.Heading
						action={
							canWrite ? (
								<RecordCreateButton
									autoOpen={searchParams.get("action") === "create"}
									members={members}
									onCreated={(record) =>
										setRecords((current) => [record, ...current])
									}
									simulateFailure={simulateFailure}
								/>
							) : null
						}
						actionLayout="responsive"
						description={
							<>
								Organization-scoped fixtures for {organizationName}. Sort any
								presentation-owned column.
							</>
						}
						leading={
							<Icon name={recordPresentationDefinition.icon} size="sm" />
						}
						title={recordPresentationDefinition.nouns.plural}
					/>
				}
				id="reference-records"
				rows={records}
			/>
		</div>
	);
}

function RecordRowActions({
	canWrite,
	onArchived,
	onDeleted,
	onRollback,
	record,
	simulateFailure,
}: {
	canWrite: boolean;
	onArchived: () => void;
	onDeleted: () => void;
	onRollback: () => void;
	record: ReferenceRecord;
	simulateFailure: boolean;
}) {
	const presentation = getRecordPresentation(record);
	const deleteOption = useEntityDeletionOption({
		completion: { type: "refresh" },
		definition: {
			entityLabel: presentation.title,
			entityTypeLabel: recordPresentationDefinition.nouns.singular,
			impacts: [
				{ description: "Removed from list and detail views.", label: "Record" },
				{
					description: "Fixture Markdown and properties are removed.",
					label: "Content",
				},
			],
			summary: "This fixture deletion is immediate and organization scoped.",
			warning:
				"Production adapters should define retention and restore behavior before enabling deletion.",
		},
		deleteEntity: () => deleteReferenceRecordAction(record.id, simulateFailure),
		onDeleted,
		onOptimisticDelete: onDeleted,
		onRollback,
	});
	const options: DropdownMenuOption[] = [
		Dropdown.menuOptions.open({ href: presentation.href }),
	];
	if (canWrite) {
		options.push({
			id: "archive",
			label: "Archive",
			leadingIcon: <Icon name="archive" size="sm" />,
			onSelect: async () => {
				onArchived();
				const result = await archiveReferenceRecordAction(
					record.id,
					simulateFailure,
				);
				if (!result.ok) {
					onRollback();
					showToast.error(result.message, { title: "Archive failed" });
					return;
				}
				showToast.success(result.message, { title: "Archived" });
			},
		});
		options.push(deleteOption);
	}
	return (
		<Dropdown.Menu
			ariaLabel={`Actions for ${presentation.title}`}
			openOnHover={false}
			options={options}
			positionStrategy="fixed"
		/>
	);
}

function RecordCreateButton({
	autoOpen = false,
	members,
	onCreated,
	simulateFailure,
}: {
	autoOpen?: boolean;
	members: readonly MemberPresentation[];
	onCreated: (record: ReferenceRecord) => void;
	simulateFailure: boolean;
}) {
	const { openModal } = useModal();
	const openedAutomatically = React.useRef(false);
	const openCreateModal = React.useCallback(() => {
		openModal(
			({ close }) => (
				<RecordCreateForm
					members={members}
					onCancel={close}
					onCreated={(record) => {
						onCreated(record);
						close();
					}}
					simulateFailure={simulateFailure}
				/>
			),
			{ ariaLabel: "Create record", id: "create-reference-record" },
		);
	}, [members, onCreated, openModal, simulateFailure]);
	React.useEffect(() => {
		if (!autoOpen || openedAutomatically.current) return;
		openedAutomatically.current = true;
		openCreateModal();
	}, [autoOpen, openCreateModal]);
	return (
		<Button onClick={openCreateModal} size="sm" type="button">
			New record
		</Button>
	);
}

function RecordCreateForm({
	members,
	onCancel,
	onCreated,
	simulateFailure,
}: {
	members: readonly MemberPresentation[];
	onCancel: () => void;
	onCreated: (record: ReferenceRecord) => void;
	simulateFailure: boolean;
}) {
	const [title, setTitle] = React.useState("");
	const [ownerMemberId, setOwnerMemberId] = React.useState<string | null>(
		members[0]?.id ?? null,
	);
	const [review, setReview] = React.useState<string[]>([]);
	const [error, setError] = React.useState<string>();
	const { beginSubmission, endSubmission, isSubmitting } = useModalSubmission();

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (title.trim().length < 2) {
			setError("Enter a record title.");
			return;
		}
		if (!beginSubmission()) return;
		setError(undefined);
		let shouldEndSubmission = true;
		try {
			const result = await createReferenceRecordAction(
				{
					ownerMemberId,
					status: review.includes("review") ? "review" : "draft",
					title,
				},
				simulateFailure,
			);
			if (!result.ok) {
				setError(result.fieldErrors?.title);
				showToast.error(result.message, { title: "Creation failed" });
				return;
			}
			showToast.success(result.message);
			shouldEndSubmission = false;
			onCreated(result.record);
		} catch {
			showToast.error("The record could not be created. Try again.", {
				title: "Creation failed",
			});
		} finally {
			if (shouldEndSubmission) endSubmission();
		}
	}
	return (
		<>
			<ModalHeader leadingIcon={<Icon name="plus" size="sm" />}>
				<ModalTitle>Create record</ModalTitle>
				<ModalDescription>
					Creates a non-durable organization-scoped fixture.
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
							Create record
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
				<ToggleInput
					description="Starts the record in review instead of draft."
					label="Workflow"
					onChange={setReview}
					options={[{ label: "Ready for review", value: "review" }]}
					value={review}
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
