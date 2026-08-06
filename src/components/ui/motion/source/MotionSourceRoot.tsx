"use client";

import { Slot } from "@radix-ui/react-slot";
import {
	animate,
	type MotionValue,
	type UseScrollOptions,
	useInView,
	useMotionValue,
	useScroll,
	useSpring,
} from "motion/react";
import {
	type ComponentPropsWithoutRef,
	type ElementType,
	forwardRef,
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useMotionDisableOverride } from "@/components/ui/foundations/motionDisableOverride";
import {
	getMotionTiming,
	type MotionTimingPreset,
} from "@/components/ui/foundations/motionTiming";
import { getSpring } from "@/components/ui/foundations/spring";
import { useAppReady } from "@/hooks/useAppReady";
import { useMotionAllowed } from "@/hooks/useMotionAllowed";
import {
	clampMotionProgress,
	MotionSourceContext,
	type MotionSourceContextValue,
	type MotionSourceMode,
} from "./context";
import { useMotionParticipant } from "./scheduler/useMotionParticipant";

export type MotionSourceBreakpoint = "base" | "sm" | "md" | "lg" | "xl" | "2xl";
export type MotionSourceTiming = MotionTimingPreset;

export type MotionSourceStrategy =
	| {
			type: "scroll";
			offset?: UseScrollOptions["offset"];
			smooth?: boolean;
			activeFrom?: MotionSourceBreakpoint;
			staticProgress?: number;
	  }
	| { type: "hover"; timing?: MotionSourceTiming }
	| { type: "owner-hover"; timing?: MotionSourceTiming }
	| { type: "boolean"; active: boolean; timing?: MotionSourceTiming }
	| { type: "in-view"; amount?: number; once?: boolean }
	| { type: "reveal"; ready?: boolean; once?: boolean };

type MotionSourceRootOwnProps = {
	as?: ElementType;
	asChild?: boolean;
	children: ReactNode;
	strategy: MotionSourceStrategy;
};

export type MotionSourceRootProps = MotionSourceRootOwnProps &
	Omit<ComponentPropsWithoutRef<"div">, keyof MotionSourceRootOwnProps | "ref">;

const breakpointQueries: Record<MotionSourceBreakpoint, string> = {
	base: "(min-width: 0px)",
	sm: "(min-width: 640px)",
	md: "(min-width: 768px)",
	lg: "(min-width: 1024px)",
	xl: "(min-width: 1280px)",
	"2xl": "(min-width: 1536px)",
};

const defaultScrollOffset: UseScrollOptions["offset"] = [
	"start end",
	"end start",
];

const SlotWithRef = forwardRef<HTMLElement, React.ComponentProps<typeof Slot>>(
	(props, ref) => <Slot ref={ref} {...props} />,
);
SlotWithRef.displayName = "MotionSourceSlot";

export function MotionSourceRoot(props: MotionSourceRootProps) {
	switch (props.strategy.type) {
		case "scroll":
			return <ScrollSource {...props} strategy={props.strategy} />;
		case "hover":
			return <InteractionSource {...props} strategy={props.strategy} />;
		case "owner-hover":
			return <InteractionSource {...props} strategy={props.strategy} />;
		case "boolean":
			return <BooleanSource {...props} strategy={props.strategy} />;
		case "in-view":
			return <InViewSource {...props} strategy={props.strategy} />;
		case "reveal":
			return <RevealSource {...props} strategy={props.strategy} />;
	}
}

function ScrollSource({
	strategy,
	...props
}: MotionSourceRootProps & {
	strategy: Extract<MotionSourceStrategy, { type: "scroll" }>;
}) {
	const targetRef = useRef<HTMLElement | null>(null);
	const activeFrom = strategy.activeFrom ?? "base";
	const breakpointActive = useBreakpointActive(activeFrom);
	const appReady = useAppReady();
	const motionAllowed = useMotionAllowed(true);
	const motionDisabled = useMotionDisableOverride();
	const enabled =
		appReady && motionAllowed && !motionDisabled && breakpointActive;
	const staticProgress = clampMotionProgress(strategy.staticProgress ?? 1);
	const { scrollYProgress } = useScroll({
		target: targetRef,
		offset: strategy.offset ?? defaultScrollOffset,
	});
	const springProgress = useSpring(scrollYProgress, getSpring("scroll"));
	const sourceProgress =
		strategy.smooth === false ? scrollYProgress : springProgress;
	const progress = useMotionValue(staticProgress);

	useEffect(() => {
		if (!enabled) {
			progress.jump(staticProgress);
			return;
		}
		progress.jump(sourceProgress.get());
		return sourceProgress.on("change", (value) => progress.set(value));
	}, [enabled, progress, sourceProgress, staticProgress]);

	return (
		<SourceFrame
			{...props}
			mode={enabled ? "animated" : "static-final"}
			progress={progress}
			strategyType="scroll"
			targetRef={targetRef}
		/>
	);
}

