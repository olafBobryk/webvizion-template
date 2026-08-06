import { createContext } from "react";

export type RegisteredMotionParticipant = {
	id: string;
	element: HTMLElement;
	order: number;
	ready: boolean;
	played: boolean;
	play: (delay: number) => Promise<void> | void;
	reset: () => void;
	showImmediately: () => void;
};

export type MotionScheduler = {
	disabled: boolean;
	kind: "global" | "sequence";
	started: boolean;
	register: (participant: {
		id: string;
		element: HTMLElement;
		play: RegisteredMotionParticipant["play"];
		reset: RegisteredMotionParticipant["reset"];
		showImmediately: RegisteredMotionParticipant["showImmediately"];
	}) => () => void;
	markExited: (id: string) => void;
	markReady: (id: string) => void;
};

export const MotionSchedulerContext = createContext<MotionScheduler | null>(
	null,
);

export function sortParticipantsByDocumentOrder(
	first: RegisteredMotionParticipant,
	second: RegisteredMotionParticipant,
) {
	if (first.element === second.element) return 0;
	const position = first.element.compareDocumentPosition(second.element);
	if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
	if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
	return first.order - second.order;
}

export function waitForMotionDelay(delay: number) {
	if (delay <= 0) return Promise.resolve();
	return new Promise<void>((resolve) => {
		window.setTimeout(resolve, delay * 1000);
	});
}
