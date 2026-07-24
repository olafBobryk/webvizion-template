import { getAccountPresentation } from "../_lib/entities/account/presentation";
import { memberRolePresentation } from "../_lib/entities/member/presentation";
import { requireDashboardCapability } from "../_registry/access.server";
import { getDashboardCapabilities } from "../_registry/surfaceRegistry";
import { ProfileSurface } from "./_components/ProfileSurface";

export default async function DashboardProfilePage() {
	const { context } = await requireDashboardCapability("dashboard.view");
	const presentation = getAccountPresentation({
		membership: context.membership,
		organization: context.organization,
		user: context.user,
	});
	const capabilities = getDashboardCapabilities(
		context.membership.role,
		context.user.platformRole,
	);
	const role = memberRolePresentation[context.membership.role];

	return (
		<ProfileSurface
			capabilities={[...capabilities]}
			presentation={presentation}
			role={role}
		/>
	);
}
