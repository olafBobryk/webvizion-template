import { createContext } from "react";

export type RegisteredParticipant = {
	id: string;
	element: HTMLElement;
	order: number;
	ready: boolean;
	played: boolean;
	play: (delay: number) => Promise<void> | void;
	showImmediately: () => void;
};

export type RevealScheduler = {
	disabled: boolean;
	kind: "global" | "sequence";
	started: boolean;
	register: (participant: {
		id: string;
		element: HTMLElement;
		play: RegisteredParticipant["play"];
		showImmediately: RegisteredParticipant["showImmediately"];
	}) => () => void;
	markReady: (id: string) => void;
};

export const RevealSchedulerContext = createContext<RevealScheduler | null>(
	null,
);

export function sortParticipantsByDocumentOrder(
	first: RegisteredParticipant,
	second: RegisteredParticipant,
) {
	if (first.element === second.element) return 0;
	const position = first.element.compareDocumentPosition(second.element);
	if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
	if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
	return first.order - second.order;
}

export function waitForRevealDelay(delay: number) {
	if (delay <= 0) return Promise.resolve();
	return new Promise<void>((resolve) => {
		window.setTimeout(resolve, delay * 1000);
	});
}
