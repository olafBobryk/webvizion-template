import clsx from "clsx";
import type {
	ComponentPropsWithoutRef,
	ComponentPropsWithRef,
	ElementType,
	ReactNode,
} from "react";
import { type AccentTone, getAccentClassName, getAccentStyle } from "../accent";
import { type SurfaceStyleProps, surfaceStyles } from "./surfaceStyles";

export type { AccentTone } from "../accent";

type PanelOwnProps<T extends ElementType> = {
	accent?: AccentTone | null;
	as?: T;
	children?: ReactNode;
	className?: string;
	ref?: ComponentPropsWithRef<T>["ref"];
	solidAccentBackground?: boolean;
} & SurfaceStyleProps;

export type PanelProps<T extends ElementType = "div"> = PanelOwnProps<T> &
	Omit<ComponentPropsWithoutRef<T>, keyof PanelOwnProps<T>>;

export function Panel<T extends ElementType = "div">({
	accent,
	as,
	background,
	border,
	children,
	className,
	columns,
	display,
	elevation = "panel",
	gap,
	overflow,
	padding,
	radius,
	ref,
	solidAccentBackground = false,
	style,
	tone,
	width,
	...rest
}: PanelProps<T>) {
	const Tag = (as ?? "div") as ElementType;

	return (
		<Tag
			ref={ref}
			className={clsx(
				surfaceStyles({
					background,
					border,
					columns,
					display,
					elevation,
					gap,
					overflow,
					padding,
					radius,
					tone,
					width,
				}),
				getAccentClassName(accent, "surface", {
					solidBackground: solidAccentBackground,
				}),
				className,
			)}
			data-accent={accent ?? undefined}
			data-elevation={elevation}
			data-solid-accent-background={solidAccentBackground || undefined}
			data-slot="panel"
			data-surface-role="panel"
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
