import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { type AccentTone, getAccentClassName, getAccentStyle } from "../accent";
import { Text } from "../Text";
import { Panel, type PanelProps } from "./Panel";

export type { AccentTone } from "../accent";

const cardStyles = cva("", {
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
	border = "subtle",
	className,
	display = "flex",
	elevation = "card",
	gap,
	overflow = "hidden",
	padding,
	radius = "card",
	size,
	...props
}: CardProps<T>) {
	const resolvedSize = size ?? "default";
	const usesDefaultGap = gap == null;
	const usesStructuredSpacing = padding == null;
	const PanelRoot = Panel as ElementType;

	return (
		<PanelRoot
			background={background}
			border={border}
			className={clsx(
				"group/card text-sm",
				usesStructuredSpacing && cardStyles({ size: resolvedSize }),
				usesDefaultGap &&
					(resolvedSize === "sm"
						? "has-data-[slot=card-content]:gap-3"
						: "has-data-[slot=card-content]:gap-4"),
				className,
			)}
			data-elevation={elevation}
			data-size={resolvedSize}
			data-slot="card"
			data-surface-role="card"
			display={display}
			elevation={elevation}
			gap={gap ?? "none"}
			overflow={overflow}
			padding={padding ?? "none"}
			radius={radius}
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
			data-accent={accent ?? undefined}
			data-solid-accent-background={solidAccentBackground || undefined}
			data-slot="card-header"
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

export type CardHeadingProps = Omit<CardPartProps, "children" | "title"> & {
	action?: ReactNode;
	actionLayout?: "inline" | "responsive";
	description?: ReactNode;
	leading?: ReactNode;
	title: ReactNode;
	titleAs?: CardTitleProps["as"];
};

export function CardHeading({
	action,
	actionLayout = "inline",
	className,
	description,
	leading,
	title,
	titleAs,
	...props
}: CardHeadingProps) {
	const hasAction = action !== undefined && action !== null && action !== false;
	const hasDescription =
		description !== undefined && description !== null && description !== false;
	const usesResponsiveAction = hasAction && actionLayout === "responsive";

	return (
		<CardHeader
			className={clsx(
				"min-w-0",
				usesResponsiveAction && "!grid-cols-1 sm:!grid-cols-[1fr_auto]",
				className,
			)}
			data-card-heading=""
			{...props}
		>
			<CardTitle
				as={titleAs}
				className="inline-flex min-w-0 flex-wrap items-center gap-2"
			>
				{leading}
				{title}
			</CardTitle>
			{hasDescription ? (
				<CardDescription className="min-w-0 break-words">
					{description}
				</CardDescription>
			) : null}
			{hasAction ? (
				<CardAction
					className={
						usesResponsiveAction
							? "!col-start-1 !row-span-1 !row-start-auto mt-2 justify-self-start sm:!col-start-2 sm:!row-span-2 sm:!row-start-1 sm:mt-0 sm:justify-self-end"
							: undefined
					}
				>
					{action}
				</CardAction>
			) : null}
		</CardHeader>
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
				"flex items-center p-4 group-data-[size=sm]/card:p-3 group-has-data-[slot=card-content]/card:border-t",
				getAccentClassName(accent, "slot", {
					solidBackground: solidAccentBackground,
				}),
				className,
			)}
			data-accent={accent ?? undefined}
			data-solid-accent-background={solidAccentBackground || undefined}
			data-slot="card-footer"
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
Card.Heading = CardHeading;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Action = CardAction;
Card.Content = CardContent;
Card.Footer = CardFooter;
