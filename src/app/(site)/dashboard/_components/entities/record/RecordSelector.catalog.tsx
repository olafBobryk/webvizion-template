"use client";

import { useState } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { getRecordPresentation } from "../../../_lib/entities/record/presentation";
import { RecordSelector } from "./RecordSelector";

const records = [
	["North star", "north-star", "active"],
	["Launch brief", "launch-brief", "review"],
	["Working notes", "working-notes", "draft"],
].map(([title, slug, status], index) =>
	getRecordPresentation({
		archivedAt: null,
		createdAt: "2026-01-12T08:00:00.000Z",
		descriptionMarkdown: "",
		id: `record-story-${index}`,
		organizationId: "organization-story",
		ownerMemberId: null,
		properties: [],
		slug,
		status: status as "active" | "draft" | "review",
		title,
		updatedAt: "2026-08-01T08:00:00.000Z",
	}),
);
function ControlledRecordSelector() {
	const [value, setValue] = useState<string | null>(records[0].id);
	return (
		<div className="w-80">
			<RecordSelector onChange={setValue} records={records} value={value} />
		</div>
	);
}
function CatalogPreview() {
	const render = () => <ControlledRecordSelector />;
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "dashboard-entity-record-selector",
	name: "RecordSelector",
	role: "Controlled record selection with canonical record identity and option semantics.",
	importStatement: 'import { RecordSelector } from "./RecordSelector";',
	chooseWhen: [
		"A form or workflow needs controlled selection from a known record collection.",
	],
	chooseInstead: [
		"Use RecordIdentity for read-only display or a generic SelectInput for non-record values.",
	],
	compounds: [],
	exclusions: [
		"Action menus that visually imitate persistent record selection.",
		"Page-local record option rendering or selection state.",
	],
	guarantees: [
		{
			label: "Selection",
			storyId: "dashboard-entity-record-selector--selection",
		},
	],
	family: "Dashboard",
	group: "Entities / Record",
	sweepSpan: "double",
	previewTargets: [
		{
			id: "selection",
			name: "Selection",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview,
		},
	],
});
