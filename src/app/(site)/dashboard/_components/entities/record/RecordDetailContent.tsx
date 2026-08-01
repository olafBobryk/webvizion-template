"use client";

import * as React from "react";
import * as Markdown from "@/components/composites/markdown";
import { Icon } from "@/components/ui/icons/Icon";
import { Button } from "@/components/ui/primitives/Button";
import { Dropdown } from "@/components/ui/primitives/dropdown";
import { Card } from "@/components/ui/primitives/surfaces";
import { Text } from "@/components/ui/primitives/Text";
import { showToast } from "@/lib/feedback/toast";
import type { MemberPresentation } from "../../../_lib/entities/member/presentation";
import type {
	ReferenceRecord,
	ReferenceRecordProperty,
} from "../../../_lib/entities/record/domain";
import {
	getRecordPresentation,
	recordFieldDefinitions,
} from "../../../_lib/entities/record/presentation";
import { updateReferenceRecordAction } from "../../../records/_actions";
import { DashboardDetailField } from "../../detail/DashboardDetailField";
import { DashboardMarkdownEditorModalButton } from "../../detail/DashboardMarkdownEditorModalButton";
import { DashboardPropertyList } from "../../detail/DashboardPropertyList";
import { MemberIdentity } from "../member/MemberIdentity";
import { MemberMention } from "../member/MemberMention";
import { RecordStatusChip } from "./RecordStatusChip";

const availableProperties = [
	{ id: "audience", label: "Audience", value: "Product team" },
	{ id: "cadence", label: "Review cadence", value: "Monthly" },
	{ id: "priority", label: "Priority", value: "Normal" },
] as const;

const defaultRecordSkeletonMarkdown =
	"## Product-ready reference\n\nThis organization-scoped record demonstrates shared presentation, Markdown editing, mutations, and deletion without prescribing a product domain.";

function RecordDetailContentRoot({
	canWrite,
	members,
	record: initialRecord,
	simulateFailure,
}: {
	canWrite: boolean;
	members: readonly MemberPresentation[];
	record: ReferenceRecord;
	simulateFailure: boolean;
}) {
	const [record, setRecord] = React.useState(initialRecord);
	React.useEffect(() => setRecord(initialRecord), [initialRecord]);
	const presentation = getRecordPresentation(record);
	const memberById = new Map(members.map((member) => [member.id, member]));
	const owner = record.ownerMemberId
		? memberById.get(record.ownerMemberId)
		: null;
	async function saveProperties(
		properties: readonly ReferenceRecordProperty[],
	) {
		const previous = record;
		setRecord({ ...record, properties });
		const result = await updateReferenceRecordAction(
			record.id,
			{ properties },
			simulateFailure,
		);
		if (!result.ok) {
			setRecord(previous);
			showToast.error(result.message, { title: "Property update failed" });
			return;
		}
		setRecord(result.record);
		showToast.success(result.message);
	}
	return (
		<div className="grid gap-5">
			<Card>
				<Card.Heading
					description="Field metadata comes from the record-owned presentation definition."
					title="Record details"
				/>
				<Card.Content>
					<dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
						<DashboardDetailField
							copyValue={record.slug}
							icon={
								<Icon
									name={recordFieldDefinitions[1].icon ?? "link"}
									size="sm"
								/>
							}
							label={recordFieldDefinitions[1].label}
							value={presentation.slugLabel}
						/>
						<DashboardDetailField
							icon={
								<Icon
									name={recordFieldDefinitions[2].icon ?? "flag"}
									size="sm"
								/>
							}
							label={recordFieldDefinitions[2].label}
							truncateValue={false}
							value={
								<RecordStatusChip
									label={presentation.status.shortLabel}
									tone={presentation.status.tone}
								/>
							}
						/>
						<DashboardDetailField
							icon={<Icon name="user" size="sm" />}
							label="Owner"
							truncateValue={false}
							value={
								owner ? (
									<MemberIdentity
										avatarSize="sm"
										href
										presentation={owner}
										variant="actor"
									/>
								) : (
									"Unassigned"
								)
							}
						/>
						<DashboardDetailField
							icon={
								<Icon
									name={recordFieldDefinitions[3].icon ?? "calendar"}
									size="sm"
								/>
							}
							label={recordFieldDefinitions[3].label}
							value={presentation.updatedAtLabel}
						/>
					</dl>
				</Card.Content>
			</Card>

			<Card>
				<Card.Heading
					action={
						canWrite ? (
							<DashboardMarkdownEditorModalButton
								description="Markdown supports organization-member mentions."
								initialMarkdown={record.descriptionMarkdown}
								mentions={members.map((member) => ({
									id: member.id,
									label: member.displayLabel,
								}))}
								modalId={`record-markdown-${record.id}`}
								onSave={async (descriptionMarkdown) => {
									const result = await updateReferenceRecordAction(
										record.id,
										{ descriptionMarkdown },
										simulateFailure,
									);
									if (!result.ok) {
										return {
											error: result.message,
											message: result.message,
											ok: false,
										};
									}
									setRecord(result.record);
									return { message: result.message, ok: true };
								}}
								title={`Edit ${presentation.title} description`}
							/>
						) : null
					}
					description="Rendered with the shared Markdown renderer and edited in a focused dashboard modal."
					title="Description"
				/>
				<Card.Content>
					{record.descriptionMarkdown ? (
						<Markdown.Render
							density="compact"
							markdown={record.descriptionMarkdown}
							variant="result"
						/>
					) : (
						<Text tone="muted">No description yet.</Text>
					)}
					{owner ? (
						<Text className="mt-4" tone="muted" variant="caption">
							Mention example: <MemberMention presentation={owner} />
						</Text>
					) : null}
				</Card.Content>
			</Card>

			<DashboardPropertyList>
				<DashboardPropertyList.Header
					onAdd={
						canWrite
							? (id) => {
									const definition = availableProperties.find(
										(item) => item.id === id,
									);
									if (
										!definition ||
										record.properties.some((property) => property.id === id)
									)
										return;
									void saveProperties([...record.properties, definition]);
								}
							: undefined
					}
					options={availableProperties.filter(
						(option) =>
							!record.properties.some((property) => property.id === option.id),
					)}
				/>
				<DashboardPropertyList.Rows>
					{record.properties.map((property) => (
						<DashboardPropertyList.Row
							icon={<Icon name="link" size="sm" />}
							key={property.id}
							label={property.label}
							menuOptions={
								canWrite
									? [
											Dropdown.menuOptions.delete({
												label: "Remove property",
												onSelect: () =>
													void saveProperties(
														record.properties.filter(
															(item) => item.id !== property.id,
														),
													),
											}),
										]
									: undefined
							}
						>
							{property.value}
						</DashboardPropertyList.Row>
					))}
				</DashboardPropertyList.Rows>
			</DashboardPropertyList>
		</div>
	);
}

