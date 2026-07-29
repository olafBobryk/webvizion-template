"use client";

import clsx from "clsx";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import {
	type ComponentProps,
	createElement,
	type ElementType,
	type ReactNode,
	useRef,
} from "react";
import { useMotionDisableOverride } from "@/components/ui/foundations/motionDisableOverride";
import { getSpring } from "@/components/ui/foundations/spring";
import { useAppReady } from "@/hooks/useAppReady";
import { useMotionAllowed } from "@/hooks/useMotionAllowed";

export type ScrollWidthRadius = {
	tl?: number;
	tr?: number;
	br?: number;
	bl?: number;
};

type ScrollWidthOffset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];

export type ScrollWidthProps = {
	children: ReactNode;
	as?: ElementType;
	className?: string;
	frameClassName?: string;
	contentClassName?: string;
	coverClassName?: string;
	style?: React.CSSProperties;
	offset?: ScrollWidthOffset;
	startInset?: number;
	endInset?: number;
	startRadius?: ScrollWidthRadius;
	endRadius?: ScrollWidthRadius;
	progressRange?: [number, number];
	disableWhenReducedMotion?: boolean;
	smooth?: boolean;
	stiffness?: number;
	damping?: number;
	mass?: number;
} & Omit<ComponentProps<"div">, "children" | "className" | "style">;

const DEFAULT_OFFSET: ScrollWidthOffset = ["start end", "end start"];

function resolveRadius(radius?: ScrollWidthRadius) {
	return {
		tl: radius?.tl ?? 0,
		tr: radius?.tr ?? 0,
		br: radius?.br ?? 0,
		bl: radius?.bl ?? 0,
	};
}

export function ScrollWidth({
	disableWhenReducedMotion = true,
	...props
}: ScrollWidthProps) {
	const appReady = useAppReady();
	const motionAllowed = useMotionAllowed(disableWhenReducedMotion);
	const motionDisabled = useMotionDisableOverride();
	const motionReady = motionAllowed && appReady && !motionDisabled;

	if (!motionReady) {
		return <ScrollWidthStatic {...props} />;
	}

	return <ScrollWidthMotion {...props} />;
}

function ScrollWidthStatic({
	children,
	as = "div",
	className,
	frameClassName,
	contentClassName,
	coverClassName,
	style,
	offset: _offset = DEFAULT_OFFSET,
	startInset = 0,
	endInset: _endInset = 48,
	startRadius,
	endRadius: _endRadius,
	progressRange: _progressRange = [0, 1],
	smooth: _smooth = true,
	stiffness: _stiffness,
	damping: _damping,
	mass: _mass,
	...rest
}: Omit<ScrollWidthProps, "disableWhenReducedMotion">) {
	const Tag = (as ?? "div") as ElementType;
	const start = resolveRadius(startRadius);
	const coverWidth = Math.max(startInset, 1);
	const startCoverScale = startInset / coverWidth;

	return createElement(
		Tag,
		{
			className: clsx("relative min-w-0", className),
			style,
			...rest,
		},
		<div
			className={clsx(
				"absolute inset-0 min-w-0 overflow-hidden box-border",
				frameClassName,
			)}
			style={{
				borderTopLeftRadius: start.tl,
				borderTopRightRadius: start.tr,
				borderBottomRightRadius: start.br,
				borderBottomLeftRadius: start.bl,
			}}
		>
			<div className={clsx("relative h-full w-full", contentClassName)}>
				{children}
			</div>
			<div
				aria-hidden={true}
				className={clsx(
					"pointer-events-none absolute inset-y-0 left-0",
					coverClassName,
				)}
				style={{
					width: coverWidth,
					scale: `${startCoverScale} 1`,
					transformOrigin: "left center",
				}}
			/>
			<div
				aria-hidden={true}
				className={clsx(
					"pointer-events-none absolute inset-y-0 right-0",
					coverClassName,
				)}
				style={{
					width: coverWidth,
					scale: `${startCoverScale} 1`,
					transformOrigin: "right center",
				}}
			/>
		</div>,
	);
}

function ScrollWidthMotion({
	children,
	as = "div",
	className,
	frameClassName,
	contentClassName,
	coverClassName,
	style,
	offset = DEFAULT_OFFSET,
	startInset = 0,
	endInset = 48,
	startRadius,
	endRadius,
	progressRange = [0, 1],
	smooth = true,
	stiffness,
	damping,
	mass,
	...rest
}: Omit<ScrollWidthProps, "disableWhenReducedMotion">) {
	const ref = useRef<HTMLElement | null>(null);
	const Tag = as ?? "div";
	const start = resolveRadius(startRadius);
	const end = resolveRadius(endRadius);
	const componentSpring = getSpring("component");
	const coverWidth = Math.max(startInset, endInset, 1);
	const startCoverScale = startInset / coverWidth;
	const endCoverScale = endInset / coverWidth;

	const { scrollYProgress } = useScroll({
		target: ref,
		offset,
	});

	const rawProgress = useTransform(scrollYProgress, progressRange, [0, 1], {
		clamp: true,
	});
	const springProgress = useSpring(rawProgress, {
		...componentSpring,
		stiffness: stiffness ?? componentSpring.stiffness,
		damping: damping ?? componentSpring.damping,
		mass: mass ?? componentSpring.mass,
	});
	const progress = smooth ? springProgress : rawProgress;

	const borderTopLeftRadius = useTransform(
		progress,
		[0, 1],
		[start.tl, end.tl],
	);
	const borderTopRightRadius = useTransform(
		progress,
		[0, 1],
		[start.tr, end.tr],
	);
	const borderBottomRightRadius = useTransform(
		progress,
		[0, 1],
		[start.br, end.br],
	);
	const borderBottomLeftRadius = useTransform(
		progress,
		[0, 1],
		[start.bl, end.bl],
	);
	const coverScale = useTransform(
		progress,
		[0, 1],
		[startCoverScale, endCoverScale],
	);

	const frameStyle = {
		borderTopLeftRadius,
		borderTopRightRadius,
		borderBottomRightRadius,
		borderBottomLeftRadius,
		willChange: "border-radius",
	};
	const leftCoverStyle = {
		scaleX: coverScale,
		originX: 0,
		willChange: "transform",
	};
	const rightCoverStyle = {
		scaleX: coverScale,
		originX: 1,
		willChange: "transform",
	};

	return (
		<Tag
			ref={ref}
			className={clsx("relative min-w-0", className)}
			style={style}
			{...rest}
		>
			<motion.div
				className={clsx(
					"absolute inset-0 min-w-0 overflow-hidden box-border",
					frameClassName,
				)}
				style={frameStyle}
			>
				<div className={clsx("relative h-full w-full", contentClassName)}>
					{children}
				</div>
				<motion.div
					aria-hidden={true}
					className={clsx(
						"pointer-events-none absolute inset-y-0 left-0",
						coverClassName,
					)}
					style={{
						width: coverWidth,
						...leftCoverStyle,
					}}
				/>
				<motion.div
					aria-hidden={true}
					className={clsx(
						"pointer-events-none absolute inset-y-0 right-0",
						coverClassName,
					)}
					style={{
						width: coverWidth,
						...rightCoverStyle,
					}}
				/>
			</motion.div>
		</Tag>
	);
}
