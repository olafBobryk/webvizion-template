// biome-ignore-all assist/source/organizeImports: The dashboard import must remain inside its prune marker block.
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import { StatusMessage } from "@/components/ui/primitives/StatusMessage";
import { Text } from "@/components/ui/primitives/Text";
// prune:dashboard:start
import {
	DashboardDomainChips,
	DashboardDomainOverview,
} from "@/app/(site)/dashboard/_components/intelligence/DashboardDomainIntelligence";
// prune:dashboard:end
import {
	type CodexTurnRecordingReadResult,
	type CodexTurnSummary,
	readCodexTurnRecording,
	readTemplateIntelligenceAgentMap,
	readTemplateIntelligenceBenchmarkExampleRuns,
	readTemplateIntelligenceBenchmarkRuns,
	readTemplateIntelligenceIndex,
	type TemplateIntelligenceBenchmarkRun,
	type TemplateIntelligenceIndex,
} from "@/lib/template-intelligence";
import { InternalPage, InternalPageHeader } from "../_components/InternalPage";
import { BenchmarkRunToggle } from "./BenchmarkRunToggle";

type SearchParams = Promise<
	Record<string, string | string[] | undefined> | undefined
>;

function getViewParam(
	searchParams: Record<string, string | string[] | undefined> | undefined,
) {
	const value = searchParams?.view;
	const view = Array.isArray(value) ? value[0] : value;

	return view === "benchmarks" ? "benchmarks" : "index";
}

function getExampleParam(
	searchParams: Record<string, string | string[] | undefined> | undefined,
) {
	const value = searchParams?.example;
	const example = Array.isArray(value) ? value[0] : value;

	return example === "on" || example === "true" || example === "1";
}

