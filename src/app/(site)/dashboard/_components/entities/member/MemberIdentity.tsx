import type { MemberIdentityPresentation } from "../../../_lib/entities/member/presentation";
import { EntityIdentity } from "../EntityIdentity";
import {
	MemberAvatar,
	type MemberAvatarSize,
	MemberAvatarSkeleton,
} from "./MemberAvatar";

export type MemberIdentityVariant = "actor" | "compact" | "profile";

const defaultAvatarSize = {
	actor: "sm",
	compact: "md",
	profile: "xl",
} satisfies Record<MemberIdentityVariant, MemberAvatarSize>;

function MemberIdentityRoot({
	avatarSize,
	className,
	href = false,
	presentation,
	variant = "profile",
}: {
	avatarSize?: MemberAvatarSize;
	className?: string;
	href?: boolean;
	presentation: MemberIdentityPresentation;
	variant?: MemberIdentityVariant;
}) {
	const profile = variant === "profile";
	const actor = variant === "actor";
	const avatar = (
		<MemberAvatar
			alt={presentation.avatarAlt}
			colorIndex={presentation.avatarColorIndex}
			imageUrl={presentation.avatarUrl}
			initials={presentation.initials}
			size={avatarSize ?? defaultAvatarSize[variant]}
		/>
	);
	return (
		<EntityIdentity
			avatar={avatar}
			className={className}
			primaryAs={profile ? "h2" : "span"}
			primaryHref={href ? presentation.href : undefined}
			primaryLabel={presentation.displayLabel}
			secondaryLabel={actor ? undefined : presentation.emailLabel}
			variant={variant}
		/>
	);
}

export function MemberIdentitySkeleton({
	avatarSize,
	className,
	displayLabel = "Example member",
	emailLabel = "member@example.com",
	variant = "profile",
}: {
	avatarSize?: MemberAvatarSize;
	className?: string;
	displayLabel?: string;
	emailLabel?: string;
	href?: boolean;
	variant?: MemberIdentityVariant;
}) {
	const profile = variant === "profile";
	return (
		<EntityIdentity.Skeleton
			avatar={
				<MemberAvatarSkeleton size={avatarSize ?? defaultAvatarSize[variant]} />
			}
			className={className}
			primaryAs={profile ? "h2" : "span"}
			primaryLabel={displayLabel}
			secondaryLabel={variant === "actor" ? undefined : emailLabel}
			variant={variant}
		/>
	);
}

export const MemberIdentity = Object.assign(MemberIdentityRoot, {
	Skeleton: MemberIdentitySkeleton,
});
