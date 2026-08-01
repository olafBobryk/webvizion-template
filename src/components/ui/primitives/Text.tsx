// components/ui/Text.tsx
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import type * as React from "react";
import { Skeleton } from "@/components/ui/misc/Skeleton";

export const textVariants = cva("", {
	variants: {
		variant: {
			chip: "min-w-0 truncate text-xs leading-4",
			heading:
				"[font-family:var(--font-heading)] text-3xl font-semibold leading-tight tracking-normal md:text-5xl",
			headingPage:
				"[font-family:var(--font-heading)] text-2xl font-semibold leading-tight md:text-3xl",
			headingHero:
				"[font-family:var(--font-heading)] text-display-hero font-semibold -tracking-[0.02em] leading-[1.05]",
			heading2xxl:
				"[font-family:var(--font-heading)] text-display-2xxl font-semibold -tracking-[0.02em] leading-[1.05]",
			headingXxl:
				"[font-family:var(--font-heading)] text-display-xxl font-semibold -tracking-[0.02em]",
			headingXl:
				"[font-family:var(--font-heading)] text-display-xl font-semibold -tracking-[0.02em]",
			headingLg:
				"[font-family:var(--font-heading)] text-xl font-semibold -tracking-[0.02em]",
			headingMd:
				"[font-family:var(--font-heading)] text-xl font-medium -tracking-[0.02em]",
			headingSm:
				"[font-family:var(--font-heading)] text-lg font-medium -tracking-[0.02em]",
			headingXs:
				"[font-family:var(--font-heading)] text-base font-medium -tracking-[0.02em]",
			body: "text-sm font-normal",
			support: "text-sm leading-6",
			bodyStrong: "text-sm font-medium -tracking-[0.02em]",
			caption: "text-xs font-normal",
			nav: "text-sm font-medium leading-none",
			"menu-title": "text-sm font-medium leading-[1.15]",
			"menu-description": "text-xs font-normal leading-[1.2]",
		},
		tone: {
			default: "",
			muted: "",
			inherit: "",
		},
		theme: {
			dark: "",
			light: "",
			inherit: "",
		},
		interactive: {
			true: "transition-colors motion-interactive",
			false: "",
		},
	},
	compoundVariants: [
		{
			theme: "dark",
			tone: "default",
			class: "text-foreground",
		},
		{
			theme: "dark",
			tone: "muted",
			class: "text-muted-foreground",
		},
		{
			theme: "light",
			tone: "default",
			class: "text-background",
		},
		{
			theme: "light",
			tone: "muted",
			class: "text-background/70",
		},
	],
	defaultVariants: {
		variant: "body",
		tone: "default",
		theme: "dark",
		interactive: true,
	},
});

export type TextVariant = NonNullable<
	VariantProps<typeof textVariants>["variant"]
>;

export type TextSkeletonDensity = "default" | "compact";

type BaseProps = {
	as?: "span" | "p" | "div" | "label" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
	className?: string;
	children?: React.ReactNode;
} & VariantProps<typeof textVariants>;

type SpanProps = BaseProps & {
	as?: "span";
} & React.HTMLAttributes<HTMLSpanElement>;
type PProps = BaseProps & {
	as: "p";
} & React.HTMLAttributes<HTMLParagraphElement>;
type DivProps = BaseProps & {
	as: "div";
} & React.HTMLAttributes<HTMLDivElement>;
type LabelProps = BaseProps & {
	as: "label";
} & React.LabelHTMLAttributes<HTMLLabelElement>;
type HeadingProps = BaseProps & {
	as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
} & React.HTMLAttributes<HTMLHeadingElement>;

export type TextSpanProps = SpanProps;

export type TextProps =
	| SpanProps
	| PProps
	| DivProps
	| LabelProps
	| HeadingProps;

type TextSkeletonProps = Omit<
	React.ComponentPropsWithoutRef<typeof Skeleton>,
	"as" | "children"
> &
	VariantProps<typeof textVariants> & {
		as?:
			| "span"
			| "p"
			| "div"
			| "label"
			| "h1"
			| "h2"
			| "h3"
			| "h4"
			| "h5"
			| "h6";
		children?: React.ReactNode;
		density?: TextSkeletonDensity;
		textClassName?: string;
	};

function TextSkeleton({
	as = "span",
	variant,
	tone,
	theme,
	interactive,
	className,
	textClassName,
	density = "default",
	children,
	...rest
}: TextSkeletonProps) {
	return (
		<Skeleton
			as={as === "span" || as === "label" ? "span" : "div"}
			className={clsx(
				"w-fit max-w-full",
				density === "compact" &&
					"!bg-transparent before:pointer-events-none before:absolute before:inset-x-0 before:inset-y-px before:rounded-[inherit] before:bg-muted/80",
				textVariants({
					variant,
					tone,
					theme,
					interactive,
					className: clsx(className, textClassName),
				}),
			)}
			data-skeleton-density={density}
			{...rest}
		>
			<span>{children ?? "Loading"}</span>
		</Skeleton>
	);
}

// Overloads (gives you correct props per tag)
function TextRoot(props: SpanProps): React.ReactElement;
function TextRoot(props: PProps): React.ReactElement;
function TextRoot(props: DivProps): React.ReactElement;
function TextRoot(props: LabelProps): React.ReactElement;
function TextRoot(props: HeadingProps): React.ReactElement;

function TextRoot({
	as = "span",
	variant,
	tone,
	theme,
	interactive,
	className,
	children,
	...rest
}: TextProps) {
	const Tag = as as
		| "span"
		| "p"
		| "div"
		| "label"
		| "h1"
		| "h2"
		| "h3"
		| "h4"
		| "h5"
		| "h6";
	return (
		<Tag
			className={textVariants({ variant, tone, theme, interactive, className })}
			{...(rest as Record<string, unknown>)}
		>
			{children}
		</Tag>
	);
}

export const Text = Object.assign(TextRoot, { Skeleton: TextSkeleton });
