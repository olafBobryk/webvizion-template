import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import type { ComponentPropsWithoutRef, ElementType } from "react";
import { Panel, type PanelProps } from "@/components/ui/primitives/Panel";
import { Text } from "@/components/ui/primitives/Text";
import { type AccentTone, getAccentClassName, getAccentStyle } from "./accent";

export type { AccentTone } from "./accent";

const cardStyles = cva("group/card text-sm", {
	variants: {
		size: {
			default: "py-4 has-data-[slot=card-footer]:pb-0",
			sm: "py-3 has-data-[slot=card-footer]:pb-0",
		},
	},
	defaultVariants: {
		size: "default",
	},
});

export type CardProps<T extends ElementType = "div"> = PanelProps<T> &
	VariantProps<typeof cardStyles>;

export function Card<T extends ElementType = "div">({
	background = "card",
	border,
	bordered,
	className,
	display = "flex",
	gap,
	overflow = "hidden",
	padding,
	radius,
	shadow,
	size,
	...props
}: CardProps<T>) {
	const resolvedSize = size ?? "default";
	const resolvedBorder =
		border ?? (bordered == null ? "ring" : bordered ? "default" : "none");
	const usesDefaultGap = gap == null;
	const usesStructuredSpacing = padding == null;
	const PanelRoot = Panel as ElementType;

	return (
		<PanelRoot
			background={background}
			border={resolvedBorder}
			className={clsx(
				usesStructuredSpacing && cardStyles({ size: resolvedSize }),
				usesDefaultGap && (resolvedSize === "sm" ? "gap-3" : "gap-4"),
				className,
			)}
			data-size={resolvedSize}
			data-slot="card"
			display={display}
			gap={gap ?? "none"}
			overflow={overflow}
			padding={padding ?? "none"}
			radius={radius ?? "xs"}
			shadow={shadow ?? "none"}
			{...props}
		/>
	);
}

type CardPartProps = ComponentPropsWithoutRef<"div"> & {
	accent?: AccentTone | null;
	solidAccentBackground?: boolean;
};

export function CardHeader({
	accent,
	className,
	solidAccentBackground = false,
	style,
	...props
}: CardPartProps) {
	return (
		<div
			className={clsx(
				"grid auto-rows-min items-start gap-1 border-b px-4 pb-4 group-data-[size=sm]/card:px-3 group-data-[size=sm]/card:pb-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]",
				getAccentClassName(accent, "slot", {
					solidBackground: solidAccentBackground,
				}),
				className,
			)}
			data-slot="card-header"
			data-accent={accent ?? undefined}
			data-solid-accent-background={solidAccentBackground || undefined}
			style={{
				...getAccentStyle(accent, "slot", {
					solidBackground: solidAccentBackground,
				}),
				...style,
			}}
			{...props}
		/>
	);
}

type CardTitleProps = CardPartProps & {
	as?: "div" | "h1" | "h2" | "h3" | "h4";
};

export function CardTitle({ as = "h2", className, ...props }: CardTitleProps) {
	const Tag = as;
	return (
		<Tag
			className={clsx(
				"text-base font-semibold leading-snug group-data-[size=sm]/card:text-sm",
				className,
			)}
			data-slot="card-title"
			{...props}
		/>
	);
}

export function CardDescription({
	accent: _accent,
	className,
	solidAccentBackground: _solidAccentBackground,
	...props
}: CardPartProps) {
	return (
		<Text
			as="div"
			className={className}
			data-slot="card-description"
			tone="muted"
			variant="support"
			{...props}
		/>
	);
}

export function CardAction({ className, ...props }: CardPartProps) {
	return (
		<div
			className={clsx(
				"col-start-2 row-span-2 row-start-1 self-start justify-self-end",
				className,
			)}
			data-slot="card-action"
			{...props}
		/>
	);
}

export function CardContent({
	accent,
	className,
	solidAccentBackground = false,
	style,
	...props
}: CardPartProps) {
	return (
		<div
			className={clsx(
				"px-4 group-data-[size=sm]/card:px-3",
				getAccentClassName(accent, "slot", {
					solidBackground: solidAccentBackground,
				}),
				className,
			)}
			data-accent={accent ?? undefined}
			data-solid-accent-background={solidAccentBackground || undefined}
			data-slot="card-content"
			style={{
				...getAccentStyle(accent, "slot", {
					solidBackground: solidAccentBackground,
				}),
				...style,
			}}
			{...props}
		/>
	);
}

export function CardFooter({
	accent,
	className,
	solidAccentBackground = false,
	style,
	...props
}: CardPartProps) {
	return (
		<div
			className={clsx(
				"flex items-center border-t p-4 group-data-[size=sm]/card:p-3",
				getAccentClassName(accent, "slot", {
					solidBackground: solidAccentBackground,
				}),
				className,
			)}
			data-slot="card-footer"
			data-accent={accent ?? undefined}
			data-solid-accent-background={solidAccentBackground || undefined}
			style={{
				...getAccentStyle(accent, "slot", {
					solidBackground: solidAccentBackground,
				}),
				...style,
			}}
			{...props}
		/>
	);
}

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Action = CardAction;
Card.Content = CardContent;
Card.Footer = CardFooter;
