import { cva } from "class-variance-authority";
import type * as React from "react";

export const textVariants = cva("", {
	variants: {
		variant: {
			chip: "min-w-0 truncate text-xs leading-4",
			heading:
				"text-3xl font-semibold leading-tight tracking-normal md:text-5xl",
			headingPage: "text-2xl font-semibold leading-tight md:text-3xl",
			body: "text-base leading-7",
			support: "text-sm leading-6",
			headingHero: "text-4xl font-semibold leading-tight md:text-6xl",
			heading2xxl: "text-4xl font-semibold leading-tight md:text-6xl",
			headingXxl: "text-3xl font-semibold leading-tight md:text-5xl",
			headingXl: "text-3xl font-semibold leading-tight md:text-5xl",
			headingLg: "text-2xl font-semibold leading-tight md:text-4xl",
			headingMd: "text-xl font-semibold leading-tight",
			headingSm: "text-lg font-semibold leading-tight",
			headingXs: "text-base font-semibold leading-snug",
			bodyStrong: "text-base font-semibold leading-7",
			caption: "text-sm leading-6",
		},
		tone: {
			default: "text-foreground",
			muted: "text-muted-foreground",
			inherit: "text-inherit",
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
	defaultVariants: {
		variant: "body",
		tone: "default",
		theme: "inherit",
		interactive: true,
	},
});

export type TextVariant =
	| "chip"
	| "heading"
	| "headingPage"
	| "body"
	| "support"
	| "headingHero"
	| "heading2xxl"
	| "headingXxl"
	| "headingXl"
	| "headingLg"
	| "headingMd"
	| "headingSm"
	| "headingXs"
	| "bodyStrong"
	| "caption"
	| null;
export type TextTone = "default" | "muted" | "inherit" | null;
export type TextTheme = "dark" | "light" | "inherit" | null;

type TextOwnProps = {
	as?: React.ElementType;
	children?: React.ReactNode;
	className?: string;
	interactive?: boolean;
	theme?: TextTheme;
	tone?: TextTone;
	variant?: TextVariant;
};

export type TextProps = TextOwnProps &
	Omit<React.HTMLAttributes<HTMLElement>, keyof TextOwnProps>;

export type TextSpanProps = TextOwnProps &
	Omit<React.HTMLAttributes<HTMLSpanElement>, keyof TextOwnProps> & {
		as?: "span";
	};

function TextSkeleton({
	as = "span",
	children = "Loading",
	className,
	variant = "body",
}: Pick<TextOwnProps, "as" | "children" | "className" | "variant">) {
	const Tag = as ?? "span";
	return (
		<Tag
			aria-hidden
			className={textVariants({
				variant,
				className: [
					"w-fit max-w-full rounded bg-muted/80 text-transparent",
					className,
				]
					.filter(Boolean)
					.join(" "),
			})}
		>
			{children}
		</Tag>
	);
}

function TextRoot({
	as,
	children,
	className,
	interactive: _interactive,
	theme,
	tone = "default",
	variant = "body",
	...rest
}: TextProps) {
	const Tag = as ?? (variant === "heading" ? "h2" : "p");

	return (
		<Tag
			className={textVariants({
				variant,
				tone,
				theme,
				interactive: _interactive,
				className,
			})}
			{...rest}
		>
			{children}
		</Tag>
	);
}

export const Text = Object.assign(TextRoot, { Skeleton: TextSkeleton });
