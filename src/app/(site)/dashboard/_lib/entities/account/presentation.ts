import { hrefFor } from "@/lib/routes";
import { formatMemberJoinedDate } from "../member/presentation";
import type { AccountEntity } from "./domain";

function getInitials(value: string) {
	const parts = value
		.replace(/[^a-zA-Z0-9\s-]/g, " ")
		.split(/[\s-]+/)
		.filter(Boolean);
	if (parts.length === 0) return "U";
	return (
		parts.length === 1 ? parts[0].slice(0, 2) : `${parts[0][0]}${parts[1][0]}`
	).toUpperCase();
}

function hashSeed(seed: string) {
	let hash = 2_166_136_261;
	for (let index = 0; index < seed.length; index += 1) {
		hash ^= seed.charCodeAt(index);
		hash = Math.imul(hash, 16_777_619);
	}
	return hash >>> 0;
}

export function getAccountPresentation(account: AccountEntity) {
	const displayLabel =
		account.user.name.trim() || account.user.email.split("@")[0];
	return {
		avatarAlt: `${displayLabel} profile picture`,
		avatarColorIndex: hashSeed(account.user.id) % 8,
		avatarUrl: account.user.profilePictureUrl ?? null,
		displayLabel,
		emailLabel: account.user.email,
		initials: getInitials(displayLabel),
		joinedAtLabel: formatMemberJoinedDate(account.membership.createdAt),
		organizationId: account.organization.id,
		organizationLabel: account.organization.name,
		organizationSlug: account.organization.slug,
		profileHref: hrefFor("dashboard.profile"),
		role: account.membership.role,
	};
}

export type AccountPresentation = ReturnType<typeof getAccountPresentation>;
