"use client";

import * as React from "react";
import {
	RecordToolCall,
	type RecordToolProposalPreview,
} from "@/app/(site)/dashboard/_components/entities/record/RecordToolCall";
import { getRecordToolPresentation } from "@/app/(site)/dashboard/_lib/entities/record/presentation";
import type { AssistantToolPart } from "@/lib/assistant/contracts";

function needsRecordProposalPreview(part: AssistantToolPart) {
	return (
		part.state === "approval-requested" &&
		["record_update", "record_archive", "record_delete"].includes(part.name)
	);
}

function useRecordProposalPreview(part: AssistantToolPart) {
	const needsPreview = needsRecordProposalPreview(part);
	const [preview, setPreview] = React.useState<
		RecordToolProposalPreview | undefined
	>();
	const loadPreview = React.useEffectEvent(async (signal?: AbortSignal) => {
		if (!needsRecordProposalPreview(part)) return;
		setPreview({ status: "loading" });
		try {
			const response = await fetch("/api/assistant/presentation/record-tool", {
				body: JSON.stringify({ input: part.input, toolName: part.name }),
				headers: { "content-type": "application/json" },
				method: "POST",
				signal,
			});
			const body = await response.json();
			if (!response.ok) throw new Error(body.error ?? "Record preview failed.");
			const item = getRecordToolPresentation({
				input: part.input,
				output: body,
				state: "completed",
				toolName: "record_get",
			}).items[0];
			if (!item) throw new Error("The current Record is unavailable.");
			setPreview({ item, status: "ready" });
		} catch (error) {
			if (signal?.aborted) return;
			setPreview({
				message:
					error instanceof Error ? error.message : "Record preview failed.",
				status: "error",
			});
		}
	});

	React.useEffect(() => {
		if (!needsPreview) {
			setPreview(undefined);
			return;
		}
		const controller = new AbortController();
		void loadPreview(controller.signal);
		return () => controller.abort();
	}, [needsPreview]);

	return { preview, retry: () => void loadPreview() };
}

export function ToolCall({
	disabled,
	onDecision,
	part,
}: {
	disabled?: boolean;
	onDecision?: (approved: boolean) => void;
	part: AssistantToolPart;
}) {
	const proposal = useRecordProposalPreview(part);
	switch (part.name) {
		case "records_list":
		case "record_get":
		case "record_create":
		case "record_update":
		case "record_archive":
		case "record_delete":
			return (
				<RecordToolCall
					disabled={disabled}
					onApprove={() => onDecision?.(true)}
					onDeny={() => onDecision?.(false)}
					onRetryProposal={proposal.retry}
					presentation={getRecordToolPresentation({
						error: part.error,
						input: part.input,
						output: part.output,
						state: part.state,
						toolName: part.name,
					})}
					proposalPreview={proposal.preview}
				/>
			);
	}

	part.name satisfies never;
	return null;
}
