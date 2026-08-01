import "server-only";

import type {
	ReferenceRecordCreateInput,
	ReferenceRecordUpdateInput,
} from "@/app/(site)/dashboard/_lib/entities/record/domain";
import { getRecordPresentation } from "@/app/(site)/dashboard/_lib/entities/record/presentation";
import {
	archiveReferenceRecord,
	createReferenceRecord,
	deleteReferenceRecord,
	getReferenceRecord,
	listReferenceRecords,
	updateReferenceRecord,
} from "@/app/(site)/dashboard/_lib/fixtures/reference-records.server";
import type { AssistantToolName } from "./contracts";

type RecordToolContext = { canWrite: boolean; organizationId: string };

function object(value: unknown): Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value))
		throw new Error("Tool input must be an object.");
	return value as Record<string, unknown>;
}

function idInput(value: unknown) {
	const id = object(value).id;
	if (typeof id !== "string" || !id.trim())
		throw new Error("A record id is required.");
	return id;
}

function requireWrite(context: RecordToolContext) {
	if (!context.canWrite)
		throw new Error("Your role does not allow Record mutations.");
}

function toolRecord(
	record: NonNullable<ReturnType<typeof getReferenceRecord>>,
) {
	const presentation = getRecordPresentation(record);
	return {
		descriptionMarkdown: record.descriptionMarkdown,
		id: record.id,
		slug: presentation.slugLabel,
		status: record.status,
		title: presentation.title,
		updatedAt: record.updatedAt,
		url: presentation.href,
	};
}

export async function executeRecordTool(
	name: AssistantToolName,
	input: unknown,
	context: RecordToolContext,
) {
	switch (name) {
		case "records_list": {
			const values = object(input ?? {});
			const query =
				typeof values.query === "string"
					? values.query.trim().toLowerCase()
					: "";
			const records = listReferenceRecords(context.organizationId, {
				includeArchived: values.includeArchived === true,
			})
				.filter(
					(record) =>
						!query ||
						`${record.title} ${record.slug} ${record.status}`
							.toLowerCase()
							.includes(query),
				)
				.slice(0, 20);
			return { items: records.map(toolRecord), total: records.length };
		}
		case "record_get": {
			const record = getReferenceRecord(context.organizationId, idInput(input));
			if (!record) throw new Error("The record is no longer available.");
			return { record: toolRecord(record) };
		}
		case "record_create": {
			requireWrite(context);
			const values = object(input);
			if (typeof values.title !== "string")
				throw new Error("A title is required.");
			const result = createReferenceRecord(context.organizationId, {
				descriptionMarkdown:
					typeof values.descriptionMarkdown === "string"
						? values.descriptionMarkdown
						: undefined,
				status: ["active", "draft", "review"].includes(String(values.status))
					? (values.status as ReferenceRecordCreateInput["status"])
					: undefined,
				title: values.title,
			});
			if (!result.ok) throw new Error(result.message);
			return {
				message: result.message,
				record: toolRecord(result.record),
				url: getRecordPresentation(result.record).href,
			};
		}
		case "record_update": {
			requireWrite(context);
			const values = object(input);
			const id = idInput(values);
			const patch: ReferenceRecordUpdateInput = {};
			if (typeof values.title === "string") patch.title = values.title;
			if (typeof values.descriptionMarkdown === "string")
				patch.descriptionMarkdown = values.descriptionMarkdown;
			if (
				["active", "archived", "draft", "review"].includes(
					String(values.status),
				)
			)
				patch.status = values.status as ReferenceRecordUpdateInput["status"];
			const result = updateReferenceRecord(context.organizationId, id, patch);
			if (!result.ok) throw new Error(result.message);
			return {
				message: result.message,
				record: toolRecord(result.record),
				url: getRecordPresentation(result.record).href,
			};
		}
		case "record_archive": {
			requireWrite(context);
			const result = archiveReferenceRecord(
				context.organizationId,
				idInput(input),
			);
			if (!result.ok) throw new Error(result.message);
			return {
				message: result.message,
				record: toolRecord(result.record),
				url: getRecordPresentation(result.record).href,
			};
		}
		case "record_delete": {
			requireWrite(context);
			const result = deleteReferenceRecord(
				context.organizationId,
				idInput(input),
			);
			if (!result.ok) throw new Error(result.message);
			return {
				message: result.message,
				record: toolRecord(result.record),
				url: "/dashboard/records",
			};
		}
	}
}
