import fs from "node:fs/promises";
import path from "node:path";

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

export type CodexTurnRecordingReadResult = {
	status: "ready" | "missing";
	path: string;
	events: CodexHookEventV1[];
	turns: CodexTurnSummary[];
	sessions: CodexSessionSummary[];
	invalidLineCount: number;
};

const CODEX_TURN_EVENTS_PATH = path.join(
	process.cwd(),
	".template-intelligence/codex-turn-events.jsonl",
);

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

function isStringArray(value: unknown): value is string[] {
	return (
		Array.isArray(value) && value.every((entry) => typeof entry === "string")
	);
}

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
