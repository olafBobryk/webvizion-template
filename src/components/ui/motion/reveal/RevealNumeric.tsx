"use client";

import clsx from "clsx";
import { motion, useAnimationControls } from "motion/react";
import type { ComponentPropsWithoutRef } from "react";
import * as React from "react";
import { spring } from "@/components/ui/foundations/spring";
import { type TextProps, textVariants } from "@/components/ui/primitives/Text";
import { useRevealParticipant } from "./scheduler/useRevealParticipant";

export type NumericRevealAnimation = "countUp" | "reveal" | "scroll";

const numericDigitEase = [0.16, 1, 0.3, 1] as const;
const numericCountEase = (progress: number) => 1 - (1 - progress) ** 4;
const numericCountUpDuration = 640;
const numericCountUpDelayStep = 8;
const numericCountUpDurationStep = 10;

type NumericRevealOwnProps = {
	animation?: NumericRevealAnimation;
	as?: React.ElementType;
	children?: string;
	className?: string;
	startDelay?: number;
	text?: string;
	textVariant?: TextProps["variant"];
};

export type NumericRevealProps = NumericRevealOwnProps &
	Omit<ComponentPropsWithoutRef<"span">, keyof NumericRevealOwnProps | "as">;

export function NumericReveal({
	animation = "reveal",
	as,
	children,
	className,
	startDelay = 0,
	text,
	textVariant,
	...rest
}: NumericRevealProps) {
	const finalText = text ?? children ?? "";
	const hasDigits = /\d/.test(finalText);
	const Tag = (as ?? "span") as React.ElementType;
	const ref = React.useRef<HTMLElement | null>(null);
	const [hasPlayed, setHasPlayed] = React.useState(false);
	const [hasHydrated, setHasHydrated] = React.useState(false);
	const [scheduled, setScheduled] = React.useState(false);
	const [schedulerDelay, setSchedulerDelay] = React.useState(0);
	const completionResolverRef = React.useRef<(() => void) | null>(null);
	const resolvedClassName = clsx(
		textVariant && textVariants({ variant: textVariant, tone: "inherit" }),
		className,
	);

	React.useEffect(() => {
		setHasHydrated(true);
	}, []);

	const play = React.useCallback(
		(delay: number) => {
			setSchedulerDelay(delay);
			setScheduled(true);
			if (finalText.length === 0 || (!hasDigits && animation !== "countUp")) {
				setHasPlayed(true);
				return Promise.resolve();
			}
			return new Promise<void>((resolve) => {
				completionResolverRef.current = resolve;
			});
		},
		[animation, finalText.length, hasDigits],
	);

	const showImmediately = React.useCallback(() => {
		setScheduled(true);
		setHasPlayed(true);
		completionResolverRef.current?.();
		completionResolverRef.current = null;
	}, []);

	const { disabled } = useRevealParticipant({
		elementRef: ref,
		play,
		showImmediately,
	});
	const shouldPlay = hasHydrated && !disabled && scheduled && !hasPlayed;

	const handleDigitComplete = React.useCallback(() => {
		if (hasPlayed) return;
		setHasPlayed(true);
		completionResolverRef.current?.();
		completionResolverRef.current = null;
	}, [hasPlayed]);

	if (!hasHydrated || disabled || finalText.length === 0) {
		return (
			<Tag
				ref={(node: HTMLElement | null) => {
					ref.current = node;
				}}
				className={resolvedClassName}
				{...rest}
			>
				{finalText}
			</Tag>
		);
	}

	if (animation === "countUp") {
		return (
			<Tag
				ref={(node: HTMLElement | null) => {
					ref.current = node;
				}}
				aria-label={finalText}
				className={clsx("inline-flex items-baseline", resolvedClassName)}
				{...rest}
			>
				<CountUpNumericText
					active={shouldPlay || hasPlayed}
					onComplete={handleDigitComplete}
					startDelay={startDelay + schedulerDelay}
					text={finalText}
				/>
			</Tag>
		);
	}

	const characters = Array.from(finalText);
	const digitCount = characters.filter((character) =>
		/\d/.test(character),
	).length;
	const seenCharacters = new Map<string, number>();
	let lastDigitIndex = -1;
	const tokens = characters.map((character) => {
		const occurrence = seenCharacters.get(character) ?? 0;
		seenCharacters.set(character, occurrence + 1);

		if (!/\d/.test(character)) {
			return {
				character,
				digitIndex: null,
				key: `${character}-${occurrence}`,
			};
		}

		lastDigitIndex += 1;

		return {
			character,
			digitIndex: lastDigitIndex,
			key: `${character}-${occurrence}`,
		};
	});

	return (
		<Tag
			ref={(node: HTMLElement | null) => {
				ref.current = node;
			}}
			aria-label={finalText}
			className={clsx("inline-flex items-baseline", resolvedClassName)}
			{...rest}
		>
			{tokens.map((token) => {
				if (token.digitIndex === null) {
					return (
						<span key={token.key} aria-hidden="true">
							{token.character}
						</span>
					);
				}

				return (
					<NumericRevealDigit
						key={token.key}
						active={shouldPlay || hasPlayed}
						animation={animation}
						delay={startDelay + schedulerDelay + token.digitIndex * 0.07}
						digit={token.character}
						isLast={token.digitIndex === digitCount - 1}
						onComplete={handleDigitComplete}
					/>
				);
			})}
		</Tag>
	);
}