function InteractionSource({
	strategy,
	...props
}: MotionSourceRootProps & {
	strategy: Extract<
		MotionSourceStrategy,
		{ type: "hover" } | { type: "owner-hover" }
	>;
}) {
	const targetRef = useRef<HTMLElement | null>(null);
	const [active, setActive] = useState(false);
	const appReady = useAppReady();
	const motionAllowed = useMotionAllowed(true);
	const motionDisabled = useMotionDisableOverride();
	const enabled = appReady && motionAllowed && !motionDisabled;
	const mode: MotionSourceMode = !appReady
		? "static-final"
		: enabled
			? "animated"
			: "instant";
	const progress = useMotionValue(appReady ? 0 : 1);
	const timing = strategy.timing ?? "interactive";

	useEffect(() => {
		const root = targetRef.current;
		const trigger =
			strategy.type === "owner-hover"
				? root?.closest<HTMLElement>("[data-motion-owner]")
				: root;
		if (!trigger) return;

		let pointerActive = false;
		let focusActive = false;
		let focusFrame = 0;
		const sync = () => setActive(pointerActive || focusActive);
		const syncFocus = () => {
			cancelAnimationFrame(focusFrame);
			focusFrame = requestAnimationFrame(() => {
				focusActive =
					trigger.matches(":focus-visible") ||
					Boolean(trigger.querySelector(":focus-visible"));
				sync();
			});
		};
		const enter = () => {
			pointerActive = true;
			sync();
		};
		const leave = () => {
			pointerActive = false;
			sync();
		};

		trigger.addEventListener("pointerenter", enter);
		trigger.addEventListener("pointerleave", leave);
		trigger.addEventListener("focusin", syncFocus);
		trigger.addEventListener("focusout", syncFocus);
		return () => {
			cancelAnimationFrame(focusFrame);
			trigger.removeEventListener("pointerenter", enter);
			trigger.removeEventListener("pointerleave", leave);
			trigger.removeEventListener("focusin", syncFocus);
			trigger.removeEventListener("focusout", syncFocus);
		};
	}, [strategy.type]);

	useProgressTarget(
		progress,
		mode === "static-final" ? 1 : active ? 1 : 0,
		mode,
		timing,
		true,
	);

	return (
		<SourceFrame
			{...props}
			mode={mode}
			progress={progress}
			strategyType={strategy.type}
			targetRef={targetRef}
			timing={timing}
		/>
	);
}

function BooleanSource({
	strategy,
	...props
}: MotionSourceRootProps & {
	strategy: Extract<MotionSourceStrategy, { type: "boolean" }>;
}) {
	const targetRef = useRef<HTMLElement | null>(null);
	const appReady = useAppReady();
	const motionAllowed = useMotionAllowed(true);
	const motionDisabled = useMotionDisableOverride();
	const enabled = appReady && motionAllowed && !motionDisabled;
	const mode: MotionSourceMode = !appReady
		? "static-final"
		: enabled
			? "animated"
			: "instant";
	const progress = useMotionValue(appReady ? Number(strategy.active) : 1);
	const timing = strategy.timing ?? "interactive";
	useProgressTarget(
		progress,
		mode === "static-final" ? 1 : Number(strategy.active),
		mode,
		timing,
		true,
	);

	return (
		<SourceFrame
			{...props}
			mode={mode}
			progress={progress}
			strategyType="boolean"
			targetRef={targetRef}
			timing={timing}
		/>
	);
}

