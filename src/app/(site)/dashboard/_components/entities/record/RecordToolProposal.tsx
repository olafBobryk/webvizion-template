import type { ReactNode } from "react";
import * as Markdown from "@/components/composites/markdown";
import { StatusMessage } from "@/components/ui/primitives/StatusMessage";
import { Text } from "@/components/ui/primitives/Text";
import type {
	RecordToolProposalPresentation,
	RecordToolProposalValue,
} from "../../../_lib/entities/record/presentation";
import { RecordIdentity } from "./RecordIdentity";
import { RecordStatusChip } from "./RecordStatusChip";

type ProposalField = RecordToolProposalPresentation["changedFields"][number];

function compactComparisonMarkdown(markdown: string) {
	return markdown.replace(/^#{1,6}\s+(.+)$/gmu, "**$1**");
}

function ProposalValueLabel({ children }: { children: string }) {
	return (
		<Text tone="muted" variant="caption">
			{children}
		</Text>
	);
}

function TitleValue({ value }: { value: RecordToolProposalValue }) {
	return <Text variant="bodyStrong">{value.title}</Text>;
}

function StatusValue({ value }: { value: RecordToolProposalValue }) {
	return value.status ? (
		<div>
			<RecordStatusChip
				label={value.status.shortLabel}
				tone={value.status.tone}
			/>
		</div>
	) : (
		<Text tone="muted" variant="support">
			No status
		</Text>
	);
}

function DescriptionValue({ value }: { value: RecordToolProposalValue }) {
	return value.descriptionMarkdown ? (
		<Markdown.Render
			density="compact"
			markdown={compactComparisonMarkdown(value.descriptionMarkdown)}
			variant="result"
		/>
	) : (
		<Text tone="muted" variant="support">
			No description.
		</Text>
	);
}

const proposalFieldDefinitions = {
	description: {
		label: "Description",
		render: (value: RecordToolProposalValue) => (
			<DescriptionValue value={value} />
		),
	},
	status: {
		label: "Status",
		render: (value: RecordToolProposalValue) => <StatusValue value={value} />,
	},
	title: {
		label: "Title",
		render: (value: RecordToolProposalValue) => <TitleValue value={value} />,
	},
} satisfies Record<
	ProposalField,
	{
		label: string;
		render: (value: RecordToolProposalValue) => ReactNode;
	}
>;

function RecordToolProposalRow({
	current,
	field,
	proposed,
}: {
	current: RecordToolProposalValue | null;
	field: ProposalField;
	proposed: RecordToolProposalValue;
}) {
	const definition = proposalFieldDefinitions[field];
	return (
		<div
			className="grid min-w-0 gap-2 border-border/70 border-t py-3 first:border-t-0 first:pt-0 last:pb-0 sm:grid-cols-[6rem_minmax(0,1fr)]"
			data-proposal-field={field}
		>
			<Text tone="muted" variant="caption">
				{definition.label}
			</Text>
			<div
				className={current ? "grid min-w-0 gap-3 sm:grid-cols-2" : "min-w-0"}
			>
				{current ? (
					<div className="grid min-w-0 content-start gap-1">
						<ProposalValueLabel>Current</ProposalValueLabel>
						{definition.render(current)}
					</div>
				) : null}
				<div className="grid min-w-0 content-start gap-1">
					<ProposalValueLabel>Proposed</ProposalValueLabel>
					{definition.render(proposed)}
				</div>
			</div>
		</div>
	);
}

function RecordToolProposalRoot({
	presentation,
}: {
	presentation: RecordToolProposalPresentation;
}) {
	const target = presentation.current ?? presentation.proposed;
	const proposed = presentation.proposed;
	if (!target) return null;
	const deleting = Boolean(presentation.current && !proposed);
	return (
		<div className="grid min-w-0 gap-4" data-record-tool-proposal="true">
			<RecordIdentity
				presentation={{ slugLabel: target.slugLabel, title: target.title }}
			/>
			{deleting ? (
				<StatusMessage tone="danger">
					This Record will be permanently deleted.
				</StatusMessage>
			) : proposed && presentation.changedFields.length > 0 ? (
				<div className="grid min-w-0" data-record-tool-proposal-diff="true">
					{presentation.changedFields.map((field) => (
						<RecordToolProposalRow
							current={presentation.current}
							field={field}
							key={field}
							proposed={proposed}
						/>
					))}
				</div>
			) : (
				<Text tone="muted" variant="support">
					No changes proposed.
				</Text>
			)}
		</div>
	);
}

function RecordToolProposalSkeleton({ count = 2 }: { count?: 1 | 2 }) {
	return (
		<div
			aria-hidden="true"
			className="grid min-w-0 gap-4"
			data-record-tool-proposal-skeleton="true"
		>
			<RecordIdentity.Skeleton />
			{count === 1 ? (
				<Text.Skeleton tone="muted" variant="support">
					This Record will be permanently deleted.
				</Text.Skeleton>
			) : (
				<div className="grid gap-3 border-border/70 border-t pt-3 sm:grid-cols-[6rem_minmax(0,1fr)]">
					<Text.Skeleton variant="caption">Description</Text.Skeleton>
					<div className="grid gap-3 sm:grid-cols-2">
						<Text.Skeleton tone="muted" variant="support">
							Current value
						</Text.Skeleton>
						<Text.Skeleton tone="muted" variant="support">
							Proposed value
						</Text.Skeleton>
					</div>
				</div>
			)}
		</div>
	);
}

export const RecordToolProposal = Object.assign(RecordToolProposalRoot, {
	Skeleton: RecordToolProposalSkeleton,
});
