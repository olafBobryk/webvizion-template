import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";
import { focusRing } from "@/components/ui/foundations/focus";
import { Text, type TextVariant } from "@/components/ui/primitives/Text";

export type EntityIdentityVariant = "actor" | "default";
export type EntityIdentityAvatarSize = "sm" | "md" | "lg" | "xl";

const defaultPrimaryVariantByAvatarSize = {
	lg: "support",
	md: "caption",
	sm: "caption",
	xl: "headingXs",
} satisfies Record<EntityIdentityAvatarSize, TextVariant>;

function getPrimaryVariant(
	variant: EntityIdentityVariant,
	avatarSize?: EntityIdentityAvatarSize,
): TextVariant {
	return variant === "default" && avatarSize
		? defaultPrimaryVariantByAvatarSize[avatarSize]
		: "support";
}

const identityLayout = {
	actor: {
		rootClassName: "gap-3",
		textClassName: "gap-0",
		secondaryVariant: "caption",
	},
	default: {
		rootClassName: "gap-3",
		textClassName: "gap-0",
		secondaryVariant: "caption",
	},
} satisfies Record<
	EntityIdentityVariant,
	{
		rootClassName: string;
		textClassName: string;
		secondaryVariant: TextVariant;
	}
>;

type EntityIdentityProps = {
	avatar: ReactNode;
	avatarSize?: EntityIdentityAvatarSize;
	className?: string;
	primaryAs?: "h2" | "span";
	primaryHref?: string;
	primaryLabel: string;
	secondaryLabel?: string;
	textClassName?: string;
	variant?: EntityIdentityVariant;
};

function EntityIdentityRoot({
	avatar,
	avatarSize,
	className,
	primaryAs = "span",
	primaryHref,
	primaryLabel,
	secondaryLabel,
	textClassName,
	variant = "default",
}: EntityIdentityProps) {
	const layout = identityLayout[variant];
	const primaryVariant = getPrimaryVariant(variant, avatarSize);
	return (
		<div
			className={clsx(
				"flex min-w-0 items-center",
				layout.rootClassName,
				className,
			)}
		>
			{avatar}
			<div
				className={clsx(
					"grid min-w-0 flex-1",
					layout.textClassName,
					textClassName,
				)}
			>
				{primaryHref ? (
					<Link
						className={clsx(
							"block min-w-0 rounded-sm text-foreground outline-none",
							focusRing.visibleDefault,
						)}
						href={primaryHref}
					>
						<Text as="span" className="block truncate" variant={primaryVariant}>
							{primaryLabel}
						</Text>
					</Link>
				) : primaryAs === "h2" ? (
					<Text as="h2" className="truncate" variant={primaryVariant}>
						{primaryLabel}
					</Text>
				) : (
					<Text as="span" className="truncate" variant={primaryVariant}>
						{primaryLabel}
					</Text>
				)}
				{secondaryLabel ? (
					<Text
						className="truncate"
						tone="muted"
						variant={layout.secondaryVariant}
					>
						{secondaryLabel}
					</Text>
				) : null}
			</div>
		</div>
	);
}

type EntityIdentitySkeletonProps = Omit<EntityIdentityProps, "primaryHref"> & {
	primaryClassName?: string;
	secondaryClassName?: string;
};

function EntityIdentitySkeleton({
	avatar,
	avatarSize,
	className,
	primaryAs = "span",
	primaryClassName,
	primaryLabel,
	secondaryClassName,
	secondaryLabel,
	textClassName,
	variant = "default",
}: EntityIdentitySkeletonProps) {
	const layout = identityLayout[variant];
	const primaryVariant = getPrimaryVariant(variant, avatarSize);
	return (
		<div
			className={clsx(
				"flex min-w-0 items-center",
				layout.rootClassName,
				className,
			)}
		>
			{avatar}
			<div
				className={clsx(
					"grid min-w-0 flex-1",
					layout.textClassName,
					textClassName,
				)}
			>
				<Text.Skeleton
					as={primaryAs}
					className={clsx("max-w-48 truncate", primaryClassName)}
					density="compact"
					variant={primaryVariant}
				>
					{primaryLabel}
				</Text.Skeleton>
				{secondaryLabel ? (
					<Text.Skeleton
						as="span"
						className={clsx("max-w-56 truncate", secondaryClassName)}
						density="compact"
						tone="muted"
						variant={layout.secondaryVariant}
					>
						{secondaryLabel}
					</Text.Skeleton>
				) : null}
			</div>
		</div>
	);
}

export const EntityIdentity = Object.assign(EntityIdentityRoot, {
	Skeleton: EntityIdentitySkeleton,
});