function InViewSource({
	strategy,
	...props
}: MotionSourceRootProps & {
	strategy: Extract<MotionSourceStrategy, { type: "in-view" }>;
}) {
	const targetRef = useRef<HTMLElement | null>(null);
	const appReady = useAppReady();
	const motionAllowed = useMotionAllowed(true);
	const motionDisabled = useMotionDisableOverride();
	const enabled = appReady && motionAllowed && !motionDisabled;
	const inView = useInView(targetRef, {
		amount: strategy.amount ?? 0.2,
		once: strategy.once ?? true,
	});
	const progress = useMotionValue(appReady ? 0 : 1);
	useProgressTarget(
		progress,
		enabled ? Number(inView) : 1,
		enabled ? "animated" : "static-final",
		"grand",
	);

	return (
		<SourceFrame
			{...props}
			mode={enabled ? "animated" : "static-final"}
			progress={progress}
			strategyType="in-view"
			targetRef={targetRef}
		/>
	);
}

function RevealSource({
	strategy,
	...props
}: MotionSourceRootProps & {
	strategy: Extract<MotionSourceStrategy, { type: "reveal" }>;
}) {
	const targetRef = useRef<HTMLElement | null>(null);
	const appReady = useAppReady();
	const progress = useMotionValue(appReady ? 0 : 1);
	const animationRef = useRef<ReturnType<typeof animate> | null>(null);
	const completionResolverRef = useRef<(() => void) | null>(null);
	const finish = useCallback(() => {
		completionResolverRef.current?.();
		completionResolverRef.current = null;
	}, []);
	const stop = useCallback(() => {
		animationRef.current?.stop();
		animationRef.current = null;
		finish();
	}, [finish]);
	const { disabled } = useMotionParticipant({
		elementRef: targetRef,
		once: strategy.once ?? true,
		ready: strategy.ready ?? true,
		play: (delay) => {
			stop();
			return new Promise<void>((resolve) => {
				completionResolverRef.current = resolve;
				animationRef.current = animate(progress, 1, {
					...getMotionTiming("grand"),
					delay,
					onComplete: () => {
						animationRef.current = null;
						finish();
					},
				});
			});
		},
		reset: () => {
			stop();
			progress.jump(0);
		},
		showImmediately: () => {
			stop();
			progress.jump(1);
		},
	});

	useEffect(() => {
		if (!appReady || disabled) {
			progress.jump(1);
			return;
		}
		progress.jump(0);
		return stop;
	}, [appReady, disabled, progress, stop]);

	return (
		<SourceFrame
			{...props}
			mode={appReady && !disabled ? "animated" : "static-final"}
			progress={progress}
			strategyType="reveal"
			targetRef={targetRef}
		/>
	);
}

function SourceFrame({
	as: Tag = "div",
	asChild = false,
	children,
	mode,
	progress,
	strategyType,
	targetRef,
	timing,
	...rest
}: Omit<MotionSourceRootProps, "strategy"> &
	MotionSourceContextValue & {
		targetRef: React.RefObject<HTMLElement | null>;
		timing?: MotionSourceTiming;
	}) {
	const value = useMemo(
		() => ({ mode, progress, strategyType }),
		[mode, progress, strategyType],
	);
	const Frame = asChild ? SlotWithRef : Tag;

	return (
		<MotionSourceContext.Provider value={value}>
			<Frame
				ref={targetRef}
				data-motion-source=""
				data-motion-source-mode={mode}
				data-motion-source-strategy={strategyType}
				data-motion-source-timing={timing}
				{...rest}
			>
				{children}
			</Frame>
		</MotionSourceContext.Provider>
	);
}

function useProgressTarget(
	progress: MotionValue<number>,
	target: number,
	mode: MotionSourceMode,
	timing: MotionSourceTiming,
	skipInitialAnimation = false,
) {
	const hasSettledInitialTarget = useRef(false);

	useEffect(() => {
		if (mode !== "animated") {
			progress.jump(target);
			return;
		}
		if (skipInitialAnimation && !hasSettledInitialTarget.current) {
			hasSettledInitialTarget.current = true;
			progress.jump(target);
			return;
		}
		hasSettledInitialTarget.current = true;
		const controls = animate(progress, target, getMotionTiming(timing));
		return () => controls.stop();
	}, [mode, progress, skipInitialAnimation, target, timing]);
}

function useBreakpointActive(activeFrom: MotionSourceBreakpoint) {
	const [active, setActive] = useState(activeFrom === "base");
	useEffect(() => {
		const media = window.matchMedia(breakpointQueries[activeFrom]);
		const update = () => setActive(media.matches);
		update();
		media.addEventListener("change", update);
		return () => media.removeEventListener("change", update);
	}, [activeFrom]);
	return active;
}
