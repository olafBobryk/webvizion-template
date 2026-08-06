"use client";

import { motion, useTransform } from "motion/react";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { useMotionEffectProgress } from "./progress";

type MotionEffectParallaxOwnProps = {
	as?: ElementType;
	children: ReactNode;
	direction?: "down" | "up";
	magnitude?: number;
	range?: readonly [number, number];
};

export type MotionEffectParallaxProps = MotionEffectParallaxOwnProps &
	Omit<
		ComponentPropsWithoutRef<"div">,
		keyof MotionEffectParallaxOwnProps | "ref"
	>;

export function MotionEffectParallax({
	as: Tag = "div",
	children,
	direction = "down",
	magnitude = 80,
	range = [0, 1],
	style,
	...rest
}: MotionEffectParallaxProps) {
	const { progress } = useMotionEffectProgress("Parallax", range);
	const amplitude = direction === "down" ? magnitude : -magnitude;
	const y = useTransform(progress, [0, 0.5, 1], [-amplitude, 0, amplitude]);
	const MotionTag = motion.create(Tag);
	return (
		<MotionTag
			data-motion-effect="parallax"
			style={{ ...style, y, willChange: "transform" }}
			{...rest}
		>
			{children}
		</MotionTag>
	);
}
