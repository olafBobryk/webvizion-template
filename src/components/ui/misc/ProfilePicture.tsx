"use client";

import clsx from "clsx";
import Image from "next/image";
import * as React from "react";
import { Chip } from "@/components/ui/misc/Chip";
import { Skeleton } from "@/components/ui/misc/Skeleton";

const sizeMap = {
	sm: { px: 32, className: "size-8 text-xs" },
	md: { px: 40, className: "size-10 text-sm" },
	lg: { px: 56, className: "size-14 text-base" },
	xl: { px: 80, className: "size-20 text-xl" },
	"2xl": { px: 96, className: "size-24 text-2xl" },
} as const;

const HELPER_PALETTE_SIZE = 8;

function getAvatarHelperIndex(value: string) {
	return value.charCodeAt(0) % HELPER_PALETTE_SIZE;
}

export type ProfilePictureSize = keyof typeof sizeMap;

export type ProfilePictureProps = {
	alt?: string;
	className?: string;
	fallback?: React.ReactNode;
	helperIndex?: number;
	loading?: boolean;
	name?: string | null;
	size?: ProfilePictureSize;
	src?: string | null;
	tone?: "helper" | "neutral";
};

function ProfilePictureRoot({
	alt,
	className,
	fallback,
	helperIndex,
	loading = false,
	name,
	size = "md",
	src,
	tone = "helper",
}: ProfilePictureProps) {
	const [imgError, setImgError] = React.useState(false);
	const { px, className: sizeClass } = sizeMap[size];
	const normalizedName = name?.trim();
	const initial = normalizedName?.charAt(0).toUpperCase() || "?";
	const fallbackIsText = typeof fallback === "string";
	const fallbackLabel = fallbackIsText
		? fallback
		: normalizedName?.startsWith("Unknown")
			? "?"
			: initial;
	const fallbackContent = fallbackIsText
		? fallbackLabel
		: (fallback ?? fallbackLabel);
	const accessibleLabel =
		alt ??
		(normalizedName ? `${normalizedName} profile picture` : "Profile picture");
	const showImage = src && !imgError;
	const resolvedHelperIndex =
		helperIndex ?? getAvatarHelperIndex(fallbackLabel || initial);
	const isLocalPreviewSource =
		src?.startsWith("data:") || src?.startsWith("blob:");

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset image fallback when the image source changes
	React.useEffect(() => {
		setImgError(false);
	}, [src]);

	const baseClass = clsx(
		"relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full! border-transparent font-semibold leading-none",
		sizeClass,
		className,
	);

	if (loading) {
		return (
			<Skeleton
				className={clsx(
					"inline-block shrink-0 rounded-full! border border-transparent",
					sizeClass,
					className,
				)}
				data-slot="profile-picture"
			/>
		);
	}

	if (showImage) {
		return (
			<Chip
				contentMode="contents"
				size="none"
				tone="plain"
				className={baseClass}
				data-slot="profile-picture"
				style={{
					backgroundColor: "var(--ui-surface-color, var(--color-background))",
				}}
			>
				<Image
					src={src}
					alt={accessibleLabel}
					width={px}
					height={px}
					className="h-full w-full object-cover"
					unoptimized={isLocalPreviewSource}
					onError={() => setImgError(true)}
				/>
			</Chip>
		);
	}

	return (
		<Chip
			contentMode="contents"
			size="none"
			tone={tone}
			helperIndex={resolvedHelperIndex}
			className={baseClass}
			data-helper-index={resolvedHelperIndex}
			data-slot="profile-picture"
		>
			<span
				aria-label={accessibleLabel}
				className="flex size-full items-center justify-center text-[inherit]"
				role="img"
			>
				{fallbackContent}
			</span>
		</Chip>
	);
}

function ProfilePictureSkeleton({
	className,
	size = "md",
}: Pick<ProfilePictureProps, "className" | "size">) {
	return <ProfilePictureRoot className={className} loading size={size} />;
}

export const ProfilePicture = Object.assign(ProfilePictureRoot, {
	Skeleton: ProfilePictureSkeleton,
});

