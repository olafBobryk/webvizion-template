"use client";

import { motion, useAnimationControls } from "motion/react";
import * as React from "react";

const numericDigitEase = [0.16, 1, 0.3, 1] as const;
const numericCountUpDuration = 640;
const numericCountUpDelayStep = 8;
const numericCountUpDurationStep = 10;
const numericCountEase = (progress: number) => 1 - (1 - progress) ** 4;

type CountUpNumericPart =
	| { type: "literal"; value: string }
	| { type: "number"; index: number; target: number; width: number };

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

export function NumericCountUpText({
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
				<NumericCountUpCharacter
					// biome-ignore lint/suspicious/noArrayIndexKey: character position is the visual identity in this counter.
					key={index}
					character={character}
					index={index}
				/>
			))}
		</>
	);
}

function NumericCountUpCharacter({
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
		return <span aria-hidden="true">{character}</span>;
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
