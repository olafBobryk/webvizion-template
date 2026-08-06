"use client";

import clsx from "clsx";
import { useMotionValueEvent } from "motion/react";
import type { ComponentPropsWithoutRef, ElementType } from "react";
import { useLayoutEffect, useRef } from "react";
import { type TextProps, textVariants } from "@/components/ui/primitives/Text";
import { useMotionEffectProgress } from "./progress";

const DEFAULT_CHARACTERS =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}<>?/|~";
const NUMERIC_CHARACTERS = "0123456789";

type MotionEffectScrambleOwnProps = {
	as?: ElementType;
	characters?: string;
	children?: string;
	className?: string;
	maintainSpace?: boolean;
	mode?: "default" | "numeric";
	preserveWhitespace?: boolean;
	range?: readonly [number, number];
	revealStep?: number;
	text?: string;
	textVariant?: TextProps["variant"];
};

export type MotionEffectScrambleProps = MotionEffectScrambleOwnProps &
	Omit<
		ComponentPropsWithoutRef<"span">,
		keyof MotionEffectScrambleOwnProps | "as"
	>;

export function MotionEffectScramble({
	as: Tag = "span",
	characters,
	children,
	className,
	maintainSpace = false,
	mode = "default",
	preserveWhitespace = true,
	range = [0, 1],
	revealStep = 1,
	text,
	textVariant,
	...rest
}: MotionEffectScrambleProps) {
	const finalText = text ?? children ?? "";
	const { progress } = useMotionEffectProgress("Scramble", range);
	const displayRef = useRef<HTMLSpanElement | null>(null);
	const alphabet =
		mode === "numeric"
			? NUMERIC_CHARACTERS
			: characters?.length
				? characters
				: DEFAULT_CHARACTERS;
	const write = (value: number) => {
		if (!displayRef.current) return;
		displayRef.current.textContent = buildFrame({
			alphabet,
			finalText,
			mode,
			preserveWhitespace,
			progress: value,
			revealStep,
		});
	};
	useLayoutEffect(() => write(progress.get()));
	useMotionValueEvent(progress, "change", write);

	return (
		<Tag
			className={clsx(
				maintainSpace && "relative inline-block align-baseline",
				textVariant && textVariants({ variant: textVariant, tone: "inherit" }),
				className,
			)}
			data-motion-effect="scramble"
			{...rest}
		>
			{maintainSpace ? (
				<span className="relative opacity-0" aria-hidden="true">
					{finalText}
				</span>
			) : null}
			<span
				ref={displayRef}
				className={maintainSpace ? "absolute inset-0" : undefined}
				data-motion-effect-scramble-visual=""
				aria-hidden="true"
			/>
			<span className="sr-only">{finalText}</span>
		</Tag>
	);
}

function buildFrame({
	alphabet,
	finalText,
	mode,
	preserveWhitespace,
	progress,
	revealStep,
}: {
	alphabet: string;
	finalText: string;
	mode: "default" | "numeric";
	preserveWhitespace: boolean;
	progress: number;
	revealStep: number;
}) {
	if (progress >= 1) return finalText;
	const characters = Array.from(finalText);
	const animatable = characters
		.map((character, index) => ({ character, index }))
		.filter(({ character }) => {
			if (preserveWhitespace && /\s/.test(character)) return false;
			return mode !== "numeric" || /\d/.test(character);
		});
	const revealed = Math.min(
		animatable.length,
		Math.floor(
			progress * Math.ceil(animatable.length / Math.max(1, revealStep)),
		) * Math.max(1, revealStep),
	);
	const frame = Math.floor(progress * 24);
	for (let unit = revealed; unit < animatable.length; unit += 1) {
		const entry = animatable[unit];
		if (!entry) continue;
		const index =
			stableHash(`${finalText}:${entry.index}:${frame}`) % alphabet.length;
		characters[entry.index] = alphabet[index] ?? entry.character;
	}
	return characters.join("");
}

function stableHash(value: string) {
	let hash = 2166136261;
	for (const character of value) {
		hash ^= character.codePointAt(0) ?? 0;
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}
