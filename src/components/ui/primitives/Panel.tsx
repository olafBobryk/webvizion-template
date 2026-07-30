import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import type {
	ComponentPropsWithoutRef,
	ComponentPropsWithRef,
	ElementType,
	ReactNode,
} from "react";
import { type AccentTone, getAccentClassName, getAccentStyle } from "./accent";

export type { AccentTone } from "./accent";

const panelStyles = cva("text-foreground", {
	variants: {
		background: {
			background: "bg-background [--ui-surface-color:var(--color-background)]",
			card: "bg-card text-card-foreground [--ui-surface-color:var(--color-card)]",
			muted: "bg-muted [--ui-surface-color:var(--color-muted)]",
			surface: "bg-surface [--ui-surface-color:var(--color-surface)]",
			transparent: "bg-transparent",
			white: "bg-background [--ui-surface-color:var(--color-background)]",
		},
		border: {
			default: "border border-border",
			none: "border-0",
			ring: "ring-1 ring-foreground/10",
			subtle: "border border-border/15",
		},
		columns: {
			1: "grid-cols-1",
			2: "grid-cols-1 md:grid-cols-2",
			3: "grid-cols-1 md:grid-cols-3",
		},
		display: {
			block: "block",
			flex: "flex flex-col",
			grid: "grid",
		},
		gap: {
			none: "gap-0",
			sm: "gap-4",
			md: "gap-6",
			lg: "gap-8",
		},
		overflow: {
			auto: "overflow-auto",
			hidden: "overflow-hidden",
			visible: "overflow-visible",
		},
		padding: {
			none: "p-0",
			xs: "p-2",
			sm: "p-4",
			md: "p-6",
			lg: "p-8",
		},
		radius: {
			none: "rounded-none",
			xs: "rounded-md",
			sm: "rounded-lg",
			md: "rounded-xl",
			lg: "rounded-2xl",
		},
		shadow: {
			none: "shadow-none",
			sm: "shadow-sm",
			lg: "shadow-lg",
			xl: "shadow-xl",
			"2xl": "shadow-2xl",
		},
		tone: {
			default: "",
			warning: "border-warning-accent/20 bg-warning-accent/10",
			danger: "border-danger/20 bg-danger/10",
		},
		width: {
			auto: "w-auto",
			full: "w-full",
		},
	},
	defaultVariants: {
		background: "background",
		border: "default",
		columns: 1,
		display: "grid",
		gap: "md",
		overflow: "visible",
		padding: "md",
		radius: "lg",
		shadow: "sm",
		tone: "default",
		width: "full",
	},
});

type PanelOwnProps<T extends ElementType> = {
	/** Boolean shorthand for selecting the default or no-border treatment. */
	accent?: AccentTone | null;
	bordered?: boolean;
	as?: T;
	children?: ReactNode;
	className?: string;
	ref?: ComponentPropsWithRef<T>["ref"];
	solidAccentBackground?: boolean;
} & VariantProps<typeof panelStyles>;

export type PanelProps<T extends ElementType = "div"> = PanelOwnProps<T> &
	Omit<ComponentPropsWithoutRef<T>, keyof PanelOwnProps<T>>;

export function Panel<T extends ElementType = "div">({
	accent,
	as,
	background,
	border,
	bordered,
	children,
	className,
	columns,
	display,
	gap,
	overflow,
	padding,
	radius,
	ref,
	shadow,
	solidAccentBackground = false,
	style,
	tone,
	width,
	...rest
}: PanelProps<T>) {
	const Tag = (as ?? "div") as ElementType;
	const resolvedBorder = border ?? (bordered === false ? "none" : undefined);

	return (
		<Tag
			ref={ref}
			className={clsx(
				panelStyles({
					background,
					border: resolvedBorder,
					columns,
					display,
					gap,
					overflow,
					padding,
					radius,
					shadow,
					tone,
					width,
				}),
				getAccentClassName(accent, "surface", {
					solidBackground: solidAccentBackground,
				}),
				className,
			)}
			data-accent={accent ?? undefined}
			data-solid-accent-background={solidAccentBackground || undefined}
			data-slot="panel"
			style={{
				...getAccentStyle(accent, "surface", {
					solidBackground: solidAccentBackground,
				}),
				...style,
			}}
			{...(rest as ComponentPropsWithoutRef<ElementType>)}
		>
			{children}
		</Tag>
	);
}
