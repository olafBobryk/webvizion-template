import { memberRolePresentation } from "../_lib/entities/member/presentation";
import { toOrganizationEntity } from "../_lib/entities/organization/domain";
import { getOrganizationPresentation } from "../_lib/entities/organization/presentation";
import { requireDashboardCapability } from "../_registry/access.server";
import { OrganizationSurface } from "./_components/OrganizationSurface";

export default async function DashboardOrganizationPage() {
	const { capabilities, context } =
		await requireDashboardCapability("organization.read");
	const presentation = getOrganizationPresentation(
		toOrganizationEntity(context.organization, context.membership.role),
	);
	const canManage = capabilities.has("organization.manage");
	const rolePresentation = memberRolePresentation[context.membership.role];

	return (
		<OrganizationSurface
			canManage={canManage}
			modeLabel={
				context.organization.mode === "multi"
					? "Multi-organization"
					: "Single organization"
			}
			name={context.organization.name}
			presentation={presentation}
			role={rolePresentation}
			slug={context.organization.slug}
		/>
	);
}
