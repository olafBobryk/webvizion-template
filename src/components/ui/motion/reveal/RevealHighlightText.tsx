"use client";

import type { VariantProps } from "class-variance-authority";
import { motion } from "motion/react";
import type { HTMLAttributes } from "react";
import { resolveMotionTransition } from "@/components/ui/foundations/motionTiming";
import { textVariants } from "@/components/ui/primitives/Text";
import { RevealItem, type RevealItemProps } from "./RevealItem";

type TextAs = "span" | "p" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

const motionElements = {
	span: motion.span,
	p: motion.p,
	div: motion.div,
	h1: motion.h1,
	h2: motion.h2,
	h3: motion.h3,
	h4: motion.h4,
	h5: motion.h5,
	h6: motion.h6,
} as const;

export type RevealHighlightTextProps = {
	children: string;
	highlight: string;
	as?: TextAs;
	className?: string;
	highlightClassName?: string;
	charDelay?: number;
	dir?: HTMLAttributes<HTMLElement>["dir"];
} & Pick<RevealItemProps, "intensity" | "expressive"> &
	VariantProps<typeof textVariants>;

export function RevealHighlightText({
	children,
	highlight,
	as = "span",
	className,
	highlightClassName = "text-primary",
	charDelay = 0.018,
	dir = "auto",
	variant,
	tone,
	intensity = "normal",
	expressive,
}: RevealHighlightTextProps) {
	const resolvedClassName = textVariants({
		variant,
		tone,
		className,
	});
	const MotionTag = motionElements[as];
	const highlightStart = children.indexOf(highlight);
	const hasHighlight = highlightStart >= 0 && highlight.length > 0;
	const before = hasHighlight ? children.slice(0, highlightStart) : "";
	const afterText = hasHighlight
		? children.slice(highlightStart + highlight.length)
		: "";
	const highlightTransition = resolveMotionTransition("reveal", {
		expressive,
		intensity,
	});

	if (!hasHighlight) {
		return (
			<RevealItem
				as={MotionTag}
				staticAs={as}
				className={resolvedClassName}
				disableTransform
				intensity={intensity}
				expressive={expressive}
			>
				<span dir={dir}>{children}</span>
			</RevealItem>
		);
	}

	return (
		<RevealItem
			as={MotionTag}
			staticAs={as}
			className={resolvedClassName}
			variants={{
				hidden: {},
				show: {},
			}}
			disableTransform
			intensity={intensity}
			expressive={expressive}
		>
			<span className="sr-only">{children}</span>
			<span aria-hidden={true} dir={dir}>
				{before}
				<span className={highlightClassName}>
					{highlight.split("").map((char, index) => (
						<motion.span
							// biome-ignore lint/suspicious/noArrayIndexKey: character order is the reveal identity
							key={`${char}-${index}`}
							className="inline"
							custom={index}
							variants={{
								hidden: { color: "rgb(var(--color-foreground-rgb) / 1)" },
								show: (charIndex: number) => ({
									color: "rgb(var(--color-primary-rgb) / 1)",
									transition: {
										...highlightTransition,
										delay: charIndex * charDelay,
									},
								}),
							}}
						>
							{char === " " ? "\u00A0" : char}
						</motion.span>
					))}
				</span>
				{afterText}
			</span>
		</RevealItem>
	);
}
