"use client";

import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import Link from "next/link";
import * as React from "react";
import { focusRing } from "@/components/ui/foundations/focus";
import { Icon, type IconName } from "@/components/ui/icons/Icon";
import { Loader } from "@/components/ui/misc/Loader";
import { Skeleton } from "@/components/ui/misc/Skeleton";
import { Text, type TextProps } from "@/components/ui/primitives/Text";

type IconConfig = {
	name: IconName;
	mirrorInRtl?: boolean;
};
type IconProp = React.ReactNode | IconName | IconConfig;

const buttonStyles = cva(
	[
		"group relative inline-flex shrink-0 items-center justify-center whitespace-nowrap border border-transparent bg-clip-padding",
		"cursor-pointer transition-all motion-interactive select-none",
		focusRing.visibleDefault,
		"active:not-aria-[haspopup]:translate-y-px",
		"disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
		"data-[disabled=true]:pointer-events-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50",
	].join(" "),
	{
		variants: {
			variant: {
				primary: "bg-primary text-primary-foreground hover:bg-primary/80",
				secondary:
					"border border-transparent bg-input/50 text-foreground hover:bg-input/70",
				ghost:
					"!bg-transparent hover:!bg-transparent active:!bg-transparent text-foreground hover:opacity-70 active:opacity-60",
				inverse:
					"border-border bg-foreground text-background hover:bg-foreground/90",
			},
			tone: {
				default: "",
				danger:
					"!text-danger-text focus-visible:!border-danger/40 focus-visible:!ring-danger/20",
			},
			size: {
				none: "",
				lg: "h-11 px-6 text-sm font-semibold",
				xl: "h-12 px-7 text-base font-semibold",
				md: "h-9 px-3 text-sm font-medium",
				sm: "h-8 px-2.5 text-xs font-medium",
				chip: "h-auto px-2 py-1 text-xs font-medium [&_svg]:size-3",
				icon: "size-9 p-0 text-sm font-medium",
				"icon-sm": "size-8 p-0 text-sm font-medium",
			},
			align: {
				left: "justify-start",
				center: "justify-center",
				between: "justify-between",
			},
			radius: {
				pill: "rounded-4xl",
				sm: "rounded-[6px]",
			},
			hitArea: {
				none: "",
				touch:
					"before:absolute before:left-1/2 before:top-1/2 before:min-h-11 before:min-w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
			},
		},
		defaultVariants: {
			variant: "secondary",
			tone: "default",
			size: "md",
			align: "left",
			radius: "pill",
			hitArea: "none",
		},
	},
);

const buttonDangerStyles = cva("", {
	variants: {
		variant: {
			primary: "!bg-danger/20 hover:!bg-danger/30",
			secondary: "!bg-danger/10 hover:!bg-danger/20",
			ghost: "!bg-transparent",
			inverse: "!bg-danger/20 hover:!bg-danger/30",
		},
	},
});

export type ButtonVariant = NonNullable<
	VariantProps<typeof buttonStyles>["variant"]
>;
export type ButtonSize = NonNullable<VariantProps<typeof buttonStyles>["size"]>;
export type ButtonTone = NonNullable<VariantProps<typeof buttonStyles>["tone"]>;

const DEFAULT_ICON_SIZE = 15; // 0.9375rem – kept in px to match provided assets

export type ButtonBaseProps = {
	children?: React.ReactNode;
	leadingIcon?: IconProp;
	trailingIcon?: IconProp;
	href?: string;
	className?: string;
	contentClassName?: string;
	textVariant?: TextProps["variant"];
	textTone?: TextProps["tone"];
	textClassName?: string;
	style?: React.CSSProperties;
	loading?: boolean;
	iconSize?: number;
	focusable?: boolean;
	disabled?: boolean;
} & Omit<VariantProps<typeof buttonStyles>, "align"> & {
		align?: "left" | "center" | "between";
	};

type ButtonElementProps = Omit<
	React.ButtonHTMLAttributes<HTMLButtonElement>,
	"align" | "href"
> & {
	href?: undefined;
};

type AnchorElementProps = Omit<
	React.AnchorHTMLAttributes<HTMLAnchorElement>,
	"align"
> & {
	href: string;
};

// allow both button + link props without getting too crazy on typing
export type ButtonProps = ButtonBaseProps &
	(ButtonElementProps | AnchorElementProps);

type ButtonElement = HTMLElement;

function getTextToneClassName(tone?: TextProps["tone"]) {
	switch (tone) {
		case "default":
			return "text-foreground";
		case "muted":
			return "text-muted/60";
		default:
			return undefined;
	}
}

