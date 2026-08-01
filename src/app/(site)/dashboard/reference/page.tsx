import { requireDashboardCapability } from "../_registry/access.server";
import { ReferenceSurface } from "./_components/ReferenceSurface";

export default async function DashboardReferencePage() {
	await requireDashboardCapability("debug.use");
	return <ReferenceSurface />;
}
