import { OverviewSurface } from "./_components/OverviewSurface";
import { requireDashboardCapability } from "./_registry/access.server";

export default async function DashboardPage() {
	const { capabilities } = await requireDashboardCapability("dashboard.view");
	return <OverviewSurface showReference={capabilities.has("debug.use")} />;
}
