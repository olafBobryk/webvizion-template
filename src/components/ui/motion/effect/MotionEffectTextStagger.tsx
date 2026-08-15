"use client";

import type { VariantProps } from "class-variance-authority";
import { type MotionValue, motion, useTransform } from "motion/react";
import type { ElementType, HTMLAttributes } from "react";
import { textVariants } from "@/components/ui/primitives/Text";
import { useMotionEffectProgress } from "./progress";

export type MotionEffectTextStaggerUnit = "graphemes" | "words" | "whole";
export type MotionEffectTextStaggerTreatment = "blur" | "clip";

export type MotionEffectTextStaggerSegment = {
	className?: string;
	text: string;
	unit?: MotionEffectTextStaggerUnit;
};

type MotionEffectTextStaggerContent =
	| {
			children: string;
			segments?: never;
			unit?: MotionEffectTextStaggerUnit;
	  }
	| {
			children?: never;
			segments: readonly MotionEffectTextStaggerSegment[];
			unit?: never;
	  };

type MotionEffectTextStaggerOwnProps = {
	as?: ElementType;
	blurOffset?: string;
	blurRadius?: number;
	className?: string;
	range?: readonly [number, number];
	treatment?: MotionEffectTextStaggerTreatment;
} & VariantProps<typeof textVariants>;

export type MotionEffectTextStaggerProps = MotionEffectTextStaggerContent &
	MotionEffectTextStaggerOwnProps &
	Omit<
		HTMLAttributes<HTMLElement>,
		keyof MotionEffectTextStaggerOwnProps | "as" | "children"
	>;

type TextStaggerToken = {
	className?: string;
	reveal: boolean;
	segmentIndex: number;
	text: string;
	unit: MotionEffectTextStaggerUnit;
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
	if (typeof Intl.Segmenter === "function") {
		return Array.from(
			new Intl.Segmenter(undefined, { granularity: "word" }).segment(text),
			({ isWordLike, segment }) => ({
				isWordLike: Boolean(isWordLike),
				segment,
			}),
		);
	}
	return text.split(/(\s+)/u).map((segment) => ({
		isWordLike: !/^\s+$/u.test(segment),
		segment,
	}));
}

function tokenizeSegment(
	segment: Required<Pick<MotionEffectTextStaggerSegment, "text" | "unit">> &
		Pick<MotionEffectTextStaggerSegment, "className">,
	segmentIndex: number,
): TextStaggerToken[] {
	if (segment.unit === "whole") {
		return [
			{
				className: segment.className,
				reveal: !/^\s+$/u.test(segment.text),
				segmentIndex,
				text: segment.text,
				unit: segment.unit,
			},
		];
	}

	if (segment.unit === "graphemes") {
		return segmentGraphemes(segment.text).map((text) => ({
			className: segment.className,
			reveal: !/^\s+$/u.test(text),
			segmentIndex,
			text,
			unit: segment.unit,
		}));
	}

	const tokens: TextStaggerToken[] = [];
	for (const { isWordLike, segment: text } of segmentWords(segment.text)) {
		if (/^\s+$/u.test(text)) {
			tokens.push({
				className: segment.className,
				reveal: false,
				segmentIndex,
				text,
				unit: segment.unit,
			});
			continue;
		}
		if (isWordLike) {
			const previous = tokens.at(-1);
			if (previous && !previous.reveal && !/^\s+$/u.test(previous.text)) {
				previous.text += text;
				previous.reveal = true;
			} else {
				tokens.push({
					className: segment.className,
					reveal: true,
					segmentIndex,
					text,
					unit: segment.unit,
				});
			}
			continue;
		}

		const previous = tokens.at(-1);
		if (previous?.reveal) previous.text += text;
		else
			tokens.push({
				className: segment.className,
				reveal: false,
				segmentIndex,
				text,
				unit: segment.unit,
			});
	}
	return tokens;
}

function StaggeredToken({
	blurOffset,
	blurRadius,
	className,
	index,
	progress,
	segmentIndex,
	text,
	total,
	treatment,
	unit,
}: {
	blurOffset: string;
	blurRadius: number;
	className?: string;
	index: number;
	progress: MotionValue<number>;
	segmentIndex: number;
	text: string;
	total: number;
	treatment: MotionEffectTextStaggerTreatment;
	unit: MotionEffectTextStaggerUnit;
}) {
	const start = total <= 1 ? 0 : (index / (total - 1)) * 0.38;
	const end = Math.min(1, start + 0.62);
	const opacity = useTransform(progress, [start, end], [0, 1]);
	const y = useTransform(
		progress,
		[start, end],
		treatment === "clip" ? ["105%", "0%"] : [blurOffset, "0em"],
	);
	const filter = useTransform(
		progress,
		[start, end],
		[`blur(${blurRadius}px)`, "blur(0px)"],
	);

	return (
		<span
			className={[
				className,
				treatment === "clip"
					? "inline-block overflow-hidden align-bottom"
					: "inline-block align-baseline",
			]
				.filter(Boolean)
				.join(" ")}
			data-motion-effect-text-stagger-index={index}
			data-motion-effect-text-stagger-segment={segmentIndex}
			data-motion-effect-text-stagger-token=""
			data-motion-effect-text-stagger-unit={unit}
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

export function MotionEffectTextStagger({
	as: Tag = "span",
	blurOffset = "0.58em",
	blurRadius = 5,
	children,
	className,
	range = [0, 1],
	segments,
	treatment = "clip",
	unit = "graphemes",
	interactive,
	theme,
	variant,
	tone,
	...rest
}: MotionEffectTextStaggerProps) {
	const { progress } = useMotionEffectProgress("TextStagger", range);
	const resolvedSegments = segments?.map((segment) => ({
		...segment,
		unit: segment.unit ?? "graphemes",
	})) ?? [{ text: children ?? "", unit }];
	const accessibleText = resolvedSegments
		.map((segment) => segment.text)
		.join("");
	const tokens = resolvedSegments.flatMap(tokenizeSegment);
	const staggerCount = tokens.filter((token) => token.reveal).length;
	let staggerIndex = -1;

	return (
		<Tag
			className={textVariants({
				className,
				interactive,
				theme,
				tone,
				variant,
			})}
			data-motion-effect="text-stagger"
			data-motion-effect-text-stagger-blur-offset={
				treatment === "blur" ? blurOffset : undefined
			}
			data-motion-effect-text-stagger-blur-radius={
				treatment === "blur" ? blurRadius : undefined
			}
			data-motion-effect-text-stagger-treatment={treatment}
			{...rest}
		>
			<span className="sr-only">{accessibleText}</span>
			<span aria-hidden="true" className="whitespace-pre-wrap">
				{tokens.map((token, index) => {
					if (!token.reveal)
						return (
							<span
								data-motion-effect-text-stagger-structural=""
								// biome-ignore lint/suspicious/noArrayIndexKey: text position is the visual identity.
								key={index}
							>
								{token.text}
							</span>
						);
					staggerIndex += 1;
					return (
						<StaggeredToken
							blurOffset={blurOffset}
							blurRadius={blurRadius}
							className={token.className}
							index={staggerIndex}
							// biome-ignore lint/suspicious/noArrayIndexKey: text position is the visual identity.
							key={index}
							progress={progress}
							segmentIndex={token.segmentIndex}
							text={token.text}
							total={staggerCount}
							treatment={treatment}
							unit={token.unit}
						/>
					);
				})}
			</span>
		</Tag>
	);
}
