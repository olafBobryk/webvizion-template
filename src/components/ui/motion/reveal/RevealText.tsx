"use client";

import type { VariantProps } from "class-variance-authority";
import { motion } from "motion/react";
import { getSpring } from "@/components/ui/foundations/spring";
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

const charVariants = {
	hidden: { opacity: 0, y: "105%" },
	show: {
		opacity: 1,
		y: 0,
		transition: getSpring("reveal", { intensity: "subtle" }),
	},
} as const;

export type RevealTextProps = {
	children: string;
	as?: TextAs;
	className?: string;
	charDelay?: number;
} & Pick<RevealItemProps, "intensity" | "expressive"> &
	VariantProps<typeof textVariants>;

export function RevealText({
	children,
	as = "span",
	className,
	charDelay = 0.025,
	variant,
	tone,
	intensity,
	expressive,
}: RevealTextProps) {
	const resolvedClass = textVariants({ variant, tone, className });
	const MotionTag = motionElements[as];
	const chars = children.split("");

	return (
		<RevealItem
			as={MotionTag}
			staticAs={as}
			className={resolvedClass}
			variants={{
				hidden: {},
				show: { transition: { staggerChildren: charDelay } },
			}}
			disableTransform
			intensity={intensity}
			expressive={expressive}
		>
			{chars.map((char, index) => (
				<span
					// biome-ignore lint/suspicious/noArrayIndexKey: stable positional index
					key={index}
					className="inline-block overflow-hidden"
					style={{ verticalAlign: "bottom", lineHeight: "1.05em" }}
				>
					<motion.span className="inline-block" variants={charVariants}>
						{char === " " ? "\u00A0" : char}
					</motion.span>
				</span>
			))}
		</RevealItem>
	);
}
