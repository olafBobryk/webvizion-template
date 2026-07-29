"use client";

import { Slot } from "@radix-ui/react-slot";
import {
	motion,
	type TargetAndTransition,
	useAnimationControls,
	type Variants,
} from "motion/react";
import {
	createElement,
	type ElementType,
	forwardRef,
	type ReactNode,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	getMotionTiming,
	type MotionDistance,
	type MotionIntensity,
	type MotionSurface,
} from "@/components/ui/foundations/motionTiming";
import { waitForRevealDelay } from "./scheduler/context";
import { useRevealParticipant } from "./scheduler/useRevealParticipant";

const SlotWithRef = forwardRef<HTMLElement, React.ComponentProps<typeof Slot>>(
	(props, ref) => <Slot ref={ref} {...props} />,
);
SlotWithRef.displayName = "RevealSlot";
const MotionSlot = motion.create(SlotWithRef);

const staticRevealStyle = {
	opacity: 1,
	transform: "none",
	clipPath: "none",
} as const;

export type RevealItemProps = {
	children?: ReactNode;
	as?: ElementType;
	staticAs?: ElementType;
	asChild?: boolean;
	handoffAfterReveal?: boolean;
	deferInteractionUntilRevealed?: boolean;
	className?: string;
	variants?: Variants;
	disableTransform?: boolean;
	intensity?: MotionIntensity;
	expressive?: number;
	distance?: MotionDistance | number;
	surface?: MotionSurface | number;
};

type RevealParticipantItemProps = RevealItemProps & {
	participantReady?: boolean;
	onParticipantShow?: () => void;
	onParticipantStart?: (delay: number) => Promise<void> | void;
};

export function RevealItem(props: RevealItemProps) {
	return <RevealParticipantItem {...props} />;
}

export function RevealParticipantItem({
	children,
	as = motion.div,
	staticAs,
	asChild = false,
	handoffAfterReveal = false,
	deferInteractionUntilRevealed = false,
	className,
	variants,
	disableTransform = false,
	intensity,
	expressive,
	distance,
	surface,
	participantReady = true,
	onParticipantShow,
	onParticipantStart,
}: RevealParticipantItemProps) {
	const controls = useAnimationControls();
	const revealTiming = useMemo(
		() =>
			getMotionTiming("grand", { intensity, expressive, distance, surface }),
		[intensity, expressive, distance, surface],
	);
	const [hasPlayed, setHasPlayed] = useState(false);
	const childRef = useRef<HTMLElement | null>(null);
	const wrapperRef = useRef<HTMLElement | null>(null);
	const elementRef = asChild ? childRef : wrapperRef;
	const mountedRef = useRef(false);
	const originalTransitionRef = useRef<string | null>(null);

	useLayoutEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, []);

	const completeReveal = useCallback(async () => {
		if (!mountedRef.current) return;
		if (asChild && handoffAfterReveal) {
			await new Promise<void>((resolve) => {
				requestAnimationFrame(() => {
					if (childRef.current) {
						childRef.current.style.transition =
							originalTransitionRef.current ?? "";
					}
					if (mountedRef.current) setHasPlayed(true);
					resolve();
				});
			});
			return;
		}
		setHasPlayed(true);
	}, [asChild, handoffAfterReveal]);

	const play = useCallback(
		async (delay: number) => {
			const participantEffect = onParticipantStart?.(delay);
			if (variants) {
				await waitForRevealDelay(delay);
				if (!mountedRef.current) return;
				await controls.start("show");
			} else {
				const target: TargetAndTransition = disableTransform
					? { opacity: 1, transition: { ...revealTiming, delay } }
					: {
							opacity: 1,
							y: 0,
							transition: { ...revealTiming, delay },
							transitionEnd: { transform: "none", y: 0 },
						};
				await controls.start(target);
			}
			if (mountedRef.current) await completeReveal();
			await participantEffect;
		},
		[
			completeReveal,
			controls,
			disableTransform,
			onParticipantStart,
			revealTiming,
			variants,
		],
	);

	const showImmediately = useCallback(() => {
		onParticipantShow?.();
		if (variants) controls.set("show");
		else controls.set(disableTransform ? { opacity: 1 } : { opacity: 1, y: 0 });
		setHasPlayed(true);
	}, [controls, disableTransform, onParticipantShow, variants]);

	const { disabled } = useRevealParticipant({
		elementRef,
		play,
		ready: participantReady,
		showImmediately,
	});

	useLayoutEffect(() => {
		if (!asChild || !handoffAfterReveal || disabled || hasPlayed) return;
		const node = childRef.current;
		if (!node) return;
		originalTransitionRef.current = node.style.transition;
		node.style.transition = "none";
	}, [asChild, disabled, handoffAfterReveal, hasPlayed]);

	useEffect(
		() => () => {
			mountedRef.current = false;
		},
		[],
	);

	const usePlainChild = asChild && handoffAfterReveal && hasPlayed;
	const interactionLocked =
		deferInteractionUntilRevealed && !disabled && !hasPlayed;
	const revealClassName = interactionLocked
		? [className, "pointer-events-none"].filter(Boolean).join(" ")
		: className;
	const interactionProps = interactionLocked
		? ({ "aria-hidden": true, inert: true } as const)
		: {};

	if (disabled || usePlainChild) {
		if (asChild) {
			return (
				<SlotWithRef
					ref={childRef}
					className={revealClassName}
					data-reveal-item=""
					style={staticRevealStyle}
					{...interactionProps}
				>
					{children}
				</SlotWithRef>
			);
		}

		const StaticTag =
			typeof (staticAs ?? as) === "string" ? (staticAs ?? as) : "div";
		return createElement(
			StaticTag,
			{
				ref: wrapperRef,
				className: revealClassName,
				"data-reveal-item": "",
				style: staticRevealStyle,
				...interactionProps,
			},
			children,
		);
	}

	const MotionTag = asChild ? MotionSlot : (as ?? motion.div);
	const resolvedVariants: Variants =
		variants ??
		({
			hidden: disableTransform ? { opacity: 0 } : { opacity: 0, y: 12 },
			show: disableTransform
				? { opacity: 1, transition: revealTiming }
				: {
						opacity: 1,
						y: 0,
						transition: revealTiming,
						transitionEnd: { transform: "none", y: 0 },
					},
		} as const);

	return (
		<MotionTag
			ref={asChild ? childRef : wrapperRef}
			initial="hidden"
			animate={controls}
			variants={resolvedVariants}
			className={revealClassName}
			data-reveal-item=""
			{...interactionProps}
		>
			{children}
		</MotionTag>
	);
}
