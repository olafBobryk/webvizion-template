import "server-only";

import { getFixtureAuthState } from "@/lib/auth/fixture-adapter";
import type { ReferenceMember } from "../entities/member/domain";

const joinedAtByMembershipId: Record<string, string> = {
	"membership-multi-demo": "2026-02-14T10:00:00.000Z",
	"membership-multi-sandbox": "2026-03-04T09:30:00.000Z",
	"membership-template-owner": "2026-01-12T08:00:00.000Z",
};

function toReferenceMember(membershipId: string): ReferenceMember | null {
	const state = getFixtureAuthState();
	const membership = state.memberships.get(membershipId);
	if (membership?.status !== "active") return null;
	const user = state.users.get(membership.userId);
	if (!user) return null;
	return {
		createdAt:
			joinedAtByMembershipId[membership.id] ?? "2026-01-01T00:00:00.000Z",
		id: membership.id,
		organizationId: membership.organizationId,
		role: membership.role,
		user: {
			email: user.email,
			id: user.id,
			name: user.name,
			profilePictureUrl: user.profilePictureUrl ?? null,
		},
	};
}

export function listReferenceMembers(organizationId: string) {
	const state = getFixtureAuthState();
	return [...state.memberships.values()]
		.filter(
			(membership) =>
				membership.organizationId === organizationId &&
				membership.status === "active",
		)
		.map((membership) => toReferenceMember(membership.id))
		.filter((member): member is ReferenceMember => Boolean(member))
		.sort((left, right) =>
			(left.user.name ?? left.user.email).localeCompare(
				right.user.name ?? right.user.email,
			),
		);
}

export function getReferenceMember(organizationId: string, memberId: string) {
	const member = toReferenceMember(memberId);
	return member?.organizationId === organizationId ? member : null;
}
