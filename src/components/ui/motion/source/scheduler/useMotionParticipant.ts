"use client";

import { useInView } from "motion/react";
import {
	type RefObject,
	useCallback,
	useContext,
	useEffect,
	useId,
	useRef,
} from "react";
import { useAppReady } from "@/hooks/useAppReady";
import { MotionSchedulerContext } from "./context";

type UseMotionParticipantOptions = {
	elementRef: RefObject<HTMLElement | null>;
	play: (delay: number) => Promise<void> | void;
	ready?: boolean;
	reset: () => void;
	showImmediately: () => void;
	once?: boolean;
	viewportAmount?: number;
};

export function useMotionParticipant({
	elementRef,
	play,
	ready = true,
	reset,
	showImmediately,
	once = true,
	viewportAmount,
}: UseMotionParticipantOptions) {
	const id = useId();
	const scheduler = useContext(MotionSchedulerContext);
	const appReady = useAppReady();
	const inView = useInView(elementRef, {
		amount: viewportAmount ?? (once ? 0.2 : 0),
		once,
	});
	const playRef = useRef(play);
	const resetRef = useRef(reset);
	const showImmediatelyRef = useRef(showImmediately);
	const hasEnteredViewportRef = useRef(false);
	playRef.current = play;
	resetRef.current = reset;
	showImmediatelyRef.current = showImmediately;

	if (!scheduler && process.env.NODE_ENV !== "production") {
		throw new Error(
			'MotionSource.Root strategy="reveal" requires the application-level MotionProvider.',
		);
	}

	const registeredPlay = useCallback((delay: number) => {
		return playRef.current(delay);
	}, []);
	const registeredReset = useCallback(() => {
		resetRef.current();
	}, []);
	const registeredShowImmediately = useCallback(() => {
		showImmediatelyRef.current();
	}, []);

	useEffect(() => {
		const element = elementRef.current;
		if (!scheduler || !element) return;
		return scheduler.register({
			id,
			element,
			play: registeredPlay,
			reset: registeredReset,
			showImmediately: registeredShowImmediately,
		});
	}, [
		elementRef,
		id,
		registeredPlay,
		registeredReset,
		registeredShowImmediately,
		scheduler,
	]);

	const participantReady = scheduler
		? scheduler.disabled ||
			(scheduler.kind === "sequence"
				? scheduler.started && ready
				: appReady && inView && ready)
		: true;

	useEffect(() => {
		if (!scheduler || !participantReady) return;
		scheduler.markReady(id);
	}, [id, participantReady, scheduler]);

	useEffect(() => {
		if (!scheduler || scheduler.disabled || scheduler.kind !== "global" || once)
			return;
		if (inView) {
			hasEnteredViewportRef.current = true;
			return;
		}
		if (hasEnteredViewportRef.current) scheduler.markExited(id);
	}, [id, inView, once, scheduler]);

	return {
		disabled: scheduler?.disabled ?? true,
	};
}
