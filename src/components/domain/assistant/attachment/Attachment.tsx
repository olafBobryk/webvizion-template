"use client";

import { Chip } from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import type { AssistantAttachment } from "@/lib/assistant/contracts";

function formatBytes(bytes: number) {
	return bytes < 1024 * 1024
		? `${Math.max(1, Math.round(bytes / 1024))} KB`
		: `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function Attachment({
	attachment,
	onRemove,
}: {
	attachment: AssistantAttachment;
	onRemove?: () => void;
}) {
	return (
		<Chip
			className="max-w-64"
			contentMode="contents"
			leadingIcon={
				attachment.contentType === "application/pdf" ? "cards" : "image"
			}
		>
			<span className="min-w-0 truncate">{attachment.filename}</span>
			<span className="shrink-0 text-foreground/80">
				{formatBytes(attachment.size)}
			</span>
			{onRemove ? (
				<Button
					aria-label={`Remove ${attachment.filename}`}
					onClick={onRemove}
					size="none"
					variant="ghost"
				>
					×
				</Button>
			) : null}
		</Chip>
	);
}
