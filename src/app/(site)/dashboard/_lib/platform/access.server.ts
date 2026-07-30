import "server-only";

import { redirect } from "next/navigation";
import type { ResolvedOrganizationContext } from "@/lib/auth/contracts";
import { resolveCurrentSession } from "@/lib/auth/server";
import { hrefFor } from "@/lib/routes";
import type { PlatformActorSnapshot } from "./contracts";

export async function requireResolvedDashboardSession() {
	const resolution = await resolveCurrentSession();
	if (resolution.status !== "resolved") {
		throw new Error("A resolved dashboard session is required.");
	}
	return resolution;
}

export async function requirePlatformAdmin() {
	const resolution = await resolveCurrentSession();
	if (
		resolution.status !== "resolved" ||
		resolution.user.platformRole !== "admin"
	) {
		redirect(hrefFor("dashboard.overview"));
	}
	return resolution;
}

export function getPlatformActorSnapshot(
	resolution: Pick<
		ResolvedOrganizationContext,
		"membership" | "organization" | "user"
	>,
): PlatformActorSnapshot {
	return {
		email: resolution.user.email,
		membershipId: resolution.membership.id,
		name: resolution.user.name,
		organizationId: resolution.organization.id,
		organizationName: resolution.organization.name,
		organizationProfilePictureUrl:
			resolution.organization.profilePictureUrl?.trim() || null,
		organizationSlug: resolution.organization.slug,
		profilePictureUrl: resolution.user.profilePictureUrl?.trim() || null,
		role: resolution.membership.role,
		userId: resolution.user.id,
	};
}
