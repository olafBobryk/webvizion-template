import { cva, type VariantProps } from "class-variance-authority";

export const surfaceChromeStyles = cva("text-foreground", {
	variants: {
		background: {
			page: "bg-background [--ui-surface-color:var(--color-background)]",
			panel: "bg-surface [--ui-surface-color:var(--color-surface)]",
			card: "bg-card text-card-foreground [--ui-surface-color:var(--color-card)]",
			float:
				"bg-popover text-popover-foreground [--ui-surface-color:var(--color-popover)]",
			muted: "bg-muted [--ui-surface-color:var(--color-muted)]",
			transparent: "bg-transparent",
		},
		border: {
			default: "border border-border",
			none: "border-0",
			subtle: "border border-foreground/[0.08]",
		},
		elevation: {
			panel: "shadow-none",
			card: "shadow-sm",
			float: "shadow-md",
			overlay: "shadow-lg",
		},
		radius: {
			none: "rounded-none",
			float: "rounded-lg",
			panel: "rounded-2xl",
			card: "rounded-3xl",
		},
		tone: {
			default: "",
			warning: "border-warning-accent/20 bg-warning-accent/10",
			danger: "border-danger/20 bg-danger/10",
		},
	},
	defaultVariants: {
		background: "panel",
		border: "default",
		elevation: "panel",
		radius: "panel",
		tone: "default",
	},
});

export const surfaceLayoutStyles = cva("", {
	variants: {
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
		width: {
			auto: "w-auto",
			full: "w-full",
		},
	},
	defaultVariants: {
		columns: 1,
		display: "grid",
		gap: "md",
		overflow: "visible",
		padding: "md",
		width: "full",
	},
});

type SurfaceChromeStyleProps = VariantProps<typeof surfaceChromeStyles>;
type SurfaceLayoutStyleProps = VariantProps<typeof surfaceLayoutStyles>;
export type SurfaceStyleProps = SurfaceChromeStyleProps &
	SurfaceLayoutStyleProps;

export function surfaceStyles(props: SurfaceStyleProps) {
	return `${surfaceChromeStyles(props)} ${surfaceLayoutStyles(props)}`;
}

export type SurfaceBackground = NonNullable<
	SurfaceChromeStyleProps["background"]
>;
export type SurfaceBorder = NonNullable<SurfaceChromeStyleProps["border"]>;
export type SurfaceElevation = NonNullable<
	SurfaceChromeStyleProps["elevation"]
>;
export type SurfaceRadius = NonNullable<SurfaceChromeStyleProps["radius"]>;
