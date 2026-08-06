"use client";

import {
	type ElementType,
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	MotionSchedulerContext,
	type RegisteredMotionParticipant,
	sortParticipantsByDocumentOrder,
	waitForMotionDelay,
} from "./scheduler/context";
import { useMotionParticipant } from "./scheduler/useMotionParticipant";

export type MotionSourceSequenceProps = {
	children: ReactNode;
	as?: ElementType;
	className?: string;
	once?: boolean;
	stagger?: number;
};

export function MotionSourceSequence({
	children,
	as: Tag = "div",
	className,
	once = true,
	stagger = 0.18,
}: MotionSourceSequenceProps) {
	const wrapperRef = useRef<HTMLElement | null>(null);
	const participantsRef = useRef(
		new Map<string, RegisteredMotionParticipant>(),
	);
	const completedRef = useRef(new Set<string>());
	const orderRef = useRef(0);
	const flushFrameRef = useRef<number | null>(null);
	const completionFrameRef = useRef<number | null>(null);
	const completionResolverRef = useRef<(() => void) | null>(null);
	const playbackCycleRef = useRef(0);
	const [started, setStarted] = useState(false);
	const startedRef = useRef(false);
	const disabledRef = useRef(false);

	const finish = useCallback(() => {
		completionResolverRef.current?.();
		completionResolverRef.current = null;
	}, []);

	const checkCompletion = useCallback(() => {
		completionFrameRef.current = null;
		if (!startedRef.current) return;
		const connected = [...participantsRef.current.values()].filter(
			(participant) => participant.element.isConnected,
		);
		if (
			connected.length === 0 ||
			connected.every((participant) => completedRef.current.has(participant.id))
		) {
			finish();
		}
	}, [finish]);

	const scheduleCompletionCheck = useCallback(() => {
		if (completionFrameRef.current !== null) return;
		completionFrameRef.current = requestAnimationFrame(checkCompletion);
	}, [checkCompletion]);

	const complete = useCallback(
		(id: string) => {
			completedRef.current.add(id);
			scheduleCompletionCheck();
		},
		[scheduleCompletionCheck],
	);

	const flushReadyParticipants = useCallback(() => {
		flushFrameRef.current = null;
		if (!startedRef.current) return;
		const participants = [...participantsRef.current.values()]
			.filter(
				(participant) =>
					participant.ready &&
					!participant.played &&
					participant.element.isConnected,
			)
			.sort(sortParticipantsByDocumentOrder);

		participants.forEach((participant, index) => {
			const playbackCycle = playbackCycleRef.current;
			participant.played = true;
			if (disabledRef.current) {
				participant.showImmediately();
				complete(participant.id);
				return;
			}
			void Promise.resolve(participant.play(index * stagger)).finally(() => {
				if (playbackCycle === playbackCycleRef.current)
					complete(participant.id);
			});
		});
		scheduleCompletionCheck();
	}, [complete, scheduleCompletionCheck, stagger]);

	const scheduleFlush = useCallback(() => {
		if (flushFrameRef.current !== null) return;
		flushFrameRef.current = requestAnimationFrame(flushReadyParticipants);
	}, [flushReadyParticipants]);

	const register = useCallback(
		({
			id,
			element,
			play,
			reset,
			showImmediately,
		}: Omit<RegisteredMotionParticipant, "order" | "ready" | "played">) => {
			participantsRef.current.set(id, {
				id,
				element,
				play,
				reset,
				showImmediately,
				order: orderRef.current,
				ready: false,
				played: false,
			});
			orderRef.current += 1;
			if (startedRef.current) scheduleCompletionCheck();
			return () => {
				participantsRef.current.delete(id);
				completedRef.current.delete(id);
				scheduleCompletionCheck();
			};
		},
		[scheduleCompletionCheck],
	);

	const markReady = useCallback(
		(id: string) => {
			const participant = participantsRef.current.get(id);
			if (!participant || participant.ready || participant.played) return;
			participant.ready = true;
			scheduleFlush();
		},
		[scheduleFlush],
	);

	const start = useCallback(() => {
		startedRef.current = true;
		setStarted(true);
		scheduleFlush();
		scheduleCompletionCheck();
	}, [scheduleCompletionCheck, scheduleFlush]);

	const play = useCallback(
		async (delay: number) => {
			await waitForMotionDelay(delay);
			return new Promise<void>((resolve) => {
				completionResolverRef.current = resolve;
				start();
			});
		},
		[start],
	);

	const showImmediately = useCallback(() => {
		disabledRef.current = true;
		start();
	}, [start]);

	const reset = useCallback(() => {
		playbackCycleRef.current += 1;
		startedRef.current = false;
		setStarted(false);
		if (flushFrameRef.current !== null) {
			cancelAnimationFrame(flushFrameRef.current);
			flushFrameRef.current = null;
		}
		if (completionFrameRef.current !== null) {
			cancelAnimationFrame(completionFrameRef.current);
			completionFrameRef.current = null;
		}
		completedRef.current.clear();
		for (const participant of participantsRef.current.values()) {
			participant.ready = false;
			participant.played = false;
			participant.reset();
		}
		finish();
	}, [finish]);

	const { disabled } = useMotionParticipant({
		elementRef: wrapperRef,
		once,
		play,
		reset,
		showImmediately,
	});
	disabledRef.current = disabled;
	const ignoreParticipantExit = useCallback(() => {}, []);

	const scheduler = useMemo(
		() => ({
			disabled,
			kind: "sequence" as const,
			started,
			register,
			markExited: ignoreParticipantExit,
			markReady,
		}),
		[disabled, ignoreParticipantExit, markReady, register, started],
	);

	useEffect(
		() => () => {
			if (flushFrameRef.current !== null)
				cancelAnimationFrame(flushFrameRef.current);
			if (completionFrameRef.current !== null)
				cancelAnimationFrame(completionFrameRef.current);
			finish();
		},
		[finish],
	);

	return (
		<MotionSchedulerContext.Provider value={scheduler}>
			<Tag
				ref={wrapperRef}
				className={className}
				data-motion-source-sequence=""
				data-motion-source-sequence-once={once}
				data-motion-source-sequence-stagger={stagger}
			>
				{children}
			</Tag>
		</MotionSchedulerContext.Provider>
	);
}
