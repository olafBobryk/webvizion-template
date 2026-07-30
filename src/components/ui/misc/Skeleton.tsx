import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import type * as React from "react";

const skeletonStyles = cva("relative overflow-hidden bg-muted/80", {
	defaultVariants: {
		radius: "md",
	},
	variants: {
		radius: {
			"2xl": "rounded-2xl",
			full: "rounded-full",
			lg: "rounded-lg",
			md: "rounded-md",
			none: "rounded-none",
			sm: "rounded-sm",
			xl: "rounded-xl",
		},
	},
});

export type SkeletonRadius = NonNullable<
	VariantProps<typeof skeletonStyles>["radius"]
>;

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
	as?: "div" | "span";
	children?: React.ReactNode;
	radius?: SkeletonRadius;
};

export function Skeleton({
	as: Component = "div",
	className,
	children,
	radius,
	style,
	...rest
}: SkeletonProps) {
	return (
		<Component
			className={clsx(skeletonStyles({ radius }), className)}
			aria-hidden={rest["aria-hidden"] ?? true}
			style={{ ...style, textOverflow: "clip" }}
			{...rest}
		>
			{children ? (
				<span
					className="contents invisible pointer-events-none select-none"
					aria-hidden="true"
				>
					{children}
				</span>
			) : null}
		</Component>
	);
}
