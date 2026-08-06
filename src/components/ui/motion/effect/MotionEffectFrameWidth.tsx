"use client";

import clsx from "clsx";
import { motion, useTransform } from "motion/react";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { useMotionEffectProgress } from "./progress";

export type MotionEffectFrameRadius = {
	tl?: number;
	tr?: number;
	br?: number;
	bl?: number;
};

type MotionEffectFrameWidthOwnProps = {
	as?: ElementType;
	children: ReactNode;
	contentClassName?: string;
	coverClassName?: string;
	endInset?: number;
	endRadius?: MotionEffectFrameRadius;
	frameClassName?: string;
	range?: readonly [number, number];
	startInset?: number;
	startRadius?: MotionEffectFrameRadius;
};

export type MotionEffectFrameWidthProps = MotionEffectFrameWidthOwnProps &
	Omit<
		ComponentPropsWithoutRef<"div">,
		keyof MotionEffectFrameWidthOwnProps | "ref"
	>;

function resolveRadius(radius?: MotionEffectFrameRadius) {
	return {
		tl: radius?.tl ?? 0,
		tr: radius?.tr ?? 0,
		br: radius?.br ?? 0,
		bl: radius?.bl ?? 0,
	};
}

export function MotionEffectFrameWidth({
	as: Tag = "div",
	children,
	className,
	contentClassName,
	coverClassName,
	endInset = 48,
	endRadius,
	frameClassName,
	range = [0, 1],
	startInset = 0,
	startRadius,
	style,
	...rest
}: MotionEffectFrameWidthProps) {
	const { progress } = useMotionEffectProgress("FrameWidth", range);
	const start = resolveRadius(startRadius);
	const end = resolveRadius(endRadius);
	const coverWidth = Math.max(startInset, endInset, 1);
	const coverScale = useTransform(
		progress,
		[0, 1],
		[startInset / coverWidth, endInset / coverWidth],
	);
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
	return (
		<Tag
			className={clsx("relative min-w-0", className)}
			data-motion-effect="frame-width"
			style={style}
			{...rest}
		>
			<motion.div
				className={clsx(
					"absolute inset-0 min-w-0 overflow-hidden box-border",
					frameClassName,
				)}
				style={{
					borderTopLeftRadius,
					borderTopRightRadius,
					borderBottomRightRadius,
					borderBottomLeftRadius,
				}}
			>
				<div className={clsx("relative h-full w-full", contentClassName)}>
					{children}
				</div>
				<motion.div
					aria-hidden="true"
					className={clsx(
						"pointer-events-none absolute inset-y-0 left-0",
						coverClassName,
					)}
					style={{ originX: 0, scaleX: coverScale, width: coverWidth }}
				/>
				<motion.div
					aria-hidden="true"
					className={clsx(
						"pointer-events-none absolute inset-y-0 right-0",
						coverClassName,
					)}
					style={{ originX: 1, scaleX: coverScale, width: coverWidth }}
				/>
			</motion.div>
		</Tag>
	);
}
