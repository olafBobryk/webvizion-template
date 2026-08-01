import { requireDashboardCapability } from "../_registry/access.server";
import { AssistantNewThreadSurface } from "./_components/AssistantNewThreadSurface";

export default async function AssistantPage() {
	await requireDashboardCapability("assistant.use");
	return <AssistantNewThreadSurface />;
}
