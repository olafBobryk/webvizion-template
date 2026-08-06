"use client";

import type { VariantProps } from "class-variance-authority";
import { type MotionValue, motion, useTransform } from "motion/react";
import type { ElementType, HTMLAttributes } from "react";
import { textVariants } from "@/components/ui/primitives/Text";
import { useMotionEffectProgress } from "./progress";

export type MotionEffectTextHighlightProps = {
	as?: ElementType;
	baseColor?: string;
	children: string;
	className?: string;
	dir?: HTMLAttributes<HTMLElement>["dir"];
	highlight?: string;
	range?: readonly [number, number];
	targetColor?: string;
} & VariantProps<typeof textVariants>;

function HighlightCharacter({
	baseColor,
	character,
	index,
	progress,
	targetColor,
	total,
}: {
	baseColor: string;
	character: string;
	index: number;
	progress: MotionValue<number>;
	targetColor: string;
	total: number;
}) {
	const start = total > 1 ? (index / total) * 0.72 : 0;
	const end = Math.min(1, start + 0.28);
	const color = useTransform(progress, [start, end], [baseColor, targetColor]);
	return (
		<motion.span style={{ color }}>
			{character === " " ? "\u00A0" : character}
		</motion.span>
	);
}

export function MotionEffectTextHighlight({
	as: Tag = "span",
	baseColor = "rgb(var(--color-foreground-rgb) / 1)",
	children,
	className,
	dir = "auto",
	highlight,
	range = [0, 1],
	targetColor = "rgb(var(--color-primary-rgb) / 1)",
	variant,
	tone,
}: MotionEffectTextHighlightProps) {
	const { progress } = useMotionEffectProgress("TextHighlight", range);
	const start = highlight ? children.indexOf(highlight) : 0;
	const resolvedHighlight = start >= 0 ? (highlight ?? children) : "";
	const before = resolvedHighlight ? children.slice(0, start) : children;
	const after = resolvedHighlight
		? children.slice(start + resolvedHighlight.length)
		: "";
	const characters = Array.from(resolvedHighlight);
	return (
		<Tag
			className={textVariants({ variant, tone, className })}
			data-motion-effect="text-highlight"
			dir={dir}
		>
			<span className="sr-only">{children}</span>
			<span aria-hidden="true">
				{before}
				{characters.map((character, index) => (
					<HighlightCharacter
						baseColor={baseColor}
						character={character}
						index={index}
						// biome-ignore lint/suspicious/noArrayIndexKey: character position is the visual identity.
						key={index}
						progress={progress}
						targetColor={targetColor}
						total={characters.length}
					/>
				))}
				{after}
			</span>
		</Tag>
	);
}
