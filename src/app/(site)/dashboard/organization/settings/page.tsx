import { applicationAdapters } from "@/lib/auth/server";
import { isOrganizationInvitationPending } from "../../_lib/entities/invitation/presentation";
import { requireDashboardCapability } from "../../_registry/access.server";
import { OrganizationSettingsSurface } from "./_components/OrganizationSettingsSurface";

export default async function DashboardOrganizationSettingsPage() {
	const { context } = await requireDashboardCapability("organization.manage");
	const [members, invitations] = await Promise.all([
		applicationAdapters.organizations.listOrganizationMembers(
			context.organization.id,
		),
		applicationAdapters.invitations.listInvitations(context.organization.id),
	]);
	const now = new Date();
	const pendingInvitationCount = invitations.filter((invitation) =>
		isOrganizationInvitationPending(invitation, now),
	).length;

	return (
		<OrganizationSettingsSurface
			activeMemberCount={members.length}
			pendingInvitationCount={pendingInvitationCount}
		/>
	);
}
