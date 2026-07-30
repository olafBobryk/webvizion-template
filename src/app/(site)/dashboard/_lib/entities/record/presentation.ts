import { surfaceHref } from "@/lib/routes";
import type {
	DashboardColumnDefinition,
	DashboardCommandPresentation,
	DashboardEntityPresentationDefinition,
	DashboardFieldDefinition,
	DashboardVariantPresentation,
} from "../../presentation/contracts";
import type { ReferenceRecord, ReferenceRecordStatus } from "./domain";

export const recordPresentationDefinition = {
	actions: {
		archive: "Archive record",
		create: "Create record",
		delete: "Delete record",
		edit: "Edit record",
		save: "Save record",
	},
	emptyState: {
		description:
			"Create the first organization-scoped record to populate this collection.",
		icon: "database",
		title: "No records yet",
	},
	icon: "database",
	nouns: {
		plural: "Records",
		shortLabel: "Record",
		singular: "Reference record",
	},
} satisfies DashboardEntityPresentationDefinition;

export const recordStatusPresentation = {
	active: {
		description: "Available to normal product workflows.",
		label: "Active record",
		shortLabel: "Active",
		tone: "success",
	},
	archived: {
		description: "Retained outside the active collection.",
		label: "Archived record",
		shortLabel: "Archived",
		tone: "neutral",
	},
	draft: {
		description: "Still being prepared.",
		label: "Draft record",
		shortLabel: "Draft",
		tone: "neutral",
	},
	review: {
		description: "Ready for another person to review.",
		label: "Record in review",
		shortLabel: "Review",
		tone: "warning",
	},
} satisfies Record<ReferenceRecordStatus, DashboardVariantPresentation>;

export function formatRecordDate(value: string) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "Date unavailable";
	return new Intl.DateTimeFormat("en", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
}

export function getRecordPresentation(record: ReferenceRecord) {
	const title = record.title.trim() || "Untitled record";
	return {
		createdAtLabel: formatRecordDate(record.createdAt),
		descriptionMarkdown: record.descriptionMarkdown,
		href: surfaceHref("dashboard.record", { recordId: record.id }),
		id: record.id,
		ownerMemberId: record.ownerMemberId,
		properties: record.properties,
		slugLabel: record.slug || "Slug unavailable",
		status: recordStatusPresentation[record.status],
		statusLabel: recordStatusPresentation[record.status].shortLabel,
		title,
		updatedAtLabel: formatRecordDate(record.updatedAt),
	};
}

export type RecordPresentation = ReturnType<typeof getRecordPresentation>;

export const recordFieldDefinitions = [
	{
		emptyValue: "Untitled record",
		getValue: (record) => getRecordPresentation(record).title,
		icon: "cards",
		id: "title",
		label: "Title",
	},
	{
		emptyValue: "Slug unavailable",
		getValue: (record) => getRecordPresentation(record).slugLabel,
		icon: "link",
		id: "slug",
		label: "Slug",
	},
	{
		emptyValue: "Status unavailable",
		getValue: (record) => getRecordPresentation(record).statusLabel,
		icon: "flag",
		id: "status",
		label: "Status",
	},
	{
		emptyValue: "Date unavailable",
		getValue: (record) => getRecordPresentation(record).updatedAtLabel,
		icon: "calendar",
		id: "updated",
		label: "Updated",
	},
] satisfies readonly DashboardFieldDefinition<ReferenceRecord>[];

export const recordColumnDefinitions = [
	{
		getSortValue: (record) => getRecordPresentation(record).title,
		id: "record",
		label: "Record",
	},
	{
		getSortValue: (record) => getRecordPresentation(record).statusLabel,
		id: "status",
		label: "Status",
	},
	{
		getSortValue: (record) => record.updatedAt,
		id: "updated",
		label: "Updated",
	},
] satisfies readonly DashboardColumnDefinition<ReferenceRecord>[];

export function getRecordCommand(
	record: RecordPresentation,
): DashboardCommandPresentation {
	return {
		description: `${record.statusLabel} · updated ${record.updatedAtLabel}`,
		href: record.href,
		id: `record.open.${record.id}`,
		keywords: ["record", record.slugLabel, record.statusLabel],
		label: record.title,
	};
}
