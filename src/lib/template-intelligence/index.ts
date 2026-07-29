import fs from "node:fs/promises";
import path from "node:path";

export type TemplateIntelligenceFile = {
	path: string;
	title: string;
	sourceType: string;
	size: number;
	lines: number;
	conceptIds: string[];
	excerpt: string;
};

export type TemplateIntelligenceConcept = {
	id: string;
	title: string;
	summary: string;
	fileCount: number;
	sourceTypes: string[];
};

export type TemplateIntelligenceRelationship = {
	source: string;
	target: string;
	weight: number;
	sharedFiles: string[];
};

export type TemplateIntelligenceAgentMapTopic = {
	id: string;
	title: string;
	aliases: string[];
	paths: string[];
	notes: string;
};

export type TemplateIntelligenceAgentMap = {
	schemaVersion: 1;
	project: string;
	generator: string;
	artifact: string;
	topics: TemplateIntelligenceAgentMapTopic[];
};

export type TemplateIntelligenceIndex = {
	schemaVersion: 1;
	project: string;
	generator: string;
	artifact: string;
	fileCount: number;
	conceptCount: number;
	files: TemplateIntelligenceFile[];
	concepts: TemplateIntelligenceConcept[];
	relationships: TemplateIntelligenceRelationship[];
};

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

export type CodexHookEventName =
	| "SessionStart"
	| "UserPromptSubmit"
	| "PostToolUse"
	| "SubagentStart"
	| "SubagentStop"
	| "Stop";

export type CodexActivitySignal =
	| "direct-search"
	| "template-map"
	| "serena"
	| "graphify";

export type CodexObservedPath =
	| "Control"
	| "TemplateMap"
	| "TemplateSerena"
	| "Graphify"
	| "Serena-only"
	| "Mixed";

export type CodexHookEventV1 = {
	schemaVersion: 1;
	recordKind: "codex-hook-event";
	eventId: string;
	recordedAt: string;
	sessionId: string;
	eventName: CodexHookEventName;
	turnId?: string;
	model?: string;
	permissionMode?: string;
	source?: "startup" | "resume" | "clear" | "compact";
	toolCategory?:
		| "shell"
		| "file-edit"
		| "mcp"
		| "subagent-control"
		| "local-tool";
	activitySignals?: CodexActivitySignal[];
	editedPaths?: string[];
	agentId?: string;
	agentType?: string;
};

export type CodexTurnSummary = {
	id: string;
	sessionId: string;
	turnId: string;
	status: "complete" | "open" | "partial";
	startedAt?: string;
	completedAt?: string;
	durationSeconds?: number;
	model?: string;
	permissionMode?: string;
	toolCount: number;
	toolCounts: Record<string, number>;
	subagentCount: number;
	activitySignals: CodexActivitySignal[];
	observedPath: CodexObservedPath;
	editedPaths: string[];
};

export type CodexSessionSummary = {
	sessionId: string;
	firstSeenAt: string;
	lastSeenAt: string;
	startSources: string[];
	turnCount: number;
	completedTurnCount: number;
	openTurnCount: number;
};

export type TemplateIntelligenceReadResult =
	| {
			status: "ready";
			index: TemplateIntelligenceIndex;
	  }
	| {
			status: "missing";
			path: string;
	  };

