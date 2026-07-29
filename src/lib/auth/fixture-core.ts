import { createHash, randomBytes, randomUUID } from "node:crypto";
import type {
	AdapterMethodAvailability,
	AuthIdentity,
	AuthSession,
	AuthUser,
	MembershipRole,
	Organization,
	OrganizationInvitation,
	OrganizationMembership,
	OrganizationUpdate,
	ResolvedOrganizationContext,
	SessionResolution,
} from "./contracts";
import { AuthDomainError } from "./errors";
import { isPasswordRecoveryAvailable } from "./passwordRecoveryCapability";

const sessionLifetimeMs = 8 * 60 * 60 * 1000;
const invitationLifetimeMs = 7 * 24 * 60 * 60 * 1000;
const passwordRecoveryLifetimeMs = 30 * 60 * 1000;

const passwordRecoveryAvailable = isPasswordRecoveryAvailable();

export const fixtureAuthMethods: AdapterMethodAvailability = {
	"password-sign-in": { available: true },
	"magic-link-sign-in": {
		available: false,
		reason: "The fixture adapter does not send email.",
	},
	"password-recovery": {
		available: passwordRecoveryAvailable,
		reason: passwordRecoveryAvailable
			? undefined
			: "Configure APP_ORIGIN, PASSWORD_RESET_FROM, and RESEND_API_KEY.",
	},
	"password-update": {
		available: passwordRecoveryAvailable,
		reason: passwordRecoveryAvailable
			? undefined
			: "Configure APP_ORIGIN, PASSWORD_RESET_FROM, and RESEND_API_KEY.",
	},
	"identity-link": {
		available: false,
		reason: "No external identity provider is installed.",
	},
	"identity-unlink": { available: true },
};

export type FixtureCredential = {
	email: string;
	password: string;
	userId: string;
};

type FixturePasswordRecovery = {
	email: string;
	expiresAt: string;
	resetUrl: string;
	tokenHash: string;
	userId: string;
};

export type FixtureRecoveryOutboxEntry = {
	createdAt: string;
	email: string;
	resetUrl: string;
};

export type FixtureAuthState = {
	credentials: FixtureCredential[];
	identities: Map<string, AuthIdentity[]>;
	invitations: Map<string, OrganizationInvitation>;
	memberships: Map<string, OrganizationMembership>;
	organizations: Map<string, Organization>;
	passwordRecoveries: Map<string, FixturePasswordRecovery>;
	recoveryOutbox: FixtureRecoveryOutboxEntry[];
	revokedSessionIds: Set<string>;
	sessions: Map<string, AuthSession>;
	users: Map<string, AuthUser>;
};

const initialUsers: AuthUser[] = [
	{
		id: "user-template-owner",
		name: "Template Operator",
		email: "operator@averlo.local",
		isBanned: false,
		platformRole: "admin",
		identities: [],
	},
	{
		id: "user-multi-org",
		name: "Multi-org Reviewer",
		email: "multi@averlo.local",
		isBanned: false,
		platformRole: null,
		identities: [],
	},
	{
		id: "user-invited",
		name: "Invited Teammate",
		email: "invitee@averlo.local",
		isBanned: false,
		platformRole: null,
		identities: [],
	},
	{
		id: "user-demo-member",
		name: "Demo Member",
		email: "member@averlo.local",
		isBanned: false,
		platformRole: null,
		identities: [],
	},
];

const initialOrganizations: Organization[] = [
	{
		id: "org-demo",
		name: "Demo organization",
		slug: "demo",
		mode: "singleton",
	},
	{
		id: "org-sandbox",
		name: "Product sandbox",
		slug: "sandbox",
		mode: "multi",
	},
];

const initialMemberships: OrganizationMembership[] = [
	{
		createdAt: "2026-01-12T08:00:00.000Z",
		id: "membership-template-owner",
		organizationId: "org-demo",
		role: "owner",
		status: "active",
		userId: "user-template-owner",
	},
	{
		createdAt: "2026-02-14T10:00:00.000Z",
		id: "membership-multi-demo",
		organizationId: "org-demo",
		role: "admin",
		status: "active",
		userId: "user-multi-org",
	},
	{
		createdAt: "2026-03-04T09:30:00.000Z",
		id: "membership-multi-sandbox",
		organizationId: "org-sandbox",
		role: "owner",
		status: "active",
		userId: "user-multi-org",
	},
	{
		createdAt: "2026-04-18T11:15:00.000Z",
		id: "membership-demo-member",
		organizationId: "org-demo",
		role: "member",
		status: "active",
		userId: "user-demo-member",
	},
];

function buildIdentity(user: AuthUser): AuthIdentity {
	return {
		id: `identity-email-${user.id}`,
		kind: "email",
		label: user.email,
		provider: "password",
		verified: true,
	};
}

function copyUser(user: AuthUser, identities: readonly AuthIdentity[]) {
	return { ...user, identities: [...identities] };
}

function nowIso(now: Date) {
	return now.toISOString();
}

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
		createdAt: nowIso(createdAt),
		expiresAt: nowIso(expiresAt),
	};
}

