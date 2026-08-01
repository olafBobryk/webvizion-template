"use client";

import type { IconWeight } from "@phosphor-icons/react";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import {
	type IconName,
	useIconRegistry,
} from "@/components/ui/icons/iconRegistry";
import { Skeleton } from "@/components/ui/misc/Skeleton";
import { useMotionAllowed } from "@/hooks/useMotionAllowed";

export type { IconName };

const missingIconNames = new Set<string>();
const isDev = process.env.NODE_ENV !== "production";

function reportMissingIcon(name: IconName) {
	if (!isDev) return;
	const key = String(name);
	if (missingIconNames.has(key)) return;
	missingIconNames.add(key);
	// eslint-disable-next-line no-console
	console.warn(`[Icon] Missing icon: "${key}".`);
}

const iconSizeStyles = cva("inline-flex items-center justify-center", {
	variants: {
		size: {
			sm: "w-[0.75rem] h-[0.75rem]",
			md: "w-[0.9375rem] h-[0.9375rem]",
			lg: "w-[1.25rem] h-[1.25rem]",
		},
	},
	defaultVariants: {
		size: "md",
	},
});

const iconFrameStyles = cva("inline-flex items-center justify-center", {
	variants: {
		frame: {
			none: "",
			default: "p-ui-5 rounded-button-sm border border-border",
		},
	},
	defaultVariants: {
		frame: "none",
	},
});

type IconProps = {
	name: IconName;
	className?: string;
	animate?: boolean;
	weight?: IconWeight;
	mirrorInRtl?: boolean;
} & VariantProps<typeof iconSizeStyles> &
	VariantProps<typeof iconFrameStyles> &
	Omit<ComponentProps<"span">, "children">;

const animatedIconClassMap: Record<string, string> = {
	close:
		"group-hover:scale-105 group-active:scale-100 transition-transform motion-interactive",
	plus: "group-hover:rotate-[180deg] transition-[transform] motion-interactive",
	"arrow-right":
		"group-hover:translate-x-[2px] transition-transform motion-interactive",
	spinner: "animate-spin-smooth",
	warning: "animate-pulse",
	bell: "icon-bell-animate transition-transform motion-interactive",
};

type IconSkeletonProps = {
	size?: VariantProps<typeof iconSizeStyles>["size"];
	className?: string;
};

const IconRoot = ({
	name,
	size,
	frame = "none",
	className,
	animate = false,
	weight,
	mirrorInRtl = false,
	...rest
}: IconProps) => {
	const registry = useIconRegistry();
	const IconNode = registry[name];
	const motionAllowed = useMotionAllowed(true);
	if (!IconNode) {
		reportMissingIcon(name);

		if (isDev) {
			const label = typeof name === "string" ? name : "missing";
			const wrapperClassName = [
				frame === "none" ? undefined : iconFrameStyles({ frame }),
				className,
			]
				.filter(Boolean)
				.join(" ");
			const placeholder = (
				<span
					className={[
						iconSizeStyles({ size }),
						"inline-flex items-center justify-center rounded-[4px] border border-dashed border-danger/50 text-[9px] leading-none text-danger-text/80",
						frame === "none" ? className : undefined,
					]
						.filter(Boolean)
						.join(" ")}
					{...(frame === "none" ? rest : {})}
				>
					{label}
				</span>
			);

			if (frame && frame !== "none") {
				return (
					<span className={wrapperClassName} {...rest}>
						{placeholder}
					</span>
				);
			}

			return placeholder;
		}

		return null;
	}

	const shouldAnimate = animate && (motionAllowed || name === "spinner");

	const wrapperClassName = [
		frame === "none" ? undefined : iconFrameStyles({ frame }),
		className,
	]
		.filter(Boolean)
		.join(" ");
	const innerClassName = [
		iconSizeStyles({ size }),
		mirrorInRtl ? "rtl:-scale-x-100" : undefined,
		shouldAnimate ? animatedIconClassMap[name] : undefined,
		frame === "none" ? className : undefined,
	]
		.filter(Boolean)
		.join(" ");

	if (frame && frame !== "none") {
		return (
			<span className={wrapperClassName} {...rest}>
				<span className={innerClassName}>
					<IconNode
						className="w-full h-full"
						aria-hidden={true}
						weight={weight}
					/>
				</span>
			</span>
		);
	}

	return (
		<span className={innerClassName} {...rest}>
			<IconNode className="w-full h-full" aria-hidden={true} weight={weight} />
		</span>
	);
};

function IconSkeleton({ size, className }: IconSkeletonProps) {
	return (
		<Skeleton
			className={[iconSizeStyles({ size }), className]
				.filter(Boolean)
				.join(" ")}
		/>
	);
}

export const Icon = Object.assign(IconRoot, {
	Skeleton: IconSkeleton,
});
