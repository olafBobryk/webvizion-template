"use client";

import { useTransform } from "motion/react";
import { normalizeMotionRange, useMotionSource } from "../source/context";

export function useMotionEffectProgress(
	effectName: string,
	range: readonly [number, number] = [0, 1],
) {
	const source = useMotionSource(effectName);
	const [start, end] = normalizeMotionRange(range);
	const progress = useTransform(source.progress, [start, end], [0, 1], {
		clamp: true,
	});
	return { ...source, progress };
}
