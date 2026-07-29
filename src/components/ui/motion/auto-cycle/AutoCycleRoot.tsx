"use client";

import { useInView } from "motion/react";
import * as React from "react";
import { useAppReady } from "@/hooks/useAppReady";

export type AutoCycleController = {
	activeIndex: number;
	hasInteraction: boolean;
	progress: number;
	isActive: (index: number) => boolean;
	setActive: (index: number) => void;
	clearInteraction: () => void;
	getItemProps: (index: number) => {
		onMouseEnter: () => void;
		onMouseLeave: () => void;
		onFocus: () => void;
		onBlur: () => void;
		"data-active": boolean;
	};
};

const AutoCycleContext = React.createContext<AutoCycleController | null>(null);

export type AutoCycleRootProps = {
	count: number;
	autoCycle?: boolean;
	intervalMs?: number;
	initialIndex?: number;
	cycleWhen?: "ready" | "inView";
	pauseOnHover?: boolean;
	pauseOnFocus?: boolean;
	restartTimerFromActiveOnLeave?: boolean;
	className?: string;
	children: React.ReactNode;
};

function clampIndex(index: number, count: number) {
	if (count <= 0) return 0;
	if (index < 0) return 0;
	if (index >= count) return count - 1;
	return index;
}

export function AutoCycleRoot({
	count,
	autoCycle = true,
	intervalMs = 3000,
	initialIndex = 0,
	cycleWhen = "ready",
	pauseOnHover = true,
	pauseOnFocus = true,
	restartTimerFromActiveOnLeave = true,
	className,
	children,
}: AutoCycleRootProps) {
	const appReady = useAppReady();
	const hostRef = React.useRef<HTMLDivElement>(null);
	const hostInView = useInView(hostRef, { amount: 0.2, once: false });
	const [activeIndex, setActiveIndex] = React.useState(() =>
		clampIndex(initialIndex, count),
	);
	const [progress, setProgress] = React.useState(0);
	const [timerStartedAt, setTimerStartedAt] = React.useState(0);
	const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
	const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null);

	React.useEffect(() => {
		setActiveIndex((currentIndex) => clampIndex(currentIndex, count));
	}, [count]);

	const readyToStart = appReady;
	const readyToCycle = readyToStart && (cycleWhen === "ready" || hostInView);
	const interactionIndex = focusedIndex !== null ? focusedIndex : hoveredIndex;
	const hasInteraction = interactionIndex !== null;
	const currentActiveIndex = interactionIndex ?? activeIndex;

	React.useEffect(() => {
		if (readyToCycle) return;
		setProgress(0);
		setTimerStartedAt(0);
	}, [readyToCycle]);

	React.useEffect(() => {
		if (!autoCycle) return undefined;
		if (count <= 1) return undefined;
		if (!readyToCycle) return undefined;
		if (hasInteraction) {
			setProgress(1);
			return undefined;
		}

		let frameId = 0;
		let startedAt = timerStartedAt || window.performance.now();
		setProgress(0);

		const tick = (now: number) => {
			const nextProgress = Math.min((now - startedAt) / intervalMs, 1);
			setProgress(nextProgress);

			if (nextProgress >= 1) {
				setActiveIndex((currentIndex) => (currentIndex + 1) % count);
				startedAt = now;
				setProgress(0);
			}

			frameId = window.requestAnimationFrame(tick);
		};

		frameId = window.requestAnimationFrame(tick);

		return () => window.cancelAnimationFrame(frameId);
	}, [
		autoCycle,
		count,
		hasInteraction,
		intervalMs,
		readyToCycle,
		timerStartedAt,
	]);

	const setActive = (index: number) => {
		setActiveIndex(clampIndex(index, count));
		setProgress(0);
		setTimerStartedAt(window.performance.now());
	};

	const clearInteraction = () => {
		setHoveredIndex(null);
		setFocusedIndex(null);
		setProgress(0);
		setTimerStartedAt(window.performance.now());
	};

	const getItemProps = (index: number) => ({
		onMouseEnter: () => {
			if (!pauseOnHover) return;
			const nextIndex = clampIndex(index, count);
			setHoveredIndex(nextIndex);
			setActiveIndex(nextIndex);
		},
		onMouseLeave: () => {
			if (!pauseOnHover) return;
			if (!restartTimerFromActiveOnLeave) {
				setHoveredIndex(null);
				return;
			}
			clearInteraction();
		},
		onFocus: () => {
			if (!pauseOnFocus) return;
			const nextIndex = clampIndex(index, count);
			setFocusedIndex(nextIndex);
			setActiveIndex(nextIndex);
		},
		onBlur: () => {
			if (!pauseOnFocus) return;
			if (!restartTimerFromActiveOnLeave) {
				setFocusedIndex(null);
				return;
			}
			clearInteraction();
		},
		"data-active": currentActiveIndex === clampIndex(index, count),
	});

	const content = (
		<AutoCycleContext.Provider
			value={{
				activeIndex: currentActiveIndex,
				hasInteraction,
				progress,
				isActive: (index: number) =>
					currentActiveIndex === clampIndex(index, count),
				setActive,
				clearInteraction,
				getItemProps,
			}}
		>
			{children}
		</AutoCycleContext.Provider>
	);

	if (cycleWhen === "inView" || className) {
		return (
			<div ref={hostRef} className={className}>
				{content}
			</div>
		);
	}

	return content;
}

export function useAutoCycleController() {
	const context = React.useContext(AutoCycleContext);

	if (!context) {
		throw new Error(
			"AutoCycle.useController must be used within AutoCycle.Root.",
		);
	}

	return context;
}