type CountUpNumericPart =
	| {
			type: "literal";
			value: string;
	  }
	| {
			type: "number";
			index: number;
			target: number;
			width: number;
	  };

function parseCountUpParts(text: string) {
	const parts: CountUpNumericPart[] = [];
	const matches = text.matchAll(/\d+/g);
	let cursor = 0;
	let groupIndex = 0;

	for (const match of matches) {
		const value = match[0];
		const index = match.index ?? 0;

		if (index > cursor) {
			parts.push({ type: "literal", value: text.slice(cursor, index) });
		}

		parts.push({
			type: "number",
			index: groupIndex,
			target: Number.parseInt(value, 10),
			width: value.length,
		});

		groupIndex += 1;
		cursor = index + value.length;
	}

	if (cursor < text.length) {
		parts.push({ type: "literal", value: text.slice(cursor) });
	}

	return parts;
}

function getCountUpDisplayValue(target: number, progress: number) {
	if (progress >= 1) return target;
	if (target <= 0) return 0;

	return Math.min(target - 1, Math.floor(target * numericCountEase(progress)));
}

function getCountUpTiming(text: string, partIndex: number) {
	const seed = Array.from(text).reduce((total, character, index) => {
		return total + character.charCodeAt(0) * (index + 1);
	}, 0);
	const delayMs = ((seed + partIndex * 3) % 5) * numericCountUpDelayStep;
	const durationOffsetMs =
		(((seed + partIndex * 5) % 7) - 3) * numericCountUpDurationStep;

	return {
		delayMs,
		durationMs: numericCountUpDuration + durationOffsetMs,
	};
}

function getInitialCountValues(parts: CountUpNumericPart[]) {
	return parts
		.filter((part): part is Extract<CountUpNumericPart, { type: "number" }> => {
			return part.type === "number";
		})
		.map(() => 0);
}

function renderCountUpText(
	parts: CountUpNumericPart[],
	values: readonly number[],
) {
	return parts
		.map((part) => {
			if (part.type === "literal") return part.value;
			const value = values[part.index] ?? 0;
			return String(value).padStart(part.width, "0");
		})
		.join("");
}

function CountUpNumericText({
	active,
	onComplete,
	startDelay,
	text,
}: {
	active: boolean;
	onComplete: () => void;
	startDelay: number;
	text: string;
}) {
	const parts = React.useMemo(() => parseCountUpParts(text), [text]);
	const [values, setValues] = React.useState(() =>
		getInitialCountValues(parts),
	);
	const completedRef = React.useRef(false);
	const displayText = renderCountUpText(parts, values);

	React.useEffect(() => {
		setValues(getInitialCountValues(parts));
		completedRef.current = false;
	}, [parts]);

	React.useEffect(() => {
		if (!active || completedRef.current) return;

		const numberParts = parts.filter(
			(part): part is Extract<CountUpNumericPart, { type: "number" }> =>
				part.type === "number",
		);

		if (numberParts.length === 0) {
			completedRef.current = true;
			onComplete();
			return;
		}

		let frameId = 0;
		let timeoutId = 0;
		let startedAt = 0;

		const tick = (now: number) => {
			if (startedAt === 0) startedAt = now;
			const elapsed = now - startedAt;
			let allComplete = true;

			const nextValues = numberParts.map((part) => {
				const timing = getCountUpTiming(text, part.index);
				const progress = Math.min(
					Math.max((elapsed - timing.delayMs) / timing.durationMs, 0),
					1,
				);

				if (progress < 1) allComplete = false;

				return getCountUpDisplayValue(part.target, progress);
			});

			setValues(nextValues);

			if (allComplete) {
				completedRef.current = true;
				onComplete();
				return;
			}

			frameId = window.requestAnimationFrame(tick);
		};

		timeoutId = window.setTimeout(() => {
			frameId = window.requestAnimationFrame(tick);
		}, startDelay * 1000);

		return () => {
			window.clearTimeout(timeoutId);
			if (frameId) window.cancelAnimationFrame(frameId);
		};
	}, [active, onComplete, parts, startDelay, text]);

	React.useEffect(() => {
		if (active) return;
		completedRef.current = false;
		setValues(getInitialCountValues(parts));
	}, [active, parts]);

	return (
		<>
			{Array.from(displayText).map((character, index) => (
				<NumericRevealCharacter
					// biome-ignore lint/suspicious/noArrayIndexKey: character position is the visual identity in this counter.
					key={index}
					character={character}
					index={index}
				/>
			))}
		</>
	);
}

