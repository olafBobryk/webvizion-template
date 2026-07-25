import { Button } from "@/components/ui/primitives/Button";
import { Section } from "@/components/ui/primitives/Section";
import { Text } from "@/components/ui/primitives/Text";
import {
	type CodexTurnSummary,
	readCodexTurnRecording,
	readTemplateIntelligenceAgentMap,
	readTemplateIntelligenceBenchmarkExampleRuns,
	readTemplateIntelligenceBenchmarkRuns,
	readTemplateIntelligenceIndex,
} from "@/lib/template-intelligence";
import { InternalCard } from "./_components/InternalCard";
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

function shortId(value: string) {
	return value.length > 12 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;
}

function ThinTurnCard({ turn }: { turn: CodexTurnSummary }) {
	return (
		<InternalCard className="grid gap-3">
			<div className="flex flex-wrap items-start justify-between gap-2">
				<div className="grid gap-1">
					<Text as="h2" variant="heading" className="text-xl">
						{turn.observedPath}
					</Text>
					<Text variant="support" tone="muted">
						Turn {shortId(turn.turnId)}
					</Text>
				</div>
				<Text variant="support" tone="muted">
					{turn.status}
				</Text>
			</div>
			<Text tone="muted">
				{turn.toolCount} observed tools · {turn.subagentCount} subagents ·{" "}
				{turn.model ?? "Unknown model"}
			</Text>
			{turn.editedPaths.length > 0 ? (
				<Text variant="support" className="break-words">
					{turn.editedPaths.join(", ")}
				</Text>
			) : null}
		</InternalCard>
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
		const completedTurns = recording.turns.filter(
			(turn) => turn.status === "complete",
		).length;

		return (
			<main>
				<Section padding="hero">
					<div className="mx-auto grid max-w-section-max gap-6">
						<header className="grid gap-3">
							<Text as="h1" variant="heading">
								Codex Turn Recording
							</Text>
							<Text tone="muted">
								Privacy-safe local evidence from trusted Codex lifecycle hooks.
							</Text>
						</header>
						<div className="flex flex-wrap gap-3">
							<Button href="/internal/intelligence" variant="ghost">
								Overview
							</Button>
							<BenchmarkRunToggle isExample={isExample} />
						</div>

						{isExample ? (
							<>
								<InternalCard className="grid gap-2">
									<Text as="h2" variant="heading" className="text-xl">
										Visual fixture only
									</Text>
									<Text tone="muted">
										{exampleResult.runs.length} placeholder rows are shown for
										presentation review and are never treated as recorded
										activity.
									</Text>
								</InternalCard>
								<div className="grid gap-4 md:grid-cols-2">
									{exampleResult.runs.map((run) => (
										<InternalCard
											className="grid gap-1"
											key={`${run.taskId}:${run.strategy}`}
										>
											<Text as="h2" variant="heading" className="text-xl">
												{run.strategy}
											</Text>
											<Text tone="muted">{run.taskName}</Text>
										</InternalCard>
									))}
								</div>
							</>
						) : (
							<>
								<div className="grid gap-4 sm:grid-cols-3">
									<InternalCard className="grid gap-1">
										<Text variant="support" tone="muted">
											Recorded sessions
										</Text>
										<Text as="p" variant="heading" className="text-2xl">
											{recording.sessions.length}
										</Text>
									</InternalCard>
									<InternalCard className="grid gap-1">
										<Text variant="support" tone="muted">
											Completed turns
										</Text>
										<Text as="p" variant="heading" className="text-2xl">
											{completedTurns}
										</Text>
									</InternalCard>
									<InternalCard className="grid gap-1">
										<Text variant="support" tone="muted">
											Open or partial
										</Text>
										<Text as="p" variant="heading" className="text-2xl">
											{recording.turns.length - completedTurns}
										</Text>
									</InternalCard>
								</div>
								<Text variant="support" tone="muted">
									Tool totals include only local activity observed by Codex
									hooks; hosted tools remain outside these totals.
								</Text>
								{recording.turns.length === 0 ? (
									<InternalCard className="grid gap-2">
										<Text as="h2" variant="heading" className="text-xl">
											No local Codex turns recorded yet
										</Text>
										<Text tone="muted">
											Trust the repository hook, then start a new Codex turn.
										</Text>
									</InternalCard>
								) : (
									<div className="grid gap-4">
										{recording.turns.slice(0, 20).map((turn) => (
											<ThinTurnCard key={turn.id} turn={turn} />
										))}
									</div>
								)}
								<InternalCard className="grid gap-1">
									<Text as="h2" variant="heading" className="text-xl">
										Curated legacy observations
									</Text>
									<Text tone="muted">
										{legacyResult.runs.length} historical self-reported rows
										remain separate from automatic turn telemetry.
									</Text>
								</InternalCard>
							</>
						)}
					</div>
				</Section>
			</main>
		);
	}

	const [indexResult, agentMapResult] = await Promise.all([
		readTemplateIntelligenceIndex(),
		readTemplateIntelligenceAgentMap(),
	]);

	return (
		<main>
			<Section padding="hero">
				<div className="mx-auto grid max-w-section-max gap-6">
					<header className="grid gap-3">
						<Text as="h1" variant="heading">
							Template Intelligence
						</Text>
						<Text tone="muted">
							Minimal route-owned intelligence summary for thin-start.
						</Text>
					</header>
					<div className="flex gap-3">
						<Button
							href="/internal/intelligence?view=benchmarks"
							variant="ghost"
						>
							Recordings
						</Button>
					</div>
					<div className="grid gap-4 md:grid-cols-3">
						<InternalCard>
							<Text variant="support" tone="muted">
								Index
							</Text>
							<Text as="p" variant="heading" className="text-2xl">
								{indexResult.status}
							</Text>
						</InternalCard>
						<InternalCard>
							<Text variant="support" tone="muted">
								Files
							</Text>
							<Text as="p" variant="heading" className="text-2xl">
								{indexResult.status === "ready"
									? indexResult.index.files.length
									: 0}
							</Text>
						</InternalCard>
						<InternalCard>
							<Text variant="support" tone="muted">
								Agent map
							</Text>
							<Text as="p" variant="heading" className="text-2xl">
								{agentMapResult.status}
							</Text>
						</InternalCard>
					</div>
				</div>
			</Section>
		</main>
	);
}
