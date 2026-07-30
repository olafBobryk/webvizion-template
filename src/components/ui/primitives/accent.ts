import clsx from "clsx";
import type { CSSProperties } from "react";
import { createSurfaceTint } from "@/components/ui/foundations/surfaceTint";

export type AccentTone = "danger" | "info" | "neutral" | "success" | "warning";

type AccentScope = "slot" | "surface";

const accentSurfaceClassNames = {
	danger: "border-danger/20 bg-danger/5 ring-danger/20",
	info: "border-primary/20 bg-primary/5 ring-primary/20",
	neutral: "border-border/70 bg-muted/40",
	success: "border-success/20 bg-success/5 ring-success/20",
	warning:
		"border-warning-accent/25 bg-warning-accent/5 ring-warning-accent/20",
} satisfies Record<AccentTone, string>;

const accentSlotClassNames = {
	danger: "bg-danger/5",
	info: "bg-primary/5",
	neutral: "bg-muted/45",
	success: "bg-success/5",
	warning: "bg-warning-accent/5",
} satisfies Record<AccentTone, string>;

const solidAccentSurfaceClassNames = {
	danger: "border-danger/20 bg-[var(--accent-background)] ring-danger/20",
	info: "border-primary/20 bg-[var(--accent-background)] ring-primary/20",
	neutral: "border-border/70 bg-[var(--accent-background)]",
	success: "border-success/20 bg-[var(--accent-background)] ring-success/20",
	warning:
		"border-warning-accent/25 bg-[var(--accent-background)] ring-warning-accent/20",
} satisfies Record<AccentTone, string>;

const solidAccentSlotClassNames = {
	danger: "bg-[var(--accent-background)]",
	info: "bg-[var(--accent-background)]",
	neutral: "bg-[var(--accent-background)]",
	success: "bg-[var(--accent-background)]",
	warning: "bg-[var(--accent-background)]",
} satisfies Record<AccentTone, string>;

const accentTintColors = {
	danger: "var(--danger)",
	info: "var(--primary)",
	neutral: "var(--muted)",
	success: "var(--success)",
	warning: "var(--warning)",
} satisfies Record<AccentTone, string>;

type AccentStyle = CSSProperties & {
	"--accent-background"?: string;
};

const accentForegroundClassNames = {
	danger: "text-danger",
	info: "text-primary",
	neutral: "text-muted-foreground",
	success: "text-success",
	warning: "text-warning",
} satisfies Record<AccentTone, string>;

export function getAccentClassName(
	accent: AccentTone | null | undefined,
	scope: AccentScope = "surface",
	options: { solidBackground?: boolean } = {},
) {
	if (!accent) return undefined;
	return clsx(
		options.solidBackground
			? scope === "surface"
				? solidAccentSurfaceClassNames[accent]
				: solidAccentSlotClassNames[accent]
			: scope === "surface"
				? accentSurfaceClassNames[accent]
				: accentSlotClassNames[accent],
	);
}

export function getAccentForegroundClassName(
	accent: AccentTone | null | undefined,
) {
	return accent ? accentForegroundClassNames[accent] : undefined;
}

export function getAccentStyle(
	accent: AccentTone | null | undefined,
	scope: AccentScope = "surface",
	options: { solidBackground?: boolean } = {},
): AccentStyle | undefined {
	if (!accent || !options.solidBackground) return undefined;
	const tintPercentage =
		accent === "neutral" ? (scope === "surface" ? 40 : 45) : 5;
	return {
		"--accent-background": createSurfaceTint({
			surface: "var(--card)",
			space: "oklch",
			tint: accentTintColors[accent],
			tintPercentage,
		}),
	};
}
