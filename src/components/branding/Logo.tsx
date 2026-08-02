// components/branding/Logo.tsx
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import Link from "next/link";
import type * as React from "react";
import { focusRing } from "../ui/foundations/focus";

const logoStyles = cva(
	clsx(
		"inline-flex items-center shrink-0 transition-opacity motion-micro rounded-sm",
		focusRing.visibleDefault,
	),
	{
		variants: {
			variant: {
				full: "",
				mark: "",
			},
			size: {
				sm: "",
				md: "",
				lg: "",
			},
			tone: {
				light: "text-background",
				dark: "text-foreground",
				muted: "text-muted-foreground",
			},
			interactive: {
				true: "cursor-pointer hover:opacity-80",
				false: "",
			},
		},
		compoundVariants: [
			{ variant: "full", size: "sm", class: "h-[24px] w-[86px]" },
			{ variant: "full", size: "md", class: "h-[36px] w-[129px]" },
			{ variant: "full", size: "lg", class: "h-[48px] w-[172px]" },
			{ variant: "mark", size: "sm", class: "h-[24px] w-[23px]" },
			{ variant: "mark", size: "md", class: "h-[36px] w-[34px]" },
			{ variant: "mark", size: "lg", class: "h-[48px] w-[46px]" },
		],
		defaultVariants: {
			variant: "full",
			size: "md",
			tone: "dark",
			interactive: true,
		},
	},
);

type LogoOwnProps = {
	href?: string;
	title?: string;
	className?: string;
	logoClassName?: string;
	interactive?: boolean;
	focusable?: boolean;
} & VariantProps<typeof logoStyles>;

type LogoProps<T extends React.ElementType = "span"> = LogoOwnProps & {
	as?: T;
} & Omit<React.ComponentPropsWithoutRef<T>, keyof LogoOwnProps | "as">;

