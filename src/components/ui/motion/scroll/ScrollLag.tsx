"use client";

import {
	motion,
	useMotionValue,
	useScroll,
	useSpring,
	useTransform,
	useVelocity,
} from "motion/react";
import {
	type ComponentProps,
	createElement,
	type ElementType,
	type ReactNode,
	useEffect,
	useState,
} from "react";
import { useMotionDisableOverride } from "@/components/ui/foundations/motionDisableOverride";
import { getSpring } from "@/components/ui/foundations/spring";
import { useAppReady } from "@/hooks/useAppReady";
import { useMotionAllowed } from "@/hooks/useMotionAllowed";

export type ScrollLagProps = {
	children: ReactNode;
	as?: ElementType;
	className?: string;
	style?: React.CSSProperties;
	magnitude?: number;
	stiffness?: number;
	damping?: number;
	velocityClamp?: number;
	disableWhenReducedMotion?: boolean;
} & Omit<ComponentProps<"div">, "children" | "className" | "style">;

export function ScrollLag({
	children,
	as = motion.div,
	className,
	style,
	magnitude = 0.15,
	stiffness,
	damping,
	velocityClamp = 2000,
	disableWhenReducedMotion = true,
	...rest
}: ScrollLagProps) {
	const appReady = useAppReady();
	const motionAllowed = useMotionAllowed(disableWhenReducedMotion);
	const motionDisabled = useMotionDisableOverride();
	const motionReady = motionAllowed && appReady && !motionDisabled;

	if (!motionReady) {
		const StaticTag = (typeof as === "string" ? as : "div") as ElementType;
		return createElement(StaticTag, { className, style, ...rest }, children);
	}

	return (
		<ScrollLagMotion
			as={as}
			className={className}
			damping={damping}
			magnitude={magnitude}
			stiffness={stiffness}
			style={style}
			velocityClamp={velocityClamp}
			{...rest}
		>
			{children}
		</ScrollLagMotion>
	);
}

function ScrollLagMotion({
	children,
	as = motion.div,
	className,
	style,
	magnitude = 0.15,
	stiffness,
	damping,
	velocityClamp = 2000,
	...rest
}: Omit<ScrollLagProps, "disableWhenReducedMotion">) {
	const { scrollY } = useScroll();
	const velocity = useVelocity(scrollY);
	const [hasScrolled, setHasScrolled] = useState(false);

	useEffect(() => {
		const unsubscribe = scrollY.on("change", (latest) => {
			if (!hasScrolled && Math.abs(latest) > 0) setHasScrolled(true);
		});
		return () => unsubscribe();
	}, [hasScrolled, scrollY]);

	const base = useMotionValue(0);
	const safeVelocity = useTransform(velocity, (value) =>
		Number.isFinite(value)
			? Math.max(-velocityClamp, Math.min(velocityClamp, value))
			: base.get(),
	);

	const scrollSpring = getSpring("scroll");
	const smoothVelocity = useSpring(safeVelocity, {
		...scrollSpring,
		stiffness: stiffness ?? scrollSpring.stiffness,
		damping: damping ?? scrollSpring.damping,
		restSpeed: 0.0001,
	});
	const y = useTransform(smoothVelocity, (value) =>
		hasScrolled ? -value * magnitude : 0,
	);

	const Tag = as ?? motion.div;
	return (
		<Tag style={{ ...style, y }} className={className} {...rest}>
			{children}
		</Tag>
	);
}
