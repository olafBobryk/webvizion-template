"use client";

import { Icon } from "@/components/ui/icons/Icon";
import { ProfilePicture, type ProfilePictureSize } from "@/components/ui/misc";

export type OrganizationAvatarSize = Exclude<ProfilePictureSize, "2xl">;
export type OrganizationIdentityVisual = "icon" | "profile-picture";

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
	visual = "profile-picture",
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
			<ProfilePicture
				alt={alt}
				className={className}
				fallback={<Icon name="building" size={iconSize[size]} />}
				helperIndex={colorIndex}
				name={alt}
				size={size}
			/>
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
}: {
	className?: string;
	size?: OrganizationAvatarSize;
	visual?: OrganizationIdentityVisual;
}) {
	return <ProfilePicture className={className} loading size={size} />;
}

export const OrganizationAvatar = Object.assign(OrganizationAvatarRoot, {
	Skeleton: OrganizationAvatarSkeleton,
});
