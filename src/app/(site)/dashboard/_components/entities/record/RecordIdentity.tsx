import type { RecordIdentityPresentation } from "../../../_lib/entities/record/presentation";
import { EntityIdentity } from "../EntityIdentity";
import { RecordAvatar, type RecordAvatarSize } from "./RecordAvatar";

export type RecordIdentityVariant = "actor" | "default";

const defaultAvatarSize = {
	actor: "sm",
	default: "md",
} satisfies Record<RecordIdentityVariant, RecordAvatarSize>;

function RecordIdentityRoot({
	avatarSize,
	className,
	presentation,
	variant = "default",
}: {
	avatarSize?: RecordAvatarSize;
	className?: string;
	presentation: RecordIdentityPresentation;
	variant?: RecordIdentityVariant;
}) {
	const resolvedAvatarSize = avatarSize ?? defaultAvatarSize[variant];
	return (
		<EntityIdentity
			avatar={<RecordAvatar size={resolvedAvatarSize} />}
			avatarSize={resolvedAvatarSize}
			className={className}
			primaryLabel={presentation.title}
			secondaryLabel={variant === "actor" ? undefined : presentation.slugLabel}
			variant={variant}
		/>
	);
}

function RecordIdentitySkeleton({
	avatarSize,
	className,
	slugLabel = "example-record",
	title = "Example record",
	variant = "default",
}: {
	avatarSize?: RecordAvatarSize;
	className?: string;
	slugLabel?: string;
	title?: string;
	variant?: RecordIdentityVariant;
}) {
	const resolvedAvatarSize = avatarSize ?? defaultAvatarSize[variant];
	return (
		<EntityIdentity.Skeleton
			avatar={<RecordAvatar.Skeleton size={resolvedAvatarSize} />}
			avatarSize={resolvedAvatarSize}
			className={className}
			primaryLabel={title}
			secondaryLabel={variant === "actor" ? undefined : slugLabel}
			variant={variant}
		/>
	);
}

export const RecordIdentity = Object.assign(RecordIdentityRoot, {
	Skeleton: RecordIdentitySkeleton,
});
