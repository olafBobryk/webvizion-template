"use client";

import { Slot } from "@radix-ui/react-slot";
import { type HTMLMotionProps, motion, useTransform } from "motion/react";
import { type ElementType, forwardRef, type ReactNode } from "react";
import { useMotionEffectProgress } from "./progress";

type MotionEffectEntranceOwnProps = {
	as?: ElementType;
	asChild?: boolean;
	children: ReactNode;
	axis?: "x" | "y";
	disableTransform?: boolean;
	distance?: number;
	range?: readonly [number, number];
};

export type MotionEffectEntranceProps = MotionEffectEntranceOwnProps &
	Omit<HTMLMotionProps<"div">, keyof MotionEffectEntranceOwnProps | "ref">;

const SlotWithRef = forwardRef<HTMLElement, React.ComponentProps<typeof Slot>>(
	(props, ref) => <Slot ref={ref} {...props} />,
);
SlotWithRef.displayName = "MotionEffectEntranceSlot";
const MotionSlot = motion.create(SlotWithRef);

export function MotionEffectEntrance({
	as: Tag = "div",
	asChild = false,
	children,
	axis = "y",
	disableTransform = false,
	distance = 12,
	range = [0, 1],
	style,
	...rest
}: MotionEffectEntranceProps) {
	const { progress } = useMotionEffectProgress("Entrance", range);
	const opacity = useTransform(progress, [0, 1], [0, 1]);
	const translation = useTransform(
		progress,
		[0, 1],
		[disableTransform ? 0 : distance, 0],
	);
	const x = axis === "x" ? translation : undefined;
	const y = axis === "y" ? translation : undefined;
	const MotionTag = asChild ? MotionSlot : motion.create(Tag);

	return (
		<MotionTag
			data-motion-effect="entrance"
			style={{ ...style, opacity, x, y }}
			{...rest}
		>
			{children}
		</MotionTag>
	);
}
