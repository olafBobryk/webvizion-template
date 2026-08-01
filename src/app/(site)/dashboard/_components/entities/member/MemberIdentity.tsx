import type { MemberIdentityPresentation } from "../../../_lib/entities/member/presentation";
import { EntityIdentity } from "../EntityIdentity";
import {
	MemberAvatar,
	type MemberAvatarSize,
	MemberAvatarSkeleton,
} from "./MemberAvatar";

export type MemberIdentityVariant = "actor" | "default";

const defaultAvatarSize = {
	actor: "sm",
	default: "md",
} satisfies Record<MemberIdentityVariant, MemberAvatarSize>;

function MemberIdentityRoot({
	avatarSize,
	className,
	href = false,
	presentation,
	variant = "default",
}: {
	avatarSize?: MemberAvatarSize;
	className?: string;
	href?: boolean;
	presentation: MemberIdentityPresentation;
	variant?: MemberIdentityVariant;
}) {
	const actor = variant === "actor";
	const resolvedAvatarSize = avatarSize ?? defaultAvatarSize[variant];
	const avatar = (
		<MemberAvatar
			alt={presentation.avatarAlt}
			colorIndex={presentation.avatarColorIndex}
			imageUrl={presentation.avatarUrl}
			initials={presentation.initials}
			size={resolvedAvatarSize}
		/>
	);
	return (
		<EntityIdentity
			avatar={avatar}
			avatarSize={resolvedAvatarSize}
			className={className}
			primaryAs="span"
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
	variant = "default",
}: {
	avatarSize?: MemberAvatarSize;
	className?: string;
	displayLabel?: string;
	emailLabel?: string;
	href?: boolean;
	variant?: MemberIdentityVariant;
}) {
	const resolvedAvatarSize = avatarSize ?? defaultAvatarSize[variant];
	return (
		<EntityIdentity.Skeleton
			avatar={<MemberAvatarSkeleton size={resolvedAvatarSize} />}
			avatarSize={resolvedAvatarSize}
			className={className}
			primaryAs="span"
			primaryLabel={displayLabel}
			secondaryLabel={variant === "actor" ? undefined : emailLabel}
			variant={variant}
		/>
	);
}

export const MemberIdentity = Object.assign(MemberIdentityRoot, {
	Skeleton: MemberIdentitySkeleton,
});
