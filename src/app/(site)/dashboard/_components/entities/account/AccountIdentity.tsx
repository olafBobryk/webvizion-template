import clsx from "clsx";
import { ProfilePicture } from "@/components/ui/misc";
import { Text } from "@/components/ui/primitives/Text";
import type { AccountPresentation } from "../../../_lib/entities/account/presentation";

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
		<div
			className={clsx(
				"flex min-w-0 items-center",
				profile ? "gap-3.5" : "gap-3",
				className,
			)}
		>
			<ProfilePicture
				alt={presentation.avatarAlt}
				fallback={presentation.initials}
				helperIndex={presentation.avatarColorIndex}
				name={presentation.displayLabel}
				size={profile ? "xl" : "md"}
				src={presentation.avatarUrl}
			/>
			<div className={clsx("grid min-w-0 flex-1", profile ? "gap-1" : "gap-0")}>
				{profile ? (
					<Text as="h2" className="truncate" variant="headingXs">
						{presentation.displayLabel}
					</Text>
				) : (
					<Text as="span" className="truncate" variant="support">
						{presentation.displayLabel}
					</Text>
				)}
				<Text
					className="truncate"
					tone="muted"
					variant={profile ? "support" : "caption"}
				>
					{presentation.emailLabel}
				</Text>
			</div>
		</div>
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
		<div
			className={clsx(
				"flex min-w-0 items-center",
				profile ? "gap-3.5" : "gap-3",
			)}
		>
			<ProfilePicture loading size={profile ? "xl" : "md"} />
			<div className={clsx("grid min-w-0 flex-1", profile ? "gap-1" : "gap-0")}>
				<Text.Skeleton
					as={profile ? "h2" : "span"}
					className="max-w-48 truncate"
					variant={profile ? "headingXs" : "support"}
				>
					{displayLabel}
				</Text.Skeleton>
				<Text.Skeleton
					as="span"
					className="max-w-56 truncate"
					tone="muted"
					variant={profile ? "support" : "caption"}
				>
					{emailLabel}
				</Text.Skeleton>
			</div>
		</div>
	);
}

export const AccountIdentity = Object.assign(AccountIdentityRoot, {
	Skeleton: AccountIdentitySkeleton,
});
