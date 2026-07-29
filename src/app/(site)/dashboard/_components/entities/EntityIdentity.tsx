import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";
import { focusRing } from "@/components/ui/foundations/focus";
import { Text, type TextVariant } from "@/components/ui/primitives/Text";

export type EntityIdentityVariant = "actor" | "compact" | "profile";

const identityLayout = {
	actor: {
		rootClassName: "gap-3",
		textClassName: "gap-0",
		secondaryVariant: "caption",
	},
	compact: {
		rootClassName: "gap-3",
		textClassName: "gap-0",
		secondaryVariant: "caption",
	},
	profile: {
		rootClassName: "gap-3.5",
		textClassName: "gap-0.5",
		secondaryVariant: "support",
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
	className,
	primaryAs = "span",
	primaryHref,
	primaryLabel,
	secondaryLabel,
	textClassName,
	variant = "profile",
}: EntityIdentityProps) {
	const layout = identityLayout[variant];
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
							"truncate rounded-sm text-sm font-normal leading-6 text-foreground outline-none",
							focusRing.visibleDefault,
						)}
						href={primaryHref}
					>
						{primaryLabel}
					</Link>
				) : primaryAs === "h2" ? (
					<Text as="h2" className="truncate" variant="support">
						{primaryLabel}
					</Text>
				) : (
					<Text as="span" className="truncate" variant="support">
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
	className,
	primaryAs = "span",
	primaryClassName,
	primaryLabel,
	secondaryClassName,
	secondaryLabel,
	textClassName,
	variant = "profile",
}: EntityIdentitySkeletonProps) {
	const layout = identityLayout[variant];
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
					variant="support"
				>
					{primaryLabel}
				</Text.Skeleton>
				{secondaryLabel ? (
					<Text.Skeleton
						as="span"
						className={clsx("max-w-56 truncate", secondaryClassName)}
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
