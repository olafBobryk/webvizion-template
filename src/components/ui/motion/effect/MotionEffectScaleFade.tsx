"use client";

import { Slot } from "@radix-ui/react-slot";
import { type HTMLMotionProps, motion, useTransform } from "motion/react";
import { type ElementType, forwardRef, type ReactNode, useMemo } from "react";
import { useMotionEffectProgress } from "./progress";

type MotionEffectScaleFadeOwnProps = {
	as?: ElementType;
	asChild?: boolean;
	children: ReactNode;
	fromOpacity?: number;
	fromScale?: number;
	range?: readonly [number, number];
};

export type MotionEffectScaleFadeProps = MotionEffectScaleFadeOwnProps &
	Omit<HTMLMotionProps<"div">, keyof MotionEffectScaleFadeOwnProps | "ref">;

const SlotWithRef = forwardRef<HTMLElement, React.ComponentProps<typeof Slot>>(
	(props, ref) => <Slot ref={ref} {...props} />,
);
SlotWithRef.displayName = "MotionEffectScaleFadeSlot";
const MotionSlot = motion.create(SlotWithRef);

function finiteOr(value: number | undefined, fallback: number) {
	return Number.isFinite(value) ? (value ?? fallback) : fallback;
}

export function MotionEffectScaleFade({
	as: Tag = "div",
	asChild = false,
	children,
	fromOpacity = 0.56,
	fromScale = 1.06,
	range = [0, 1],
	style,
	...rest
}: MotionEffectScaleFadeProps) {
	const { progress } = useMotionEffectProgress("ScaleFade", range);
	const opacity = useTransform(
		progress,
		[0, 1],
		[Math.min(1, Math.max(0, finiteOr(fromOpacity, 0.56))), 1],
	);
	const scale = useTransform(
		progress,
		[0, 1],
		[Math.max(0, finiteOr(fromScale, 1.06)), 1],
	);
	// Keep arbitrary wrapper identities stable while the shared source reverses.
	const MotionTag = useMemo(
		() => (asChild ? MotionSlot : motion.create(Tag)),
		[asChild, Tag],
	);

	return (
		<MotionTag
			data-motion-effect="scale-fade"
			style={{ ...style, opacity, scale, willChange: "opacity, transform" }}
			{...rest}
		>
			{children}
		</MotionTag>
	);
}