function getContentSizeClassName(size: ButtonSize) {
	switch (size) {
		case "none":
		case "icon":
		case "icon-sm":
			return undefined;
		case "chip":
			return "gap-1";
		case "sm":
		case "md":
			return "gap-1.5";
		case "lg":
			return "gap-2";
		case "xl":
			return "gap-2.5";
	}
}

function renderIcon(
	icon?: IconProp,
	size = DEFAULT_ICON_SIZE,
	className?: string,
) {
	if (!icon) return null;

	if (typeof icon === "string") {
		return (
			<Icon
				name={icon as IconName}
				animate
				className={className}
				style={{ width: `${size}px`, height: `${size}px` }}
			/>
		);
	}

	if (
		typeof icon === "object" &&
		icon !== null &&
		!React.isValidElement(icon) &&
		"name" in icon
	) {
		return (
			<Icon
				name={icon.name}
				animate
				mirrorInRtl={icon.mirrorInRtl}
				className={className}
				style={{ width: `${size}px`, height: `${size}px` }}
			/>
		);
	}

	return (
		<span
			className={clsx("inline-flex items-center justify-center", className)}
		>
			{icon}
		</span>
	);
}

type ButtonSkeletonProps = {
	children?: React.ReactNode;
	className?: string;
	fullWidth?: boolean;
	leadingIcon?: boolean;
	trailingIcon?: boolean;
	iconSize?: number;
	textVariant?: TextProps["variant"];
	textClassName?: string;
	variant?: VariantProps<typeof buttonStyles>["variant"];
	tone?: ButtonTone;
} & VariantProps<typeof buttonSkeletonStyles>;

const buttonSkeletonStyles = cva(
	["inline-flex items-center justify-center gap-2.5", "whitespace-nowrap"].join(
		" ",
	),
	{
		variants: {
			size: {
				none: "",
				lg: "h-11 px-6 text-sm font-semibold",
				xl: "h-12 px-7 text-base font-semibold",
				md: "h-9 px-3 text-sm font-medium",
				sm: "h-8 px-2.5 text-xs font-medium",
				chip: "h-auto gap-1 px-2 py-1 text-xs font-medium",
				icon: "size-9 p-0",
				"icon-sm": "size-8 p-0",
			},
			align: {
				left: "justify-start",
				center: "justify-center",
				between: "justify-between",
			},
			radius: {
				pill: "rounded-4xl",
				sm: "rounded-[6px]",
			},
			fullWidth: {
				true: "w-full",
			},
		},
		defaultVariants: {
			size: "md",
			align: "center",
			radius: "pill",
		},
	},
);

function ButtonSkeleton({
	children,
	className,
	size,
	align,
	radius,
	fullWidth,
	leadingIcon = false,
	trailingIcon = false,
	iconSize,
	textVariant,
	textClassName,
	variant,
}: ButtonSkeletonProps) {
	const label = children ?? "Button";
	const hasLabel = React.Children.count(children) > 0;
	const isIconSize = size === "icon" || size === "icon-sm";
	const isChipSize = size === "chip";
	const resolvedIconSize = iconSize ?? (isChipSize ? 12 : DEFAULT_ICON_SIZE);
	const resolvedTextVariant = textVariant ?? (isChipSize ? "chip" : "support");
	const usesCustomTextPresentation =
		textVariant !== undefined || textClassName !== undefined;
	const minWidthClass =
		isIconSize || fullWidth || hasLabel ? undefined : "min-w-[140px]";
	const iconStyle = {
		width: `${resolvedIconSize}px`,
		height: `${resolvedIconSize}px`,
	};
	const isPrimaryVariant = variant === "primary";
	const isTextChild = typeof label === "string" || typeof label === "number";

	return (
		<Skeleton
			className={clsx(
				buttonSkeletonStyles({
					size,
					align,
					radius,
					fullWidth: fullWidth ? true : undefined,
				}),
				minWidthClass,
				"pointer-events-none border border-transparent",
				radius === "sm" ? "!rounded-[6px]" : "!rounded-full",
				isPrimaryVariant ? "!bg-primary/20" : "!bg-muted/80",
				className,
			)}
		>
			<span
				className={clsx(
					"inline-flex items-center justify-center",
					getContentSizeClassName(size ?? "md"),
				)}
			>
				{leadingIcon ? (
					<span
						className="inline-flex items-center justify-center"
						style={iconStyle}
					/>
				) : null}
				{isIconSize ? null : isTextChild && usesCustomTextPresentation ? (
					<Text
						as="span"
						variant={resolvedTextVariant}
						style={{ color: "inherit" }}
						className={clsx("opacity-0 select-none", textClassName)}
					>
						{label}
					</Text>
				) : (
					<span className="truncate opacity-0 select-none">{label}</span>
				)}
				{trailingIcon ? (
					<span
						className="inline-flex items-center justify-center"
						style={iconStyle}
					/>
				) : null}
			</span>
		</Skeleton>
	);
}

