"use client";

import { useEffect, useRef, useState } from "react";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Button } from "@/components/ui/primitives/Button";
import { Card, Float, Panel } from "@/components/ui/primitives/surfaces";
import { Text } from "@/components/ui/primitives/Text";
import { InternalPageHeader } from "../../_components/InternalPage";

type FootprintSnapshot = {
	date: string;
	files: number;
	hash: string;
	lines: number;
	subject: string;
	textBytes: number;
	tokens: number;
};

type ChartSnapshot = FootprintSnapshot & {
	index: number;
};

type FootprintTooltipProps = {
	active?: boolean;
	payload?: Array<{ payload?: ChartSnapshot }>;
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

const charts = [
	{
		color: "var(--primary)",
		description: "Physical lines across included authored text files.",
		key: "lines" as const,
		label: "Lines of text",
	},
	{
		color: "var(--success)",
		description: "Raw UTF-8 bytes across included authored text files.",
		key: "textBytes" as const,
		label: "Text bytes",
	},
	{
		color: "var(--foreground)",
		description:
			"Exact OpenAI o200k_base tokens across included authored text files.",
		key: "tokens" as const,
		label: "o200k_base tokens",
	},
];

const minimumVisibleSnapshots = 6;

function formatDate(value: string) {
	return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

function formatShortDate(value: string) {
	return shortDateFormatter.format(new Date(`${value}T00:00:00Z`));
}

function formatMetric(key: (typeof charts)[number]["key"], value: number) {
	if (key === "textBytes") return `${numberFormatter.format(value)} B`;
	return numberFormatter.format(value);
}

function FootprintTooltip({ active, payload }: FootprintTooltipProps) {
	const snapshot = payload?.[0]?.payload;
	if (!active || !snapshot) return null;

	return (
		<Float
			background="panel"
			border="subtle"
			padding="sm"
			className="max-w-80 gap-2"
		>
			<div className="flex items-center justify-between gap-4">
				<Text variant="caption" tone="muted">
					{formatDate(snapshot.date)}
				</Text>
				<Text variant="caption" className="font-mono text-foreground/70">
					{snapshot.hash.slice(0, 7)}
				</Text>
			</div>
			<Text variant="bodyStrong">{snapshot.subject}</Text>
			<div className="grid grid-cols-3 gap-3">
				{charts.map((chart) => (
					<div key={chart.key} className="grid gap-0.5">
						<Text variant="caption" tone="muted">
							{chart.label}
						</Text>
						<Text variant="caption">
							{formatMetric(chart.key, snapshot[chart.key])}
						</Text>
					</div>
				))}
			</div>
		</Float>
	);
}

function getZoomedDomain({
	domain,
	progress,
	scale,
	snapshotCount,
}: {
	domain: [number, number];
	progress: number;
	scale: number;
	snapshotCount: number;
}): [number, number] {
	const [start, end] = domain;
	const maximumSpan = Math.max(0, snapshotCount - 1);
	const minimumSpan = Math.min(minimumVisibleSnapshots - 1, maximumSpan);
	const span = end - start;
	const nextSpan = Math.round(
		Math.min(maximumSpan, Math.max(minimumSpan, span * scale)),
	);
	if (nextSpan === span) return domain;

	const focus = start + span * progress;
	const nextStart = Math.round(
		Math.min(maximumSpan - nextSpan, Math.max(0, focus - nextSpan * progress)),
	);

	return [nextStart, nextStart + nextSpan];
}

function useFootprintZoom(snapshotCount: number) {
	const chartsRef = useRef<HTMLDivElement>(null);
	const [domain, setDomain] = useState<[number, number]>([
		0,
		Math.max(0, snapshotCount - 1),
	]);

	useEffect(() => {
		setDomain([0, Math.max(0, snapshotCount - 1)]);
	}, [snapshotCount]);

	useEffect(() => {
		const chartContainer = chartsRef.current;
		if (!chartContainer || snapshotCount < 2) return;

		function handleWheel(event: WheelEvent) {
			if (!event.ctrlKey) return;

			const target = event.target;
			if (!(target instanceof Element)) return;
			const chart = target.closest<HTMLElement>("[data-footprint-chart]");
			if (!chart) return;

			event.preventDefault();
			const bounds = chart.getBoundingClientRect();
			const progress = Math.min(
				1,
				Math.max(0, (event.clientX - bounds.left) / bounds.width),
			);

			setDomain((currentDomain) =>
				getZoomedDomain({
					domain: currentDomain,
					progress,
					scale: event.deltaY > 0 ? 1.25 : 0.8,
					snapshotCount,
				}),
			);
		}

		chartContainer.addEventListener("wheel", handleWheel, { passive: false });
		return () => chartContainer.removeEventListener("wheel", handleWheel);
	}, [snapshotCount]);

	const maximumSpan = Math.max(0, snapshotCount - 1);
	const minimumSpan = Math.min(minimumVisibleSnapshots - 1, maximumSpan);
	const currentSpan = domain[1] - domain[0];
	const panBy = Math.max(1, Math.round(currentSpan * 0.4));

	return {
		canReset: currentSpan < maximumSpan,
		canPanBackward: domain[0] > 0,
		canPanForward: domain[1] < maximumSpan,
		canZoomIn: currentSpan > minimumSpan,
		canZoomOut: currentSpan < maximumSpan,
		chartsRef,
		domain,
		panBackward: () =>
			setDomain(([start, end]) => {
				const nextStart = Math.max(0, start - panBy);
				return [nextStart, nextStart + (end - start)];
			}),
		panForward: () =>
			setDomain(([start, end]) => {
				const nextEnd = Math.min(maximumSpan, end + panBy);
				return [nextEnd - (end - start), nextEnd];
			}),
		reset: () => setDomain([0, maximumSpan]),
		zoomIn: () =>
			setDomain((currentDomain) =>
				getZoomedDomain({
					domain: currentDomain,
					progress: 0.5,
					scale: 0.8,
					snapshotCount,
				}),
			),
		zoomOut: () =>
			setDomain((currentDomain) =>
				getZoomedDomain({
					domain: currentDomain,
					progress: 0.5,
					scale: 1.25,
					snapshotCount,
				}),
			),
	};
}

function SnapshotChart({
	chart,
	domain,
	snapshots,
}: {
	chart: (typeof charts)[number];
	domain: [number, number];
	snapshots: readonly ChartSnapshot[];
}) {
	return (
		<section className="grid gap-2" data-footprint-chart>
			<div className="grid gap-0.5">
				<Text as="h3" variant="bodyStrong">
					{chart.label}
				</Text>
				<Text variant="caption" tone="muted">
					{chart.description}
				</Text>
			</div>
			<div className="h-52 w-full">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={snapshots}
						margin={{ left: 2, right: 12, top: 12 }}
						syncId="repository-footprint"
					>
						<CartesianGrid
							stroke="var(--border)"
							strokeDasharray="3 3"
							vertical={false}
						/>
						<XAxis
							allowDataOverflow
							axisLine={false}
							dataKey="index"
							domain={domain}
							minTickGap={46}
							tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
							tickFormatter={(index) =>
								formatShortDate(snapshots[index]?.date ?? "")
							}
							tickLine={false}
							type="number"
						/>
						<YAxis
							axisLine={false}
							tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
							tickFormatter={(value) => compactNumberFormatter.format(value)}
							tickLine={false}
							width={54}
						/>
						<Tooltip
							content={<FootprintTooltip />}
							cursor={{ stroke: "var(--foreground)", strokeOpacity: 0.2 }}
						/>
						<Line
							activeDot={{ r: 4 }}
							dataKey={chart.key}
							dot={{ r: 2 }}
							name={chart.label}
							stroke={chart.color}
							strokeWidth={2.25}
							type="linear"
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</section>
	);
}

export function RepositoryFootprintCharts({
	encoding,
	scope,
	snapshots,
}: {
	encoding: string;
	scope: string;
	snapshots: readonly FootprintSnapshot[];
}) {
	const chartSnapshots = snapshots.map((snapshot, index) => ({
		...snapshot,
		index,
	}));
	const {
		canReset,
		canPanBackward,
		canPanForward,
		canZoomIn,
		canZoomOut,
		chartsRef,
		domain,
		panBackward,
		panForward,
		reset,
		zoomIn,
		zoomOut,
	} = useFootprintZoom(chartSnapshots.length);
	const startSnapshot = chartSnapshots[0];
	const endSnapshot = chartSnapshots.at(-1);
	const description =
		startSnapshot && endSnapshot
			? `${numberFormatter.format(chartSnapshots.length)} authored commits · ${formatDate(startSnapshot.date)} — ${formatDate(endSnapshot.date)} · ${scope.replaceAll("-", " ")} · ${encoding}`
			: "No repository footprint has been generated yet.";

	return (
		<>
			<InternalPageHeader
				title="Repository footprint"
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

			{chartSnapshots.length === 0 ? (
				<Panel background="muted" border="subtle" padding="md">
					<Text variant="body" tone="muted">
						No footprint data has been generated yet. Run npm run
						footprint:generate.
					</Text>
				</Panel>
			) : (
				<>
					<fieldset className="m-0 flex min-w-0 flex-wrap justify-end gap-1 border-0 p-0">
						<legend className="sr-only">
							Repository footprint chart controls
						</legend>
						<Button
							aria-label="Zoom in"
							disabled={!canZoomIn}
							leadingIcon="plus"
							onClick={zoomIn}
							size="icon-sm"
							title="Zoom in"
							type="button"
						/>
						<Button
							aria-label="Zoom out"
							disabled={!canZoomOut}
							leadingIcon="minus"
							onClick={zoomOut}
							size="icon-sm"
							title="Zoom out"
							type="button"
						/>
						<Button
							aria-label="Pan backward"
							disabled={!canPanBackward}
							leadingIcon="caret-left"
							onClick={panBackward}
							size="icon-sm"
							title="Pan backward"
							type="button"
						/>
						<Button
							aria-label="Pan forward"
							disabled={!canPanForward}
							leadingIcon="caret-right"
							onClick={panForward}
							size="icon-sm"
							title="Pan forward"
							type="button"
						/>
						<Button
							aria-label="Reset chart view"
							disabled={!canReset}
							leadingIcon="undo"
							onClick={reset}
							size="icon-sm"
							title="Reset chart view"
							type="button"
							variant="ghost"
						/>
					</fieldset>

					<div ref={chartsRef} className="w-full">
						<Card className="w-full">
							<Card.Heading
								description="Three raw-unit views of the same authored repository history. Hover any plot for the shared commit details."
								title="Footprint over time"
								titleAs="h2"
							/>
							<Card.Content className="grid gap-7 pt-4">
								{charts.map((chart) => (
									<SnapshotChart
										chart={chart}
										domain={domain}
										key={chart.key}
										snapshots={chartSnapshots}
									/>
								))}
							</Card.Content>
						</Card>
					</div>
				</>
			)}
		</>
	);
}
