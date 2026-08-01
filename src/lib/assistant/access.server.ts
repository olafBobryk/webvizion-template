import "server-only";

import { getDashboardCapabilities } from "@/app/(site)/dashboard/_registry/surfaceRegistry";
import { resolveCurrentSession } from "@/lib/auth/server";

export async function resolveAssistantActor() {
	const resolution = await resolveCurrentSession();
	if (resolution.status !== "resolved") return null;
	const capabilities = getDashboardCapabilities(
		resolution.membership.role,
		resolution.user.platformRole,
	);
	if (!capabilities.has("assistant.use")) return null;
	return {
		actor: {
			organizationId: resolution.organization.id,
			userId: resolution.user.id,
		},
		capabilities,
		context: resolution,
	};
}