export function createFixtureAuthState(now = new Date()): FixtureAuthState {
	const identities = new Map(
		initialUsers.map((user) => [user.id, [buildIdentity(user)]]),
	);
	const users = new Map(
		initialUsers.map((user) => [
			user.id,
			copyUser(user, identities.get(user.id) ?? []),
		]),
	);
	const invitation: OrganizationInvitation = {
		id: "00000000-0000-4000-8000-000000000001",
		organizationId: "org-demo",
		email: "invitee@averlo.local",
		role: "member",
		tokenHash: "fixture-invitation-token",
		createdAt: nowIso(now),
		expiresAt: nowIso(new Date(now.getTime() + invitationLifetimeMs)),
		acceptedAt: null,
		revokedAt: null,
	};

	return {
		credentials: initialUsers.map((user) => ({
			email: user.email,
			password: "demo-password",
			userId: user.id,
		})),
		identities,
		invitations: new Map([[invitation.id, invitation]]),
		memberships: new Map(
			initialMemberships.map((membership) => [
				membership.id,
				{ ...membership },
			]),
		),
		organizations: new Map(
			initialOrganizations.map((organization) => [
				organization.id,
				{ ...organization },
			]),
		),
		passwordRecoveries: new Map(),
		recoveryOutbox: [],
		revokedSessionIds: new Set(),
		sessions: new Map(),
		users,
	};
}

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
	return copyUser(user, state.identities.get(user.id) ?? []);
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
		createdAt: nowIso(now),
		expiresAt: nowIso(new Date(now.getTime() + sessionLifetimeMs)),
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

export function listActiveFixtureMemberships(
	state: FixtureAuthState,
	userId: string,
) {
	return [...state.memberships.values()].filter(
		(membership) =>
			membership.userId === userId && membership.status === "active",
	);
}

function requireActiveFixtureMembership(
	state: FixtureAuthState,
	membershipId: string,
) {
	const membership = state.memberships.get(membershipId);
	if (membership?.status !== "active") {
		throw new AuthDomainError("membership-required");
	}
	return membership;
}

function requireFixtureAccessManager(
	state: FixtureAuthState,
	actorMembershipId: string,
) {
	const actor = requireActiveFixtureMembership(state, actorMembershipId);
	if (actor.role !== "owner" && actor.role !== "admin") {
		throw new AuthDomainError("membership-role-forbidden");
	}
	return actor;
}

export function listFixtureOrganizationMembers(
	state: FixtureAuthState,
	organizationId: string,
) {
	return [...state.memberships.values()]
		.filter(
			(membership) =>
				membership.organizationId === organizationId &&
				membership.status === "active",
		)
		.flatMap((membership) => {
			const user = state.users.get(membership.userId);
			return user
				? [
						{
							membership: { ...membership },
							user: copyUser(user, state.identities.get(user.id) ?? []),
						},
					]
				: [];
		})
		.sort((left, right) => left.user.name.localeCompare(right.user.name));
}

export function updateFixtureMembershipRole(
	state: FixtureAuthState,
	input: {
		actorMembershipId: string;
		membershipId: string;
		role: Exclude<MembershipRole, "owner">;
	},
) {
	const actor = requireFixtureAccessManager(state, input.actorMembershipId);
	const target = requireActiveFixtureMembership(state, input.membershipId);
	if (actor.organizationId !== target.organizationId) {
		throw new AuthDomainError("membership-role-forbidden");
	}
	if (target.role === "owner") {
		throw new AuthDomainError("membership-owner-protected");
	}
	if (actor.role !== "owner") {
		throw new AuthDomainError("membership-role-forbidden");
	}
	const next = { ...target, role: input.role };
	state.memberships.set(next.id, next);
	return { ...next };
}

export function removeFixtureMembership(
	state: FixtureAuthState,
	input: { actorMembershipId: string; membershipId: string },
) {
	const actor = requireFixtureAccessManager(state, input.actorMembershipId);
	const target = requireActiveFixtureMembership(state, input.membershipId);
	if (actor.organizationId !== target.organizationId) {
		throw new AuthDomainError("membership-role-forbidden");
	}
	if (actor.id === target.id) {
		throw new AuthDomainError("membership-self-removal");
	}
	if (target.role === "owner") {
		throw new AuthDomainError("membership-owner-protected");
	}
	if (actor.role === "admin" && target.role !== "member") {
		throw new AuthDomainError("membership-role-forbidden");
	}
	const next = { ...target, status: "revoked" as const };
	state.memberships.set(next.id, next);
	return { ...next };
}

