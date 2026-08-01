"use client";

import { Fragment, type Key, type ReactNode } from "react";
import { Chip, type ChipTone } from "@/components/ui/misc";
import { Card } from "@/components/ui/primitives/surfaces";
import { Text } from "@/components/ui/primitives/Text";
import type { AssistantToolState } from "@/lib/assistant/contracts";
import { ToolApprovalActions } from "./ToolApprovalActions";

export type ToolFramePresentation<TItem> = {
	description: string;
	destructive: boolean;
	items: readonly TItem[];
	label: string;
	state: AssistantToolState;
	stateLabel: string;
	tone: ChipTone;
	toolName: string;
};

export type ToolPresentationFrameProps<TItem> = {
	children?: ReactNode;
	disabled?: boolean;
	getItemKey: (item: TItem) => Key;
	onApprove?: () => void;
	onDeny?: () => void;
	presentation: ToolFramePresentation<TItem>;
	renderItem: (item: TItem) => ReactNode;
};

function ToolPresentationFrameRoot<TItem>({
	children,
	disabled = false,
	getItemKey,
	onApprove,
	onDeny,
	presentation,
	renderItem,
}: ToolPresentationFrameProps<TItem>) {
	const content =
		children ??
		(presentation.items.length > 0 ? (
			<div className="grid gap-3">
				{presentation.items.map((item) => (
					<Fragment key={getItemKey(item)}>{renderItem(item)}</Fragment>
				))}
			</div>
		) : null);

	return (
		<Card
			as="section"
			className="min-w-0"
			data-assistant-tool={presentation.toolName}
		>
			<Card.Header>
				<Card.Title
					as="div"
					className="inline-flex min-w-0 flex-wrap items-center gap-2"
				>
					{presentation.label}
					<Chip tone={presentation.tone}>{presentation.stateLabel}</Chip>
				</Card.Title>
				<Card.Description>{presentation.description}</Card.Description>
			</Card.Header>
			{content ? <Card.Content>{content}</Card.Content> : null}
			{presentation.state === "approval-requested" ? (
				<ToolApprovalActions
					destructive={presentation.destructive}
					disabled={disabled}
					onApprove={onApprove}
					onDeny={onDeny}
				/>
			) : null}
		</Card>
	);
}

export type ToolPresentationFrameSkeletonProps = {
	description?: string;
	destructive?: boolean;
	itemSkeleton?: ReactNode;
	label?: string;
	showApprovalActions?: boolean;
	stateLabel?: string;
};

function ToolPresentationFrameSkeleton({
	description = "Tool result in the current organization.",
	destructive = false,
	itemSkeleton,
	label = "Record tool",
	showApprovalActions = false,
	stateLabel = "Completed",
}: ToolPresentationFrameSkeletonProps) {
	return (
		<Card as="section" className="min-w-0">
			<Card.Header>
				<Card.Title
					as="div"
					className="inline-flex min-w-0 flex-wrap items-center gap-2"
				>
					<Text.Skeleton
						className="text-sm font-semibold leading-snug"
						variant={null}
					>
						{label}
					</Text.Skeleton>
					<Chip.Skeleton>{stateLabel}</Chip.Skeleton>
				</Card.Title>
				<Card.Description>
					<Text.Skeleton tone="muted" variant="support">
						{description}
					</Text.Skeleton>
				</Card.Description>
			</Card.Header>
			{itemSkeleton ? (
				<Card.Content>
					<div className="grid gap-3">{itemSkeleton}</div>
				</Card.Content>
			) : null}
			{showApprovalActions ? (
				<ToolApprovalActions.Skeleton destructive={destructive} />
			) : null}
		</Card>
	);
}

export const ToolPresentationFrame = Object.assign(ToolPresentationFrameRoot, {
	Skeleton: ToolPresentationFrameSkeleton,
});
