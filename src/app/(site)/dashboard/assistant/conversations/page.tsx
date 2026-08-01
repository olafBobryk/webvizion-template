import { assistantAdapters } from "@/lib/assistant/server";
import { requireDashboardCapability } from "../../_registry/access.server";
import { AssistantConversationsSurface } from "./_components/AssistantConversationsSurface";

export default async function ConversationsPage() {
	const { context } = await requireDashboardCapability("assistant.use");
	const initialThreads = await assistantAdapters.conversations.listThreads({
		organizationId: context.organization.id,
		userId: context.user.id,
	});
	return <AssistantConversationsSurface initialThreads={initialThreads} />;
}
