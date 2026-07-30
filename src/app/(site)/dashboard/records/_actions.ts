"use server";

import { revalidatePath } from "next/cache";
import { hrefFor, surfaceHref } from "@/lib/routes";
import type {
	ReferenceRecordCreateInput,
	ReferenceRecordUpdateInput,
} from "../_lib/entities/record/domain";
import {
	archiveReferenceRecord,
	createReferenceRecord,
	deleteReferenceRecord,
	updateReferenceRecord,
} from "../_lib/fixtures/reference-records.server";
import { requireDashboardCapability } from "../_registry/access.server";

function refreshRecordRoutes(recordId?: string) {
	revalidatePath(hrefFor("dashboard.overview"));
	revalidatePath(hrefFor("dashboard.records"));
	if (recordId) {
		revalidatePath(surfaceHref("dashboard.record", { recordId }));
	}
}

export async function createReferenceRecordAction(
	input: ReferenceRecordCreateInput,
	simulateFailure = false,
) {
	const { context } = await requireDashboardCapability("records.write");
	const result = createReferenceRecord(context.organization.id, input, {
		simulateFailure,
	});
	if (result.ok) refreshRecordRoutes(result.record.id);
	return result;
}

export async function updateReferenceRecordAction(
	recordId: string,
	patch: ReferenceRecordUpdateInput,
	simulateFailure = false,
) {
	const { context } = await requireDashboardCapability("records.write");
	const result = updateReferenceRecord(
		context.organization.id,
		recordId,
		patch,
		{
			simulateFailure,
		},
	);
	if (result.ok) refreshRecordRoutes(recordId);
	return result;
}

export async function archiveReferenceRecordAction(
	recordId: string,
	simulateFailure = false,
) {
	const { context } = await requireDashboardCapability("records.write");
	const result = archiveReferenceRecord(context.organization.id, recordId, {
		simulateFailure,
	});
	if (result.ok) refreshRecordRoutes(recordId);
	return result;
}

export async function deleteReferenceRecordAction(
	recordId: string,
	simulateFailure = false,
) {
	const { context } = await requireDashboardCapability("records.write");
	const result = deleteReferenceRecord(context.organization.id, recordId, {
		simulateFailure,
	});
	if (result.ok) refreshRecordRoutes(recordId);
	return result;
}
