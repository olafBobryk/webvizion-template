#!/usr/bin/env node

import path from "node:path";
import process from "node:process";
import {
	appendExecutedBenchmarkRun,
	createExecutedBenchmarkRun,
	VALID_BENCHMARK_MODES,
	VALID_RESOLUTIONS,
	VALID_STRATEGIES,
} from "./lib/template-intelligence-benchmark.mjs";

const ROOT = process.cwd();

function parseArgs(argv) {
	const values = new Map();

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (!arg.startsWith("--")) continue;

		const [key, inlineValue] = arg.slice(2).split("=");
		const nextValue = inlineValue ?? argv[index + 1];
		if (inlineValue === undefined) index += 1;

		const currentValue = values.get(key);
		if (currentValue === undefined) values.set(key, nextValue);
		else if (Array.isArray(currentValue)) currentValue.push(nextValue);
		else values.set(key, [currentValue, nextValue]);
	}

	return values;
}

function readString(values, key) {
	const value = values.get(key);
	const candidate = Array.isArray(value) ? value.at(-1) : value;
	return typeof candidate === "string" && candidate.trim()
		? candidate.trim()
		: undefined;
}

function readStringList(values, key) {
	const value = values.get(key);
	if (value === undefined) return undefined;
	const entries = Array.isArray(value) ? value : [value];
	const list = entries
		.flatMap((entry) => String(entry).split(","))
		.map((entry) => entry.trim())
		.filter(Boolean);
	return list.length > 0 ? list : undefined;
}

function readNumber(values, key, fallback) {
	const value = readString(values, key);
	if (value === undefined) return fallback;
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed < 0) {
		throw new Error(`--${key} must be a non-negative number.`);
	}
	return parsed;
}

function printUsage() {
	console.log(`Administrative import usage: npm run intelligence:record -- \\
  --task-id T1 \\
  --task-name "Route architecture" \\
  --strategy TemplateSerena \\
  --shell-commands 15 \\
  --semantic-calls 2

Normal Codex work is recorded by repository hooks. This command is reserved for
intentional standalone import and recovery.

Strategies: ${Array.from(VALID_STRATEGIES).join(", ")}
Modes: ${Array.from(VALID_BENCHMARK_MODES).join(", ")}
Resolutions: ${Array.from(VALID_RESOLUTIONS).join(", ")}

Optional:
  --date YYYY-MM-DD
  --scenario-id route-architecture
  --run-group-id route-bakeoff
  --benchmark-mode live-passive
  --task-class implementation
  --resolution inconclusive
  --output tmp/intelligence-benchmark-smoke.jsonl
  --source-command imported-observation
  --elapsed-seconds 120
  --setup-seconds 0
  --build-seconds 0
  --query-seconds 0
  --output-bytes 0
  --graph-nodes 0
  --graph-edges 0
  --graph-queries 0
  --suggested-files src/app/page.tsx,src/config/surfaces.ts
  --actual-files src/app/page.tsx
  --correctness 3
  --wrong-turns 1
  --generated-artifact-mistakes 0
  --notes "Short evidence note"
`);
}

const values = parseArgs(process.argv.slice(2));
const taskId = readString(values, "task-id");
const taskName = readString(values, "task-name");
const strategy = readString(values, "strategy");

if (!taskId || !taskName || !strategy) {
	printUsage();
	process.exit(1);
}

const input = {
	taskId,
	taskName,
	strategy,
	measurementSource: "administrative",
	sourceCommand:
		readString(values, "source-command") ?? "intelligence:record import",
	shellCommands: readNumber(values, "shell-commands", 0),
	semanticCalls: readNumber(values, "semantic-calls", 0),
	lookupActions: readNumber(values, "lookup-actions", undefined),
	date: readString(values, "date"),
	scenarioId: readString(values, "scenario-id"),
	runGroupId: readString(values, "run-group-id"),
	taskClass: readString(values, "task-class"),
	benchmarkMode: readString(values, "benchmark-mode"),
	beforeCommit: readString(values, "before-commit"),
	afterCommit: readString(values, "after-commit"),
	resolution: readString(values, "resolution"),
	setupSeconds: readNumber(values, "setup-seconds", undefined),
	buildSeconds: readNumber(values, "build-seconds", undefined),
	querySeconds: readNumber(values, "query-seconds", undefined),
	outputBytes: readNumber(values, "output-bytes", undefined),
	graphNodes: readNumber(values, "graph-nodes", undefined),
	graphEdges: readNumber(values, "graph-edges", undefined),
	graphQueries: readNumber(values, "graph-queries", undefined),
	suggestedFiles: readStringList(values, "suggested-files"),
	actualFiles: readStringList(values, "actual-files"),
	missedFiles: readStringList(values, "missed-files"),
	unnecessaryFiles: readStringList(values, "unnecessary-files"),
	fallbacksUsed: readStringList(values, "fallbacks-used"),
	elapsedSeconds: readNumber(values, "elapsed-seconds", undefined),
	correctness: readNumber(values, "correctness", undefined),
	wrongTurns: readNumber(values, "wrong-turns", undefined),
	generatedArtifactMistakes: readNumber(
		values,
		"generated-artifact-mistakes",
		undefined,
	),
	notes: readString(values, "notes"),
};

const run = createExecutedBenchmarkRun(input);
const outputPath = readString(values, "output");
const result = await appendExecutedBenchmarkRun(run, {
	root: ROOT,
	outputPath,
});
console.log(
	`${result.status === "duplicate" ? "Already recorded" : "Recorded"} ${run.strategy} ${run.taskId} in ${path.relative(ROOT, result.path)} (${run.runId}).`,
);
