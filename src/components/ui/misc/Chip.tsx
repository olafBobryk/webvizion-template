"use client";

import clsx from "clsx";
import Link from "next/link";
import * as React from "react";
import { focusRing } from "@/components/ui/foundations/focus";
import { createSurfaceTint } from "@/components/ui/foundations/surfaceTint";
import { Icon, type IconName } from "@/components/ui/icons/Icon";
import { Skeleton } from "@/components/ui/misc/Skeleton";
import { Text } from "@/components/ui/primitives/Text";

type IconProp = React.ReactNode | IconName;

export type ChipTone =
	| "plain"
	| "neutral"
	| "primary"
	| "success"
	| "warning"
	| "danger"
	| "helper";

export type ChipSize = "sm" | "none";
export type ChipContentMode = "label" | "contents";

export type ChipProps = {
	as?: "span" | "div";
	children: React.ReactNode;
	href?: string | null;
	disabled?: boolean;
	tone?: ChipTone;
	size?: ChipSize;
	contentMode?: ChipContentMode;
	helperIndex?: number;
	color?: string | null;
	leadingIcon?: IconProp;
	trailingIcon?: IconProp;
	className?: string;
	contentClassName?: string;
	style?: React.CSSProperties;
	onClick?: React.MouseEventHandler<HTMLElement>;
	title?: string;
} & Omit<
	React.HTMLAttributes<HTMLElement>,
	"children" | "className" | "color" | "onClick" | "style" | "title"
>;

type ChipStyle = React.CSSProperties & {
	"--chip-accent"?: string;
	"--chip-background"?: string;
	"--chip-background-active"?: string;
	"--chip-background-hover"?: string;
	"--chip-color"?: string;
};

export type ChipSkeletonProps = {
	children?: React.ReactNode;
	leadingIcon?: boolean;
	trailingIcon?: boolean;
	iconSize?: number;
	className?: string;
	contentClassName?: string;
};

export const chipCanvasTokens = {
	backgroundColor: "rgba(255,255,255,0.86)",
	mutedBackgroundColor: "rgba(255,255,255,0.56)",
	borderColor: "transparent",
	mutedBorderColor: "transparent",
	borderWidth: 1,
	fontFamily: "Geist, Arial, sans-serif",
	fontWeight: 500,
	labelGap: 10,
	paddingX: 10,
	paddingY: 4,
	textColor: "#111827",
	mutedTextColor: "rgba(17,24,39,0.58)",
} as const;

export function getChipCanvasMetrics(textHeight: number) {
	const height =
		textHeight +
		chipCanvasTokens.paddingY * 2 +
		chipCanvasTokens.borderWidth * 2;

	return {
		borderRadius: height / 2,
		height,
		padding: [chipCanvasTokens.paddingX, chipCanvasTokens.paddingY] as [
			number,
			number,
		],
	};
}

const HELPER_PALETTE_SIZE = 8;

const chipColorTokenValues: Record<string, string> = {
	berry: "var(--app-berry)",
	danger: "var(--danger)",
	info: "var(--primary)",
	lime: "var(--app-lime)",
	orange: "var(--app-orange)",
	primary: "var(--primary)",
	purple: "var(--app-purple)",
	rose: "var(--app-rose)",
	success: "var(--success)",
	violet: "var(--app-violet)",
	warning: "var(--warning)",
};

const CHIP_SURFACE_COLOR = "var(--ui-surface-color,var(--color-background))";

type ChipBackgroundRecipe = {
	activePercentage: number;
	hoverPercentage: number;
	tint: string;
	tintPercentage: number;
};

const chipToneBackgroundRecipes: Partial<
	Record<ChipTone, ChipBackgroundRecipe>
> = {
	neutral: {
		activePercentage: 12,
		hoverPercentage: 8,
		tint: "var(--foreground)",
		tintPercentage: 5,
	},
	primary: {
		activePercentage: 20,
		hoverPercentage: 15,
		tint: "var(--primary)",
		tintPercentage: 10,
	},
	success: {
		activePercentage: 20,
		hoverPercentage: 15,
		tint: "var(--success)",
		tintPercentage: 10,
	},
	warning: {
		activePercentage: 20,
		hoverPercentage: 15,
		tint: "var(--warning)",
		tintPercentage: 10,
	},
	danger: {
		activePercentage: 20,
		hoverPercentage: 15,
		tint: "var(--danger)",
		tintPercentage: 10,
	},
	helper: {
		activePercentage: 24,
		hoverPercentage: 18,
		tint: "var(--chip-accent)",
		tintPercentage: 12,
	},
};

