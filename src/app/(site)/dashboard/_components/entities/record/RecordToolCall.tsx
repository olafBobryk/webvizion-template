"use client";

import { ToolPresentationFrame } from "@/components/domain/assistant/message/assistant/tool-call/ToolPresentationFrame";
import { ErrorState } from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import { Text } from "@/components/ui/primitives/Text";
import {
	getRecordToolProposalPresentation,
	type RecordToolItem,
	type RecordToolPresentation,
} from "../../../_lib/entities/record/presentation";
import { RecordIdentity } from "./RecordIdentity";
import { RecordStatusChip } from "./RecordStatusChip";
import { RecordToolProposal } from "./RecordToolProposal";

export type RecordToolProposalPreview =
	| { status: "loading" }
	| { message: string; status: "error" }
	| { item: RecordToolItem; status: "ready" };

function object(value: unknown) {
	return value && typeof value === "object" && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: {};
}

function RecordToolResult({ item }: { item: RecordToolItem }) {
	return (
		<div className="grid min-w-0 gap-4 rounded-md border border-border/70 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
			<div className="grid min-w-0 gap-1">
				<RecordIdentity presentation={item} variant="default" />
				{item.updatedAtLabel ? (
					<Text tone="muted" variant="caption">
						Updated {item.updatedAtLabel}
					</Text>
				) : null}
			</div>
			<div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
				{item.status ? (
					<RecordStatusChip
						label={item.status.shortLabel}
						tone={item.status.tone}
					/>
				) : null}
				{item.href ? (
					<Button href={item.href} size="sm" variant="ghost">
						Open
					</Button>
				) : null}
			</div>
		</div>
	);
}

function RecordToolResultSkeleton() {
	return (
		<div className="grid min-w-0 gap-4 rounded-md border border-border/70 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
			<RecordIdentity.Skeleton />
			<div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
				<RecordStatusChip.Skeleton label="Active" />
				<div aria-hidden="true" className="inline-flex h-8 items-center px-2.5">
					<Text.Skeleton variant="caption">Open</Text.Skeleton>
				</div>
			</div>
		</div>
	);
}

function RecordToolActiveBody({
	presentation,
}: {
	presentation: RecordToolPresentation;
}) {
	const input = object(presentation.input);
	if (presentation.toolName === "record_create") {
		return (
			<div aria-hidden="true">
				<RecordToolProposal
					presentation={getRecordToolProposalPresentation({
						input,
						toolName: presentation.toolName,
					})}
				/>
			</div>
		);
	}
	if (
		["record_update", "record_archive", "record_delete"].includes(
			presentation.toolName,
		)
	) {
		return (
			<RecordToolProposal.Skeleton
				count={presentation.toolName === "record_delete" ? 1 : 2}
			/>
		);
	}
	return (
		<div aria-hidden="true">
			<RecordToolResultSkeleton />
		</div>
	);
}

function RecordToolCallRoot({
	disabled = false,
	onApprove,
	onDeny,
	onRetryProposal,
	presentation,
	proposalPreview,
}: {
	disabled?: boolean;
	onApprove?: () => void;
	onDeny?: () => void;
	onRetryProposal?: () => void;
	presentation: RecordToolPresentation;
	proposalPreview?: RecordToolProposalPreview;
}) {
	const isApproval = presentation.state === "approval-requested";
	const isActive =
		presentation.state === "input-streaming" ||
		presentation.state === "input-available";
	return (
		<ToolPresentationFrame
			disabled={disabled}
			getItemKey={(item) => item.id}
			onApprove={onApprove}
			onDeny={onDeny}
			presentation={presentation}
			renderItem={(item) => <RecordToolResult item={item} />}
		>
			{isActive ? (
				<RecordToolActiveBody presentation={presentation} />
			) : isApproval ? (
				presentation.toolName === "record_create" ? (
					<RecordToolProposal
						presentation={getRecordToolProposalPresentation({
							input: presentation.input,
							toolName: presentation.toolName,
						})}
					/>
				) : proposalPreview?.status === "ready" ? (
					<RecordToolProposal
						presentation={getRecordToolProposalPresentation({
							current: proposalPreview.item,
							input: presentation.input,
							toolName: presentation.toolName,
						})}
					/>
				) : proposalPreview?.status === "error" ? (
					<ErrorState
						description={proposalPreview.message}
						onAction={onRetryProposal}
						title="Could not load the current Record"
						variant="framed"
					/>
				) : (
					<RecordToolProposal.Skeleton
						count={presentation.toolName === "record_delete" ? 1 : 2}
					/>
				)
			) : presentation.items.length > 0 ? (
				<div className="grid gap-2">
					{presentation.items.map((item) => (
						<RecordToolResult item={item} key={item.id} />
					))}
				</div>
			) : presentation.state === "error" ? (
				<ErrorState
					description={presentation.error ?? undefined}
					title="Record tool failed"
					variant="framed"
				/>
			) : null}
		</ToolPresentationFrame>
	);
}

function RecordToolCallSkeleton({
	destructive = false,
	showApprovalActions = false,
}: {
	destructive?: boolean;
	showApprovalActions?: boolean;
}) {
	return (
		<ToolPresentationFrame.Skeleton
			description="Get record in the current organization."
			destructive={destructive}
			itemSkeleton={
				showApprovalActions ? undefined : <RecordToolResultSkeleton />
			}
			label="Get record"
			showApprovalActions={showApprovalActions}
			stateLabel={showApprovalActions ? "Approval required" : "Completed"}
		/>
	);
}

export const RecordToolCall = Object.assign(RecordToolCallRoot, {
	Skeleton: RecordToolCallSkeleton,
});
