import type { AssistantToolState } from "@/lib/assistant/contracts";
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
		searchText: `${title} ${record.slug} ${record.status}`,
		slugLabel: record.slug || "Slug unavailable",
		status: recordStatusPresentation[record.status],
		statusLabel: recordStatusPresentation[record.status].shortLabel,
		title,
		updatedAtLabel: formatRecordDate(record.updatedAt),
	};
}

export type RecordPresentation = ReturnType<typeof getRecordPresentation>;

export type RecordIdentityPresentation = Pick<
	RecordPresentation,
	"slugLabel" | "title"
>;

export const recordToolPresentationDefinition = {
	record_archive: { label: "Archive record", tone: "warning" },
	record_create: { label: "Create record", tone: "primary" },
	record_delete: { label: "Delete record", tone: "danger" },
	record_get: { label: "Get record", tone: "neutral" },
	record_update: { label: "Update record", tone: "primary" },
	records_list: { label: "List records", tone: "neutral" },
} as const;

export type RecordToolName = keyof typeof recordToolPresentationDefinition;

export type RecordToolPresentation = {
	description: string;
	destructive: boolean;
	error: string | null;
	items: Array<{
		descriptionMarkdown: string;
		href: string | null;
		id: string;
		slugLabel: string;
		status: DashboardVariantPresentation | null;
		title: string;
		updatedAtLabel: string | null;
	}>;
	input: unknown;
	label: string;
	state: AssistantToolState;
	stateLabel: string;
	tone: "danger" | "neutral" | "primary" | "success" | "warning";
	toolName: RecordToolName;
};

export type RecordToolItem = RecordToolPresentation["items"][number];

export type RecordToolProposalValue = {
	descriptionMarkdown: string;
	slugLabel: string;
	status: DashboardVariantPresentation | null;
	title: string;
};

export type RecordToolProposalPresentation = {
	changedFields: readonly ("description" | "status" | "title")[];
	current: RecordToolProposalValue | null;
	proposed: RecordToolProposalValue | null;
};

const recordToolStateLabels = {
	"approval-requested": "Approval required",
	approved: "Approved",
	completed: "Completed",
	denied: "Declined",
	error: "Failed",
	"input-available": "Running",
	"input-streaming": "Pending",
} satisfies Record<AssistantToolState, string>;

function asObject(value: unknown) {
	return value && typeof value === "object" && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: null;
}

function proposalStatus(value: unknown) {
	return typeof value === "string" &&
		Object.hasOwn(recordStatusPresentation, value)
		? recordStatusPresentation[value as ReferenceRecordStatus]
		: null;
}

export function getRecordToolProposalPresentation(input: {
	current?: RecordToolItem | null;
	input: unknown;
	toolName: RecordToolName;
}): RecordToolProposalPresentation {
	const values = asObject(input.input) ?? {};
	const current = input.current
		? {
				descriptionMarkdown: input.current.descriptionMarkdown,
				slugLabel: input.current.slugLabel,
				status: input.current.status,
				title: input.current.title,
			}
		: null;
	if (input.toolName === "record_delete") {
		return { changedFields: [], current, proposed: null };
	}
	if (
		!["record_create", "record_update", "record_archive"].includes(
			input.toolName,
		)
	) {
		return { changedFields: [], current, proposed: null };
	}

	const proposedStatus =
		input.toolName === "record_archive"
			? recordStatusPresentation.archived
			: (proposalStatus(values.status) ??
				current?.status ??
				recordStatusPresentation.draft);
	const proposed = {
		descriptionMarkdown:
			typeof values.descriptionMarkdown === "string"
				? values.descriptionMarkdown
				: (current?.descriptionMarkdown ?? ""),
		slugLabel: current?.slugLabel ?? "New record",
		status: proposedStatus,
		title:
			typeof values.title === "string" && values.title.trim()
				? values.title.trim()
				: (current?.title ?? "Untitled record"),
	};
	const changedFields = [
		proposed.title !== current?.title ? "title" : null,
		proposed.status?.shortLabel !== current?.status?.shortLabel
			? "status"
			: null,
		proposed.descriptionMarkdown !== current?.descriptionMarkdown
			? "description"
			: null,
	].filter(
		(value): value is "description" | "status" | "title" => value !== null,
	);
	return { changedFields, current, proposed };
}

function toolItems(output: unknown) {
	const result = asObject(output);
	const values = Array.isArray(result?.items)
		? result.items
		: result?.record
			? [result.record]
			: [];
	return values.flatMap((value) => {
		const item = asObject(value);
		if (!item || typeof item.id !== "string") return [];
		const rawStatus = item.status;
		const status =
			typeof rawStatus === "string" &&
			Object.hasOwn(recordStatusPresentation, rawStatus)
				? recordStatusPresentation[rawStatus as ReferenceRecordStatus]
				: null;
		return [
			{
				descriptionMarkdown:
					typeof item.descriptionMarkdown === "string"
						? item.descriptionMarkdown
						: "",
				href: typeof item.url === "string" ? item.url : null,
				id: item.id,
				slugLabel:
					typeof item.slug === "string" && item.slug.trim()
						? item.slug.trim()
						: item.id,
				status,
				title:
					typeof item.title === "string" && item.title.trim()
						? item.title.trim()
						: item.id,
				updatedAtLabel:
					typeof item.updatedAt === "string"
						? formatRecordDate(item.updatedAt)
						: null,
			},
		];
	});
}

export function getRecordToolPresentation(input: {
	error?: string | null;
	input: unknown;
	output?: unknown;
	state: AssistantToolState;
	toolName: RecordToolName;
}): RecordToolPresentation {
	const definition = recordToolPresentationDefinition[input.toolName];
	const values = asObject(input.input);
	const recordId = typeof values?.id === "string" ? values.id : null;
	const title = typeof values?.title === "string" ? values.title : null;
	const isDelete = input.toolName === "record_delete";
	const itemCount = toolItems(input.output).length;
	const description =
		input.state === "approval-requested"
			? isDelete
				? `Permanently delete ${title ?? recordId ?? "this record"}. This cannot be undone.`
				: `${definition.label}: ${title ?? recordId ?? "review the proposed change"}.`
			: (input.error ??
				(input.toolName === "records_list" && input.state === "completed"
					? `${itemCount} ${itemCount === 1 ? "record" : "records"} found in the current organization.`
					: `${definition.label} ${recordId ? `for ${recordId}` : "in the current organization"}.`));
	return {
		description,
		destructive: isDelete,
		error: input.error ?? null,
		items: toolItems(input.output),
		input: input.input,
		label: definition.label,
		state: input.state,
		stateLabel: recordToolStateLabels[input.state],
		tone:
			input.state === "error" || isDelete
				? "danger"
				: input.state === "completed"
					? "success"
					: input.state === "input-streaming" ||
							input.state === "input-available"
						? "neutral"
						: definition.tone,
		toolName: input.toolName,
	};
}

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
