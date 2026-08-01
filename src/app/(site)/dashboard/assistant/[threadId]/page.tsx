import { notFound } from "next/navigation";
import { assistantAdapters } from "@/lib/assistant/server";
import { requireDashboardCapability } from "../../_registry/access.server";
import { AssistantThreadSurface } from "./_components/AssistantThreadSurface";

export default async function AssistantThreadPage({
	params,
}: {
	params: Promise<{ threadId: string }>;
}) {
	const { capabilities, context } =
		await requireDashboardCapability("assistant.use");
	const thread = await assistantAdapters.conversations.getThread(
		{ organizationId: context.organization.id, userId: context.user.id },
		(await params).threadId,
	);
	if (!thread) notFound();
	return (
		<AssistantThreadSurface
			canWrite={capabilities.has("records.write")}
			fixtureEnabled={capabilities.has("debug.use")}
			initialThread={thread}
		/>
	);
}
