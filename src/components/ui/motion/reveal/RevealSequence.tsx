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
	type RegisteredParticipant,
	RevealSchedulerContext,
	sortParticipantsByDocumentOrder,
	waitForRevealDelay,
} from "./scheduler/context";
import { useRevealParticipant } from "./scheduler/useRevealParticipant";

export type RevealSequenceProps = {
	children: ReactNode;
	as?: ElementType;
	className?: string;
	stagger?: number;
};

export function RevealSequence({
	children,
	as: Tag = "div",
	className,
	stagger = 0.18,
}: RevealSequenceProps) {
	const wrapperRef = useRef<HTMLElement | null>(null);
	const participantsRef = useRef(new Map<string, RegisteredParticipant>());
	const completedRef = useRef(new Set<string>());
	const orderRef = useRef(0);
	const flushFrameRef = useRef<number | null>(null);
	const completionFrameRef = useRef<number | null>(null);
	const completionResolverRef = useRef<(() => void) | null>(null);
	const [started, setStarted] = useState(false);
	const startedRef = useRef(false);
	const disabledRef = useRef(false);

	const finish = useCallback(() => {
		const resolve = completionResolverRef.current;
		completionResolverRef.current = null;
		resolve?.();
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
			participant.played = true;
			if (disabledRef.current) {
				participant.showImmediately();
				complete(participant.id);
				return;
			}
			void Promise.resolve(participant.play(index * stagger)).finally(() => {
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
			showImmediately,
		}: {
			id: string;
			element: HTMLElement;
			play: RegisteredParticipant["play"];
			showImmediately: RegisteredParticipant["showImmediately"];
		}) => {
			participantsRef.current.set(id, {
				id,
				element,
				play,
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
			await waitForRevealDelay(delay);
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

	const { disabled } = useRevealParticipant({
		elementRef: wrapperRef,
		play,
		showImmediately,
	});
	disabledRef.current = disabled;

	const scheduler = useMemo(
		() => ({
			disabled,
			kind: "sequence" as const,
			started,
			register,
			markReady,
		}),
		[disabled, markReady, register, started],
	);

	useEffect(
		() => () => {
			if (flushFrameRef.current !== null) {
				cancelAnimationFrame(flushFrameRef.current);
			}
			if (completionFrameRef.current !== null) {
				cancelAnimationFrame(completionFrameRef.current);
			}
			finish();
		},
		[finish],
	);

	return (
		<RevealSchedulerContext.Provider value={scheduler}>
			<Tag ref={wrapperRef} className={className} data-reveal-sequence="">
				{children}
			</Tag>
		</RevealSchedulerContext.Provider>
	);
}
