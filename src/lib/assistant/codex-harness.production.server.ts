import "server-only";

import type {
	AssistantRuntimeAdapter,
	AssistantRuntimeEvent,
} from "./contracts";

export async function* codexHarnessResponse(
	_input: Parameters<AssistantRuntimeAdapter["stream"]>[0],
): AsyncGenerator<AssistantRuntimeEvent> {
	yield await Promise.reject(
		new Error("The local Codex harness is disabled in production."),
	);
}
