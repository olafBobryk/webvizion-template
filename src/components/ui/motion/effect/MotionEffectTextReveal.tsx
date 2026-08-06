"use client";

import type { VariantProps } from "class-variance-authority";
import { type MotionValue, motion, useTransform } from "motion/react";
import type { ComponentPropsWithoutRef, ElementType } from "react";
import { textVariants } from "@/components/ui/primitives/Text";
import { useMotionEffectProgress } from "./progress";

export type MotionEffectTextRevealBy = "characters" | "words";
export type MotionEffectTextRevealTreatment = "blur" | "clip";

export type MotionEffectTextRevealRun = {
	text: string;
	by: MotionEffectTextRevealBy;
};

type MotionEffectTextRevealContent =
	| {
			children: string;
			by?: MotionEffectTextRevealBy;
			runs?: never;
	  }
	| {
			children?: never;
			by?: never;
			runs: readonly MotionEffectTextRevealRun[];
	  };

type MotionEffectTextRevealOwnProps = {
	as?: ElementType;
	className?: string;
	range?: readonly [number, number];
	treatment?: MotionEffectTextRevealTreatment;
} & VariantProps<typeof textVariants>;

export type MotionEffectTextRevealProps = MotionEffectTextRevealContent &
	MotionEffectTextRevealOwnProps &
	Omit<
		ComponentPropsWithoutRef<"span">,
		keyof MotionEffectTextRevealOwnProps | "as" | "children"
	>;

type TextRevealUnit = {
	by: MotionEffectTextRevealBy;
	reveal: boolean;
	runIndex: number;
	text: string;
};

function segmentGraphemes(text: string) {
	if (typeof Intl.Segmenter === "function") {
		return Array.from(
			new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text),
			({ segment }) => segment,
		);
	}
	return Array.from(text);
}

function segmentWords(text: string) {
	if (typeof Intl.Segmenter !== "function") {
		return text
			.split(/(\s+)/u)
			.filter(Boolean)
			.map((segment) => ({
				isWordLike: !/^\s+$/u.test(segment),
				segment,
			}));
	}
	return Array.from(
		new Intl.Segmenter(undefined, { granularity: "word" }).segment(text),
		({ isWordLike, segment }) => ({ isWordLike: Boolean(isWordLike), segment }),
	);
}

function tokenizeRun(
	run: MotionEffectTextRevealRun,
	runIndex: number,
): TextRevealUnit[] {
	if (run.by === "characters") {
		return segmentGraphemes(run.text).map((text) => ({
			by: run.by,
			reveal: !/^\s+$/u.test(text),
			runIndex,
			text,
		}));
	}

	const units: TextRevealUnit[] = [];
	for (const { isWordLike, segment } of segmentWords(run.text)) {
		if (/^\s+$/u.test(segment)) {
			units.push({ by: run.by, reveal: false, runIndex, text: segment });
			continue;
		}
		if (isWordLike) {
			const previous = units.at(-1);
			if (previous && !previous.reveal && !/^\s+$/u.test(previous.text)) {
				previous.text += segment;
				previous.reveal = true;
			} else {
				units.push({ by: run.by, reveal: true, runIndex, text: segment });
			}
			continue;
		}

		const previous = units.at(-1);
		if (previous?.reveal) previous.text += segment;
		else units.push({ by: run.by, reveal: false, runIndex, text: segment });
	}
	return units;
}

function RevealedUnit({
	by,
	index,
	progress,
	runIndex,
	text,
	total,
	treatment,
}: {
	by: MotionEffectTextRevealBy;
	index: number;
	progress: MotionValue<number>;
	runIndex: number;
	text: string;
	total: number;
	treatment: MotionEffectTextRevealTreatment;
}) {
	const start = total > 1 ? (index / (total - 1)) * 0.38 : 0;
	const end = Math.min(1, start + 0.62);
	const opacity = useTransform(progress, [start, end], [0, 1]);
	const y = useTransform(
		progress,
		[start, end],
		treatment === "clip" ? ["105%", "0%"] : ["0.58em", "0em"],
	);
	const filter = useTransform(
		progress,
		[start, end],
		["blur(5px)", "blur(0px)"],
	);

	return (
		<span
			className={
				treatment === "clip"
					? "inline-block overflow-hidden align-bottom"
					: "inline-block align-baseline"
			}
			data-motion-effect-text-reveal-by={by}
			data-motion-effect-text-reveal-index={index}
			data-motion-effect-text-reveal-run={runIndex}
			data-motion-effect-text-reveal-unit=""
			style={treatment === "clip" ? { lineHeight: "1.05em" } : undefined}
		>
			<motion.span
				className="inline-block"
				style={{
					filter: treatment === "blur" ? filter : undefined,
					opacity,
					y,
				}}
			>
				{text}
			</motion.span>
		</span>
	);
}

export function MotionEffectTextReveal({
	as: Tag = "span",
	by = "characters",
	children,
	className,
	range = [0, 1],
	runs,
	treatment = "clip",
	variant,
	tone,
	...rest
}: MotionEffectTextRevealProps) {
	const { progress } = useMotionEffectProgress("TextReveal", range);
	const resolvedRuns: readonly MotionEffectTextRevealRun[] = runs ?? [
		{ text: children ?? "", by },
	];
	const accessibleText = resolvedRuns.map((run) => run.text).join("");
	const units = resolvedRuns.flatMap(tokenizeRun);
	const revealCount = units.filter((unit) => unit.reveal).length;
	let revealIndex = -1;

	return (
		<Tag
			className={textVariants({ variant, tone, className })}
			data-motion-effect="text-reveal"
			data-motion-effect-text-reveal-treatment={treatment}
			{...rest}
		>
			<span className="sr-only">{accessibleText}</span>
			<span aria-hidden="true" className="whitespace-pre-wrap">
				{units.map((unit, index) => {
					if (!unit.reveal)
						return (
							<span
								data-motion-effect-text-reveal-structural=""
								// biome-ignore lint/suspicious/noArrayIndexKey: text position is the visual identity.
								key={index}
							>
								{unit.text}
							</span>
						);
					revealIndex += 1;
					return (
						<RevealedUnit
							by={unit.by}
							index={revealIndex}
							// biome-ignore lint/suspicious/noArrayIndexKey: text position is the visual identity.
							key={index}
							progress={progress}
							runIndex={unit.runIndex}
							text={unit.text}
							total={revealCount}
							treatment={treatment}
						/>
					);
				})}
			</span>
		</Tag>
	);
}