function formatNumber(value: number) {
	return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatDuration(seconds: number | undefined) {
	if (seconds === undefined) return "—";
	if (seconds < 60) return `${formatNumber(seconds)}s`;
	return `${formatNumber(seconds / 60)}m`;
}

function formatTimestamp(value: string | undefined) {
	if (!value) return "Unknown time";
	return new Intl.DateTimeFormat("en", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

function shortId(value: string) {
	return value.length > 12 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;
}

function TurnCard({ turn }: { turn: CodexTurnSummary }) {
	const shellCount = turn.toolCounts.shell ?? 0;
	const editCount = turn.toolCounts["file-edit"] ?? 0;

	return (
		<Card size="sm">
			<Card.Header className="border-b">
				<div className="flex flex-wrap items-start justify-between gap-2">
					<div className="grid gap-1">
						<Card.Title>{turn.observedPath}</Card.Title>
						<Card.Description>
							{formatTimestamp(turn.startedAt ?? turn.completedAt)} · turn{" "}
							{shortId(turn.turnId)}
						</Card.Description>
					</div>
					<Text
						variant="caption"
						tone="muted"
						className={turn.status === "complete" ? undefined : "text-warning"}
					>
						{turn.status}
					</Text>
				</div>
			</Card.Header>
			<Card.Content className="grid gap-4">
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
					<div className="grid gap-1">
						<Text variant="caption" tone="muted">
							Duration
						</Text>
						<Text variant="body">{formatDuration(turn.durationSeconds)}</Text>
					</div>
					<div className="grid gap-1">
						<Text variant="caption" tone="muted">
							Observed tools
						</Text>
						<Text variant="body">{turn.toolCount}</Text>
					</div>
					<div className="grid gap-1">
						<Text variant="caption" tone="muted">
							Shell / edits
						</Text>
						<Text variant="body">
							{shellCount} / {editCount}
						</Text>
					</div>
					<div className="grid gap-1">
						<Text variant="caption" tone="muted">
							Subagents
						</Text>
						<Text variant="body">{turn.subagentCount}</Text>
					</div>
					<div className="grid gap-1">
						<Text variant="caption" tone="muted">
							Model
						</Text>
						<Text variant="body">{turn.model ?? "Unknown"}</Text>
					</div>
				</div>
				{/* prune:dashboard:start */}
				<DashboardDomainChips editedPaths={turn.editedPaths} />
				{/* prune:dashboard:end */}
				{turn.editedPaths.length > 0 ? (
					<div className="grid gap-1">
						<Text variant="caption" tone="muted">
							Observed edited files
						</Text>
						<Text variant="caption">{turn.editedPaths.join(", ")}</Text>
					</div>
				) : null}
			</Card.Content>
		</Card>
	);
}

function MissingIndexState({ path }: { path: string }) {
	return (
		<InternalPage>
			<InternalPageHeader
				title="Template Intelligence"
				description="The generated repository index is not available yet."
			/>

			<Card>
				<Card.Content>
					<Text variant="body">
						Run <code>npm run intelligence:generate</code> to create{" "}
						<code>{path}</code>.
					</Text>
				</Card.Content>
			</Card>
		</InternalPage>
	);
}

function ReadyState({
	index,
	agentMapResult,
}: {
	index: TemplateIntelligenceIndex;
	agentMapResult: Awaited<ReturnType<typeof readTemplateIntelligenceAgentMap>>;
}) {
	return (
		<InternalPage className="gap-8 text-center">
			<InternalPageHeader
				className="mx-auto items-center"
				title="Template Intelligence"
				description="Generated map of the template surfaces to inspect before changing shared code."
			/>

			<div className="grid w-full gap-4 sm:grid-cols-2 md:grid-cols-4">
				<Card size="sm">
					<Card.Content className="grid gap-1">
						<Text variant="caption" tone="muted">
							Files indexed
						</Text>
						<Text as="p" variant="headingMd">
							{index.fileCount}
						</Text>
					</Card.Content>
				</Card>
				<Card size="sm">
					<Card.Content className="grid gap-1">
						<Text variant="caption" tone="muted">
							Concept groups
						</Text>
						<Text as="p" variant="headingMd">
							{index.conceptCount}
						</Text>
					</Card.Content>
				</Card>
				<Card size="sm">
					<Card.Content className="grid gap-1">
						<Text variant="caption" tone="muted">
							Relationships
						</Text>
						<Text as="p" variant="headingMd">
							{index.relationships.length}
						</Text>
					</Card.Content>
				</Card>
				<Card size="sm">
					<Card.Content className="grid gap-1">
						<Text variant="caption" tone="muted">
							Task topics
						</Text>
						<Text as="p" variant="headingMd">
							{agentMapResult.status === "ready"
								? agentMapResult.agentMap.topics.length
								: 0}
						</Text>
					</Card.Content>
				</Card>
			</div>

			<Card className="mx-auto max-w-3xl text-center">
				<Card.Header className="border-b">
					<Card.Title>Codex turn recording</Card.Title>
					<Card.Description>
						Inspect automatically observed local sessions and turns without
						manual worker recording.
					</Card.Description>
				</Card.Header>
				<Card.Content className="flex justify-center">
					<Button
						href="/internal/intelligence?view=benchmarks"
						variant="secondary"
						size="md"
						className="mx-auto w-fit"
					>
						View recordings
					</Button>
				</Card.Content>
			</Card>
		</InternalPage>
	);
}

function BenchmarkState({
	legacyRuns,
	legacyInvalidLineCount,
	recording,
	exampleRuns,
	exampleInvalidLineCount,
	isExample,
}: {
	legacyRuns: TemplateIntelligenceBenchmarkRun[];
	legacyInvalidLineCount: number;
	recording: CodexTurnRecordingReadResult;
	exampleRuns: TemplateIntelligenceBenchmarkRun[];
	exampleInvalidLineCount: number;
	isExample: boolean;
}) {
	const completedTurns = recording.turns.filter(
		(turn) => turn.status === "complete",
	).length;
	const incompleteTurns = recording.turns.length - completedTurns;
	const recentTurns = recording.turns.slice(0, 20);

	return (
		<InternalPage>
			<InternalPageHeader
				title="Codex Turn Recording"
				description="Privacy-safe local evidence from trusted Codex lifecycle hooks."
				action={
					<Button
						href="/internal/intelligence"
						variant="ghost"
						size="sm"
						className="w-fit"
					>
						Back to overview
					</Button>
				}
			/>

			<BenchmarkRunToggle isExample={isExample} />

			{isExample ? (
				<>
					<StatusMessage>
						Placeholder data is shown for visual QA only. It is never loaded as
						recorded activity or benchmark history.
					</StatusMessage>
					{exampleInvalidLineCount > 0 ? (
						<StatusMessage tone="warning">
							{exampleInvalidLineCount} malformed fixture{" "}
							{exampleInvalidLineCount === 1 ? "line was" : "lines were"}{" "}
							ignored.
						</StatusMessage>
					) : null}
					<div className="grid gap-4 lg:grid-cols-2">
						{exampleRuns.map((run) => (
							<Card key={`${run.taskId}:${run.strategy}`} size="sm">
								<Card.Header className="border-b">
									<Card.Title>{run.strategy}</Card.Title>
									<Card.Description>{run.taskName}</Card.Description>
								</Card.Header>
								<Card.Content>
									<Text variant="caption" tone="muted">
										{run.shellCommands} shell · {run.semanticCalls} semantic ·{" "}
										{run.lookupActions} lookup actions
									</Text>
								</Card.Content>
							</Card>
						))}
					</div>
				</>
			) : (
				<>
					{recording.invalidLineCount > 0 ? (
						<StatusMessage tone="warning">
							{recording.invalidLineCount} malformed local event{" "}
							{recording.invalidLineCount === 1 ? "line was" : "lines were"}{" "}
							ignored.
						</StatusMessage>
					) : null}
					{legacyInvalidLineCount > 0 ? (
						<StatusMessage tone="warning">
							{legacyInvalidLineCount} malformed legacy observation{" "}
							{legacyInvalidLineCount === 1 ? "line was" : "lines were"}{" "}
							ignored.
						</StatusMessage>
					) : null}
					<div className="grid w-full gap-2 sm:grid-cols-3 sm:gap-4">
						<Card className="min-w-0 w-full" size="sm">
							<Card.Content className="grid gap-1">
								<Text variant="caption" tone="muted">
									Recorded sessions
								</Text>
								<Text as="p" variant="headingMd">
									{recording.sessions.length}
								</Text>
							</Card.Content>
						</Card>
						<Card className="min-w-0 w-full" size="sm">
							<Card.Content className="grid gap-1">
								<Text variant="caption" tone="muted">
									Completed turns
								</Text>
								<Text as="p" variant="headingMd">
									{completedTurns}
								</Text>
							</Card.Content>
						</Card>
						<Card className="min-w-0 w-full" size="sm">
							<Card.Content className="grid gap-1">
								<Text variant="caption" tone="muted">
									Open or partial
								</Text>
								<Text as="p" variant="headingMd">
									{incompleteTurns}
								</Text>
							</Card.Content>
						</Card>
					</div>
					<Text variant="caption" tone="muted">
						Tool totals include only local paths observed by Codex hooks. Hosted
						tools outside those hooks are excluded.
					</Text>
					{/* prune:dashboard:start */}
					<DashboardDomainOverview turns={recording.turns} />
					{/* prune:dashboard:end */}

					{recording.status === "missing" || recording.turns.length === 0 ? (
						<Card>
							<Card.Content className="grid gap-1">
								<Card.Title>No local Codex turns recorded yet</Card.Title>
								<Card.Description>
									Trust the repository hook, then start a new Codex turn. Events
									will be written automatically to <code>{recording.path}</code>
									.
								</Card.Description>
							</Card.Content>
						</Card>
					) : (
						<div className="grid gap-4">
							{recentTurns.map((turn) => (
								<TurnCard key={turn.id} turn={turn} />
							))}
						</div>
					)}

					<Card>
						<Card.Header className="border-b">
							<Card.Title>Curated legacy observations</Card.Title>
							<Card.Description>
								Historical self-reported rows are preserved for review and never
								mixed with automatic turn telemetry or strategy rankings.
							</Card.Description>
						</Card.Header>
						<Card.Content className="grid gap-1">
							<Text variant="headingMd">{legacyRuns.length}</Text>
							<Text variant="caption" tone="muted">
								Unique historical observations with source provenance.
							</Text>
						</Card.Content>
					</Card>
				</>
			)}
		</InternalPage>
	);
}

export default async function TemplateIntelligencePage({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	const resolvedSearchParams = await searchParams;
	const view = getViewParam(resolvedSearchParams);

	if (view === "benchmarks") {
		const isExample = getExampleParam(resolvedSearchParams);
		const [legacyResult, recording, exampleResult] = await Promise.all([
			readTemplateIntelligenceBenchmarkRuns(),
			readCodexTurnRecording(),
			readTemplateIntelligenceBenchmarkExampleRuns(),
		]);

		return (
			<BenchmarkState
				legacyRuns={legacyResult.runs}
				legacyInvalidLineCount={legacyResult.invalidLineCount}
				recording={recording}
				exampleRuns={exampleResult.runs}
				exampleInvalidLineCount={exampleResult.invalidLineCount}
				isExample={isExample}
			/>
		);
	}

	const [indexResult, agentMapResult] = await Promise.all([
		readTemplateIntelligenceIndex(),
		readTemplateIntelligenceAgentMap(),
	]);

	if (indexResult.status === "missing") {
		return <MissingIndexState path={indexResult.path} />;
	}

	return (
		<ReadyState index={indexResult.index} agentMapResult={agentMapResult} />
	);
}
