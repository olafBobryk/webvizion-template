import { redirect } from "next/navigation";
import { getSafeContinuationPath } from "@/lib/auth/continuation";
import { applicationAdapters } from "@/lib/auth/server";
import { requireDashboardCapability } from "../../_registry/access.server";
import { dashboardFeatureConfig } from "../../_registry/surfaceRegistry";
import { OrganizationSwitchSurface } from "./_components/OrganizationSwitchSurface";

export default async function DashboardOrganizationSwitchPage({
	searchParams,
}: {
	searchParams: Promise<{ message?: string; next?: string }>;
}) {
	const query = await searchParams;
	const next = getSafeContinuationPath(query.next, "/dashboard");
	const { context } = await requireDashboardCapability("organization.read");
	if (
		!dashboardFeatureConfig.organizationSwitcher ||
		context.memberships.length <= 1
	) {
		redirect("/dashboard/organization");
	}
	const choices = (
		await Promise.all(
			context.memberships.map(async (membership) => ({
				membership,
				organization: await applicationAdapters.organizations.getOrganization(
					membership.organizationId,
				),
			})),
		)
	).flatMap(({ membership, organization }) =>
		organization ? [{ membership, organization }] : [],
	);

	return (
		<OrganizationSwitchSurface
			choices={choices}
			currentOrganizationId={context.organization.id}
			next={next}
		/>
	);
}
