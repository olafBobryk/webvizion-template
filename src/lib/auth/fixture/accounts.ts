import type { AuthUser } from "../contracts";
import { AuthDomainError } from "../errors";
import { copyFixtureUser, type FixtureAuthState } from "./state";

export function authenticateFixturePassword(
	state: FixtureAuthState,
	input: { email: string; password: string },
) {
	const email = input.email.trim().toLowerCase();
	const credential = state.credentials.find(
		(candidate) =>
			candidate.email === email && candidate.password === input.password,
	);
	const user = credential ? state.users.get(credential.userId) : null;
	if (!user || user.isBanned) {
		throw new AuthDomainError("invalid-credentials");
	}
	return copyFixtureUser(user, state.identities.get(user.id) ?? []);
}

export function updateFixtureUser(
	state: FixtureAuthState,
	userId: string,
	patch: Partial<Pick<AuthUser, "name" | "profilePictureUrl">>,
) {
	const user = state.users.get(userId);
	if (!user) throw new AuthDomainError("session-required");
	const next = {
		...user,
		name: patch.name?.trim() || user.name,
		profilePictureUrl: Object.hasOwn(patch, "profilePictureUrl")
			? patch.profilePictureUrl
			: user.profilePictureUrl,
	};
	state.users.set(userId, next);
	return copyFixtureUser(next, state.identities.get(userId) ?? []);
}

export function removeFixtureIdentity(
	state: FixtureAuthState,
	input: { identityId: string; userId: string },
) {
	const identities = state.identities.get(input.userId) ?? [];
	const identity = identities.find(
		(candidate) => candidate.id === input.identityId,
	);
	if (!identity) return [...identities];
	const viable = identities.filter((candidate) => candidate.verified);
	if (identity.verified && viable.length <= 1) {
		throw new AuthDomainError("identity-last-viable");
	}
	const next = identities.filter(
		(candidate) => candidate.id !== input.identityId,
	);
	state.identities.set(input.userId, next);
	const user = state.users.get(input.userId);
	if (user) state.users.set(user.id, copyFixtureUser(user, next));
	return [...next];
}