export function transferFixtureOwnership(
	state: FixtureAuthState,
	input: { actorMembershipId: string; membershipId: string },
) {
	const actor = requireActiveFixtureMembership(state, input.actorMembershipId);
	const target = requireActiveFixtureMembership(state, input.membershipId);
	if (
		actor.role !== "owner" ||
		actor.organizationId !== target.organizationId ||
		actor.id === target.id
	) {
		throw new AuthDomainError("membership-role-forbidden");
	}
	const currentOwner = { ...actor, role: "admin" as const };
	const newOwner = { ...target, role: "owner" as const };
	state.memberships.set(currentOwner.id, currentOwner);
	state.memberships.set(newOwner.id, newOwner);
	return { currentOwner: { ...currentOwner }, newOwner: { ...newOwner } };
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
		user: copyUser(user, state.identities.get(user.id) ?? []),
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
			user: copyUser(user, state.identities.get(user.id) ?? []),
			memberships,
		};
	}

	return {
		status: "membership-required",
		session: { ...session },
		user: copyUser(user, state.identities.get(user.id) ?? []),
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
	return copyUser(next, state.identities.get(userId) ?? []);
}

function normalizeOrganizationSlug(value: string) {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export function updateFixtureOrganization(
	state: FixtureAuthState,
	organizationId: string,
	patch: OrganizationUpdate,
) {
	const organization = state.organizations.get(organizationId);
	if (!organization) throw new AuthDomainError("membership-required");

	const name = Object.hasOwn(patch, "name")
		? (patch.name?.trim() ?? "")
		: organization.name;
	const slug = Object.hasOwn(patch, "slug")
		? normalizeOrganizationSlug(patch.slug ?? "")
		: organization.slug;
	if (!name || !slug) throw new AuthDomainError("organization-invalid");

	const slugInUse = [...state.organizations.values()].some(
		(candidate) =>
			candidate.id !== organizationId && candidate.slug.toLowerCase() === slug,
	);
	if (slugInUse) throw new AuthDomainError("organization-slug-conflict");

	const next: Organization = {
		...organization,
		name,
		slug,
		profilePictureUrl: Object.hasOwn(patch, "profilePictureUrl")
			? patch.profilePictureUrl
			: organization.profilePictureUrl,
	};
	state.organizations.set(organizationId, next);
	return { ...next };
}

function hashFixtureRecoveryToken(token: string) {
	return createHash("sha256").update(token).digest("hex");
}

export function requestFixturePasswordRecovery(
	state: FixtureAuthState,
	input: { email: string; resetUrl: string },
	now = new Date(),
) {
	const email = input.email.trim().toLowerCase();
	const user = [...state.users.values()].find(
		(candidate) => candidate.email.toLowerCase() === email,
	);
	if (!user) return null;

	const token = randomBytes(32).toString("base64url");
	const resetUrl = new URL(input.resetUrl);
	resetUrl.searchParams.set("token", token);
	const tokenHash = hashFixtureRecoveryToken(token);
	const recovery: FixturePasswordRecovery = {
		email: user.email,
		expiresAt: nowIso(new Date(now.getTime() + passwordRecoveryLifetimeMs)),
		resetUrl: resetUrl.toString(),
		tokenHash,
		userId: user.id,
	};

	state.passwordRecoveries.set(tokenHash, recovery);
	state.recoveryOutbox.push({
		createdAt: nowIso(now),
		email: user.email,
		resetUrl: recovery.resetUrl,
	});
	return { ...recovery };
}

export function resetFixturePassword(
	state: FixtureAuthState,
	input: { password: string; token: string },
	now = new Date(),
) {
	const { recovery, tokenHash } = readFixturePasswordRecovery(
		state,
		input.token,
		now,
	);

	const credential = state.credentials.find(
		(candidate) => candidate.userId === recovery.userId,
	);
	if (!credential) throw new AuthDomainError("password-recovery-invalid");
	credential.password = input.password;
	state.passwordRecoveries.delete(tokenHash);
	for (const [sessionId, session] of state.sessions) {
		if (session.userId === recovery.userId) {
			deleteFixtureSession(state, sessionId);
		}
	}
}

export function validateFixturePasswordRecoveryToken(
	state: FixtureAuthState,
	input: { token: string },
	now = new Date(),
) {
	readFixturePasswordRecovery(state, input.token, now);
}

function readFixturePasswordRecovery(
	state: FixtureAuthState,
	token: string,
	now: Date,
) {
	const tokenHash = hashFixtureRecoveryToken(token);
	const recovery = state.passwordRecoveries.get(tokenHash);
	if (!recovery) throw new AuthDomainError("password-recovery-invalid");
	if (new Date(recovery.expiresAt).getTime() <= now.getTime()) {
		state.passwordRecoveries.delete(tokenHash);
		throw new AuthDomainError("password-recovery-expired");
	}
	return { recovery, tokenHash };
}

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
				createdAt: existing.createdAt || nowIso(now),
				role: invitation.role,
				status: "active",
			}
		: {
				createdAt: nowIso(now),
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
		acceptedAt: nowIso(now),
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
		createdAt: nowIso(now),
		expiresAt: nowIso(new Date(now.getTime() + invitationLifetimeMs)),
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
		createdAt: nowIso(now),
		expiresAt: nowIso(new Date(now.getTime() + invitationLifetimeMs)),
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
	const next = { ...invitation, revokedAt: nowIso(now) };
	state.invitations.set(next.id, next);
	return { ...next };
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
	if (user) state.users.set(user.id, copyUser(user, next));
	return [...next];
}
