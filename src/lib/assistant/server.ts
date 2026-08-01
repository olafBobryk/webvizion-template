import "server-only";

import type { AssistantAdapters } from "./contracts";
import { fixtureConversationAdapter, fixtureFileAdapter } from "./fixture";
import { assistantRuntimeAdapter } from "./runtime.server";

export const assistantAdapters: AssistantAdapters = {
	conversations: fixtureConversationAdapter,
	files: fixtureFileAdapter,
	runtime: assistantRuntimeAdapter,
};

export * from "./contracts";
