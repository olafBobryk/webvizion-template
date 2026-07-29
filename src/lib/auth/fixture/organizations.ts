import type {
	MembershipRole,
	Organization,
	OrganizationUpdate,
} from "../contracts";
import { AuthDomainError } from "../errors";
import { copyFixtureUser, type FixtureAuthState } from "./state";

export function listActiveFixtureMemberships(
	state: FixtureAuthState,
	userId: string,
) {
	return [...state.memberships.values()].filter(
		(membership) =>
			membership.userId === userId && membership.status === "active",
	);
}

export function requireActiveFixtureMembership(
	state: FixtureAuthState,
	membershipId: string,
) {
	const membership = state.memberships.get(membershipId);
	if (membership?.status !== "active") {
		throw new AuthDomainError("membership-required");
	}
	return membership;
}

export function requireFixtureAccessManager(
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
							user: copyFixtureUser(user, state.identities.get(user.id) ?? []),
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
