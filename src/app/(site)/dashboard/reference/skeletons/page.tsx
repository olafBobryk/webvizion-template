import { getMemberPresentation } from "../../_lib/entities/member/presentation";
import { toOrganizationEntity } from "../../_lib/entities/organization/domain";
import { getOrganizationPresentation } from "../../_lib/entities/organization/presentation";
import { listReferenceMembers } from "../../_lib/fixtures/reference-members.server";
import { listReferenceRecords } from "../../_lib/fixtures/reference-records.server";
import { requireDashboardCapability } from "../../_registry/access.server";
import { ReferenceSkeletonsSurface } from "./_components/ReferenceSkeletonsSurface";

export default async function DashboardSkeletonReferencePage() {
	const { capabilities, context } =
		await requireDashboardCapability("debug.use");
	const members = listReferenceMembers(context.organization.id).map(
		getMemberPresentation,
	);
	const records = listReferenceRecords(context.organization.id);
	const organization = getOrganizationPresentation(
		toOrganizationEntity(context.organization, context.membership.role),
	);

	return (
		<ReferenceSkeletonsSurface
			canWrite={capabilities.has("records.write")}
			member={members[0]}
			members={members}
			organization={organization}
			records={records}
		/>
	);
}
