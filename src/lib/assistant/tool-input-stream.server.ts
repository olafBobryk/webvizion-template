import type { AssistantRuntimeEvent, AssistantToolName } from "./contracts";

async function pause(delayMs: number, signal?: AbortSignal) {
	if (delayMs <= 0) return;
	if (signal?.aborted) throw new Error("Assistant run stopped.");
	await new Promise<void>((resolve, reject) => {
		const onAbort = () => {
			clearTimeout(timeout);
			reject(new Error("Assistant run stopped."));
		};
		const timeout = setTimeout(() => {
			signal?.removeEventListener("abort", onAbort);
			resolve();
		}, delayMs);
		signal?.addEventListener("abort", onAbort, { once: true });
	});
}

export async function* streamAssistantToolInput({
	delayMs,
	input,
	name,
	signal,
	toolCallId,
}: {
	delayMs: number;
	input: unknown;
	name: AssistantToolName;
	signal?: AbortSignal;
	toolCallId: string;
}): AsyncGenerator<AssistantRuntimeEvent> {
	for (const event of createAssistantToolInputEvents({
		input,
		name,
		toolCallId,
	})) {
		yield event;
		if (event.type === "tool-input-delta") await pause(delayMs, signal);
	}
}

export function createAssistantToolInputEvents({
	input,
	name,
	toolCallId,
}: {
	input: unknown;
	name: AssistantToolName;
	toolCallId: string;
}): AssistantRuntimeEvent[] {
	const serializedInput = JSON.stringify(input ?? null);
	const chunkSize = Math.max(1, Math.ceil(serializedInput.length / 4));
	const events: AssistantRuntimeEvent[] = [
		{ name, toolCallId, type: "tool-input-start" },
	];
	for (let index = 0; index < serializedInput.length; index += chunkSize) {
		events.push({
			delta: serializedInput.slice(index, index + chunkSize),
			toolCallId,
			type: "tool-input-delta",
		});
	}
	events.push({ input, name, toolCallId, type: "tool-input-available" });
	return events;
}
