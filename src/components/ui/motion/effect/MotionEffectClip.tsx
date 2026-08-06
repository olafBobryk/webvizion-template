"use client";

import { Slot } from "@radix-ui/react-slot";
import { type HTMLMotionProps, motion, useTransform } from "motion/react";
import {
	type ElementType,
	forwardRef,
	type ReactNode,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useMotionEffectProgress } from "./progress";

export type MotionEffectClipGeometry =
	| {
			variant?: "inset";
			axis?: "block" | "inline";
			origin?: "start" | "end";
			finalRadius?: number;
	  }
	| {
			variant: "corner";
			origin?: {
				block: "start" | "end";
				inline: "start" | "end";
			};
			finalRadius?: number;
	  }
	| {
			variant: "radial";
			origin?: { x: string; y: string };
			fromRadius?: number;
			toRadius?: number;
	  };

type MotionEffectClipOwnProps = {
	as?: ElementType;
	asChild?: boolean;
	children: ReactNode;
	range?: readonly [number, number];
};

export type MotionEffectClipProps = MotionEffectClipGeometry &
	MotionEffectClipOwnProps &
	Omit<HTMLMotionProps<"div">, keyof MotionEffectClipOwnProps | "ref">;

type ClipImplementationProps = MotionEffectClipProps & {
	axis?: "block" | "inline";
	finalRadius?: number;
	fromRadius?: number;
	origin?:
		| "start"
		| "end"
		| { block: "start" | "end"; inline: "start" | "end" }
		| { x: string; y: string };
	toRadius?: number;
	variant?: "inset" | "corner" | "radial";
};

const SlotWithRef = forwardRef<HTMLElement, React.ComponentProps<typeof Slot>>(
	(props, ref) => <Slot ref={ref} {...props} />,
);
SlotWithRef.displayName = "MotionEffectClipSlot";
const MotionSlot = motion.create(SlotWithRef);

function finiteOr(value: number | undefined, fallback: number) {
	return Number.isFinite(value) ? Math.max(0, value ?? fallback) : fallback;
}

function insetHidden(
	axis: "block" | "inline",
	origin: "start" | "end",
	direction: "ltr" | "rtl",
) {
	if (axis === "block")
		return origin === "start" ? "0% 0% 100% 0%" : "100% 0% 0% 0%";
	const physicalOrigin =
		direction === "rtl"
			? origin === "start"
				? "right"
				: "left"
			: origin === "start"
				? "left"
				: "right";
	return physicalOrigin === "left" ? "0% 100% 0% 0%" : "0% 0% 0% 100%";
}

function cornerHidden(
	origin: { block: "start" | "end"; inline: "start" | "end" },
	direction: "ltr" | "rtl",
) {
	const block = origin.block === "start" ? "top" : "bottom";
	const inline =
		direction === "rtl"
			? origin.inline === "start"
				? "right"
				: "left"
			: origin.inline === "start"
				? "left"
				: "right";
	if (block === "top" && inline === "left") return "0% 100% 100% 0%";
	if (block === "top" && inline === "right") return "0% 0% 100% 100%";
	if (block === "bottom" && inline === "left") return "100% 100% 0% 0%";
	return "100% 0% 0% 100%";
}

export function MotionEffectClip(props: MotionEffectClipProps) {
	const {
		as: Tag = "div",
		asChild = false,
		axis = "block",
		children,
		finalRadius,
		fromRadius,
		origin,
		range = [0, 1],
		style,
		toRadius,
		variant = "inset",
		...rest
	} = props as ClipImplementationProps;
	const { progress } = useMotionEffectProgress("Clip", range);
	const targetRef = useRef<HTMLElement | null>(null);
	const explicitDirection =
		rest.dir === "rtl" ? "rtl" : rest.dir === "ltr" ? "ltr" : undefined;
	const [direction, setDirection] = useState<"ltr" | "rtl">(
		explicitDirection ?? "ltr",
	);

	useLayoutEffect(() => {
		const node = targetRef.current;
		if (!node) return;
		const update = () => {
			const next =
				explicitDirection ??
				(getComputedStyle(node).direction === "rtl" ? "rtl" : "ltr");
			setDirection((current) => (current === next ? current : next));
		};
		update();
		const resizeObserver = new ResizeObserver(update);
		resizeObserver.observe(node);
		const mutationObserver = new MutationObserver(update);
		mutationObserver.observe(node, {
			attributeFilter: ["class", "dir"],
			attributes: true,
		});
		return () => {
			resizeObserver.disconnect();
			mutationObserver.disconnect();
		};
	}, [explicitDirection]);

	let hidden: string;
	let shown: string;
	if (variant === "radial") {
		const radialOrigin =
			typeof origin === "object" && origin && "x" in origin
				? origin
				: { x: "50%", y: "50%" };
		hidden = `circle(${finiteOr(fromRadius, 0)}% at ${radialOrigin.x} ${radialOrigin.y})`;
		shown = `circle(${finiteOr(toRadius, 150)}% at ${radialOrigin.x} ${radialOrigin.y})`;
	} else {
		const radius = finiteOr(finalRadius, 20);
		const hiddenInsets =
			variant === "corner"
				? cornerHidden(
						typeof origin === "object" && origin && "block" in origin
							? origin
							: { block: "end", inline: "start" },
						direction,
					)
				: insetHidden(
						axis,
						origin === "start" || origin === "end" ? origin : "end",
						direction,
					);
		hidden = `inset(${hiddenInsets} round 0px)`;
		shown = `inset(0% 0% 0% 0% round ${radius}px)`;
	}

	const clipPath = useTransform(progress, [0, 1], [hidden, shown]);
	// The polymorphic motion owner must stay stable while source progress changes.
	const MotionTag = useMemo(
		() => (asChild ? MotionSlot : motion.create(Tag)),
		[asChild, Tag],
	);

	return (
		<MotionTag
			ref={targetRef}
			data-motion-effect="clip"
			data-motion-effect-clip-axis={variant === "inset" ? axis : undefined}
			data-motion-effect-clip-direction={direction}
			data-motion-effect-clip-variant={variant}
			style={{ ...style, clipPath, overflow: "hidden" }}
			{...rest}
		>
			{children}
		</MotionTag>
	);
}
