"use client";

import clsx from "clsx";
import { animate } from "motion";
import type { ComponentPropsWithoutRef } from "react";
import * as React from "react";
import { resolveMotionTransition } from "@/components/ui/foundations/motionTiming";
import { type TextProps, textVariants } from "@/components/ui/primitives/Text";
import { useRevealParticipant } from "./scheduler/useRevealParticipant";

const DEFAULT_CHARACTERS =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}<>?/|~";
const NUMERIC_CHARACTERS = "0123456789";
const DEFAULT_SCRAMBLE_DURATION_MS = Math.round(
	Number(resolveMotionTransition("reveal", { intensity: "hero" }).duration) *
		1000,
);

const textVariantAliasMap = {
	"2xxl": "heading2xxl",
} as const satisfies Record<"2xxl", TextProps["variant"]>;

type ScrambleTextVariant =
	| TextProps["variant"]
	| keyof typeof textVariantAliasMap;

type ScrambleMode = "default" | "numeric";

function resolveTextVariant(
	textVariant?: ScrambleTextVariant,
): TextProps["variant"] | undefined {
	if (!textVariant) return undefined;
	if (textVariant === "2xxl") return textVariantAliasMap[textVariant];
	return textVariant;
}

function getResolvedCharacters(
	mode: ScrambleMode,
	characters: string | undefined,
) {
	if (mode === "numeric") return NUMERIC_CHARACTERS;
	if (characters?.length) return characters;
	return DEFAULT_CHARACTERS;
}

function isAnimatableCharacter(
	character: string,
	mode: ScrambleMode,
	preserveWhitespace: boolean,
) {
	if (preserveWhitespace && /\s/.test(character)) return false;
	if (mode === "numeric") return /\d/.test(character);
	return true;
}

type ScrambleRevealOwnProps = {
	text?: string;
	children?: string;
	as?: React.ElementType;
	textVariant?: ScrambleTextVariant;
	mode?: ScrambleMode;
	className?: string;
	characters?: string;
	durationMs?: number;
	tickMs?: number;
	delayMs?: number;
	delay?: number;
	revealStep?: number;
	preserveWhitespace?: boolean;
	maintainSpace?: boolean;
};

export type ScrambleRevealProps = ScrambleRevealOwnProps &
	Omit<ComponentPropsWithoutRef<"span">, keyof ScrambleRevealOwnProps | "as">;