function createChipBackgroundStyle(recipe?: ChipBackgroundRecipe): ChipStyle {
	if (!recipe) return {};
	return {
		"--chip-background": createSurfaceTint({
			surface: CHIP_SURFACE_COLOR,
			space: "srgb",
			tint: recipe.tint,
			tintPercentage: recipe.tintPercentage,
		}),
		"--chip-background-active": createSurfaceTint({
			surface: CHIP_SURFACE_COLOR,
			space: "srgb",
			tint: recipe.tint,
			tintPercentage: recipe.activePercentage,
		}),
		"--chip-background-hover": createSurfaceTint({
			surface: CHIP_SURFACE_COLOR,
			space: "srgb",
			tint: recipe.tint,
			tintPercentage: recipe.hoverPercentage,
		}),
	};
}

const toneClasses: Record<ChipTone, string> = {
	plain: "bg-transparent text-foreground",
	neutral: "bg-[var(--chip-background)] text-foreground/80",
	primary: "bg-[var(--chip-background)] text-primary",
	success: "bg-[var(--chip-background)] text-success",
	warning: "bg-[var(--chip-background)] text-warning",
	danger: "bg-[var(--chip-background)] text-danger",
	helper: "bg-[var(--chip-background)] text-[color:var(--chip-accent)]",
};

const interactiveToneClasses: Record<ChipTone, string> = {
	plain: "hover:bg-transparent active:bg-transparent",
	neutral:
		"hover:bg-[var(--chip-background-hover)] hover:text-foreground active:bg-[var(--chip-background-active)]",
	primary:
		"hover:bg-[var(--chip-background-hover)] active:bg-[var(--chip-background-active)]",
	success:
		"hover:bg-[var(--chip-background-hover)] active:bg-[var(--chip-background-active)]",
	warning:
		"hover:bg-[var(--chip-background-hover)] active:bg-[var(--chip-background-active)]",
	danger:
		"hover:bg-[var(--chip-background-hover)] active:bg-[var(--chip-background-active)]",
	helper:
		"hover:bg-[var(--chip-background-hover)] active:bg-[var(--chip-background-active)]",
};

function normalizeHelperIndex(index: number) {
	if (!Number.isFinite(index)) return 0;
	return Math.abs(Math.trunc(index)) % HELPER_PALETTE_SIZE;
}

function resolveChipColor(color?: string | null) {
	const normalized = color?.trim().toLowerCase();
	if (!normalized) return null;
	if (normalized === "neutral" || normalized === "muted") return "muted";
	const tokenValue = chipColorTokenValues[normalized];
	if (tokenValue) return tokenValue;
	return /^#[0-9a-f]{6}$/i.test(normalized) ? normalized : null;
}

function renderIcon(icon?: IconProp) {
	if (!icon) return null;
	if (typeof icon === "string") {
		return <Icon name={icon as IconName} size="sm" />;
	}
	return <span className="inline-flex shrink-0 items-center">{icon}</span>;
}

function chipClassName(
	disabled?: boolean,
	tone: ChipTone = "neutral",
	size: ChipSize = "sm",
	className?: string,
	customColor?: string | null,
	isInteractive = false,
) {
	return clsx(
		"inline-flex min-w-0 max-w-full items-center justify-center rounded-full border border-transparent",
		size === "sm" ? "gap-1.5 px-2 py-1" : "gap-0 p-0",
		customColor === "muted"
			? "bg-[var(--chip-background)] text-muted-foreground"
			: customColor
				? "bg-[var(--chip-background)] text-[var(--chip-color)]"
				: toneClasses[tone],
		disabled
			? "cursor-not-allowed opacity-50"
			: isInteractive && [
					"cursor-pointer transition-colors motion-interactive",
					customColor === "muted"
						? "hover:bg-[var(--chip-background-hover)] active:bg-[var(--chip-background-active)]"
						: customColor
							? "hover:bg-[var(--chip-background-hover)] active:bg-[var(--chip-background-active)]"
							: interactiveToneClasses[tone],
					focusRing.visibleDefault,
				],
		className,
	);
}

function chipSkeletonClassName(className?: string) {
	return clsx(
		"inline-flex min-w-0 max-w-full items-center justify-center gap-1.5 rounded-full border px-2 py-1",
		"pointer-events-none border-transparent !bg-muted/80",
		className,
	);
}

export type ChipTextProps = Omit<
	React.ComponentPropsWithoutRef<typeof Text>,
	"as" | "interactive" | "tone" | "variant"
>;