const ButtonRoot = React.forwardRef<ButtonElement, ButtonProps>(
	function ButtonRoot(props, ref) {
		const {
			children,
			leadingIcon,
			trailingIcon,
			href,
			className,
			contentClassName,
			textVariant,
			textTone,
			textClassName,
			style,
			variant = "secondary",
			tone = "default",
			size = "md",
			align = "center",
			radius,
			hitArea,
			loading,
			iconSize = DEFAULT_ICON_SIZE,
			focusable = true,
			...rest
		} = props;

		const isDisabled = Boolean(
			(rest as { disabled?: boolean }).disabled || loading,
		);
		const buttonRest = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
		const loadingState =
			loading === undefined ? undefined : loading ? "true" : "false";

		const mergedClassName = clsx(
			buttonStyles({ variant, tone, size, align, radius, hitArea }),
			tone === "danger" && buttonDangerStyles({ variant }),
			className,
		);

		const contentAlignClass =
			align === "center"
				? "justify-center text-center"
				: align === "between"
					? "justify-between text-left"
					: "justify-start text-left";
		const contentWidthClass =
			align === "between" || align === "center" ? "w-full" : "w-fit";
		const isTextChild =
			typeof children === "string" || typeof children === "number";
		const usesCustomTextPresentation =
			textVariant !== undefined ||
			textTone !== undefined ||
			textClassName !== undefined;
		const textToneClassName = getTextToneClassName(textTone);
		const resolvedTextVariant =
			textVariant ?? (size === "chip" ? "chip" : "body");
		const content = (
			<>
				<span
					className={clsx(
						"inline-flex max-w-full items-center transition-opacity motion-micro group-data-[loading=true]:opacity-0",
						getContentSizeClassName(size ?? "md"),
						contentAlignClass,
						contentWidthClass,
						contentClassName,
					)}
				>
					{leadingIcon && (
						<span className="flex items-center justify-center">
							{renderIcon(leadingIcon, iconSize, textToneClassName)}
						</span>
					)}

					{/* children can be anything (text, icon, etc) */}
					{children != null ? (
						isTextChild && usesCustomTextPresentation ? (
							<Text
								as="span"
								variant={resolvedTextVariant}
								tone={textTone}
								style={textTone ? undefined : { color: "inherit" }}
								className={textClassName}
							>
								{children}
							</Text>
						) : isTextChild ? (
							<span className="truncate">{children}</span>
						) : (
							children
						)
					) : null}

					{trailingIcon && (
						<span className="flex items-center justify-center">
							{renderIcon(trailingIcon, iconSize, textToneClassName)}
						</span>
					)}
				</span>
				{loadingState !== undefined && (
					<span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity motion-micro pointer-events-none group-data-[loading=true]:opacity-100">
						<Loader />
					</span>
				)}
			</>
		);

		if (href) {
			// Link-style button
			const { onClick, ...linkRest } =
				rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
			const handleDisabledClick: React.MouseEventHandler<HTMLAnchorElement> = (
				event,
			) => {
				if (isDisabled) {
					event.preventDefault();
					event.stopPropagation();
					return;
				}
				onClick?.(event);
			};

			return (
				<Link
					href={href}
					className={mergedClassName}
					style={style}
					ref={ref as React.Ref<HTMLAnchorElement>}
					aria-disabled={isDisabled || undefined}
					tabIndex={isDisabled ? -1 : focusable ? linkRest.tabIndex : -1}
					data-loading={loadingState}
					data-disabled={isDisabled ? "true" : undefined}
					onClick={handleDisabledClick}
					{...linkRest}
				>
					{content}
				</Link>
			);
		}

		// Regular button
		return (
			<button
				type="button"
				className={mergedClassName}
				style={style}
				ref={ref as React.Ref<HTMLButtonElement>}
				disabled={isDisabled}
				tabIndex={isDisabled ? undefined : focusable ? buttonRest.tabIndex : -1}
				data-loading={loadingState}
				data-disabled={isDisabled ? "true" : undefined}
				{...(buttonRest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
			>
				{content}
			</button>
		);
	},
);

export const Button = Object.assign(ButtonRoot, { Skeleton: ButtonSkeleton });
