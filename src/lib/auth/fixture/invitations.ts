import { randomBytes, randomUUID } from "node:crypto";
import type {
	OrganizationInvitation,
	OrganizationMembership,
} from "../contracts";
import { AuthDomainError } from "../errors";
import {
	listFixtureOrganizationMembers,
	requireFixtureAccessManager,
} from "./organizations";
import {
	type FixtureAuthState,
	fixtureInvitationLifetimeMs,
	fixtureNowIso,
} from "./state";

function validateFixtureInvitation(
	state: FixtureAuthState,
	input: { invitationId: string; tokenHash: string },
	now = new Date(),
) {
	const invitation = state.invitations.get(input.invitationId);
	if (!invitation || invitation.tokenHash !== input.tokenHash) {
		throw new AuthDomainError("invitation-invalid");
	}
	if (invitation.revokedAt) {
		throw new AuthDomainError("invitation-revoked");
	}
	if (invitation.acceptedAt) {
		throw new AuthDomainError("invitation-accepted");
	}
	if (new Date(invitation.expiresAt).getTime() <= now.getTime()) {
		throw new AuthDomainError("invitation-expired");
	}
	return invitation;
}

export function previewFixtureInvitation(
	state: FixtureAuthState,
	input: { invitationId: string; tokenHash: string },
	now = new Date(),
) {
	return { ...validateFixtureInvitation(state, input, now) };
}

export function acceptFixtureInvitation(
	state: FixtureAuthState,
	input: { invitationId: string; tokenHash: string; userId: string },
	now = new Date(),
) {
	const invitation = validateFixtureInvitation(state, input, now);
	const user = state.users.get(input.userId);
	if (!user) throw new AuthDomainError("session-required");
	if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
		throw new AuthDomainError("invitation-recipient-mismatch");
	}

	const existing = [...state.memberships.values()].find(
		(membership) =>
			membership.userId === user.id &&
			membership.organizationId === invitation.organizationId,
	);
	const membership: OrganizationMembership = existing
		? {
				...existing,
				createdAt: existing.createdAt || fixtureNowIso(now),
				role: invitation.role,
				status: "active",
			}
		: {
				createdAt: fixtureNowIso(now),
				id: `membership-${randomUUID()}`,
				organizationId: invitation.organizationId,
				role: invitation.role,
				status: "active",
				userId: user.id,
			};

	// This synchronous state transition is the fixture adapter's atomic boundary.
	state.memberships.set(membership.id, membership);
	state.invitations.set(invitation.id, {
		...invitation,
		acceptedAt: fixtureNowIso(now),
	});
	return { ...membership };
}

export function createFixtureInvitation(
	state: FixtureAuthState,
	input: Pick<OrganizationInvitation, "email" | "organizationId" | "role"> & {
		actorMembershipId: string;
	},
	now = new Date(),
) {
	const actor = requireFixtureAccessManager(state, input.actorMembershipId);
	if (actor.organizationId !== input.organizationId) {
		throw new AuthDomainError("membership-role-forbidden");
	}
	if (input.role === "admin" && actor.role !== "owner") {
		throw new AuthDomainError("invitation-role-forbidden");
	}
	const email = input.email.trim().toLowerCase();
	const alreadyMember = listFixtureOrganizationMembers(
		state,
		input.organizationId,
	).some((member) => member.user.email.toLowerCase() === email);
	if (alreadyMember) {
		throw new AuthDomainError("invitation-member-conflict");
	}
	const pendingInvitation = [...state.invitations.values()].find(
		(invitation) =>
			invitation.email.toLowerCase() === email &&
			invitation.organizationId === input.organizationId &&
			!invitation.acceptedAt &&
			!invitation.revokedAt,
	);
	if (pendingInvitation) {
		throw new AuthDomainError("invitation-pending-conflict");
	}

	const invitation: OrganizationInvitation = {
		id: randomUUID(),
		organizationId: input.organizationId,
		email,
		role: input.role,
		tokenHash: randomBytes(24).toString("base64url"),
		createdAt: fixtureNowIso(now),
		expiresAt: fixtureNowIso(
			new Date(now.getTime() + fixtureInvitationLifetimeMs),
		),
		acceptedAt: null,
		revokedAt: null,
	};
	state.invitations.set(invitation.id, invitation);
	return { ...invitation };
}

export function listFixtureInvitations(
	state: FixtureAuthState,
	organizationId: string,
) {
	return [...state.invitations.values()]
		.filter((invitation) => invitation.organizationId === organizationId)
		.map((invitation) => ({ ...invitation }))
		.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

function requireManageableFixtureInvitation(
	state: FixtureAuthState,
	input: { actorMembershipId: string; invitationId: string },
) {
	const actor = requireFixtureAccessManager(state, input.actorMembershipId);
	const invitation = state.invitations.get(input.invitationId);
	if (
		!invitation ||
		invitation.organizationId !== actor.organizationId ||
		invitation.acceptedAt ||
		invitation.revokedAt
	) {
		throw new AuthDomainError("invitation-invalid");
	}
	if (actor.role === "admin" && invitation.role !== "member") {
		throw new AuthDomainError("invitation-role-forbidden");
	}
	return invitation;
}

export function refreshFixtureInvitation(
	state: FixtureAuthState,
	input: { actorMembershipId: string; invitationId: string },
	now = new Date(),
) {
	const invitation = requireManageableFixtureInvitation(state, input);
	const next = {
		...invitation,
		createdAt: fixtureNowIso(now),
		expiresAt: fixtureNowIso(
			new Date(now.getTime() + fixtureInvitationLifetimeMs),
		),
		tokenHash: randomBytes(24).toString("base64url"),
	};
	state.invitations.set(next.id, next);
	return { ...next };
}

export function revokeFixtureInvitation(
	state: FixtureAuthState,
	input: { actorMembershipId: string; invitationId: string },
	now = new Date(),
) {
	const invitation = requireManageableFixtureInvitation(state, input);
	const next = { ...invitation, revokedAt: fixtureNowIso(now) };
	state.invitations.set(next.id, next);
	return { ...next };
}
