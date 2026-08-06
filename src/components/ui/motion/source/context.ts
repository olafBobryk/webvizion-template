"use client";

import type { MotionValue } from "motion/react";
import { createContext, useContext } from "react";

export type MotionSourceMode = "animated" | "instant" | "static-final";

export type MotionSourceContextValue = {
	mode: MotionSourceMode;
	progress: MotionValue<number>;
	strategyType: MotionSourceStrategyType;
};

export type MotionSourceStrategyType =
	| "scroll"
	| "hover"
	| "owner-hover"
	| "boolean"
	| "in-view"
	| "reveal";

export const MotionSourceContext =
	createContext<MotionSourceContextValue | null>(null);

export function useMotionSource(effectName: string) {
	const source = useContext(MotionSourceContext);
	if (!source) {
		throw new Error(
			`MotionEffect.${effectName} must be rendered inside MotionSource.Root.`,
		);
	}
	return source;
}

export function clampMotionProgress(value: number) {
	return Math.min(1, Math.max(0, value));
}

export function normalizeMotionRange(range: readonly [number, number]) {
	const start = clampMotionProgress(range[0]);
	const end = clampMotionProgress(range[1]);
	return start <= end ? ([start, end] as const) : ([end, start] as const);
}
