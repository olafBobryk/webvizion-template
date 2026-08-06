"use client";

import clsx from "clsx";
import { useMotionValueEvent } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./MotionEffectText.module.css";
import { useMotionEffectProgress } from "./progress";

type UnderlineSegment = {
	id: string;
	length: number;
	start: number;
	direction: 1 | -1;
	y: number;
};

export type MotionEffectUnderlineTextProps = {
	children: string;
	className?: string;
	range?: readonly [number, number];
};

export function MotionEffectUnderlineText({
	children,
	className,
	range = [0, 1],
}: MotionEffectUnderlineTextProps) {
	const { progress } = useMotionEffectProgress("UnderlineText", range);
	const rootRef = useRef<HTMLSpanElement>(null);
	const textRef = useRef<HTMLSpanElement>(null);
	const lineRefs = useRef<Array<SVGLineElement | null>>([]);
	const [segments, setSegments] = useState<UnderlineSegment[]>([]);

	useLayoutEffect(() => {
		const root = rootRef.current;
		const text = textRef.current;
		if (!root || !text) return;
		let cancelled = false;
		const measure = () => {
			if (cancelled) return;
			const rootRect = root.getBoundingClientRect();
			if (rootRect.width === 0 || rootRect.height === 0) return;
			const rtl = window.getComputedStyle(text).direction === "rtl";
			const textRange = document.createRange();
			textRange.selectNodeContents(text);
			const next = Array.from(textRange.getClientRects())
				.filter((rect) => rect.width > 0 && rect.height > 0)
				.map((rect, index) => ({
					id: `${Math.round(rect.top)}-${Math.round(rect.left)}-${index}`,
					length: rect.width,
					start: rtl ? rect.right - rootRect.left : rect.left - rootRect.left,
					direction: (rtl ? -1 : 1) as 1 | -1,
					y: rect.bottom - rootRect.top - 1,
				}));
			setSegments((current) => (segmentsMatch(current, next) ? current : next));
		};

		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(root);
		observer.observe(text);
		void document.fonts?.ready.then(measure);
		return () => {
			cancelled = true;
			observer.disconnect();
		};
	}, []);

	useMotionValueEvent(progress, "change", (value) => {
		drawSegments(lineRefs.current, segments, value);
	});
	useEffect(() => {
		drawSegments(lineRefs.current, segments, progress.get());
	}, [progress, segments]);

	return (
		<span
			ref={rootRef}
			className={clsx(styles.underlineRoot, className)}
			data-motion-effect="underline-text"
		>
			<span ref={textRef} className={styles.underlineText}>
				{children}
			</span>
			<svg aria-hidden="true" className={styles.underline} focusable="false">
				{segments.map((segment, index) => (
					<line
						key={segment.id}
						ref={(node) => {
							lineRefs.current[index] = node;
						}}
						x1={segment.start}
						x2={segment.start}
						y1={segment.y}
						y2={segment.y}
					/>
				))}
			</svg>
		</span>
	);
}

function segmentsMatch(current: UnderlineSegment[], next: UnderlineSegment[]) {
	return (
		current.length === next.length &&
		current.every((segment, index) => {
			const candidate = next[index];
			return (
				candidate !== undefined &&
				segment.length === candidate.length &&
				segment.start === candidate.start &&
				segment.direction === candidate.direction &&
				segment.y === candidate.y
			);
		})
	);
}

function drawSegments(
	lines: Array<SVGLineElement | null>,
	segments: UnderlineSegment[],
	progress: number,
) {
	const totalLength = segments.reduce(
		(total, segment) => total + segment.length,
		0,
	);
	let travelled = progress * totalLength;
	for (const [index, segment] of segments.entries()) {
		const visibleLength = Math.min(segment.length, Math.max(0, travelled));
		lines[index]?.setAttribute(
			"x2",
			String(segment.start + segment.direction * visibleLength),
		);
		travelled -= segment.length;
	}
}
