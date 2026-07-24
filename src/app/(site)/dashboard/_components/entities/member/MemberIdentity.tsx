import clsx from "clsx";
import Link from "next/link";
import { focusRing } from "@/components/ui/foundations/focus";
import { Text } from "@/components/ui/primitives/Text";
import type { MemberIdentityPresentation } from "../../../_lib/entities/member/presentation";
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
	const label =
		href && presentation.href ? (
			<Link
				className={clsx(
					"truncate rounded-sm font-medium text-foreground outline-none",
					focusRing.visibleDefault,
					profile ? "text-base font-semibold" : "text-sm",
				)}
				href={presentation.href}
			>
				{presentation.displayLabel}
			</Link>
		) : profile ? (
			<Text as="h2" className="truncate" variant="headingXs">
				{presentation.displayLabel}
			</Text>
		) : (
			<Text as="span" className="truncate" variant="support">
				{presentation.displayLabel}
			</Text>
		);
	return (
		<div
			className={clsx(
				"flex min-w-0 items-center",
				profile ? "gap-4" : "gap-3",
				className,
			)}
		>
			{avatar}
			<div className={clsx("grid min-w-0 flex-1", profile ? "gap-1" : "gap-0")}>
				{label}
				{actor ? null : (
					<Text
						className="truncate"
						tone="muted"
						variant={profile ? "support" : "caption"}
					>
						{presentation.emailLabel}
					</Text>
				)}
			</div>
		</div>
	);
}

export function MemberIdentitySkeleton({
	avatarSize,
	className,
	displayLabel = "Example member",
	emailLabel = "member@example.com",
	href = false,
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
		<div
			className={clsx(
				"flex min-w-0 items-center",
				profile ? "gap-4" : "gap-3",
				className,
			)}
		>
			<MemberAvatarSkeleton size={avatarSize ?? defaultAvatarSize[variant]} />
			<div className={clsx("grid min-w-0 flex-1", profile ? "gap-1" : "gap-0")}>
				{profile ? (
					<Text.Skeleton
						as="h2"
						className="max-w-48 truncate"
						variant="headingXs"
					>
						{displayLabel}
					</Text.Skeleton>
				) : href ? (
					<Text.Skeleton
						as="span"
						className="max-w-48 truncate text-sm font-medium leading-5 text-foreground"
						tone={null}
						variant={null}
					>
						{displayLabel}
					</Text.Skeleton>
				) : (
					<Text.Skeleton
						as="span"
						className="max-w-48 truncate"
						variant="support"
					>
						{displayLabel}
					</Text.Skeleton>
				)}
				{variant === "actor" ? null : (
					<Text.Skeleton
						as="span"
						className="max-w-56 truncate"
						tone="muted"
						variant={profile ? "support" : "caption"}
					>
						{emailLabel}
					</Text.Skeleton>
				)}
			</div>
		</div>
	);
}

export const MemberIdentity = Object.assign(MemberIdentityRoot, {
	Skeleton: MemberIdentitySkeleton,
});