export default function Logo<T extends React.ElementType = "span">({
	as,
	href: hrefProp,
	variant,
	size,
	tone,
	title,
	className,
	logoClassName,
	interactive = true,
	focusable = true,
	...rest
}: LogoProps<T>) {
	const href = hrefProp === undefined ? "/" : hrefProp;
	const hasClick = Boolean(
		(rest as { onClick?: React.MouseEventHandler }).onClick,
	);
	const Tag = (as ??
		(href ? Link : hasClick ? "button" : "span")) as React.ElementType;
	const isButton = Tag === "button";
	const hasInteractiveSurface = Boolean(
		href || hasClick || Tag === "button" || Tag === "a" || Tag === Link,
	);
	const isInteractive = interactive && hasInteractiveSurface;
	const ariaLabel =
		(rest as { "aria-label"?: string })["aria-label"] ??
		(href ? "Go to homepage" : "Logo");

	const resolvedVariant = variant ?? "full";
	const resolvedSize = size ?? "md";
	const resolvedTone = tone ?? "dark";

	const mergedClassName = clsx(
		logoStyles({
			variant: resolvedVariant,
			size: resolvedSize,
			tone: resolvedTone,
			interactive: isInteractive,
		}),
		className,
	);

	const svgTitle = title ?? (resolvedVariant === "full" ? "logo" : "logo mark");

	const svg =
		resolvedVariant === "mark" ? (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="100%"
				height="100%"
				viewBox="0 0 40 42"
				className={clsx("h-full w-full", logoClassName)}
			>
				<title>{svgTitle}</title>
				<path
					fill="currentColor"
					d="M27.677 0H16.065L1.5 25.566C-1.44 30.82.168 34.338 4.352 40.845l17.723-30.557 5.907 9.982C33.134 13.136 34.49 9.063 27.677 0Zm-3.159 35.14c-1.826-4.956-.655-8.647 3.482-14.894l12 20.802H27.981l-3.463-5.907Z"
				/>
			</svg>
		) : (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="100%"
				height="100%"
				viewBox="0 0 398 98"
				className={clsx("h-full w-full", logoClassName)}
			>
				<title>{svgTitle}</title>
				<path
					fill="currentColor"
					d="M66.0761 0H38.3541L3.58009 61.037C-3.43625 73.5801 0.401051 81.9792 10.389 97.5132L52.7015 24.5607L66.8056 48.3919C79.1045 31.3614 82.3414 21.636 66.0761 0Z"
				/>
				<path
					fill="currentColor"
					d="M58.5328 83.8959C54.1742 72.0629 56.9695 63.251 66.8457 48.3366L95.4955 98H66.8009L58.5328 83.8959Z"
				/>
				<path
					fill="currentColor"
					d="M129.367 84L153.977 13.541H166.965V27.2129H162.473L144.846 84H129.367ZM142.6 66.9102L146.213 55.875H179.074L182.688 66.9102H142.6ZM180.393 84L162.766 27.2129V13.541H171.311L195.871 84H180.393ZM207.008 84L188.893 31.6562H204.127L215.064 71.4023H215.357L226.148 31.6562H241.041L223.072 84H207.008ZM263.994 85.0742C258.656 85.0742 254.066 83.9837 250.225 81.8027C246.383 79.5892 243.421 76.4479 241.338 72.3789C239.287 68.3099 238.262 63.4922 238.262 57.9258V57.877C238.262 52.3105 239.287 47.4928 241.338 43.4238C243.421 39.3223 246.335 36.1647 250.078 33.9512C253.854 31.7051 258.298 30.582 263.408 30.582C268.519 30.582 272.93 31.6725 276.641 33.8535C280.384 36.002 283.265 39.0456 285.283 42.9844C287.334 46.9232 288.359 51.5293 288.359 56.8027V61.1973H245.244V52.2129H281.621L274.834 60.6113V55.1426C274.834 52.0827 274.362 49.5273 273.418 47.4766C272.474 45.3932 271.156 43.8307 269.463 42.7891C267.803 41.7474 265.866 41.2266 263.652 41.2266C261.439 41.2266 259.469 41.7637 257.744 42.8379C256.051 43.9121 254.717 45.4909 253.74 47.5742C252.796 49.625 252.324 52.1478 252.324 55.1426V60.6602C252.324 63.5573 252.796 66.0312 253.74 68.082C254.717 70.1328 256.1 71.7116 257.891 72.8184C259.681 73.8926 261.813 74.4297 264.287 74.4297C266.24 74.4297 267.933 74.1204 269.365 73.502C270.798 72.8835 271.969 72.1022 272.881 71.1582C273.792 70.2142 274.411 69.2539 274.736 68.2773L274.834 67.9844H287.92L287.773 68.5215C287.383 70.4421 286.618 72.3789 285.479 74.332C284.339 76.2852 282.793 78.0755 280.84 79.7031C278.919 81.3307 276.559 82.6328 273.76 83.6094C270.993 84.5859 267.738 85.0742 263.994 85.0742ZM291.732 84V31.6562H305.99V40.7871H306.283C307.064 37.5645 308.48 35.0579 310.531 33.2676C312.582 31.4772 315.137 30.582 318.197 30.582C318.979 30.582 319.727 30.6309 320.443 30.7285C321.16 30.8262 321.778 30.9564 322.299 31.1191V43.668C321.713 43.4401 320.964 43.2611 320.053 43.1309C319.141 42.9681 318.165 42.8867 317.123 42.8867C314.779 42.8867 312.777 43.3424 311.117 44.2539C309.457 45.1654 308.188 46.5 307.309 48.2578C306.43 50.0156 305.99 52.1641 305.99 54.7031V84H291.732ZM324.5 84V13.541H338.758V84H324.5ZM368.4 85.0742C363.094 85.0742 358.505 83.9837 354.631 81.8027C350.757 79.6217 347.762 76.4967 345.646 72.4277C343.531 68.3587 342.473 63.4922 342.473 57.8281V57.7305C342.473 52.099 343.547 47.265 345.695 43.2285C347.844 39.1595 350.855 36.0345 354.729 33.8535C358.602 31.6725 363.143 30.582 368.352 30.582C373.592 30.582 378.15 31.6725 382.023 33.8535C385.93 36.002 388.957 39.1107 391.105 43.1797C393.254 47.2161 394.328 52.0664 394.328 57.7305V57.8281C394.328 63.5247 393.254 68.4076 391.105 72.4766C388.99 76.5456 385.995 79.6706 382.121 81.8516C378.247 84 373.674 85.0742 368.4 85.0742ZM368.449 73.8926C370.76 73.8926 372.762 73.2741 374.455 72.0371C376.18 70.7676 377.499 68.9447 378.41 66.5684C379.354 64.1595 379.826 61.2461 379.826 57.8281V57.7305C379.826 54.3451 379.354 51.4642 378.41 49.0879C377.466 46.7116 376.132 44.9049 374.406 43.668C372.681 42.3984 370.663 41.7637 368.352 41.7637C366.073 41.7637 364.071 42.3984 362.346 43.668C360.653 44.9049 359.335 46.7116 358.391 49.0879C357.447 51.4642 356.975 54.3451 356.975 57.7305V57.8281C356.975 61.2461 357.43 64.1595 358.342 66.5684C359.286 68.9447 360.62 70.7676 362.346 72.0371C364.071 73.2741 366.105 73.8926 368.449 73.8926Z"
				/>
			</svg>
		);

	if (isButton) {
		const { type, disabled, tabIndex, ...buttonRest } =
			rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
		return (
			<button
				type={type ?? "button"}
				className={mergedClassName}
				aria-label={ariaLabel}
				disabled={disabled || !interactive}
				tabIndex={disabled || !interactive ? -1 : focusable ? tabIndex : -1}
				{...buttonRest}
			>
				{svg}
			</button>
		);
	}

	const { onClick, tabIndex, ...tagRest } =
		rest as React.HTMLAttributes<HTMLElement> & {
			onClick?: React.MouseEventHandler<HTMLElement>;
			tabIndex?: number;
		};

	return (
		<Tag
			className={mergedClassName}
			aria-label={ariaLabel}
			aria-disabled={hasInteractiveSurface && !interactive ? true : undefined}
			role={Tag === "span" ? "img" : undefined}
			tabIndex={
				hasInteractiveSurface
					? interactive && focusable
						? tabIndex
						: -1
					: tabIndex
			}
			{...(Tag === Link ? { href } : Tag === "a" && href ? { href } : {})}
			onClick={
				interactive
					? onClick
					: hasInteractiveSurface
						? (event: React.MouseEvent<HTMLElement>) => {
								event.preventDefault();
								event.stopPropagation();
							}
						: onClick
			}
			{...tagRest}
		>
			{svg}
		</Tag>
	);
}
