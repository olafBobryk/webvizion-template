"use client";

import clsx from "clsx";
import { Icon } from "@/components/ui/icons/Icon";
import { ProfilePicture, type ProfilePictureSize } from "@/components/ui/misc";
import {
	type OrganizationIdentityVisual,
	organizationPresentationConfig,
} from "@/config/organization";

export type OrganizationAvatarSize = Exclude<ProfilePictureSize, "2xl">;

const iconFrameClassName = {
	lg: "size-14",
	md: "size-10",
	sm: "size-8",
	xl: "size-20",
} satisfies Record<OrganizationAvatarSize, string>;

const iconSize = {
	lg: "lg",
	md: "md",
	sm: "sm",
	xl: "lg",
} as const satisfies Record<OrganizationAvatarSize, "lg" | "md" | "sm">;

function OrganizationAvatarRoot({
	alt,
	className,
	colorIndex,
	imageUrl,
	initials,
	size = "md",
	visual = organizationPresentationConfig.identityVisual,
}: {
	alt: string;
	className?: string;
	colorIndex: number;
	imageUrl?: string | null;
	initials: string;
	size?: OrganizationAvatarSize;
	visual?: OrganizationIdentityVisual;
}) {
	if (visual === "icon") {
		return (
			<span
				aria-label={alt}
				className={clsx(
					"inline-flex shrink-0 items-center justify-center text-muted-foreground",
					iconFrameClassName[size],
					className,
				)}
				role="img"
			>
				<Icon name="building" size={iconSize[size]} />
			</span>
		);
	}

	return (
		<ProfilePicture
			alt={alt}
			className={className}
			fallback={initials}
			helperIndex={colorIndex}
			name={alt}
			size={size}
			src={imageUrl}
		/>
	);
}

export function OrganizationAvatarSkeleton({
	className,
	size = "md",
	visual = organizationPresentationConfig.identityVisual,
}: {
	className?: string;
	size?: OrganizationAvatarSize;
	visual?: OrganizationIdentityVisual;
}) {
	if (visual === "icon") {
		return (
			<span
				aria-hidden
				className={clsx(
					"inline-flex shrink-0 items-center justify-center text-muted-foreground",
					iconFrameClassName[size],
					className,
				)}
			>
				<Icon.Skeleton size={iconSize[size]} />
			</span>
		);
	}
	return <ProfilePicture className={className} loading size={size} />;
}

export const OrganizationAvatar = Object.assign(OrganizationAvatarRoot, {
	Skeleton: OrganizationAvatarSkeleton,
});
