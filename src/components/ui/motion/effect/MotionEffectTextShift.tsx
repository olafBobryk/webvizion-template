"use client";

import clsx from "clsx";
import { motion, useMotionValue, useTransform } from "motion/react";
import { type ReactNode, useEffect, useRef } from "react";
import styles from "./MotionEffectText.module.css";
import { useMotionEffectProgress } from "./progress";

export type MotionEffectTextShiftProps = {
	children: ReactNode;
	className?: string;
	from?: "start" | "end";
	range?: readonly [number, number];
	to?: "start" | "end";
};

export function MotionEffectTextShift({
	children,
	className,
	from = "end",
	range = [0, 1],
	to = "start",
}: MotionEffectTextShiftProps) {
	const { progress } = useMotionEffectProgress("TextShift", range);
	const trackRef = useRef<HTMLSpanElement | null>(null);
	const contentRef = useRef<HTMLSpanElement | null>(null);
	const travel = useMotionValue(0);
	const direction = useMotionValue(1);
	const x = useTransform(() => {
		if (from === to) return 0;
		const towardStart = from === "end" && to === "start";
		const sign = towardStart ? -direction.get() : direction.get();
		return progress.get() * travel.get() * sign;
	});

	useEffect(() => {
		const track = trackRef.current;
		const content = contentRef.current;
		if (!track || !content) return;
		const measure = () => {
			travel.set(
				Math.max(
					0,
					track.getBoundingClientRect().width -
						content.getBoundingClientRect().width,
				),
			);
			direction.set(
				window.getComputedStyle(track).direction === "rtl" ? -1 : 1,
			);
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(track);
		observer.observe(content);
		return () => observer.disconnect();
	}, [direction, travel]);

	return (
		<span
			ref={trackRef}
			className={styles.textTrack}
			data-motion-effect="text-shift"
		>
			<motion.span
				ref={contentRef}
				className={clsx(styles.textContent, className)}
				data-motion-effect-text-shift-from={from}
				data-motion-effect-text-shift-to={to}
				style={{ x }}
			>
				{children}
			</motion.span>
		</span>
	);
}
