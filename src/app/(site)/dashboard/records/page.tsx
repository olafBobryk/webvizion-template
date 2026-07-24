import {
	getMemberCommand,
	getMemberPresentation,
} from "../_lib/entities/member/presentation";
import {
	getRecordCommand,
	getRecordPresentation,
} from "../_lib/entities/record/presentation";
import { listReferenceMembers } from "../_lib/fixtures/reference-members.server";
import { listReferenceRecords } from "../_lib/fixtures/reference-records.server";
import { requireDashboardCapability } from "../_registry/access.server";
import { RecordsSurface } from "./_components/RecordsSurface";

export default async function DashboardRecordsPage() {
	const { capabilities, context } =
		await requireDashboardCapability("records.read");
	const records = listReferenceRecords(context.organization.id);
	const members = listReferenceMembers(context.organization.id).map(
		getMemberPresentation,
	);
	return (
		<RecordsSurface
			commands={[
				...records.map(getRecordPresentation).map(getRecordCommand),
				...members.map(getMemberCommand),
			]}
			canWrite={capabilities.has("records.write")}
			initialRecords={records}
			members={members}
			organizationName={context.organization.name}
		/>
	);
}