export type ProfilePictureStackItem = {
	alt?: string;
	fallback?: ProfilePictureProps["fallback"];
	helperIndex?: number;
	id: string;
	name?: string | null;
	src?: string | null;
};

const overlapClasses = {
	sm: "-ml-2.5",
	md: "-ml-3",
	lg: "-ml-3.5",
	xl: "-ml-[18px]",
	"2xl": "-ml-[22px]",
} satisfies Record<ProfilePictureSize, string>;

const overlapClipPaths = {
	sm: 'path(evenodd, "M0 0H32V32H0Z M13 16A19 19 0 1 0-25 16A19 19 0 1 0 13 16Z")',
	md: 'path(evenodd, "M0 0H40V40H0Z M15 20A23 23 0 1 0-31 20A23 23 0 1 0 15 20Z")',
	lg: 'path(evenodd, "M0 0H56V56H0Z M17 28A31 31 0 1 0-45 28A31 31 0 1 0 17 28Z")',
	xl: 'path(evenodd, "M0 0H80V80H0Z M21 40A43 43 0 1 0-65 40A43 43 0 1 0 21 40Z")',
	"2xl":
		'path(evenodd, "M0 0H96V96H0Z M25 48A51 51 0 1 0-77 48A51 51 0 1 0 25 48Z")',
} satisfies Record<ProfilePictureSize, string>;

const profilePictureSkeletonKeys = [
	"alpha",
	"bravo",
	"charlie",
	"delta",
	"echo",
	"foxtrot",
];

function ProfilePictureStackRoot({
	ariaLabel,
	className,
	items,
	maxVisible = 3,
	size = "sm",
}: {
	ariaLabel: string;
	className?: string;
	items: readonly ProfilePictureStackItem[];
	maxVisible?: number;
	size?: ProfilePictureSize;
}) {
	if (items.length === 0) return null;
	const visibleItems = items.slice(0, Math.max(1, maxVisible));
	const remaining = items.length - visibleItems.length;

	return (
		<span
			aria-label={ariaLabel}
			className={clsx("isolate inline-flex items-center", className)}
			data-slot="profile-picture-stack"
			role="img"
		>
			{visibleItems.map((item, index) => (
				<span
					className={clsx(
						"relative inline-flex",
						index > 0 && overlapClasses[size],
					)}
					key={item.id}
					style={{
						clipPath: index > 0 ? overlapClipPaths[size] : undefined,
						zIndex: visibleItems.length - index,
					}}
					title={item.name ?? item.alt}
				>
					<ProfilePicture
						alt={item.alt}
						fallback={item.fallback}
						helperIndex={item.helperIndex}
						name={item.name}
						size={size}
						src={item.src}
					/>
				</span>
			))}
			{remaining > 0 ? (
				<span
					className={clsx("relative z-0 inline-flex", overlapClasses[size])}
					style={{ clipPath: overlapClipPaths[size] }}
					title={`${remaining} more`}
				>
					<ProfilePicture
						alt={`${remaining} more profiles`}
						fallback={`+${remaining}`}
						size={size}
						tone="neutral"
					/>
				</span>
			) : null}
		</span>
	);
}

function ProfilePictureStackSkeleton({
	className,
	count = 3,
	size = "sm",
}: {
	className?: string;
	count?: number;
	size?: ProfilePictureSize;
}) {
	return (
		<span
			aria-hidden
			className={clsx("isolate inline-flex items-center", className)}
			data-slot="profile-picture-stack-skeleton"
		>
			{profilePictureSkeletonKeys.slice(0, count).map((itemKey, index) => (
				<span
					className={clsx(
						"relative inline-flex",
						index > 0 && overlapClasses[size],
					)}
					key={itemKey}
					style={{
						clipPath: index > 0 ? overlapClipPaths[size] : undefined,
						zIndex: count - index,
					}}
				>
					<ProfilePicture.Skeleton size={size} />
				</span>
			))}
		</span>
	);
}

export const ProfilePictureStack = Object.assign(ProfilePictureStackRoot, {
	Skeleton: ProfilePictureStackSkeleton,
});
