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
import { RevealSchedulerContext } from "./context";

type UseRevealParticipantOptions = {
	elementRef: RefObject<HTMLElement | null>;
	play: (delay: number) => Promise<void> | void;
	ready?: boolean;
	showImmediately: () => void;
	viewportAmount?: number;
};

export function useRevealParticipant({
	elementRef,
	play,
	ready = true,
	showImmediately,
	viewportAmount = 0.2,
}: UseRevealParticipantOptions) {
	const id = useId();
	const scheduler = useContext(RevealSchedulerContext);
	const appReady = useAppReady();
	const inView = useInView(elementRef, {
		amount: viewportAmount,
		once: true,
	});
	const playRef = useRef(play);
	const showImmediatelyRef = useRef(showImmediately);
	playRef.current = play;
	showImmediatelyRef.current = showImmediately;

	if (!scheduler && process.env.NODE_ENV !== "production") {
		throw new Error(
			"Reveal components require the application-level MotionProvider.",
		);
	}

	const registeredPlay = useCallback((delay: number) => {
		return playRef.current(delay);
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
			showImmediately: registeredShowImmediately,
		});
	}, [elementRef, id, registeredPlay, registeredShowImmediately, scheduler]);

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

	return {
		disabled: scheduler?.disabled ?? true,
		hasProvider: scheduler !== null,
	};
}
