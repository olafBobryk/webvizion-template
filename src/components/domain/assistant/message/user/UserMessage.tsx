import clsx from "clsx";
import { inputFrameChromeClassName } from "@/components/ui/primitives/InputFrame";
import { Text } from "@/components/ui/primitives/Text";
import type { AssistantUserMessage as AssistantUserMessageContract } from "@/lib/assistant/contracts";
import { MessageFrame } from "../frame";
import { UserMessageAttachments } from "./UserMessageAttachments";

export function UserMessage({
	message,
}: {
	message: AssistantUserMessageContract;
}) {
	const hasAttachments = message.parts.some((part) => part.type === "file");

	return (
		<MessageFrame ariaLabel="You">
			<div
				className={clsx(
					inputFrameChromeClassName,
					"ml-auto grid min-h-9 max-w-2xl content-center gap-4 px-3 py-1.5",
					hasAttachments ? "w-full" : "w-fit",
				)}
			>
				{message.parts.map((part) => {
					switch (part.type) {
						case "text":
							return (
								<Text
									as="p"
									className="whitespace-pre-wrap"
									key={part.id}
									variant="body"
								>
									{part.text}
								</Text>
							);
						case "file":
							return null;
					}

					part satisfies never;
					return null;
				})}
				<UserMessageAttachments parts={message.parts} />
			</div>
		</MessageFrame>
	);
}
