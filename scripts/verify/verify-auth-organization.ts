import assert from "node:assert/strict";
import { getDashboardCapabilities } from "../../src/app/(site)/dashboard/_registry/surfaceRegistry";
import {
	getSafeContinuationPath,
	withSafeContinuation,
} from "../../src/lib/auth/continuation";
import { AuthDomainError } from "../../src/lib/auth/errors";
import {
	acceptFixtureInvitation,
	authenticateFixturePassword,
	createFixtureAuthState,
	createFixtureInvitation,
	createFixtureSession,
	fixtureAuthMethods,
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
	validateFixturePasswordRecoveryToken,
} from "../../src/lib/auth/fixture";
import { privateFilePolicy } from "../../src/lib/auth/private-files";

function expectCode(action: () => unknown, code: string) {
	assert.throws(action, (error) => {
		return error instanceof AuthDomainError && error.code === code;
	});
}

assert.equal(
	getSafeContinuationPath("/dashboard/records?view=all"),
	"/dashboard/records?view=all",
);
assert.equal(getSafeContinuationPath("https://attacker.example"), "/dashboard");
assert.equal(getSafeContinuationPath("//attacker.example"), "/dashboard");
assert.equal(getSafeContinuationPath("/\\attacker.example"), "/dashboard");
assert.equal(
	withSafeContinuation(
		"/select-organization",
		"/dashboard/settings?motion=off&reveal=off",
	),
	"/select-organization?next=%2Fdashboard%2Fsettings%3Fmotion%3Doff%26reveal%3Doff&motion=off&reveal=off",
);

const singletonState = createFixtureAuthState();
const singletonUser = authenticateFixturePassword(singletonState, {
	email: "operator@averlo.local",
	password: "demo-password",
});
assert.equal(singletonUser.platformRole, "admin");
const singletonSession = createFixtureSession(singletonState, singletonUser.id);
const singletonResolution = resolveFixtureSession(
	singletonState,
	singletonSession.id,
);
assert.equal(singletonResolution.status, "resolved");
if (singletonResolution.status === "resolved") {
	assert.equal(singletonResolution.organization.id, "org-demo");
	assert.equal(singletonResolution.session.selectedOrganizationId, "org-demo");
}

const redirectIssuedAt = new Date("2026-07-26T12:00:00Z");
const redirectSessionState = createFixtureAuthState(redirectIssuedAt);
const redirectSession = createFixtureSession(
	redirectSessionState,
	"user-template-owner",
	redirectIssuedAt,
);
assert.equal(
	resolveFixtureSession(
		createFixtureAuthState(redirectIssuedAt),
		redirectSession.id,
		new Date("2026-07-26T12:01:00Z"),
	).status,
	"resolved",
);
assert.equal(
	resolveFixtureSession(
		createFixtureAuthState(redirectIssuedAt),
		redirectSession.id,
		new Date("2026-07-26T20:00:00Z"),
	).status,
	"anonymous",
);

const organizationUpdateState = createFixtureAuthState();
const updatedOrganization = updateFixtureOrganization(
	organizationUpdateState,
	"org-demo",
	{
		name: "Updated organization",
		profilePictureUrl: "data:image/png;base64,fixture-picture",
		slug: "Updated Organization!",
	},
);
assert.equal(updatedOrganization.name, "Updated organization");
assert.equal(updatedOrganization.slug, "updated-organization");
assert.equal(
	updatedOrganization.profilePictureUrl,
	"data:image/png;base64,fixture-picture",
);
assert.equal(
	organizationUpdateState.organizations.get("org-demo")?.slug,
	"updated-organization",
);
expectCode(
	() =>
		updateFixtureOrganization(organizationUpdateState, "org-sandbox", {
			name: "Product sandbox",
			slug: "updated organization",
		}),
	"organization-slug-conflict",
);
expectCode(
	() =>
		updateFixtureOrganization(organizationUpdateState, "org-demo", {
			name: "",
			slug: "updated-organization",
		}),
	"organization-invalid",
);
assert.equal(
	getDashboardCapabilities("owner").has("organization.manage"),
	true,
);
assert.equal(
	getDashboardCapabilities("admin").has("organization.manage"),
	true,
);
assert.equal(
	getDashboardCapabilities("member").has("organization.manage"),
	false,
);

