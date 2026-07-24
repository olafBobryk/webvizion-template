import { notFound } from "next/navigation";
import {
	getMemberCommand,
	getMemberPresentation,
} from "../../_lib/entities/member/presentation";
import {
	getRecordCommand,
	getRecordPresentation,
} from "../../_lib/entities/record/presentation";
import { listReferenceMembers } from "../../_lib/fixtures/reference-members.server";
import { getReferenceRecord } from "../../_lib/fixtures/reference-records.server";
import { requireDashboardCapability } from "../../_registry/access.server";
import { RecordSurface } from "./_components/RecordSurface";

export default async function DashboardRecordPage({
	params,
	searchParams,
}: {
	params: Promise<{ recordId: string }>;
	searchParams: Promise<{ "debug-mutation"?: string }>;
}) {
	const { recordId } = await params;
	const query = await searchParams;
	const { capabilities, context } =
		await requireDashboardCapability("records.read");
	const record = getReferenceRecord(context.organization.id, recordId);
	if (!record) notFound();
	const members = listReferenceMembers(context.organization.id).map(
		getMemberPresentation,
	);
	const presentation = getRecordPresentation(record);
	return (
		<RecordSurface
			commands={[
				getRecordCommand(presentation),
				...members.map(getMemberCommand),
			]}
			canWrite={capabilities.has("records.write")}
			description={`Reference detail in ${context.organization.name}.`}
			members={members}
			record={record}
			simulateFailure={query["debug-mutation"] === "fail"}
			title={presentation.title}
		/>
	);
}
