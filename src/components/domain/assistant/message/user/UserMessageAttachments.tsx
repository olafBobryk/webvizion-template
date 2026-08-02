"use client";

import * as React from "react";
import { FileInput, type FileInputItem } from "@/components/ui/input";
import { Text } from "@/components/ui/primitives/Text";
import type { AssistantUserMessage } from "@/lib/assistant/contracts";

type ResolvedAttachments = {
	failedCount: number;
	items: FileInputItem[];
};

const ignoreFileInputChanges = () => {};

export function UserMessageAttachments({
	parts,
}: Pick<AssistantUserMessage, "parts">) {
	const attachmentCount = parts.filter((part) => part.type === "file").length;
	const [resolved, setResolved] = React.useState<ResolvedAttachments | null>(
		null,
	);

	React.useEffect(() => {
		const attachments = parts.flatMap((part) =>
			part.type === "file" ? [part.attachment] : [],
		);
		setResolved(null);
		if (attachments.length === 0) return;
		const controller = new AbortController();

		Promise.allSettled(
			attachments.map(async (attachment): Promise<FileInputItem> => {
				const fixtureAccessUrl =
					"accessUrl" in attachment && typeof attachment.accessUrl === "string"
						? attachment.accessUrl
						: null;
				if (fixtureAccessUrl) {
					return {
						key: attachment.id,
						name: attachment.filename,
						status: "uploaded",
						type: attachment.contentType,
						unoptimized: true,
						url: fixtureAccessUrl,
					};
				}
				const response = await fetch(
					`/api/assistant/files/${encodeURIComponent(attachment.id)}/access`,
					{ method: "POST", signal: controller.signal },
				);
				if (!response.ok) throw new Error("Attachment preview unavailable.");
				const result = (await response.json()) as { url?: string };
				if (!result.url) throw new Error("Attachment preview unavailable.");
				return {
					key: attachment.id,
					name: attachment.filename,
					status: "uploaded",
					type: attachment.contentType,
					unoptimized: true,
					url: result.url,
				};
			}),
		).then((results) => {
			if (controller.signal.aborted) return;
			setResolved({
				failedCount: results.filter((result) => result.status === "rejected")
					.length,
				items: results.flatMap((result) =>
					result.status === "fulfilled" ? [result.value] : [],
				),
			});
		});

		return () => controller.abort();
	}, [parts]);

	if (attachmentCount === 0) return null;
	if (!resolved) {
		return (
			<FileInput.Skeleton count={attachmentCount} label={null} mode="read" />
		);
	}

	return (
		<div className="grid gap-2">
			{resolved.items.length > 0 ? (
				<FileInput
					items={resolved.items}
					label={null}
					mode="read"
					onItemsChange={ignoreFileInputChanges}
				/>
			) : null}
			{resolved.failedCount > 0 ? (
				<Text as="p" tone="muted" variant="caption">
					{resolved.failedCount === 1
						? "One attachment preview is unavailable."
						: `${resolved.failedCount} attachment previews are unavailable.`}
				</Text>
			) : null}
		</div>
	);
}
