import { getAccountPresentation } from "../../_lib/entities/account/presentation";
import { getMemberPresentation } from "../../_lib/entities/member/presentation";
import { toOrganizationEntity } from "../../_lib/entities/organization/domain";
import { getOrganizationPresentation } from "../../_lib/entities/organization/presentation";
import { listReferenceMembers } from "../../_lib/fixtures/reference-members.server";
import { listReferenceRecords } from "../../_lib/fixtures/reference-records.server";
import { requireDashboardCapability } from "../../_registry/access.server";
import { EntityReferenceSurface } from "./_components/EntityReferenceSurface";

export default async function DashboardEntityReferencePage() {
	const { context } = await requireDashboardCapability("debug.use");
	return (
		<EntityReferenceSurface
			account={getAccountPresentation({
				membership: context.membership,
				organization: context.organization,
				user: context.user,
			})}
			members={listReferenceMembers(context.organization.id).map(
				getMemberPresentation,
			)}
			organization={getOrganizationPresentation(
				toOrganizationEntity(context.organization, context.membership.role),
			)}
			records={listReferenceRecords(context.organization.id).slice(0, 2)}
		/>
	);
}
