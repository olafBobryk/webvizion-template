"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icons/Icon";
import { Accordion } from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import { Text } from "@/components/ui/primitives/Text";
import type {
	AssistantToolPart,
	AssistantToolState,
} from "@/lib/assistant/contracts";
import { ToolCall } from "./ToolCall";

const statePriority: readonly AssistantToolState[] = [
	"approval-requested",
	"error",
	"denied",
	"input-available",
	"input-streaming",
	"approved",
	"completed",
];

const stateLabels = {
	"approval-requested": "Approval required",
	approved: "Approved",
	completed: "Completed",
	denied: "Declined",
	error: "Failed",
	"input-available": "Running",
	"input-streaming": "Pending",
} satisfies Record<AssistantToolState, string>;

function getGroupState(parts: readonly AssistantToolPart[]) {
	for (const state of statePriority) {
		if (parts.some((part) => part.state === state)) return state;
	}
	return "completed";
}

export function ToolCallGroup({
	disabled,
	onDecision,
	parts,
}: {
	disabled?: boolean;
	onDecision?: (part: AssistantToolPart, approved: boolean) => void;
	parts: AssistantToolPart[];
}) {
	const hasActionableApproval = parts.some(
		(part) => part.state === "approval-requested" && part.approvalId !== null,
	);
	const [open, setOpen] = React.useState(hasActionableApproval);
	const previousActionableApproval = React.useRef(hasActionableApproval);

	React.useEffect(() => {
		if (hasActionableApproval && !previousActionableApproval.current)
			setOpen(true);
		previousActionableApproval.current = hasActionableApproval;
	}, [hasActionableApproval]);

	const countLabel = parts.length === 1 ? "call" : "calls";
	const title = parts.length === 1 ? "Record tool" : "Record tools";
	const stateLabel = stateLabels[getGroupState(parts)];

	return (
		<Accordion
			className="my-3"
			contentClassName="px-px pb-3 pt-4"
			onOpenChange={setOpen}
			open={open}
			renderTrigger={(triggerProps) => (
				<Button
					align="left"
					className="text-muted-foreground"
					size="none"
					{...triggerProps}
					trailingIcon={
						<Icon
							aria-hidden
							className={`transition-transform motion-micro ${triggerProps["aria-expanded"] ? "rotate-180" : ""}`}
							name="chevron-down"
							size="sm"
						/>
					}
					variant="ghost"
				>
					<Text
						as="span"
						className="min-w-0 truncate font-medium"
						variant="caption"
					>
						{title}{" "}
						<span className="font-normal opacity-65">
							· {parts.length} {countLabel} · {stateLabel}
						</span>
					</Text>
				</Button>
			)}
			title={title}
		>
			<div className="grid gap-6">
				{parts.map((part) => (
					<ToolCall
						disabled={disabled}
						key={part.id}
						onDecision={(approved) => onDecision?.(part, approved)}
						part={part}
					/>
				))}
			</div>
		</Accordion>
	);
}
