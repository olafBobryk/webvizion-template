"use client";

import type { MotionValue, UseScrollOptions } from "motion/react";
import {
	motion,
	useInView,
	useScroll,
	useSpring,
	useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useMotionDisableOverride } from "@/components/ui/foundations/motionDisableOverride";
import { getSpring } from "@/components/ui/foundations/spring";
import { useAppReady } from "@/hooks/useAppReady";
import { useMotionAllowed } from "@/hooks/useMotionAllowed";

export type ScrollHighlightTextProps = {
	accessibility?: "self" | "presentation";
	active?: boolean;
	baseColor?: string;
	children: string;
	className?: string;
	highlightRange?: [number, number];
	once?: boolean;
	progress?: MotionValue<number>;
	range?: readonly [number, number];
	scrollOffset?: UseScrollOptions["offset"];
	targetColor?: string;
	variant?: "scroll" | "viewport";
	viewportAmount?: number;
};

const defaultScrollHighlightOffset: UseScrollOptions["offset"] = [
	"start end",
	"start center",
];
const positionedInlineClassName = "relative inline-block";

export function ScrollHighlightText({
	accessibility = "self",
	active,
	baseColor,
	children,
	className,
	highlightRange = [0, 1],
	once = true,
	progress,
	range,
	scrollOffset = defaultScrollHighlightOffset,
	targetColor,
	variant = "scroll",
	viewportAmount = 0.5,
}: ScrollHighlightTextProps) {
	const appReady = useAppReady();
	const motionAllowed = useMotionAllowed(true);
	const motionDisabled = useMotionDisableOverride();
	const motionReady = motionAllowed && appReady && !motionDisabled;

	if (!motionReady) {
		return (
			<span
				className={[positionedInlineClassName, className]
					.filter(Boolean)
					.join(" ")}
				aria-hidden={accessibility === "presentation" ? true : undefined}
			>
				{children}
			</span>
		);
	}

	if (variant === "viewport") {
		return (
			<ViewportHighlightText
				accessibility={accessibility}
				active={active}
				baseColor={baseColor}
				className={className}
				once={once}
				targetColor={targetColor}
				viewportAmount={viewportAmount}
			>
				{children}
			</ViewportHighlightText>
		);
	}

	return (
		<ScrollCharacterHighlightText
			accessibility={accessibility}
			className={className}
			highlightRange={highlightRange}
			progress={progress}
			range={range}
			scrollOffset={scrollOffset}
		>
			{children}
		</ScrollCharacterHighlightText>
	);
}

function ViewportHighlightText({
	accessibility,
	active,
	baseColor,
	children,
	className,
	once,
	targetColor,
	viewportAmount,
}: Pick<
	ScrollHighlightTextProps,
	| "accessibility"
	| "active"
	| "baseColor"
	| "children"
	| "className"
	| "once"
	| "targetColor"
	| "viewportAmount"
>) {
	const ref = useRef<HTMLSpanElement>(null);
	const [hasEnteredViewport, setHasEnteredViewport] = useState(false);
	const inView = useInView(ref, { amount: viewportAmount, once });
	const viewportActive = active ?? hasEnteredViewport;

	useEffect(() => {
		if (inView) {
			setHasEnteredViewport(true);
			return;
		}

		if (!once) {
			setHasEnteredViewport(false);
		}
	}, [inView, once]);

	return (
		<motion.span
			ref={ref}
			className={[positionedInlineClassName, className]
				.filter(Boolean)
				.join(" ")}
			aria-hidden={accessibility === "presentation" ? true : undefined}
			initial={false}
			animate={{
				color: viewportActive ? (targetColor ?? baseColor) : baseColor,
			}}
			transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
		>
			{children}
		</motion.span>
	);
}

function ScrollCharacterHighlightText({
	accessibility,
	children,
	className,
	highlightRange = [0, 1],
	progress,
	range,
	scrollOffset = defaultScrollHighlightOffset,
}: Pick<
	ScrollHighlightTextProps,
	| "accessibility"
	| "children"
	| "className"
	| "highlightRange"
	| "progress"
	| "range"
	| "scrollOffset"
>) {
	const ref = useRef<HTMLSpanElement>(null);
	const { scrollYProgress: rawProgress } = useScroll({
		target: ref,
		offset: scrollOffset,
	});
	const scrollYProgress = useSpring(
		progress ?? rawProgress,
		getSpring("scroll", { expressive: 1, intensity: "hero" }),
	);
	const chars = children.split("");
	const [highlightStart, highlightEnd] = range ?? highlightRange;
	const highlightLength = highlightEnd - highlightStart;

	return (
		<span
			ref={ref}
			className={[positionedInlineClassName, className]
				.filter(Boolean)
				.join(" ")}
		>
			{accessibility === "self" ? (
				<span className="sr-only">{children}</span>
			) : null}
			<span aria-hidden={accessibility === "self" ? true : undefined}>
				{chars.map((char, index) => (
					<HighlightChar
						// biome-ignore lint/suspicious/noArrayIndexKey: character position is the identity
						key={`${char}-${index}`}
						char={char}
						scrollYProgress={scrollYProgress}
						start={highlightStart + (index / chars.length) * highlightLength}
						end={
							highlightStart + ((index + 1) / chars.length) * highlightLength
						}
					/>
				))}
			</span>
		</span>
	);
}

function HighlightChar({
	char,
	scrollYProgress,
	start,
	end,
}: {
	char: string;
	scrollYProgress: MotionValue<number>;
	start: number;
	end: number;
}) {
	const opacity = useTransform(scrollYProgress, [start, end], [0.2, 1]);
	return <motion.span style={{ opacity }}>{char}</motion.span>;
}