const multiState = createFixtureAuthState();
const multiUser = authenticateFixturePassword(multiState, {
	email: "multi@averlo.local",
	password: "demo-password",
});
assert.equal(multiUser.platformRole, null);
const multiSession = createFixtureSession(multiState, multiUser.id);
assert.equal(
	resolveFixtureSession(multiState, multiSession.id).status,
	"organization-selection-required",
);
const selected = selectFixtureOrganization(
	multiState,
	multiSession.id,
	"org-sandbox",
);
assert.equal(
	resolveFixtureSession(
		createFixtureAuthState(),
		selected.session.id,
		new Date(),
	).status,
	"resolved",
);
assert.equal(selected.organization.id, "org-sandbox");
const selectedMembership = [...multiState.memberships.values()].find(
	(membership) =>
		membership.userId === multiUser.id &&
		membership.organizationId === "org-sandbox",
);
assert.ok(selectedMembership);
selectedMembership.status = "revoked";
multiState.memberships.set(selectedMembership.id, selectedMembership);
const afterRevocation = resolveFixtureSession(multiState, multiSession.id);
assert.equal(afterRevocation.status, "resolved");
if (afterRevocation.status === "resolved") {
	assert.equal(afterRevocation.organization.id, "org-demo");
}

const invitationState = createFixtureAuthState(
	new Date("2026-07-19T12:00:00Z"),
);
const fixtureInvitation = [...invitationState.invitations.values()][0];
const beforePreview = fixtureInvitation.acceptedAt;
previewFixtureInvitation(
	invitationState,
	{
		invitationId: fixtureInvitation.id,
		tokenHash: fixtureInvitation.tokenHash,
	},
	new Date("2026-07-19T12:01:00Z"),
);
assert.equal(
	invitationState.invitations.get(fixtureInvitation.id)?.acceptedAt,
	beforePreview,
);
expectCode(
	() =>
		acceptFixtureInvitation(
			invitationState,
			{
				invitationId: fixtureInvitation.id,
				tokenHash: fixtureInvitation.tokenHash,
				userId: "user-template-owner",
			},
			new Date("2026-07-19T12:02:00Z"),
		),
	"invitation-recipient-mismatch",
);
acceptFixtureInvitation(
	invitationState,
	{
		invitationId: fixtureInvitation.id,
		tokenHash: fixtureInvitation.tokenHash,
		userId: "user-invited",
	},
	new Date("2026-07-19T12:03:00Z"),
);
expectCode(
	() =>
		acceptFixtureInvitation(
			invitationState,
			{
				invitationId: fixtureInvitation.id,
				tokenHash: fixtureInvitation.tokenHash,
				userId: "user-invited",
			},
			new Date("2026-07-19T12:04:00Z"),
		),
	"invitation-accepted",
);

