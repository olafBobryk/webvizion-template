import type {
	AssistantResponseMessage,
	AssistantToolPart,
} from "@/lib/assistant/contracts";
import { Attachment } from "../../attachment";
import { MessageFrame } from "../frame";
import { Response } from "./response";
import { ToolCallGroup } from "./tool-call/ToolCallGroup";

export function AssistantMessage({
	decisionPending,
	message,
	onToolDecision,
	streaming,
}: {
	decisionPending?: boolean;
	message: AssistantResponseMessage;
	onToolDecision?: (part: AssistantToolPart, approved: boolean) => void;
	streaming: boolean;
}) {
	const hasVisibleParts = message.parts.some(
		(part) => part.type !== "text" || part.text.length > 0,
	);
	if (!hasVisibleParts) return null;
	const toolParts = message.parts.filter(
		(part): part is AssistantToolPart => part.type === "tool",
	);
	let renderedToolCalls = false;

	return (
		<MessageFrame ariaLabel="Assistant">
			<div className="max-w-2xl min-w-0">
				{message.parts.map((part) => {
					switch (part.type) {
						case "text":
							return (
								<Response
									key={part.id}
									streaming={streaming}
									text={part.text}
								/>
							);
						case "file":
							return <Attachment attachment={part.attachment} key={part.id} />;
						case "tool":
							if (renderedToolCalls) return null;
							renderedToolCalls = true;
							return (
								<ToolCallGroup
									disabled={decisionPending}
									key={part.id}
									onDecision={onToolDecision}
									parts={toolParts}
								/>
							);
					}

					part satisfies never;
					return null;
				})}
			</div>
		</MessageFrame>
	);
}
