"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useRef } from "react";
import { useMotionDisableOverride } from "@/components/ui/foundations/motionDisableOverride";
import { useMotionAllowed } from "@/hooks/useMotionAllowed";
import {
	type RegisteredParticipant,
	RevealSchedulerContext,
	sortParticipantsByDocumentOrder,
} from "./context";

type GlobalRevealSchedulerProps = {
	children: ReactNode;
	stagger?: number;
};

export function GlobalRevealScheduler({
	children,
	stagger = 0.08,
}: GlobalRevealSchedulerProps) {
	const motionAllowed = useMotionAllowed(true);
	const motionDisabled = useMotionDisableOverride();
	const disabled = motionDisabled || !motionAllowed;
	const participantsRef = useRef(new Map<string, RegisteredParticipant>());
	const orderRef = useRef(0);
	const flushFrameRef = useRef<number | null>(null);

	const flushReadyParticipants = useCallback(() => {
		flushFrameRef.current = null;
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
			if (disabled) {
				participant.showImmediately();
				return;
			}
			void Promise.resolve(participant.play(index * stagger));
		});
	}, [disabled, stagger]);

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

			return () => {
				participantsRef.current.delete(id);
			};
		},
		[],
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

	useEffect(() => {
		if (!disabled) return;
		for (const participant of participantsRef.current.values()) {
			if (!participant.played) participant.ready = true;
		}
		scheduleFlush();
	}, [disabled, scheduleFlush]);

	useEffect(
		() => () => {
			if (flushFrameRef.current !== null) {
				cancelAnimationFrame(flushFrameRef.current);
			}
		},
		[],
	);

	const value = useMemo(
		() => ({
			disabled,
			kind: "global" as const,
			started: true,
			register,
			markReady,
		}),
		[disabled, markReady, register],
	);

	return (
		<RevealSchedulerContext.Provider value={value}>
			{children}
		</RevealSchedulerContext.Provider>
	);
}