export function ChipText({ className, ...props }: ChipTextProps) {
	return (
		<Text
			as="span"
			className={className}
			interactive={false}
			tone="inherit"
			variant="chip"
			{...props}
		/>
	);
}

function ChipSkeleton({
	children,
	leadingIcon = false,
	trailingIcon = false,
	iconSize = 12,
	className,
	contentClassName,
}: ChipSkeletonProps) {
	const label = children ?? "Chip";
	const isTextChild = typeof label === "string" || typeof label === "number";
	const iconStyle = { width: `${iconSize}px`, height: `${iconSize}px` };

	return (
		<Skeleton className={chipSkeletonClassName(className)} aria-hidden="true">
			<span className="inline-flex min-w-0 items-center justify-center gap-1.5">
				{leadingIcon ? (
					<span
						className="inline-flex shrink-0 items-center justify-center"
						style={iconStyle}
					/>
				) : null}
				{isTextChild ? (
					<span
						className={clsx(
							"min-w-0 truncate text-xs font-medium opacity-0 select-none",
							contentClassName,
						)}
					>
						{label}
					</span>
				) : (
					<span className="opacity-0 select-none">{label}</span>
				)}
				{trailingIcon ? (
					<span
						className="inline-flex shrink-0 items-center justify-center"
						style={iconStyle}
					/>
				) : null}
			</span>
		</Skeleton>
	);
}

const ChipRoot = React.forwardRef<HTMLElement, ChipProps>(function Chip(
	{
		as,
		children,
		color,
		contentMode = "label",
		href,
		disabled,
		size = "sm",
		tone = "neutral",
		helperIndex = 0,
		leadingIcon,
		trailingIcon,
		className,
		contentClassName,
		style,
		onClick,
		title,
		...rest
	},
	ref,
) {
	const helperStyle: ChipStyle | undefined =
		tone === "helper"
			? {
					"--chip-accent": `var(--color-helper-${normalizeHelperIndex(helperIndex)})`,
				}
			: undefined;
	const resolvedColor = resolveChipColor(color);
	const colorStyle: ChipStyle =
		resolvedColor && resolvedColor !== "muted"
			? {
					"--chip-accent": resolvedColor,
					"--chip-color": resolvedColor,
				}
			: {};
	const backgroundRecipe =
		resolvedColor && resolvedColor !== "muted"
			? {
					activePercentage: 24,
					hoverPercentage: 18,
					tint: resolvedColor,
					tintPercentage: 10,
				}
			: resolvedColor === "muted"
				? chipToneBackgroundRecipes.neutral
				: chipToneBackgroundRecipes[tone];
	const mergedStyle = {
		...helperStyle,
		...colorStyle,
		...createChipBackgroundStyle(backgroundRecipe),
		...style,
	};
	const content = (
		<>
			{renderIcon(leadingIcon)}
			{contentMode === "contents" ? (
				children
			) : (
				<span
					className={clsx(
						"min-w-0 truncate text-xs font-medium",
						contentClassName,
					)}
				>
					{children}
				</span>
			)}
			{renderIcon(trailingIcon)}
		</>
	);

	if (href && !disabled) {
		return (
			<Link
				ref={ref as React.Ref<HTMLAnchorElement>}
				href={href}
				className={chipClassName(
					disabled,
					tone,
					size,
					className,
					resolvedColor,
					true,
				)}
				style={mergedStyle}
				title={title}
				{...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
			>
				{content}
			</Link>
		);
	}

	if (onClick) {
		return (
			<button
				ref={ref as React.Ref<HTMLButtonElement>}
				type="button"
				disabled={disabled}
				onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
				className={chipClassName(
					disabled,
					tone,
					size,
					className,
					resolvedColor,
					true,
				)}
				style={mergedStyle}
				title={title}
				{...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
			>
				{content}
			</button>
		);
	}

	const staticProps = {
		className: chipClassName(disabled, tone, size, className, resolvedColor),
		style: mergedStyle,
		title,
	};

	if (as === "div") {
		return (
			<div
				ref={ref as React.Ref<HTMLDivElement>}
				{...staticProps}
				{...(rest as React.HTMLAttributes<HTMLDivElement>)}
			>
				{content}
			</div>
		);
	}

	return (
		<span
			ref={ref as React.Ref<HTMLSpanElement>}
			{...staticProps}
			{...(rest as React.HTMLAttributes<HTMLSpanElement>)}
		>
			{content}
		</span>
	);
});

export const Chip = Object.assign(ChipRoot, {
	Skeleton: ChipSkeleton,
	Text: ChipText,
});
