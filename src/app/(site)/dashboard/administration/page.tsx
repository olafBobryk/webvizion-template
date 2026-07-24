import { Suspense } from "react";
import { applicationAdapters } from "@/lib/auth/server";
import { toOrganizationMemberEntity } from "../_lib/entities/member/domain";
import { requireDashboardCapability } from "../_registry/access.server";
import { AdministrationSurface } from "./_components/AdministrationSurface";

export default async function DashboardAdministrationPage() {
	const { context } = await requireDashboardCapability("organization.manage");
	const [memberRecords, invitations] = await Promise.all([
		applicationAdapters.organizations.listOrganizationMembers(
			context.organization.id,
		),
		applicationAdapters.invitations.listInvitations(context.organization.id),
	]);
	return (
		<Suspense>
			<AdministrationSurface
				actorMembershipId={context.membership.id}
				actorRole={context.membership.role}
				invitations={invitations.filter(
					(invitation) => !invitation.acceptedAt && !invitation.revokedAt,
				)}
				members={memberRecords.map(toOrganizationMemberEntity)}
				organizationName={context.organization.name}
			/>
		</Suspense>
	);
}
