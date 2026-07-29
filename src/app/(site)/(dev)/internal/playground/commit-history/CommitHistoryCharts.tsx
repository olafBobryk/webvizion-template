"use client";

import type * as React from "react";
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import { Panel } from "@/components/ui/primitives/Panel";
import { Text } from "@/components/ui/primitives/Text";
import { InternalPageHeader } from "../../_components/InternalPage";

type CommitHistoryRecord = {
	additions: number;
	cumulativeNet: number;
	date: string;
	deletions: number;
	delta: number;
	hash: string;
	subject: string;
};

type ChartCommit = CommitHistoryRecord & {
	removed: number;
};

type CommitTooltipProps = {
	active?: boolean;
	mode: "delta" | "net";
	payload?: Array<{ payload?: ChartCommit }>;
};

const numberFormatter = new Intl.NumberFormat("en-US");
const compactNumberFormatter = new Intl.NumberFormat("en-US", {
	notation: "compact",
	maximumFractionDigits: 1,
});
const dateFormatter = new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
	year: "numeric",
});
const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
	month: "short",
	year: "2-digit",
});

function formatDate(value: string) {
	return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

function formatShortDate(value: string) {
	return shortDateFormatter.format(new Date(`${value}T00:00:00Z`));
}

function formatSigned(value: number) {
	return `${value > 0 ? "+" : ""}${numberFormatter.format(value)}`;
}

function CommitTooltip({ active, mode, payload }: CommitTooltipProps) {
	const commit = payload?.[0]?.payload;
	if (!active || !commit) return null;

	return (
		<Panel
			background="surface"
			border="ring"
			padding="sm"
			radius="sm"
			shadow="lg"
			className="max-w-80 gap-2"
		>
			<div className="flex items-center justify-between gap-4">
				<Text variant="caption" tone="muted">
					{formatDate(commit.date)}
				</Text>
				<Text variant="caption" className="font-mono text-foreground/70">
					{commit.hash.slice(0, 7)}
				</Text>
			</div>
			<Text variant="bodyStrong">{commit.subject}</Text>
			{mode === "delta" ? (
				<div className="grid grid-cols-3 gap-3">
					<TooltipMetric
						label="Added"
						value={formatSigned(commit.additions)}
						tone="text-success"
					/>
					<TooltipMetric
						label="Removed"
						value={formatSigned(-commit.deletions)}
						tone="text-danger"
					/>
					<TooltipMetric label="Net" value={formatSigned(commit.delta)} />
				</div>
			) : (
				<div className="grid grid-cols-2 gap-4">
					<TooltipMetric
						label="Cumulative net"
						value={formatSigned(commit.cumulativeNet)}
					/>
					<TooltipMetric
						label="Commit delta"
						value={formatSigned(commit.delta)}
					/>
				</div>
			)}
		</Panel>
	);
}

function TooltipMetric({
	label,
	tone,
	value,
}: {
	label: string;
	tone?: string;
	value: string;
}) {
	return (
		<div className="grid gap-0.5">
			<Text variant="caption" tone="muted">
				{label}
			</Text>
			<Text variant="caption" className={tone}>
				{value}
			</Text>
		</div>
	);
}

function ChartCard({
	children,
	description,
	title,
}: {
	children: React.ReactNode;
	description: string;
	title: string;
}) {
	return (
		<Card>
			<Card.Header>
				<Card.Title as="h2">{title}</Card.Title>
				<Card.Description>{description}</Card.Description>
			</Card.Header>
			<Card.Content className="pt-2">{children}</Card.Content>
		</Card>
	);
}

export function CommitHistoryCharts({
	commits,
}: {
	commits: readonly CommitHistoryRecord[];
}) {
	const chartCommits = commits.map((commit) => ({
		...commit,
		removed: -commit.deletions,
	}));
	const startCommit = chartCommits[0];
	const endCommit = chartCommits.at(-1);
	const description =
		startCommit && endCommit
			? `Inspect line changes across this checkout. ${numberFormatter.format(chartCommits.length)} commits · ${formatDate(startCommit.date)} — ${formatDate(endCommit.date)}.`
			: "Inspect line changes across this checkout.";
	const header = (
		<InternalPageHeader
			title="Commit history"
			description={description}
			action={
				<Button
					href="/internal/playground"
					size="sm"
					variant="ghost"
					className="w-fit"
				>
					Back to playground
				</Button>
			}
		/>
	);

	if (chartCommits.length === 0) {
		return (
			<>
				{header}
				<Panel background="muted" border="subtle" padding="md" radius="md">
					<Text variant="body" tone="muted">
						No commit history has been generated yet. Run npm run
						chart:commit-line-delta.
					</Text>
				</Panel>
			</>
		);
	}

	return (
		<>
			{header}
			<div className="grid w-full gap-5">
				<ChartCard
					title="Line delta"
					description="Added lines sit above zero; removed lines sit below it. Each point is one commit."
				>
					<div className="h-80 w-full">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart
								data={chartCommits}
								margin={{ left: 2, right: 12, top: 12 }}
							>
								<CartesianGrid
									stroke="var(--border)"
									strokeDasharray="3 3"
									vertical={false}
								/>
								<XAxis
									axisLine={false}
									dataKey="date"
									minTickGap={46}
									tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
									tickFormatter={formatShortDate}
									tickLine={false}
								/>
								<YAxis
									axisLine={false}
									tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
									tickFormatter={(value) =>
										compactNumberFormatter.format(value)
									}
									tickLine={false}
									width={48}
								/>
								<Tooltip
									content={<CommitTooltip mode="delta" />}
									cursor={{ stroke: "var(--foreground)", strokeOpacity: 0.2 }}
								/>
								<Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
								<Line
									activeDot={{ r: 4 }}
									dataKey="additions"
									dot={{ r: 2 }}
									name="Added"
									stroke="var(--success)"
									strokeWidth={2}
									type="linear"
								/>
								<Line
									activeDot={{ r: 4 }}
									dataKey="removed"
									dot={{ r: 2 }}
									name="Removed"
									stroke="var(--destructive)"
									strokeWidth={2}
									type="linear"
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				</ChartCard>

				<ChartCard
					title="Cumulative net lines"
					description="Running additions minus deletions since the repository's root commit."
				>
					<div className="h-80 w-full">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart
								data={chartCommits}
								margin={{ left: 2, right: 12, top: 12 }}
							>
								<CartesianGrid
									stroke="var(--border)"
									strokeDasharray="3 3"
									vertical={false}
								/>
								<XAxis
									axisLine={false}
									dataKey="date"
									minTickGap={46}
									tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
									tickFormatter={formatShortDate}
									tickLine={false}
								/>
								<YAxis
									axisLine={false}
									tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
									tickFormatter={(value) =>
										compactNumberFormatter.format(value)
									}
									tickLine={false}
									width={48}
								/>
								<Tooltip
									content={<CommitTooltip mode="net" />}
									cursor={{ stroke: "var(--foreground)", strokeOpacity: 0.2 }}
								/>
								<Line
									activeDot={{ r: 4 }}
									dataKey="cumulativeNet"
									dot={{ r: 2 }}
									name="Net lines"
									stroke="var(--primary)"
									strokeWidth={2.5}
									type="linear"
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				</ChartCard>
			</div>
		</>
	);
}
