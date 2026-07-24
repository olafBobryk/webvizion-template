import { OverviewSurface } from "./_components/OverviewSurface";
import { requireDashboardCapability } from "./_registry/access.server";

export default async function DashboardPage() {
	await requireDashboardCapability("dashboard.view");
	return <OverviewSurface />;
}