function NumericRevealCharacter({
	character,
	index,
}: {
	character: string;
	index: number;
}) {
	const controls = useAnimationControls();
	const previousCharacterRef = React.useRef(character);
	const isDigit = /\d/.test(character);

	React.useEffect(() => {
		if (previousCharacterRef.current === character) return;
		previousCharacterRef.current = character;

		if (!isDigit) return;

		controls.set({ filter: "blur(2px)", opacity: 0.58, y: "0.2em" });
		void controls.start({
			filter: "blur(0px)",
			opacity: 1,
			y: "0em",
			transition: {
				duration: 0.28 + (index % 3) * 0.04,
				ease: numericDigitEase,
			},
		});
	}, [character, controls, index, isDigit]);

	if (!isDigit) {
		return (
			<span key={character} aria-hidden="true">
				{character}
			</span>
		);
	}

	return (
		<span
			aria-hidden="true"
			className="inline-block overflow-hidden align-baseline tabular-nums"
		>
			<motion.span
				animate={controls}
				className="block whitespace-pre tabular-nums"
				initial={{ filter: "blur(0px)", opacity: 1, y: "0em" }}
			>
				{character}
			</motion.span>
		</span>
	);
}

function NumericRevealDigit({
	active,
	animation,
	delay,
	digit,
	isLast,
	onComplete,
}: {
	active: boolean;
	animation: NumericRevealAnimation;
	delay: number;
	digit: string;
	isLast: boolean;
	onComplete: () => void;
}) {
	const controls = useAnimationControls();
	const [displayDigit, setDisplayDigit] = React.useState(
		animation === "scroll" ? "0" : digit,
	);
	const completedRef = React.useRef(false);
	const restingState = React.useMemo(
		() =>
			animation === "scroll"
				? { filter: "blur(0px)", opacity: 1, y: "0em" }
				: { filter: "blur(5px)", opacity: 0, y: "0.58em" },
		[animation],
	);

	React.useEffect(() => {
		if (!active || completedRef.current) return;

		let cancelled = false;

		async function revealDigit() {
			if (animation === "scroll") {
				const targetDigit = Number.parseInt(digit, 10);
				const safeTargetDigit = Number.isNaN(targetDigit) ? 0 : targetDigit;

				setDisplayDigit("0");
				controls.set(restingState);
				await waitForMs(delay * 1000);
				if (cancelled) return;

				for (let value = 1; value <= safeTargetDigit; value += 1) {
					await waitForMs(44);
					if (cancelled) return;
					controls.set({ filter: "blur(2px)", opacity: 0.62, y: "0.2em" });
					setDisplayDigit(String(value));
					await controls.start({
						filter: "blur(0px)",
						opacity: 1,
						y: "0em",
						transition: {
							duration: 0.34,
							ease: numericDigitEase,
						},
					});
				}

				if (cancelled) return;
				completedRef.current = true;
				if (isLast) onComplete();
				return;
			}

			setDisplayDigit(digit);
			await controls.start({
				filter: "blur(0px)",
				opacity: 1,
				y: "0em",
				transition: {
					...spring.component,
					delay,
					duration: 0.46,
				},
			});
			if (cancelled) return;
			completedRef.current = true;
			if (isLast) onComplete();
		}

		void revealDigit();

		return () => {
			cancelled = true;
		};
	}, [
		active,
		animation,
		controls,
		delay,
		digit,
		isLast,
		onComplete,
		restingState,
	]);

	React.useEffect(() => {
		if (!active) {
			completedRef.current = false;
			setDisplayDigit(animation === "scroll" ? "0" : digit);
			controls.set(restingState);
		}
	}, [active, animation, controls, digit, restingState]);

	return (
		<span
			aria-hidden="true"
			className="inline-block overflow-hidden align-baseline tabular-nums"
		>
			<motion.span
				animate={controls}
				className="block whitespace-pre tabular-nums"
				initial={restingState}
			>
				{displayDigit}
			</motion.span>
		</span>
	);
}

function waitForMs(duration: number) {
	if (duration <= 0) return Promise.resolve();
	return new Promise<void>((resolve) => {
		window.setTimeout(resolve, duration);
	});
}
