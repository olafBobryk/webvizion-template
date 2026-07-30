import fs from "node:fs/promises";
import path from "node:path";

export type TemplateIntelligenceBenchmarkRun = {
	schemaVersion: 1 | 2 | 3;
	recordKind?: "executed-run";
	runId?: string;
	strategyDefinitionVersion?: number;
	date: string;
	project: string;
	taskId: string;
	taskName: string;
	strategy: string;
	benchmarkMode?: string;
	shellCommands: number;
	semanticCalls: number;
	lookupActions: number;
	correctness?: number;
	measurementSource?: string;
	sourceCommand?: string;
	scenarioId?: string;
	resolution?: string;
	runGroupId?: string;
	taskClass?: string;
	beforeCommit?: string;
	afterCommit?: string;
	setupSeconds?: number;
	buildSeconds?: number;
	querySeconds?: number;
	outputBytes?: number;
	graphNodes?: number;
	graphEdges?: number;
	graphQueries?: number;
	suggestedFiles?: string[];
	actualFiles?: string[];
	missedFiles?: string[];
	unnecessaryFiles?: string[];
	fallbacksUsed?: string[];
	elapsedSeconds?: number;
	wrongTurns?: number;
	generatedArtifactMistakes?: number;
	notes?: string;
	evidenceClass?: "legacy-observation";
	evidenceQuality?: "historical-self-reported";
	sourceRepository?: string;
	sourceCommit?: string;
};

export type TemplateIntelligenceBenchmarkReadResult =
	| {
			status: "ready";
			path: string;
			runs: TemplateIntelligenceBenchmarkRun[];
			invalidLineCount: number;
	  }
	| {
			status: "missing";
			path: string;
			runs: [];
			invalidLineCount: 0;
	  };

const BENCHMARK_RUNS_PATH = path.join(
	process.cwd(),
	"src/lib/template-intelligence/fixtures/template-intelligence-benchmark-runs.jsonl",
);
const BENCHMARK_EXAMPLE_RUNS_PATH = path.join(
	process.cwd(),
	"src/lib/template-intelligence/fixtures/template-intelligence-benchmark-runs.example.jsonl",
);

function isNonNegativeNumber(value: unknown): value is number {
	return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function hasValidExecutedRunEvidence(
	candidate: Partial<TemplateIntelligenceBenchmarkRun>,
) {
	if (candidate.schemaVersion !== 3) return true;

	if (
		candidate.benchmarkMode === "triple-run" &&
		(!candidate.runGroupId || !candidate.scenarioId)
	) {
		return false;
	}
	if (candidate.runGroupId && !candidate.scenarioId) return false;

	switch (candidate.strategy) {
		case "Control":
		case "TemplateMap":
			return candidate.semanticCalls === 0 && !candidate.graphQueries;
		case "TemplateSerena":
			return (candidate.semanticCalls ?? 0) > 0 && !candidate.graphQueries;
		case "Graphify":
			return (
				(candidate.graphQueries ?? 0) > 0 &&
				(candidate.outputBytes ?? 0) > 0 &&
				isNonNegativeNumber(candidate.buildSeconds) &&
				isNonNegativeNumber(candidate.querySeconds)
			);
		default:
			return false;
	}
}

function isTemplateIntelligenceBenchmarkRun(
	value: unknown,
): value is TemplateIntelligenceBenchmarkRun {
	if (!value || typeof value !== "object") return false;

	const candidate = value as Partial<TemplateIntelligenceBenchmarkRun>;
	const correctness = candidate.correctness;
	const isLegacy =
		candidate.schemaVersion === 1 || candidate.schemaVersion === 2;
	const isExecutedRun =
		candidate.schemaVersion === 3 &&
		candidate.recordKind === "executed-run" &&
		typeof candidate.runId === "string" &&
		candidate.runId.length > 0 &&
		candidate.strategyDefinitionVersion === 1 &&
		typeof candidate.measurementSource === "string" &&
		typeof candidate.sourceCommand === "string";
	const hasValidCorrectness =
		correctness === undefined ||
		(isNonNegativeNumber(correctness) && correctness <= 3);

	return (
		(isLegacy || isExecutedRun) &&
		typeof candidate.date === "string" &&
		typeof candidate.project === "string" &&
		typeof candidate.taskId === "string" &&
		typeof candidate.taskName === "string" &&
		typeof candidate.strategy === "string" &&
		isNonNegativeNumber(candidate.shellCommands) &&
		isNonNegativeNumber(candidate.semanticCalls) &&
		isNonNegativeNumber(candidate.lookupActions) &&
		hasValidCorrectness &&
		(!isLegacy || correctness !== undefined) &&
		hasValidExecutedRunEvidence(candidate)
	);
}

async function readTemplateIntelligenceBenchmarkJsonl(
	filePath: string,
	relativePath: string,
): Promise<TemplateIntelligenceBenchmarkReadResult> {
	const raw = await fs.readFile(filePath, "utf8").catch(() => null);

	if (raw === null) {
		return {
			status: "missing",
			path: relativePath,
			runs: [],
			invalidLineCount: 0,
		};
	}

	const runs: TemplateIntelligenceBenchmarkRun[] = [];
	let invalidLineCount = 0;

	for (const line of raw.split(/\r?\n/)) {
		const trimmedLine = line.trim();
		if (!trimmedLine) continue;

		try {
			const parsed = JSON.parse(trimmedLine) as unknown;
			if (isTemplateIntelligenceBenchmarkRun(parsed)) {
				runs.push(parsed);
			} else {
				invalidLineCount += 1;
			}
		} catch {
			invalidLineCount += 1;
		}
	}

	return {
		status: "ready",
		path: relativePath,
		runs,
		invalidLineCount,
	};
}

export async function readTemplateIntelligenceBenchmarkRuns(): Promise<TemplateIntelligenceBenchmarkReadResult> {
	return readTemplateIntelligenceBenchmarkJsonl(
		BENCHMARK_RUNS_PATH,
		"src/lib/template-intelligence/fixtures/template-intelligence-benchmark-runs.jsonl",
	);
}

export async function readTemplateIntelligenceBenchmarkExampleRuns(): Promise<TemplateIntelligenceBenchmarkReadResult> {
	return readTemplateIntelligenceBenchmarkJsonl(
		BENCHMARK_EXAMPLE_RUNS_PATH,
		"src/lib/template-intelligence/fixtures/template-intelligence-benchmark-runs.example.jsonl",
	);
}
