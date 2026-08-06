"use client";

import clsx from "clsx";
import { type MotionValue, motion, useTransform } from "motion/react";
import styles from "./MotionEffectText.module.css";
import { useMotionEffectProgress } from "./progress";

export type MotionEffectTextReplayProps = {
	className?: string;
	range?: readonly [number, number];
	repeats?: number;
	/**
	 * Total normalized source-progress window distributed between the first and
	 * last character. Values are clamped so every character completes by 1.
	 */
	stagger?: number;
	text: string;
};

const defaultStagger = 0.15;
const maximumStagger = 0.42;

function ReplayCharacter({
	character,
	index,
	progress,
	stagger,
	total,
}: {
	character: string;
	index: number;
	progress: MotionValue<number>;
	stagger: number;
	total: number;
}) {
	const staggerOffset = total > 1 ? (index / (total - 1)) * stagger : 0;
	const exitStart = 0.04 + staggerOffset;
	const exitEnd = exitStart + 0.4;
	const enterStart = 0.16 + staggerOffset;
	const enterEnd = enterStart + 0.42;
	const outgoingY = useTransform(
		progress,
		[0, exitStart, exitEnd, 1],
		["0em", "0em", "-0.58em", "-0.58em"],
	);
	const outgoingOpacity = useTransform(
		progress,
		[0, exitStart, exitEnd, 1],
		[1, 1, 0, 0],
	);
	const outgoingFilter = useTransform(
		progress,
		[0, exitStart, exitEnd, 1],
		["blur(0px)", "blur(0px)", "blur(5px)", "blur(5px)"],
	);
	const incomingY = useTransform(
		progress,
		[0, enterStart, enterEnd, 1],
		["0.58em", "0.58em", "0em", "0em"],
	);
	const incomingOpacity = useTransform(
		progress,
		[0, enterStart, enterEnd, 1],
		[0, 0, 1, 1],
	);
	const incomingFilter = useTransform(
		progress,
		[0, enterStart, enterEnd, 1],
		["blur(5px)", "blur(5px)", "blur(0px)", "blur(0px)"],
	);

	return (
		<span
			className={styles.textReplayCharacter}
			data-motion-effect-text-replay-offset={staggerOffset}
		>
			<motion.span
				className={styles.textReplayOutgoing}
				data-motion-effect-text-replay-layer="outgoing"
				style={{
					filter: outgoingFilter,
					opacity: outgoingOpacity,
					y: outgoingY,
				}}
			>
				{character}
			</motion.span>
			<motion.span
				className={styles.textReplayIncoming}
				data-motion-effect-text-replay-layer="incoming"
				style={{
					filter: incomingFilter,
					opacity: incomingOpacity,
					y: incomingY,
				}}
			>
				{character}
			</motion.span>
		</span>
	);
}

export function MotionEffectTextReplay({
	className,
	range = [0, 1],
	repeats = 1,
	stagger = defaultStagger,
	text,
}: MotionEffectTextReplayProps) {
	const { progress } = useMotionEffectProgress("TextReplay", range);
	const repeatCount = Math.max(1, Math.round(repeats));
	const resolvedStagger = Number.isFinite(stagger)
		? Math.min(maximumStagger, Math.max(0, stagger))
		: defaultStagger;
	const replayProgress = useTransform(progress, (value) => {
		if (value >= 1) return 0;
		return (value * repeatCount) % 1;
	});
	const characters = Array.from(text);

	return (
		<span
			className={clsx(styles.textReplay, className)}
			data-motion-effect="text-replay"
			data-motion-effect-text-repeats={repeatCount}
			data-motion-effect-text-stagger={resolvedStagger}
		>
			<span className="sr-only">{text}</span>
			<span aria-hidden="true" className={styles.textReplayVisual}>
				{characters.map((character, index) => (
					<ReplayCharacter
						character={character}
						index={index}
						// biome-ignore lint/suspicious/noArrayIndexKey: character position is the visual identity.
						key={index}
						progress={replayProgress}
						stagger={resolvedStagger}
						total={characters.length}
					/>
				))}
			</span>
		</span>
	);
}