const reinviteState = createFixtureAuthState(new Date("2026-07-01T09:00:00Z"));
const priorInvite = [...reinviteState.invitations.values()][0];
expectCode(
	() =>
		createFixtureInvitation(reinviteState, {
			actorMembershipId: "membership-template-owner",
			organizationId: priorInvite.organizationId,
			email: priorInvite.email,
			role: "admin",
		}),
	"invitation-pending-conflict",
);
const refreshed = refreshFixtureInvitation(
	reinviteState,
	{
		actorMembershipId: "membership-template-owner",
		invitationId: priorInvite.id,
	},
	new Date("2026-07-23T09:00:00Z"),
);
assert.notEqual(refreshed.tokenHash, priorInvite.tokenHash);
assert.ok(new Date(refreshed.expiresAt) > new Date(priorInvite.expiresAt));
expectCode(
	() =>
		previewFixtureInvitation(reinviteState, {
			invitationId: priorInvite.id,
			tokenHash: priorInvite.tokenHash,
		}),
	"invitation-invalid",
);
assert.equal(
	previewFixtureInvitation(
		reinviteState,
		{
			invitationId: refreshed.id,
			tokenHash: refreshed.tokenHash,
		},
		new Date("2026-07-23T09:01:00Z"),
	).id,
	refreshed.id,
);
revokeFixtureInvitation(reinviteState, {
	actorMembershipId: "membership-template-owner",
	invitationId: refreshed.id,
});
assert.equal(
	listFixtureInvitations(reinviteState, "org-demo")[0].revokedAt !== null,
	true,
);

const hierarchyState = createFixtureAuthState();
assert.equal(
	listFixtureOrganizationMembers(hierarchyState, "org-demo").length,
	3,
);
expectCode(
	() =>
		createFixtureInvitation(hierarchyState, {
			actorMembershipId: "membership-multi-demo",
			email: "admin-invite@example.com",
			organizationId: "org-demo",
			role: "admin",
		}),
	"invitation-role-forbidden",
);
const adminInvitation = createFixtureInvitation(hierarchyState, {
	actorMembershipId: "membership-multi-demo",
	email: "member-invite@example.com",
	organizationId: "org-demo",
	role: "member",
});
assert.equal(adminInvitation.role, "member");
expectCode(
	() =>
		createFixtureInvitation(hierarchyState, {
			actorMembershipId: "membership-template-owner",
			email: "member@averlo.local",
			organizationId: "org-demo",
			role: "member",
		}),
	"invitation-member-conflict",
);
expectCode(
	() =>
		updateFixtureMembershipRole(hierarchyState, {
			actorMembershipId: "membership-multi-demo",
			membershipId: "membership-demo-member",
			role: "admin",
		}),
	"membership-role-forbidden",
);
assert.equal(
	updateFixtureMembershipRole(hierarchyState, {
		actorMembershipId: "membership-template-owner",
		membershipId: "membership-demo-member",
		role: "admin",
	}).role,
	"admin",
);
expectCode(
	() =>
		removeFixtureMembership(hierarchyState, {
			actorMembershipId: "membership-template-owner",
			membershipId: "membership-template-owner",
		}),
	"membership-self-removal",
);
expectCode(
	() =>
		removeFixtureMembership(hierarchyState, {
			actorMembershipId: "membership-multi-demo",
			membershipId: "membership-demo-member",
		}),
	"membership-role-forbidden",
);
updateFixtureMembershipRole(hierarchyState, {
	actorMembershipId: "membership-template-owner",
	membershipId: "membership-demo-member",
	role: "member",
});
assert.equal(
	removeFixtureMembership(hierarchyState, {
		actorMembershipId: "membership-multi-demo",
		membershipId: "membership-demo-member",
	}).status,
	"revoked",
);

const transferState = createFixtureAuthState();
const transfer = transferFixtureOwnership(transferState, {
	actorMembershipId: "membership-template-owner",
	membershipId: "membership-multi-demo",
});
assert.equal(transfer.currentOwner.role, "admin");
assert.equal(transfer.newOwner.role, "owner");
assert.equal(
	transferState.memberships.get("membership-template-owner")?.role,
	"admin",
);
assert.equal(
	transferState.memberships.get("membership-multi-demo")?.role,
	"owner",
);

const expiredState = createFixtureAuthState(new Date("2026-01-01T00:00:00Z"));
const expiredInvite = [...expiredState.invitations.values()][0];
expectCode(
	() =>
		previewFixtureInvitation(
			expiredState,
			{
				invitationId: expiredInvite.id,
				tokenHash: expiredInvite.tokenHash,
			},
			new Date("2026-02-01T00:00:00Z"),
		),
	"invitation-expired",
);

