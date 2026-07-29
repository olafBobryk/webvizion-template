import type { OrganizationIdentityVisual } from "@/config/organization";
import type { OrganizationPresentation } from "../../../_lib/entities/organization/presentation";
import { EntityIdentity } from "../EntityIdentity";
import {
	OrganizationAvatar,
	type OrganizationAvatarSize,
	OrganizationAvatarSkeleton,
} from "./OrganizationAvatar";

function OrganizationIdentityRoot({
	avatarClassName,
	avatarSize = "md",
	className,
	presentation,
	textClassName,
	variant = "compact",
	visual,
}: {
	avatarClassName?: string;
	avatarSize?: OrganizationAvatarSize;
	className?: string;
	presentation: OrganizationPresentation;
	textClassName?: string;
	variant?: "compact" | "profile";
	visual?: OrganizationIdentityVisual;
}) {
	return (
		<EntityIdentity
			avatar={
				<OrganizationAvatar
					alt={presentation.avatarAlt}
					className={avatarClassName}
					colorIndex={presentation.avatarColorIndex}
					imageUrl={presentation.avatarUrl}
					initials={presentation.initials}
					size={avatarSize}
					visual={visual}
				/>
			}
			className={className}
			primaryLabel={presentation.displayLabel}
			secondaryLabel={presentation.secondaryLabel}
			textClassName={textClassName}
			variant={variant}
		/>
	);
}

function OrganizationIdentitySkeleton({
	avatarSize = "md",
	className,
	displayLabel = "Example organization",
	secondaryLabel = "example · Member",
	variant = "compact",
	visual,
}: {
	avatarSize?: OrganizationAvatarSize;
	className?: string;
	displayLabel?: string;
	secondaryLabel?: string;
	variant?: "compact" | "profile";
	visual?: OrganizationIdentityVisual;
}) {
	return (
		<EntityIdentity.Skeleton
			avatar={<OrganizationAvatarSkeleton size={avatarSize} visual={visual} />}
			className={className}
			primaryLabel={displayLabel}
			secondaryClassName="max-w-36"
			secondaryLabel={secondaryLabel}
			variant={variant}
		/>
	);
}

export const OrganizationIdentity = Object.assign(OrganizationIdentityRoot, {
	Skeleton: OrganizationIdentitySkeleton,
});