function RecordDetailContentSkeleton({
	canWrite = true,
	descriptionMarkdown = defaultRecordSkeletonMarkdown,
}: {
	canWrite?: boolean;
	descriptionMarkdown?: string;
}) {
	return (
		<div className="grid gap-5">
			<Card>
				<Card.Heading
					description="Field metadata comes from the record-owned presentation definition."
					title="Record details"
				/>
				<Card.Content>
					<dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
						<DashboardDetailField.Skeleton
							copyable
							icon={
								<Icon
									name={recordFieldDefinitions[1].icon ?? "link"}
									size="sm"
								/>
							}
							label={recordFieldDefinitions[1].label}
							value="north-star"
						/>
						<DashboardDetailField.Skeleton
							icon={
								<Icon
									name={recordFieldDefinitions[2].icon ?? "flag"}
									size="sm"
								/>
							}
							label={recordFieldDefinitions[2].label}
							truncateValue={false}
						>
							<RecordStatusChip.Skeleton label="Active" />
						</DashboardDetailField.Skeleton>
						<DashboardDetailField.Skeleton
							icon={<Icon name="user" size="sm" />}
							label="Owner"
							truncateValue={false}
						>
							<MemberIdentity.Skeleton
								avatarSize="sm"
								displayLabel="Template Operator"
								href
								variant="actor"
							/>
						</DashboardDetailField.Skeleton>
						<DashboardDetailField.Skeleton
							icon={
								<Icon
									name={recordFieldDefinitions[3].icon ?? "calendar"}
									size="sm"
								/>
							}
							label={recordFieldDefinitions[3].label}
							value="Jul 18, 2026, 3:30 PM"
						/>
					</dl>
				</Card.Content>
			</Card>

			<Card>
				<Card.Heading
					action={
						canWrite ? <DashboardMarkdownEditorModalButton.Skeleton /> : null
					}
					description="Rendered with the shared Markdown renderer and edited in a focused dashboard modal."
					title="Description"
				/>
				<Card.Content>
					<Markdown.Render.Skeleton
						density="compact"
						markdown={descriptionMarkdown}
						variant="result"
					/>
					<Text.Skeleton className="mt-4" tone="muted" variant="caption">
						Mention example: @Example member
					</Text.Skeleton>
				</Card.Content>
			</Card>

			<DashboardPropertyList.Skeleton
				action={
					canWrite ? (
						<Button.Skeleton size="sm" variant="ghost">
							+ Add
						</Button.Skeleton>
					) : null
				}
				items={availableProperties.slice(0, 2).map((property) => ({
					icon: <Icon name="link" size="sm" />,
					...property,
				}))}
			/>
		</div>
	);
}

export const RecordDetailContent = Object.assign(RecordDetailContentRoot, {
	Skeleton: RecordDetailContentSkeleton,
});
