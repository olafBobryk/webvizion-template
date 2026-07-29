import type {
	AuthIdentity,
	AuthSession,
	AuthUser,
	Organization,
	OrganizationInvitation,
	OrganizationMembership,
} from "../contracts";

export const fixtureInvitationLifetimeMs = 7 * 24 * 60 * 60 * 1000;

export type FixtureCredential = {
	email: string;
	password: string;
	userId: string;
};

export type FixturePasswordRecovery = {
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

export function copyFixtureUser(
	user: AuthUser,
	identities: readonly AuthIdentity[],
) {
	return { ...user, identities: [...identities] };
}

export function fixtureNowIso(now: Date) {
	return now.toISOString();
}

export function createFixtureAuthState(now = new Date()): FixtureAuthState {
	const identities = new Map(
		initialUsers.map((user) => [user.id, [buildIdentity(user)]]),
	);
	const users = new Map(
		initialUsers.map((user) => [
			user.id,
			copyFixtureUser(user, identities.get(user.id) ?? []),
		]),
	);
	const invitation: OrganizationInvitation = {
		id: "00000000-0000-4000-8000-000000000001",
		organizationId: "org-demo",
		email: "invitee@averlo.local",
		role: "member",
		tokenHash: "fixture-invitation-token",
		createdAt: fixtureNowIso(now),
		expiresAt: fixtureNowIso(
			new Date(now.getTime() + fixtureInvitationLifetimeMs),
		),
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
