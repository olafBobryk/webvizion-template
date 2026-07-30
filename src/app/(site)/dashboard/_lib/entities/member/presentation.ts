import type { MembershipRole } from "@/lib/auth/contracts";
import { surfaceHref } from "@/lib/routes";
import type {
	DashboardColumnDefinition,
	DashboardCommandPresentation,
	DashboardEntityPresentationDefinition,
	DashboardFieldDefinition,
	DashboardVariantPresentation,
} from "../../presentation/contracts";
import type { ReferenceMember } from "./domain";

export type MemberIdentityFacts = Pick<
	ReferenceMember,
	"id" | "organizationId" | "role" | "user"
>;

export const memberPresentationDefinition = {
	actions: {
		edit: "Edit member",
	},
	emptyState: {
		description:
			"Invite the first teammate when this organization is ready to collaborate.",
		icon: "users",
		title: "No members yet",
	},
	icon: "users",
	nouns: {
		plural: "Members",
		shortLabel: "Member",
		singular: "Organization member",
	},
} satisfies DashboardEntityPresentationDefinition;

export const memberRolePresentation = {
	admin: {
		description: "Can manage organization settings and product records.",
		label: "Organization administrator",
		shortLabel: "Admin",
		tone: "info",
	},
	member: {
		description: "Can use organization products without managing access.",
		label: "Organization member",
		shortLabel: "Member",
		tone: "neutral",
	},
	owner: {
		description: "Owns organization access and final account decisions.",
		label: "Organization owner",
		shortLabel: "Owner",
		tone: "warning",
	},
} satisfies Record<MembershipRole, DashboardVariantPresentation>;

function emailPrefix(email: string) {
	return email.trim().split("@")[0] || "Member";
}

export function getMemberDisplayLabel(member: MemberIdentityFacts) {
	return member.user.name?.trim() || emailPrefix(member.user.email);
}

export function getMemberInitials(member: MemberIdentityFacts) {
	const source = getMemberDisplayLabel(member)
		.replace(/[^a-zA-Z0-9\s-]/g, " ")
		.split(/[\s-]+/)
		.filter(Boolean);
	if (source.length === 0) return "M";
	return (
		source.length === 1
			? source[0].slice(0, 2)
			: `${source[0][0]}${source[1][0]}`
	).toUpperCase();
}

export function formatMemberJoinedDate(value: string) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "Date unavailable";
	return new Intl.DateTimeFormat("en", {
		day: "numeric",
		month: "short",
		year: "numeric",
	}).format(date);
}

export function getMemberProfileHref(memberId: string) {
	return surfaceHref("dashboard.organization.member", { memberId });
}

function hashSeed(seed: string) {
	let hash = 2_166_136_261;
	for (let index = 0; index < seed.length; index += 1) {
		hash ^= seed.charCodeAt(index);
		hash = Math.imul(hash, 16_777_619);
	}
	return hash >>> 0;
}

export function getMemberIdentityPresentation(member: MemberIdentityFacts) {
	const displayLabel = getMemberDisplayLabel(member);
	return {
		avatarAlt: `${displayLabel} profile picture`,
		avatarColorIndex: hashSeed(member.id) % 8,
		avatarUrl: member.user.profilePictureUrl?.trim() || null,
		displayLabel,
		emailLabel: member.user.email.trim() || "Email unavailable",
		id: member.id,
		initials: getMemberInitials(member),
		organizationId: member.organizationId,
		role: memberRolePresentation[member.role],
		roleLabel: memberRolePresentation[member.role].shortLabel,
		userId: member.user.id,
	};
}

export type MemberIdentityPresentation = ReturnType<
	typeof getMemberIdentityPresentation
> & {
	href?: string;
};

export function getMemberPresentation(member: ReferenceMember) {
	const identity = getMemberIdentityPresentation(member);
	return {
		...identity,
		href: getMemberProfileHref(member.id),
		joinedAtLabel: formatMemberJoinedDate(member.createdAt),
		mentionLabel: `@${identity.displayLabel}`,
		searchText: `${identity.displayLabel} ${member.user.email} ${member.role}`,
	};
}

export type MemberPresentation = ReturnType<typeof getMemberPresentation>;

export const memberFieldDefinitions = [
	{
		emptyValue: "Name unavailable",
		getValue: (member) => getMemberPresentation(member).displayLabel,
		icon: "user",
		id: "name",
		label: "Name",
	},
	{
		emptyValue: "Email unavailable",
		getValue: (member) => getMemberPresentation(member).emailLabel,
		icon: "mail",
		id: "email",
		label: "Email",
	},
	{
		emptyValue: "Role unavailable",
		getValue: (member) => getMemberPresentation(member).roleLabel,
		icon: "shield",
		id: "role",
		label: "Role",
	},
	{
		emptyValue: "Date unavailable",
		getValue: (member) => getMemberPresentation(member).joinedAtLabel,
		icon: "calendar",
		id: "joined",
		label: "Joined",
	},
] satisfies readonly DashboardFieldDefinition<ReferenceMember>[];

export const memberColumnDefinitions = [
	{
		getSortValue: (member) => getMemberPresentation(member).displayLabel,
		id: "member",
		label: "Member",
	},
	{
		getSortValue: (member) => getMemberPresentation(member).roleLabel,
		id: "role",
		label: "Role",
	},
	{
		getSortValue: (member) => member.createdAt,
		id: "joined",
		label: "Joined",
	},
] satisfies readonly DashboardColumnDefinition<ReferenceMember>[];

export function getMemberCommand(
	member: MemberPresentation,
): DashboardCommandPresentation {
	return {
		description: `${member.roleLabel} · ${member.emailLabel}`,
		href: member.href,
		id: `member.open.${member.id}`,
		keywords: ["member", "user", member.emailLabel, member.roleLabel],
		label: member.displayLabel,
	};
}
