"use client";

import * as React from "react";
import { FileInput, type FileInputItem } from "@/components/ui/input";
import { Text } from "@/components/ui/primitives/Text";
import type { AssistantAttachment } from "@/lib/assistant/contracts";

const ignoreFileInputChanges = () => {};

export function Attachment({
	attachment,
}: {
	attachment: AssistantAttachment;
}) {
	const [item, setItem] = React.useState<FileInputItem | null>(null);
	const [failed, setFailed] = React.useState(false);

	React.useEffect(() => {
		const controller = new AbortController();
		setItem(null);
		setFailed(false);
		const fixtureAccessUrl =
			"accessUrl" in attachment && typeof attachment.accessUrl === "string"
				? attachment.accessUrl
				: null;
		if (fixtureAccessUrl) {
			setItem({
				key: attachment.id,
				name: attachment.filename,
				status: "uploaded",
				type: attachment.contentType,
				unoptimized: true,
				url: fixtureAccessUrl,
			});
			return () => controller.abort();
		}

		fetch(`/api/assistant/files/${encodeURIComponent(attachment.id)}/access`, {
			method: "POST",
			signal: controller.signal,
		})
			.then(async (response) => {
				if (!response.ok) throw new Error("Attachment preview unavailable.");
				const result = (await response.json()) as { url?: string };
				if (!result.url) throw new Error("Attachment preview unavailable.");
				setItem({
					key: attachment.id,
					name: attachment.filename,
					status: "uploaded",
					type: attachment.contentType,
					unoptimized: true,
					url: result.url,
				});
			})
			.catch(() => {
				if (!controller.signal.aborted) setFailed(true);
			});

		return () => controller.abort();
	}, [attachment]);

	if (!item) {
		return failed ? (
			<Text as="p" tone="muted" variant="caption">
				Attachment preview unavailable.
			</Text>
		) : (
			<FileInput.Skeleton count={1} label={null} mode="read" />
		);
	}

	return (
		<FileInput
			items={[item]}
			label={null}
			mode="read"
			onItemsChange={ignoreFileInputChanges}
		/>
	);
}
