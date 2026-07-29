"use client";

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

export type ScrollParallaxProps = {
	children: ReactNode;
	as?: ElementType;
	className?: string;
	style?: React.CSSProperties;
	magnitude?: number;
	disableWhenReducedMotion?: boolean;
	direction?: "down" | "up";
	stiffness?: number;
	damping?: number;
	smooth?: boolean;
} & Omit<ComponentProps<"div">, "children" | "className" | "style">;

export function ScrollParallax({
	children,
	as = motion.div,
	className,
	style,
	magnitude = 80,
	disableWhenReducedMotion = true,
	direction = "down",
	stiffness,
	damping,
	smooth = true,
	...rest
}: ScrollParallaxProps) {
	const appReady = useAppReady();
	const motionAllowed = useMotionAllowed(disableWhenReducedMotion);
	const motionDisabled = useMotionDisableOverride();
	const motionReady = motionAllowed && appReady && !motionDisabled;

	if (!motionReady) {
		const StaticTag = (typeof as === "string" ? as : "div") as ElementType;
		return createElement(StaticTag, { className, style, ...rest }, children);
	}

	return (
		<ScrollParallaxMotion
			as={as}
			className={className}
			damping={damping}
			direction={direction}
			magnitude={magnitude}
			smooth={smooth}
			stiffness={stiffness}
			style={style}
			{...rest}
		>
			{children}
		</ScrollParallaxMotion>
	);
}

function ScrollParallaxMotion({
	children,
	as = motion.div,
	className,
	style,
	magnitude = 80,
	direction = "down",
	stiffness,
	damping,
	smooth = true,
	...rest
}: Omit<ScrollParallaxProps, "disableWhenReducedMotion">) {
	const ref = useRef<HTMLElement | null>(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"],
	});

	const amplitude = direction === "down" ? magnitude : -magnitude;
	const rawY = useTransform(
		scrollYProgress,
		[0, 0.5, 1],
		[-amplitude, 0, amplitude],
	);
	const scrollSpring = getSpring("scroll");
	const springY = useSpring(rawY, {
		...scrollSpring,
		stiffness: stiffness ?? scrollSpring.stiffness,
		damping: damping ?? scrollSpring.damping,
		restSpeed: 0.001,
	});
	const y = smooth ? springY : rawY;

	const Tag = as ?? motion.div;
	const passthroughStyle = { willChange: "transform", ...style, y };

	return (
		<Tag
			ref={ref}
			className={["relative", className].filter(Boolean).join(" ")}
			style={passthroughStyle}
			{...rest}
		>
			{children}
		</Tag>
	);
}