const identityState = createFixtureAuthState();
const onlyIdentity = identityState.identities.get("user-template-owner")?.[0];
assert.ok(onlyIdentity);
expectCode(
	() =>
		removeFixtureIdentity(identityState, {
			identityId: onlyIdentity.id,
			userId: "user-template-owner",
		}),
	"identity-last-viable",
);

assert.equal(fixtureAuthMethods["magic-link-sign-in"].available, false);
assert.equal(fixtureAuthMethods["password-recovery"].available, true);
assert.equal(fixtureAuthMethods["password-update"].available, true);

const passwordRecoveryState = createFixtureAuthState(
	new Date("2026-07-21T12:00:00Z"),
);
const passwordRecoveryUser = authenticateFixturePassword(
	passwordRecoveryState,
	{
		email: "operator@averlo.local",
		password: "demo-password",
	},
);
const passwordRecoverySession = createFixtureSession(
	passwordRecoveryState,
	passwordRecoveryUser.id,
);
const recovery = requestFixturePasswordRecovery(
	passwordRecoveryState,
	{
		email: passwordRecoveryUser.email,
		resetUrl: "https://template.local/reset-password",
	},
	new Date("2026-07-21T12:00:00Z"),
);
assert.ok(recovery);
const recoveryToken = new URL(recovery.resetUrl).searchParams.get("token");
assert.ok(recoveryToken);
validateFixturePasswordRecoveryToken(
	passwordRecoveryState,
	{ token: recoveryToken },
	new Date("2026-07-21T12:01:00Z"),
);
expectCode(
	() =>
		resetFixturePassword(passwordRecoveryState, {
			password: "new-demo-password",
			token: "not-a-real-token",
		}),
	"password-recovery-invalid",
);
resetFixturePassword(
	passwordRecoveryState,
	{
		password: "new-demo-password",
		token: recoveryToken,
	},
	new Date("2026-07-21T12:01:00Z"),
);
expectCode(
	() =>
		validateFixturePasswordRecoveryToken(passwordRecoveryState, {
			token: recoveryToken,
		}),
	"password-recovery-invalid",
);
expectCode(
	() =>
		authenticateFixturePassword(passwordRecoveryState, {
			email: passwordRecoveryUser.email,
			password: "demo-password",
		}),
	"invalid-credentials",
);
assert.equal(
	authenticateFixturePassword(passwordRecoveryState, {
		email: passwordRecoveryUser.email,
		password: "new-demo-password",
	}).id,
	passwordRecoveryUser.id,
);
assert.equal(
	resolveFixtureSession(passwordRecoveryState, passwordRecoverySession.id)
		.status,
	"anonymous",
);
expectCode(
	() =>
		resetFixturePassword(passwordRecoveryState, {
			password: "another-demo-password",
			token: recoveryToken,
		}),
	"password-recovery-invalid",
);

const expiredRecoveryState = createFixtureAuthState(
	new Date("2026-07-21T12:00:00Z"),
);
const expiredRecovery = requestFixturePasswordRecovery(
	expiredRecoveryState,
	{
		email: "operator@averlo.local",
		resetUrl: "https://template.local/reset-password",
	},
	new Date("2026-07-21T12:00:00Z"),
);
assert.ok(expiredRecovery);
const expiredToken = new URL(expiredRecovery.resetUrl).searchParams.get(
	"token",
);
assert.ok(expiredToken);
expectCode(
	() =>
		validateFixturePasswordRecoveryToken(
			expiredRecoveryState,
			{ token: expiredToken },
			new Date("2026-07-21T12:31:00Z"),
		),
	"password-recovery-expired",
);
assert.ok(privateFilePolicy.signedAccessLifetimeSeconds <= 5 * 60);
assert.ok(privateFilePolicy.maxBytes > 0);

console.log("Auth and organization fixture verification passed.");
