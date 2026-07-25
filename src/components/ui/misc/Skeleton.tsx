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
	...rest
}: SkeletonProps) {
	return (
		<Component
			className={clsx(skeletonStyles({ radius }), className)}
			aria-hidden={rest["aria-hidden"] ?? true}
			{...rest}
		>
			{children ? (
				<span
					className="contents pointer-events-none select-none opacity-0 [&_*]:pointer-events-none [&_*]:select-none [&_*]:opacity-0"
					aria-hidden="true"
				>
					{children}
				</span>
			) : null}
		</Component>
	);
}
