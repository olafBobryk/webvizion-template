import clsx from "clsx";
import { Text } from "@/components/ui/primitives/Text";
import type { OrganizationIdentityVisual } from "@/config/organization";
import type { OrganizationPresentation } from "../../../_lib/entities/organization/presentation";
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
	visual,
}: {
	avatarClassName?: string;
	avatarSize?: OrganizationAvatarSize;
	className?: string;
	presentation: OrganizationPresentation;
	textClassName?: string;
	visual?: OrganizationIdentityVisual;
}) {
	return (
		<span className={clsx("flex min-w-0 items-center gap-3.5", className)}>
			<OrganizationAvatar
				alt={presentation.avatarAlt}
				className={avatarClassName}
				colorIndex={presentation.avatarColorIndex}
				imageUrl={presentation.avatarUrl}
				initials={presentation.initials}
				size={avatarSize}
				visual={visual}
			/>
			<span className={clsx("grid min-w-0 flex-1 gap-0.5", textClassName)}>
				<Text as="span" className="truncate" variant="support">
					{presentation.displayLabel}
				</Text>
				<Text as="span" className="truncate" tone="muted" variant="support">
					{presentation.secondaryLabel}
				</Text>
			</span>
		</span>
	);
}

function OrganizationIdentitySkeleton({
	avatarSize = "md",
	className,
	displayLabel = "Example organization",
	secondaryLabel = "example · Member",
	visual,
}: {
	avatarSize?: OrganizationAvatarSize;
	className?: string;
	displayLabel?: string;
	secondaryLabel?: string;
	visual?: OrganizationIdentityVisual;
}) {
	return (
		<span className={clsx("flex min-w-0 items-center gap-3.5", className)}>
			<OrganizationAvatarSkeleton size={avatarSize} visual={visual} />
			<span className="grid min-w-0 flex-1 gap-0.5">
				<Text.Skeleton
					as="span"
					className="max-w-48 truncate"
					variant="support"
				>
					{displayLabel}
				</Text.Skeleton>
				<Text.Skeleton
					as="span"
					className="max-w-36 truncate"
					tone="muted"
					variant="support"
				>
					{secondaryLabel}
				</Text.Skeleton>
			</span>
		</span>
	);
}

export const OrganizationIdentity = Object.assign(OrganizationIdentityRoot, {
	Skeleton: OrganizationIdentitySkeleton,
});
