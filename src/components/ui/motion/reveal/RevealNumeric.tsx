"use client";

import clsx from "clsx";
import { motion, useAnimationControls } from "motion/react";
import type { ComponentPropsWithoutRef } from "react";
import * as React from "react";
import { spring } from "@/components/ui/foundations/spring";
import { type TextProps, textVariants } from "@/components/ui/primitives/Text";
import { NumericCountUpText } from "./NumericCountUpText";
import { useRevealParticipant } from "./scheduler/useRevealParticipant";

export type NumericRevealAnimation = "countUp" | "reveal" | "scroll";

const numericDigitEase = [0.16, 1, 0.3, 1] as const;

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
				className={clsx("inline-flex items-baseline", resolvedClassName)}
				{...rest}
			>
				<span className="sr-only">{finalText}</span>
				<NumericCountUpText
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
			className={clsx("inline-flex items-baseline", resolvedClassName)}
			{...rest}
		>
			<span className="sr-only">{finalText}</span>
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
