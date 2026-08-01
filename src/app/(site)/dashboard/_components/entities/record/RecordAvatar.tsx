"use client";

import { Icon } from "@/components/ui/icons/Icon";
import { ProfilePicture, type ProfilePictureSize } from "@/components/ui/misc";
import { recordPresentationDefinition } from "../../../_lib/entities/record/presentation";

export type RecordAvatarSize = Exclude<ProfilePictureSize, "2xl">;

const iconSize = {
	lg: "lg",
	md: "md",
	sm: "sm",
	xl: "lg",
} as const satisfies Record<RecordAvatarSize, "lg" | "md" | "sm">;

function RecordAvatarRoot({
	className,
	size = "md",
}: {
	className?: string;
	size?: RecordAvatarSize;
}) {
	return (
		<ProfilePicture
			alt="Record"
			className={className}
			fallback={
				<Icon name={recordPresentationDefinition.icon} size={iconSize[size]} />
			}
			name="Record"
			size={size}
		/>
	);
}

function RecordAvatarSkeleton({
	className,
	size = "md",
}: {
	className?: string;
	size?: RecordAvatarSize;
}) {
	return <ProfilePicture className={className} loading size={size} />;
}

export const RecordAvatar = Object.assign(RecordAvatarRoot, {
	Skeleton: RecordAvatarSkeleton,
});
