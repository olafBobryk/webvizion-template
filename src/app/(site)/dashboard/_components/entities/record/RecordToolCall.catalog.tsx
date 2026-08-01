"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { getRecordToolPresentation } from "../../../_lib/entities/record/presentation";
import { RecordToolCall } from "./RecordToolCall";

const completed = getRecordToolPresentation({
	input: { id: "north-star" },
	output: {
		record: {
			id: "north-star",
			slug: "north-star",
			status: "active",
			title: "North star",
			url: "/dashboard/records/north-star",
		},
	},
	state: "completed",
	toolName: "record_get",
});
const _approval = getRecordToolPresentation({
	input: { id: "north-star", title: "North star" },
	state: "approval-requested",
	toolName: "record_delete",
});
const _listReport = getRecordToolPresentation({
	input: { includeArchived: false },
	output: {
		items: [
			{
				descriptionMarkdown: "The current launch brief.",
				id: "north-star",
				slug: "north-star",
				status: "active",
				title: "North star",
				updatedAt: "2026-08-01T12:00:00.000Z",
				url: "/dashboard/records/north-star",
			},
		],
		total: 1,
	},
	state: "completed",
	toolName: "records_list",
});
const _createApproval = getRecordToolPresentation({
	input: {
		descriptionMarkdown: "Prepared by the Assistant for review.",
		status: "draft",
		title: "Quarterly plan",
	},
	state: "approval-requested",
	toolName: "record_create",
});
const _streamingInput = getRecordToolPresentation({
	input: { id: "launch-brief", title: "Updated" },
	state: "input-streaming",
	toolName: "record_update",
});
const _availableInput = getRecordToolPresentation({
	input: { query: "launch" },
	state: "input-available",
	toolName: "records_list",
});
function CatalogPreview() {
	const render = () => (
		<div className="grid gap-6">
			<RecordToolCall presentation={completed} />
			<RecordToolCall.Skeleton />
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{ presentation: completed } } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "dashboard-entity-record-tool-call",
	name: "RecordToolCall",
	role: "Assistant record-tool lifecycle renderer for inputs, approvals, results, errors, and loading parity.",
	importStatement: 'import { RecordToolCall } from "./RecordToolCall";',
	chooseWhen: [
		"An assistant message must present a record operation from preparation through approval and completion.",
	],
	chooseInstead: [
		"Use RecordIdentity for a passive record reference or StatusMessage for non-tool feedback.",
	],
	compounds: [],
	exclusions: [
		"Generic code blocks or cards standing in for tool lifecycle states.",
		"Page-local approval controls that bypass the assistant tool contract.",
	],
	guarantees: [
		{
			label: "Completed And Loading",
			storyId: "dashboard-entity-record-tool-call--completed-and-loading",
		},
	],
	family: "Dashboard",
	group: "Entities / Record",
	sweepSpan: "full",
	previewTargets: [
		{
			id: "completed-and-loading",
			name: "Completed And Loading",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview,
		},
	],
});
