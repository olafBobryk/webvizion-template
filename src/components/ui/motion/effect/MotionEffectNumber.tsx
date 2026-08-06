"use client";

import clsx from "clsx";
import {
	type MotionValue,
	motion,
	useMotionValueEvent,
	useTransform,
} from "motion/react";
import type { ComponentPropsWithoutRef, ElementType } from "react";
import { useState } from "react";
import { type TextProps, textVariants } from "@/components/ui/primitives/Text";
import { useMotionEffectProgress } from "./progress";

export type MotionEffectNumberAnimation = "countUp" | "scroll";

type MotionEffectNumberOwnProps = {
	animation?: MotionEffectNumberAnimation;
	as?: ElementType;
	children?: string;
	className?: string;
	range?: readonly [number, number];
	text?: string;
	textVariant?: TextProps["variant"];
};

export type MotionEffectNumberProps = MotionEffectNumberOwnProps &
	Omit<
		ComponentPropsWithoutRef<"span">,
		keyof MotionEffectNumberOwnProps | "as"
	>;

export function MotionEffectNumber({
	animation = "countUp",
	as: Tag = "span",
	children,
	className,
	range = [0, 1],
	text,
	textVariant,
	...rest
}: MotionEffectNumberProps) {
	const finalText = text ?? children ?? "";
	const { progress } = useMotionEffectProgress("Number", range);
	const resolvedClassName = clsx(
		"inline-flex items-baseline",
		textVariant && textVariants({ variant: textVariant, tone: "inherit" }),
		className,
	);
	return (
		<Tag className={resolvedClassName} data-motion-effect="number" {...rest}>
			<span className="sr-only">{finalText}</span>
			<span
				aria-hidden="true"
				className="inline-flex items-baseline tabular-nums"
			>
				{animation === "countUp" ? (
					<CountUpText progress={progress} text={finalText} />
				) : (
					<ArrayDigits progress={progress} text={finalText} />
				)}
			</span>
		</Tag>
	);
}

function CountUpText({
	progress,
	text,
}: {
	progress: MotionValue<number>;
	text: string;
}) {
	const [display, setDisplay] = useState(() =>
		renderCountUp(text, progress.get()),
	);
	useMotionValueEvent(progress, "change", (value) =>
		setDisplay(renderCountUp(text, value)),
	);
	return display;
}

function renderCountUp(text: string, progress: number) {
	if (progress >= 1) return text;
	const eased = 1 - (1 - progress) ** 4;
	return text.replace(/\d+/g, (value) => {
		const target = Number.parseInt(value, 10);
		const current = Math.min(
			Math.max(0, target - 1),
			Math.floor(target * eased),
		);
		return String(current).padStart(value.length, "0");
	});
}

function ArrayDigits({
	progress,
	text,
}: {
	progress: MotionValue<number>;
	text: string;
}) {
	const characters = Array.from(text);
	const digitCount = characters.filter((character) =>
		/\d/.test(character),
	).length;
	let digitIndex = -1;
	return characters.map((character, index) => {
		if (!/\d/.test(character))
			// biome-ignore lint/suspicious/noArrayIndexKey: numeric character position is the visual identity.
			return <span key={`${character}-${index}`}>{character}</span>;
		digitIndex += 1;
		return (
			<ProgressDigit
				digit={character}
				index={digitIndex}
				// biome-ignore lint/suspicious/noArrayIndexKey: numeric character position is the visual identity.
				key={`${character}-${index}`}
				progress={progress}
				total={digitCount}
			/>
		);
	});
}

function ProgressDigit({
	digit,
	index,
	progress,
	total,
}: {
	digit: string;
	index: number;
	progress: MotionValue<number>;
	total: number;
}) {
	const start = total > 1 ? (index / total) * 0.34 : 0;
	const end = Math.min(1, start + 0.66);
	const local = useTransform(progress, [start, end], [0, 1], { clamp: true });
	const opacity = useTransform(local, [0, 1], [0.6, 1]);
	const y = useTransform(local, [0, 1], ["0.2em", "0em"]);
	const filter = useTransform(local, [0, 1], ["blur(5px)", "blur(0px)"]);
	const [display, setDisplay] = useState("0");
	useMotionValueEvent(local, "change", (value) => {
		const target = Number.parseInt(digit, 10);
		setDisplay(value >= 1 ? digit : String(Math.floor(target * value)));
	});
	return (
		<span className="inline-block overflow-hidden align-baseline">
			<motion.span
				className="block whitespace-pre"
				style={{ filter, opacity, y }}
			>
				{display}
			</motion.span>
		</span>
	);
}
