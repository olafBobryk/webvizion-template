import type { MembershipRole } from "@/lib/auth/contracts";
import { hrefFor } from "@/lib/routes";
import type { OrganizationEntity } from "./domain";

const roleLabels = {
	admin: "Admin",
	member: "Member",
	owner: "Owner",
} satisfies Record<MembershipRole, string>;

function hashSeed(seed: string) {
	let hash = 2_166_136_261;
	for (let index = 0; index < seed.length; index += 1) {
		hash ^= seed.charCodeAt(index);
		hash = Math.imul(hash, 16_777_619);
	}
	return hash >>> 0;
}

function getOrganizationInitials(name: string) {
	const words = name
		.replace(/[^a-zA-Z0-9\s-]/g, " ")
		.split(/[\s-]+/)
		.filter(Boolean);
	if (words.length === 0) return "O";
	return (
		words.length === 1 ? words[0].slice(0, 2) : `${words[0][0]}${words[1][0]}`
	).toUpperCase();
}

export function getOrganizationPresentation(organization: OrganizationEntity) {
	const displayLabel = organization.name.trim() || "Organization";
	const slugLabel = organization.slug.trim() || "organization";
	const roleLabel = organization.role ? roleLabels[organization.role] : null;
	return {
		avatarAlt: `${displayLabel} profile picture`,
		avatarColorIndex: hashSeed(organization.id) % 8,
		avatarUrl: organization.profilePictureUrl,
		displayLabel,
		href: hrefFor("dashboard.organization"),
		id: organization.id,
		initials: getOrganizationInitials(displayLabel),
		roleLabel,
		searchText: [displayLabel, slugLabel, roleLabel].filter(Boolean).join(" "),
		secondaryLabel: roleLabel ? `${slugLabel} · ${roleLabel}` : slugLabel,
		slugLabel,
	};
}

export type OrganizationPresentation = ReturnType<
	typeof getOrganizationPresentation
>;
