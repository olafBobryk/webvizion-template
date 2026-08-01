"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { recordStatusPresentation } from "../../../_lib/entities/record/presentation";
import { RecordStatusChip } from "./RecordStatusChip";

const statuses = ["active", "archived", "draft", "review"] as const;
function CatalogPreview() {
	const render = () => (
		<div className="flex flex-wrap items-center gap-3">
			{statuses.map((status) => (
				<RecordStatusChip
					key={status}
					label={recordStatusPresentation[status].shortLabel}
					tone={recordStatusPresentation[status].tone}
				/>
			))}
			<RecordStatusChip.Skeleton />
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{ label: "Draft", tone: "neutral" } } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "dashboard-entity-record-status-chip",
	name: "RecordStatusChip",
	role: "Semantic record-status label with canonical state-to-tone mapping and loading geometry.",
	importStatement: 'import { RecordStatusChip } from "./RecordStatusChip";',
	chooseWhen: [
		"A record lifecycle state must be scanned as compact metadata in a row or detail view.",
	],
	chooseInstead: [
		"Use RecordIdentity when the record itself is primary, or StatusMessage for actionable feedback.",
	],
	compounds: [],
	exclusions: [
		"Caller-selected chip colors for record states.",
		"Interactive status selection controls.",
	],
	guarantees: [
		{
			label: "Statuses And Loading",
			storyId: "dashboard-entity-record-status-chip--statuses-and-loading",
		},
	],
	family: "Dashboard",
	group: "Entities / Record",
	previewTargets: [
		{
			id: "statuses-and-loading",
			name: "Statuses And Loading",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview,
		},
	],
});
