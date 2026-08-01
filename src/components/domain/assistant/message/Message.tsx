"use client";

import type {
	AssistantMessage as AssistantMessageContract,
	AssistantToolPart,
} from "@/lib/assistant/contracts";
import { AssistantMessage } from "./assistant";
import { UserMessage } from "./user";

export function Message({
	decisionPending,
	message,
	onToolDecision,
	streaming = false,
}: {
	decisionPending?: boolean;
	message: AssistantMessageContract;
	onToolDecision?: (part: AssistantToolPart, approved: boolean) => void;
	streaming?: boolean;
}) {
	switch (message.role) {
		case "user":
			return <UserMessage message={message} />;
		case "assistant":
			return (
				<AssistantMessage
					decisionPending={decisionPending}
					message={message}
					onToolDecision={onToolDecision}
					streaming={streaming}
				/>
			);
		case "system":
			return null;
	}

	message satisfies never;
	return null;
}