export type TemplateIntelligenceAgentMapReadResult =
	| {
			status: "ready";
			agentMap: TemplateIntelligenceAgentMap;
	  }
	| {
			status: "missing";
			path: string;
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

export type CodexTurnRecordingReadResult = {
	status: "ready" | "missing";
	path: string;
	events: CodexHookEventV1[];
	turns: CodexTurnSummary[];
	sessions: CodexSessionSummary[];
	invalidLineCount: number;
};

const INTELLIGENCE_INDEX_PATH = path.join(
	process.cwd(),
	".template-intelligence/index.json",
);
const INTELLIGENCE_AGENT_MAP_PATH = path.join(
	process.cwd(),
	".template-intelligence/agent-map.json",
);
const BENCHMARK_RUNS_PATH = path.join(
	process.cwd(),
	"src/lib/template-intelligence/fixtures/template-intelligence-benchmark-runs.jsonl",
);
const BENCHMARK_EXAMPLE_RUNS_PATH = path.join(
	process.cwd(),
	"src/lib/template-intelligence/fixtures/template-intelligence-benchmark-runs.example.jsonl",
);
const CODEX_TURN_EVENTS_PATH = path.join(
	process.cwd(),
	".template-intelligence/codex-turn-events.jsonl",
);

function isTemplateIntelligenceIndex(
	value: unknown,
): value is TemplateIntelligenceIndex {
	if (!value || typeof value !== "object") return false;

	const candidate = value as Partial<TemplateIntelligenceIndex>;

	return (
		candidate.schemaVersion === 1 &&
		Array.isArray(candidate.files) &&
		Array.isArray(candidate.concepts) &&
		Array.isArray(candidate.relationships)
	);
}

function isTemplateIntelligenceAgentMap(
	value: unknown,
): value is TemplateIntelligenceAgentMap {
	if (!value || typeof value !== "object") return false;

	const candidate = value as Partial<TemplateIntelligenceAgentMap>;

	return candidate.schemaVersion === 1 && Array.isArray(candidate.topics);
}

function isNonNegativeNumber(value: unknown): value is number {
	return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isStringArray(value: unknown): value is string[] {
	return (
		Array.isArray(value) && value.every((entry) => typeof entry === "string")
	);
}

const CODEX_HOOK_EVENT_NAMES = new Set<CodexHookEventName>([
	"SessionStart",
	"UserPromptSubmit",
	"PostToolUse",
	"SubagentStart",
	"SubagentStop",
	"Stop",
]);

const CODEX_ACTIVITY_SIGNALS = new Set<CodexActivitySignal>([
	"direct-search",
	"template-map",
	"serena",
	"graphify",
]);

function isCodexHookEvent(value: unknown): value is CodexHookEventV1 {
	if (!value || typeof value !== "object") return false;
	const candidate = value as Partial<CodexHookEventV1>;
	if (
		candidate.schemaVersion !== 1 ||
		candidate.recordKind !== "codex-hook-event" ||
		typeof candidate.eventId !== "string" ||
		typeof candidate.recordedAt !== "string" ||
		!Number.isFinite(Date.parse(candidate.recordedAt)) ||
		typeof candidate.sessionId !== "string" ||
		!CODEX_HOOK_EVENT_NAMES.has(candidate.eventName as CodexHookEventName)
	) {
		return false;
	}

	if (candidate.eventName !== "SessionStart" && !candidate.turnId) return false;
	if (
		candidate.activitySignals !== undefined &&
		(!isStringArray(candidate.activitySignals) ||
			!candidate.activitySignals.every((signal) =>
				CODEX_ACTIVITY_SIGNALS.has(signal as CodexActivitySignal),
			))
	) {
		return false;
	}
	if (
		candidate.editedPaths !== undefined &&
		!isStringArray(candidate.editedPaths)
	) {
		return false;
	}

	return true;
}

export function deriveCodexObservedPath(
	signals: Iterable<CodexActivitySignal>,
): CodexObservedPath {
	const observed = new Set(signals);
	const hasTemplateMap = observed.has("template-map");
	const hasSerena = observed.has("serena");
	const hasGraphify = observed.has("graphify");

	if (hasGraphify && (hasTemplateMap || hasSerena)) return "Mixed";
	if (hasGraphify) return "Graphify";
	if (hasTemplateMap && hasSerena) return "TemplateSerena";
	if (hasTemplateMap) return "TemplateMap";
	if (hasSerena) return "Serena-only";
	return "Control";
}

export function aggregateCodexHookEvents(events: CodexHookEventV1[]) {
	const uniqueEvents = [
		...new Map(events.map((event) => [event.eventId, event])).values(),
	].sort((left, right) => left.recordedAt.localeCompare(right.recordedAt));
	const turns = new Map<
		string,
		{
			summary: CodexTurnSummary;
			subagentIds: Set<string>;
			signals: Set<CodexActivitySignal>;
			editedPaths: Set<string>;
		}
	>();

	for (const event of uniqueEvents) {
		if (!event.turnId) continue;
		const id = `${event.sessionId}:${event.turnId}`;
		const existing = turns.get(id) ?? {
			summary: {
				id,
				sessionId: event.sessionId,
				turnId: event.turnId,
				status: "partial" as const,
				toolCount: 0,
				toolCounts: {},
				subagentCount: 0,
				activitySignals: [],
				observedPath: "Control" as const,
				editedPaths: [],
			},
			subagentIds: new Set<string>(),
			signals: new Set<CodexActivitySignal>(),
			editedPaths: new Set<string>(),
		};
		const { summary } = existing;

		if (event.eventName === "UserPromptSubmit") {
			summary.startedAt = summary.startedAt ?? event.recordedAt;
		}
		if (event.eventName === "Stop") summary.completedAt = event.recordedAt;
		if (event.model) summary.model = event.model;
		if (event.permissionMode) summary.permissionMode = event.permissionMode;

		if (event.eventName === "PostToolUse") {
			summary.toolCount += 1;
			const category = event.toolCategory ?? "local-tool";
			summary.toolCounts[category] = (summary.toolCounts[category] ?? 0) + 1;
			for (const signal of event.activitySignals ?? []) {
				existing.signals.add(signal);
			}
			for (const editedPath of event.editedPaths ?? []) {
				existing.editedPaths.add(editedPath);
			}
		}
		if (event.agentId) existing.subagentIds.add(event.agentId);
		turns.set(id, existing);
	}

	const turnSummaries = [...turns.values()].map((entry) => {
		const { summary } = entry;
		if (summary.startedAt && summary.completedAt) {
			summary.status = "complete";
			summary.durationSeconds = Math.max(
				0,
				(Date.parse(summary.completedAt) - Date.parse(summary.startedAt)) /
					1000,
			);
		} else if (summary.startedAt) {
			summary.status = "open";
		}
		summary.subagentCount = entry.subagentIds.size;
		summary.activitySignals = [...entry.signals].sort();
		summary.observedPath = deriveCodexObservedPath(entry.signals);
		summary.editedPaths = [...entry.editedPaths].sort();
		return summary;
	});

	turnSummaries.sort((left, right) => {
		const leftTime = left.startedAt ?? left.completedAt ?? "";
		const rightTime = right.startedAt ?? right.completedAt ?? "";
		return rightTime.localeCompare(leftTime);
	});

	const sessionEvents = new Map<string, CodexHookEventV1[]>();
	for (const event of uniqueEvents) {
		const current = sessionEvents.get(event.sessionId) ?? [];
		current.push(event);
		sessionEvents.set(event.sessionId, current);
	}
	const sessions = [...sessionEvents.entries()].map(([sessionId, entries]) => {
		const sessionTurns = turnSummaries.filter(
			(turn) => turn.sessionId === sessionId,
		);
		return {
			sessionId,
			firstSeenAt: entries[0]?.recordedAt ?? "",
			lastSeenAt: entries.at(-1)?.recordedAt ?? "",
			startSources: [
				...new Set(
					entries
						.filter((event) => event.eventName === "SessionStart")
						.map((event) => event.source)
						.filter(
							(source): source is NonNullable<CodexHookEventV1["source"]> =>
								Boolean(source),
						),
				),
			],
			turnCount: sessionTurns.length,
			completedTurnCount: sessionTurns.filter(
				(turn) => turn.status === "complete",
			).length,
			openTurnCount: sessionTurns.filter((turn) => turn.status !== "complete")
				.length,
		};
	});
	sessions.sort((left, right) =>
		right.lastSeenAt.localeCompare(left.lastSeenAt),
	);

	return { events: uniqueEvents, turns: turnSummaries, sessions };
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

export async function readTemplateIntelligenceIndex(): Promise<TemplateIntelligenceReadResult> {
	const raw = await fs
		.readFile(INTELLIGENCE_INDEX_PATH, "utf8")
		.catch(() => null);

	if (!raw) {
		return {
			status: "missing",
			path: ".template-intelligence/index.json",
		};
	}

	const parsed = JSON.parse(raw) as unknown;

	if (!isTemplateIntelligenceIndex(parsed)) {
		throw new Error("Template intelligence index has an invalid shape.");
	}

	return {
		status: "ready",
		index: parsed,
	};
}

export async function readTemplateIntelligenceAgentMap(): Promise<TemplateIntelligenceAgentMapReadResult> {
	const raw = await fs
		.readFile(INTELLIGENCE_AGENT_MAP_PATH, "utf8")
		.catch(() => null);

	if (!raw) {
		return {
			status: "missing",
			path: ".template-intelligence/agent-map.json",
		};
	}

	const parsed = JSON.parse(raw) as unknown;

	if (!isTemplateIntelligenceAgentMap(parsed)) {
		throw new Error("Template intelligence agent map has an invalid shape.");
	}

	return {
		status: "ready",
		agentMap: parsed,
	};
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

export async function readCodexTurnRecording(): Promise<CodexTurnRecordingReadResult> {
	const raw = await fs
		.readFile(CODEX_TURN_EVENTS_PATH, "utf8")
		.catch(() => null);
	if (raw === null) {
		return {
			status: "missing",
			path: ".template-intelligence/codex-turn-events.jsonl",
			events: [],
			turns: [],
			sessions: [],
			invalidLineCount: 0,
		};
	}

	const events: CodexHookEventV1[] = [];
	let invalidLineCount = 0;
	for (const line of raw.split(/\r?\n/)) {
		const trimmedLine = line.trim();
		if (!trimmedLine) continue;
		try {
			const parsed = JSON.parse(trimmedLine) as unknown;
			if (isCodexHookEvent(parsed)) events.push(parsed);
			else invalidLineCount += 1;
		} catch {
			invalidLineCount += 1;
		}
	}

	const aggregated = aggregateCodexHookEvents(events);
	return {
		status: "ready",
		path: ".template-intelligence/codex-turn-events.jsonl",
		...aggregated,
		invalidLineCount,
	};
}
