import type {
	AuthSession,
	OrganizationMembership,
	ResolvedOrganizationContext,
	SessionResolution,
} from "../contracts";
import { AuthDomainError } from "../errors";
import { listActiveFixtureMemberships } from "./organizations";
import { copyFixtureUser, type FixtureAuthState, fixtureNowIso } from "./state";

const sessionLifetimeMs = 8 * 60 * 60 * 1000;
const fixtureSessionPrefix = "fixture-session:";

function fixtureSessionId(
	userId: string,
	issuedAt: number,
	selectedOrganizationId: string | null,
) {
	return `${fixtureSessionPrefix}${encodeURIComponent(userId)}:${issuedAt}:${selectedOrganizationId ? encodeURIComponent(selectedOrganizationId) : ""}`;
}

function restoreFixtureSession(
	state: FixtureAuthState,
	sessionId: string,
	now: Date,
) {
	const match = /^fixture-session:([^:]+):(\d+):([^:]*)$/.exec(sessionId);
	if (!match) return null;

	let userId: string;
	let selectedOrganizationId: string | null;
	try {
		userId = decodeURIComponent(match[1]);
		selectedOrganizationId = match[3] ? decodeURIComponent(match[3]) : null;
	} catch {
		return null;
	}
	const issuedAt = Number(match[2]);
	if (!state.users.has(userId) || !Number.isSafeInteger(issuedAt)) return null;

	const createdAt = new Date(issuedAt);
	const expiresAt = new Date(issuedAt + sessionLifetimeMs);
	if (Number.isNaN(createdAt.getTime()) || expiresAt <= now) return null;

	return {
		id: sessionId,
		userId,
		selectedOrganizationId,
		createdAt: fixtureNowIso(createdAt),
		expiresAt: fixtureNowIso(expiresAt),
	};
}

export function createFixtureSession(
	state: FixtureAuthState,
	userId: string,
	now = new Date(),
) {
	if (!state.users.has(userId)) {
		throw new AuthDomainError("invalid-credentials");
	}

	const session: AuthSession = {
		id: fixtureSessionId(userId, now.getTime(), null),
		userId,
		selectedOrganizationId: null,
		createdAt: fixtureNowIso(now),
		expiresAt: fixtureNowIso(new Date(now.getTime() + sessionLifetimeMs)),
	};
	state.sessions.set(session.id, session);
	return { ...session };
}

export function getFixtureSession(
	state: FixtureAuthState,
	sessionId: string,
	now = new Date(),
) {
	if (state.revokedSessionIds.has(sessionId)) return null;
	const session =
		state.sessions.get(sessionId) ??
		restoreFixtureSession(state, sessionId, now);
	if (!session) return null;
	if (new Date(session.expiresAt).getTime() <= now.getTime()) {
		deleteFixtureSession(state, sessionId);
		return null;
	}
	return { ...session };
}

export function deleteFixtureSession(
	state: FixtureAuthState,
	sessionId: string,
) {
	state.sessions.delete(sessionId);
	state.revokedSessionIds.add(sessionId);
}

function buildResolvedContext(
	state: FixtureAuthState,
	session: AuthSession,
	membership: OrganizationMembership,
): ResolvedOrganizationContext {
	const user = state.users.get(session.userId);
	const organization = state.organizations.get(membership.organizationId);
	if (!user || !organization) {
		throw new AuthDomainError("membership-required");
	}

	return {
		session: { ...session },
		user: copyFixtureUser(user, state.identities.get(user.id) ?? []),
		organization: { ...organization },
		membership: { ...membership },
		memberships: listActiveFixtureMemberships(state, user.id),
	};
}

export function resolveFixtureSession(
	state: FixtureAuthState,
	sessionId: string | null,
	now = new Date(),
): SessionResolution {
	if (!sessionId) return { status: "anonymous" };
	const session = getFixtureSession(state, sessionId, now);
	if (!session) return { status: "anonymous" };
	const user = state.users.get(session.userId);
	if (!user || user.isBanned) return { status: "anonymous" };

	const memberships = listActiveFixtureMemberships(state, user.id);
	const selectedMembership = memberships.find(
		(membership) =>
			membership.organizationId === session.selectedOrganizationId,
	);
	if (selectedMembership) {
		return {
			status: "resolved",
			...buildResolvedContext(state, session, selectedMembership),
		};
	}

	if (session.selectedOrganizationId) {
		session.selectedOrganizationId = null;
		state.sessions.set(session.id, session);
	}

	if (memberships.length === 1) {
		session.selectedOrganizationId = memberships[0].organizationId;
		state.sessions.set(session.id, session);
		return {
			status: "resolved",
			...buildResolvedContext(state, session, memberships[0]),
		};
	}

	if (memberships.length > 1) {
		return {
			status: "organization-selection-required",
			session: { ...session },
			user: copyFixtureUser(user, state.identities.get(user.id) ?? []),
			memberships,
		};
	}

	return {
		status: "membership-required",
		session: { ...session },
		user: copyFixtureUser(user, state.identities.get(user.id) ?? []),
		memberships: [],
	};
}

export function selectFixtureOrganization(
	state: FixtureAuthState,
	sessionId: string,
	organizationId: string,
) {
	const session = getFixtureSession(state, sessionId);
	if (!session) throw new AuthDomainError("session-required");
	const membership = listActiveFixtureMemberships(state, session.userId).find(
		(candidate) => candidate.organizationId === organizationId,
	);
	if (!membership) throw new AuthDomainError("membership-required");
	const next = {
		...session,
		id: fixtureSessionId(
			session.userId,
			new Date(session.createdAt).getTime(),
			organizationId,
		),
		selectedOrganizationId: organizationId,
	};
	state.sessions.delete(session.id);
	state.sessions.set(next.id, next);
	return buildResolvedContext(state, next, membership);
}