export function ScrambleReveal({
	text,
	children,
	as,
	textVariant,
	mode = "default",
	className,
	characters = DEFAULT_CHARACTERS,
	durationMs = DEFAULT_SCRAMBLE_DURATION_MS,
	tickMs = 50,
	delayMs = 0,
	delay,
	revealStep,
	preserveWhitespace = true,
	maintainSpace = false,
	...rest
}: ScrambleRevealProps) {
	const resolvedChildren =
		typeof children === "string" || typeof children === "number"
			? String(children)
			: "";
	const finalText = text ?? resolvedChildren;
	const Tag = (as ?? "span") as React.ElementType;
	const containerRef = React.useRef<HTMLElement | null>(null);
	const displayRef = React.useRef<HTMLElement | null>(null);
	const animationRef = React.useRef<ReturnType<typeof animate> | null>(null);
	const hasPlayedRef = React.useRef(false);
	const completionResolverRef = React.useRef<(() => void) | null>(null);
	const [scheduled, setScheduled] = React.useState(false);
	const [schedulerDelayMs, setSchedulerDelayMs] = React.useState(0);

	const resolvedTextVariant = resolveTextVariant(textVariant);
	const resolvedClassName = clsx(
		resolvedTextVariant &&
			textVariants({ variant: resolvedTextVariant, tone: "inherit" }),
		className,
	);
	const resolvedCharacters = getResolvedCharacters(mode, characters);
	const resolvedTickMs =
		mode === "numeric" ? Math.max(16, tickMs) : Math.max(1, tickMs);
	const resolvedDurationMs =
		mode === "numeric"
			? Math.min(1500, Math.max(700, durationMs))
			: Math.max(0, durationMs);
	React.useEffect(() => {
		hasPlayedRef.current = false;
		if (animationRef.current) {
			animationRef.current.stop();
			animationRef.current = null;
		}
		if (displayRef.current) {
			displayRef.current.textContent = finalText;
		}
	}, [finalText]);

	const play = React.useCallback(
		(delaySeconds: number) => {
			setSchedulerDelayMs(delaySeconds * 1000);
			setScheduled(true);
			if (finalText.length === 0) return Promise.resolve();
			return new Promise<void>((resolve) => {
				completionResolverRef.current = resolve;
			});
		},
		[finalText.length],
	);

	const showImmediately = React.useCallback(() => {
		setScheduled(true);
		hasPlayedRef.current = true;
		if (displayRef.current) displayRef.current.textContent = finalText;
		completionResolverRef.current?.();
		completionResolverRef.current = null;
	}, [finalText]);

	const { disabled } = useRevealParticipant({
		elementRef: containerRef,
		play,
		showImmediately,
	});

	React.useEffect(() => {
		if (animationRef.current) {
			animationRef.current.stop();
			animationRef.current = null;
		}

		const displayNode = displayRef.current;
		if (!displayNode) return undefined;

		if (disabled || finalText.length === 0) {
			displayNode.textContent = finalText;
			return undefined;
		}

		if (hasPlayedRef.current) {
			displayNode.textContent = finalText;
			return undefined;
		}

		const chars = Array.from(finalText);
		const animatableIndices = chars.reduce<number[]>(
			(indices, character, index) => {
				if (!isAnimatableCharacter(character, mode, preserveWhitespace)) {
					return indices;
				}
				indices.push(index);
				return indices;
			},
			[],
		);
		const totalUnits = animatableIndices.length;
		const resolvedRevealStep = Math.max(1, revealStep ?? 1);
		const totalSteps = Math.max(1, Math.ceil(totalUnits / resolvedRevealStep));
		const buildFrame = (revealedUnits: number, currentProgress = 0) => {
			if (totalUnits === 0) return finalText;
			const buffer = chars.slice();
			for (
				let unitIndex = revealedUnits;
				unitIndex < animatableIndices.length;
				unitIndex += 1
			) {
				const charIndex = animatableIndices[unitIndex];
				if (mode === "numeric") {
					const eased = 1 - (1 - currentProgress) ** 2;
					const targetDigit = parseInt(chars[charIndex] ?? "0", 10);
					buffer[charIndex] = String(
						Math.min(targetDigit, Math.floor(eased * (targetDigit + 1))),
					);
				} else {
					const randomIndex = Math.floor(
						Math.random() * resolvedCharacters.length,
					);
					buffer[charIndex] =
						resolvedCharacters.charAt(randomIndex) || chars[charIndex] || "";
				}
			}
			return buffer.join("");
		};
		const writeDisplay = (value: string) => {
			if (!displayRef.current) return;
			if (displayRef.current.textContent === value) return;
			displayRef.current.textContent = value;
		};
		const markPlayed = () => {
			hasPlayedRef.current = true;
			completionResolverRef.current?.();
			completionResolverRef.current = null;
		};

		if (!scheduled) {
			writeDisplay(buildFrame(0));
			return undefined;
		}

		if (totalUnits === 0) {
			writeDisplay(finalText);
			markPlayed();
			return undefined;
		}

		const resolvedDelayMs =
			typeof delay === "number"
				? Math.max(0, delay) * 1000 + schedulerDelayMs
				: Math.max(0, delayMs) + schedulerDelayMs;

		if (mode === "numeric") {
			const match = finalText.match(/\d+/);
			const targetNumber = match ? parseInt(match[0], 10) : 0;

			if (!match || targetNumber === 0) {
				writeDisplay(finalText);
				markPlayed();
				return undefined;
			}

			const matchIndex = match.index ?? 0;
			const prefix = finalText.slice(0, matchIndex);
			const suffix = finalText.slice(matchIndex + match[0].length);
			const stepMs = Math.max(16, resolvedDurationMs / targetNumber);

			let currentStep = 1;
			let timerId = 0;

			const tick = () => {
				if (currentStep > targetNumber) {
					writeDisplay(finalText);
					markPlayed();
					return;
				}
				writeDisplay(`${prefix}${currentStep}${suffix}`);
				currentStep += 1;
				timerId = window.setTimeout(tick, stepMs);
			};

			writeDisplay(`${prefix}1${suffix}`);
			const delayTimerId = window.setTimeout(tick, resolvedDelayMs);

			return () => {
				clearTimeout(delayTimerId);
				clearTimeout(timerId);
			};
		}

		const totalDurationMs = Math.max(1, resolvedDurationMs + resolvedDelayMs);
		const delayRatio = resolvedDelayMs / totalDurationMs;

		let lastUpdateMs = 0;
		writeDisplay(buildFrame(0));

		animationRef.current = animate(0, 1, {
			duration: Math.max(0.001, totalDurationMs / 1000),
			ease: resolveMotionTransition("reveal", { intensity: "subtle" }).ease,
			onUpdate: (progress) => {
				const now = performance.now();
				if (now - lastUpdateMs < resolvedTickMs) return;
				lastUpdateMs = now;

				const revealProgress =
					delayRatio > 0
						? Math.max(
								0,
								Math.min(
									1,
									(progress - delayRatio) / Math.max(0.0001, 1 - delayRatio),
								),
							)
						: progress;

				const stepIndex = Math.min(
					totalSteps,
					Math.floor(revealProgress * totalSteps),
				);
				const revealedUnits = Math.min(
					totalUnits,
					stepIndex * resolvedRevealStep,
				);
				writeDisplay(buildFrame(revealedUnits));
			},
			onComplete: () => {
				writeDisplay(finalText);
				markPlayed();
			},
		});

		return () => {
			if (animationRef.current) {
				animationRef.current.stop();
				animationRef.current = null;
			}
		};
	}, [
		delayMs,
		delay,
		disabled,
		finalText,
		mode,
		preserveWhitespace,
		resolvedCharacters,
		resolvedDurationMs,
		resolvedTickMs,
		revealStep,
		scheduled,
		schedulerDelayMs,
	]);

	if (disabled || finalText.length === 0) {
		return (
			<Tag
				ref={(node: HTMLElement | null) => {
					containerRef.current = node;
				}}
				className={resolvedClassName}
				{...rest}
			>
				{finalText}
			</Tag>
		);
	}

	if (maintainSpace) {
		return (
			<Tag
				ref={(node: HTMLElement | null) => {
					containerRef.current = node;
				}}
				className={clsx(
					"relative inline-block align-baseline",
					resolvedClassName,
				)}
				{...rest}
			>
				<span className="relative opacity-0">{finalText}</span>
				<span
					ref={(node: HTMLElement | null) => {
						displayRef.current = node;
					}}
					className="absolute inset-0"
					aria-hidden="true"
				/>
				<span className="sr-only">{finalText}</span>
			</Tag>
		);
	}

	return (
		<>
			<Tag
				ref={(node: HTMLElement | null) => {
					containerRef.current = node;
					displayRef.current = node;
				}}
				className={resolvedClassName}
				{...rest}
			/>
			<span className="sr-only">{finalText}</span>
		</>
	);
}
