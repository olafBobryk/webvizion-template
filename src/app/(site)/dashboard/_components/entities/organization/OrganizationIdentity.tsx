import type { OrganizationPresentation } from "../../../_lib/entities/organization/presentation";
import { EntityIdentity } from "../EntityIdentity";
import {
	OrganizationAvatar,
	type OrganizationAvatarSize,
	OrganizationAvatarSkeleton,
	type OrganizationIdentityVisual,
} from "./OrganizationAvatar";

export type OrganizationIdentityVariant = "actor" | "default";

const defaultAvatarSize = {
	actor: "sm",
	default: "md",
} satisfies Record<OrganizationIdentityVariant, OrganizationAvatarSize>;

function OrganizationIdentityRoot({
	avatarClassName,
	avatarSize,
	className,
	presentation,
	textClassName,
	variant = "default",
	visual,
}: {
	avatarClassName?: string;
	avatarSize?: OrganizationAvatarSize;
	className?: string;
	presentation: OrganizationPresentation;
	textClassName?: string;
	variant?: OrganizationIdentityVariant;
	visual?: OrganizationIdentityVisual;
}) {
	const actor = variant === "actor";
	const resolvedAvatarSize = avatarSize ?? defaultAvatarSize[variant];
	return (
		<EntityIdentity
			avatar={
				<OrganizationAvatar
					alt={presentation.avatarAlt}
					className={avatarClassName}
					colorIndex={presentation.avatarColorIndex}
					imageUrl={presentation.avatarUrl}
					initials={presentation.initials}
					size={resolvedAvatarSize}
					visual={visual}
				/>
			}
			avatarSize={resolvedAvatarSize}
			className={className}
			primaryLabel={presentation.displayLabel}
			secondaryLabel={actor ? undefined : presentation.secondaryLabel}
			textClassName={textClassName}
			variant={variant}
		/>
	);
}

function OrganizationIdentitySkeleton({
	avatarSize,
	className,
	displayLabel = "Example organization",
	secondaryLabel = "example · Member",
	variant = "default",
	visual,
}: {
	avatarSize?: OrganizationAvatarSize;
	className?: string;
	displayLabel?: string;
	secondaryLabel?: string;
	variant?: OrganizationIdentityVariant;
	visual?: OrganizationIdentityVisual;
}) {
	const resolvedAvatarSize = avatarSize ?? defaultAvatarSize[variant];
	return (
		<EntityIdentity.Skeleton
			avatar={
				<OrganizationAvatarSkeleton size={resolvedAvatarSize} visual={visual} />
			}
			avatarSize={resolvedAvatarSize}
			className={className}
			primaryLabel={displayLabel}
			secondaryClassName="max-w-36"
			secondaryLabel={variant === "actor" ? undefined : secondaryLabel}
			variant={variant}
		/>
	);
}

export const OrganizationIdentity = Object.assign(OrganizationIdentityRoot, {
	Skeleton: OrganizationIdentitySkeleton,
});
