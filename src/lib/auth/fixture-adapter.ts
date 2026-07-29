import "server-only";

import type {
	ApplicationAdapters,
	AuthUser,
	OrganizationInvitation,
} from "./contracts";
import {
	acceptFixtureInvitation,
	authenticateFixturePassword,
	createFixtureAuthState,
	createFixtureInvitation,
	createFixtureSession,
	deleteFixtureSession,
	type FixtureAuthState,
	fixtureAuthMethods,
	getFixtureSession,
	listActiveFixtureMemberships,
	listFixtureInvitations,
	listFixtureOrganizationMembers,
	previewFixtureInvitation,
	refreshFixtureInvitation,
	removeFixtureIdentity,
	removeFixtureMembership,
	requestFixturePasswordRecovery,
	resetFixturePassword,
	resolveFixtureSession,
	revokeFixtureInvitation,
	selectFixtureOrganization,
	transferFixtureOwnership,
	updateFixtureMembershipRole,
	updateFixtureOrganization,
	updateFixtureUser,
	validateFixturePasswordRecoveryToken,
} from "./fixture";
import { sendPasswordRecoveryEmail } from "./passwordRecoveryEmail";

declare global {
	var __averloFixtureAuthState: FixtureAuthState | undefined;
}

export function getFixtureAuthState() {
	globalThis.__averloFixtureAuthState ??= createFixtureAuthState();
	return globalThis.__averloFixtureAuthState;
}

export function resetFixtureAuthState() {
	globalThis.__averloFixtureAuthState = createFixtureAuthState();
	return globalThis.__averloFixtureAuthState;
}

export const fixtureAdapters: ApplicationAdapters = {
	auth: {
		id: "fixture",
		durability: "non-durable-fixture",
		methods: fixtureAuthMethods,
		async authenticatePassword(input) {
			return authenticateFixturePassword(getFixtureAuthState(), input);
		},
		async createSession(userId) {
			return createFixtureSession(getFixtureAuthState(), userId);
		},
		async getSession(sessionId) {
			return getFixtureSession(getFixtureAuthState(), sessionId);
		},
		async deleteSession(sessionId) {
			deleteFixtureSession(getFixtureAuthState(), sessionId);
		},
		async updateUser(
			userId,
			patch: Partial<Pick<AuthUser, "name" | "profilePictureUrl">>,
		) {
			return updateFixtureUser(getFixtureAuthState(), userId, patch);
		},
		async requestPasswordRecovery(input) {
			const recovery = requestFixturePasswordRecovery(
				getFixtureAuthState(),
				input,
			);
			if (!recovery) return { delivery: "email" as const };

			const delivered = await sendPasswordRecoveryEmail({
				recoveryUrl: recovery.resetUrl,
				to: recovery.email,
			});
			return delivered
				? { delivery: "email" as const }
				: { delivery: "local" as const, previewUrl: recovery.resetUrl };
		},
		async validatePasswordRecoveryToken(input) {
			validateFixturePasswordRecoveryToken(getFixtureAuthState(), input);
		},
		async resetPassword(input) {
			resetFixturePassword(getFixtureAuthState(), input);
		},
	},
	organizations: {
		async resolveSession(sessionId) {
			return resolveFixtureSession(getFixtureAuthState(), sessionId);
		},
		async getOrganization(organizationId) {
			return getFixtureAuthState().organizations.get(organizationId) ?? null;
		},
		async updateOrganization(input) {
			return updateFixtureOrganization(
				getFixtureAuthState(),
				input.organizationId,
				input.patch,
			);
		},
		async selectOrganization(sessionId, organizationId) {
			return selectFixtureOrganization(
				getFixtureAuthState(),
				sessionId,
				organizationId,
			);
		},
		async listMemberships(userId) {
			return listActiveFixtureMemberships(getFixtureAuthState(), userId);
		},
		async listOrganizationMembers(organizationId) {
			return listFixtureOrganizationMembers(
				getFixtureAuthState(),
				organizationId,
			);
		},
		async updateMembershipRole(input) {
			return updateFixtureMembershipRole(getFixtureAuthState(), input);
		},
		async removeMembership(input) {
			return removeFixtureMembership(getFixtureAuthState(), input);
		},
		async transferOwnership(input) {
			return transferFixtureOwnership(getFixtureAuthState(), input);
		},
	},
	invitations: {
		async listInvitations(organizationId) {
			return listFixtureInvitations(getFixtureAuthState(), organizationId);
		},
		async previewInvitation(input) {
			return previewFixtureInvitation(getFixtureAuthState(), input);
		},
		async acceptInvitation(input) {
			return acceptFixtureInvitation(getFixtureAuthState(), input);
		},
		async createInvitation(
			input: Pick<
				OrganizationInvitation,
				"email" | "organizationId" | "role"
			> & { actorMembershipId: string },
		) {
			return createFixtureInvitation(getFixtureAuthState(), input);
		},
		async refreshInvitation(input) {
			return refreshFixtureInvitation(getFixtureAuthState(), input);
		},
		async revokeInvitation(input) {
			return revokeFixtureInvitation(getFixtureAuthState(), input);
		},
	},
	identities: {
		async removeIdentity(input) {
			return removeFixtureIdentity(getFixtureAuthState(), input);
		},
	},
};
