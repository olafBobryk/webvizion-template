import { ProfilePicture, type ProfilePictureSize } from "@/components/ui/misc";
import type { AccountPresentation } from "../../../_lib/entities/account/presentation";
import { EntityIdentity } from "../EntityIdentity";

export type AccountIdentityVariant = "actor" | "default";
export type AccountIdentityAvatarSize = Exclude<ProfilePictureSize, "2xl">;

function AccountIdentityRoot({
	avatarSize,
	className,
	presentation,
	variant = "default",
}: {
	avatarSize?: AccountIdentityAvatarSize;
	className?: string;
	presentation: AccountPresentation;
	variant?: AccountIdentityVariant;
}) {
	const actor = variant === "actor";
	const resolvedAvatarSize = avatarSize ?? (actor ? "sm" : "md");
	return (
		<EntityIdentity
			avatar={
				<ProfilePicture
					alt={presentation.avatarAlt}
					fallback={presentation.initials}
					helperIndex={presentation.avatarColorIndex}
					name={presentation.displayLabel}
					size={resolvedAvatarSize}
					src={presentation.avatarUrl}
				/>
			}
			avatarSize={resolvedAvatarSize}
			className={className}
			primaryAs="span"
			primaryLabel={presentation.displayLabel}
			secondaryLabel={actor ? undefined : presentation.emailLabel}
			variant={variant}
		/>
	);
}

export function AccountIdentitySkeleton({
	avatarSize,
	displayLabel = "Example account",
	emailLabel = "account@example.com",
	variant = "default",
}: {
	avatarSize?: AccountIdentityAvatarSize;
	displayLabel?: string;
	emailLabel?: string;
	variant?: AccountIdentityVariant;
}) {
	const actor = variant === "actor";
	const resolvedAvatarSize = avatarSize ?? (actor ? "sm" : "md");
	return (
		<EntityIdentity.Skeleton
			avatar={<ProfilePicture loading size={resolvedAvatarSize} />}
			avatarSize={resolvedAvatarSize}
			primaryAs="span"
			primaryLabel={displayLabel}
			secondaryLabel={actor ? undefined : emailLabel}
			variant={variant}
		/>
	);
}

export const AccountIdentity = Object.assign(AccountIdentityRoot, {
	Skeleton: AccountIdentitySkeleton,
});
