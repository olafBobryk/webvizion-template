import "server-only";

import { type AssistantActor, assistantLimits } from "./contracts";

type RunState = { active: Set<string>; starts: Map<string, number[]> };
declare global {
	var __averloAssistantRunState: RunState | undefined;
}

function state() {
	globalThis.__averloAssistantRunState ??= {
		active: new Set(),
		starts: new Map(),
	};
	return globalThis.__averloAssistantRunState;
}

function key(actor: AssistantActor) {
	return `${actor.organizationId}:${actor.userId}`;
}

export function startAssistantRun(actor: AssistantActor) {
	const runState = state();
	const actorKey = key(actor);
	if (runState.active.has(actorKey)) {
		throw new Error("Another Assistant response is already running.");
	}
	const now = Date.now();
	const starts = (runState.starts.get(actorKey) ?? []).filter(
		(startedAt) => now - startedAt < 86_400_000,
	);
	if (
		starts.filter((startedAt) => now - startedAt < 60_000).length >=
		assistantLimits.runsPerMinute
	) {
		throw new Error("Assistant minute limit reached. Try again shortly.");
	}
	if (starts.length >= assistantLimits.runsPerDay) {
		throw new Error("Assistant daily limit reached.");
	}
	starts.push(now);
	runState.starts.set(actorKey, starts);
	runState.active.add(actorKey);
	return () => runState.active.delete(actorKey);
}
