import { ProfilePicture } from "@/components/ui/misc";
import type { AccountPresentation } from "../../../_lib/entities/account/presentation";
import { EntityIdentity } from "../EntityIdentity";

function AccountIdentityRoot({
	className,
	presentation,
	variant = "profile",
}: {
	className?: string;
	presentation: AccountPresentation;
	variant?: "compact" | "profile";
}) {
	const profile = variant === "profile";
	return (
		<EntityIdentity
			avatar={
				<ProfilePicture
					alt={presentation.avatarAlt}
					fallback={presentation.initials}
					helperIndex={presentation.avatarColorIndex}
					name={presentation.displayLabel}
					size={profile ? "xl" : "md"}
					src={presentation.avatarUrl}
				/>
			}
			className={className}
			primaryAs={profile ? "h2" : "span"}
			primaryLabel={presentation.displayLabel}
			secondaryLabel={presentation.emailLabel}
			variant={variant}
		/>
	);
}

export function AccountIdentitySkeleton({
	displayLabel = "Example account",
	emailLabel = "account@example.com",
	variant = "profile",
}: {
	displayLabel?: string;
	emailLabel?: string;
	variant?: "compact" | "profile";
}) {
	const profile = variant === "profile";
	return (
		<EntityIdentity.Skeleton
			avatar={<ProfilePicture loading size={profile ? "xl" : "md"} />}
			primaryAs={profile ? "h2" : "span"}
			primaryLabel={displayLabel}
			secondaryLabel={emailLabel}
			variant={variant}
		/>
	);
}

export const AccountIdentity = Object.assign(AccountIdentityRoot, {
	Skeleton: AccountIdentitySkeleton,
});
