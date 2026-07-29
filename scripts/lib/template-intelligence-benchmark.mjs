import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

export const BENCHMARK_SCHEMA_VERSION = 3;
export const BENCHMARK_RECORD_KIND = "executed-run";
export const STRATEGY_DEFINITION_VERSION = 1;

export const STRATEGY_ALIASES = new Map([
	["Hybrid", "TemplateSerena"],
	["TemplateIntelligence", "TemplateMap"],
]);
export const VALID_STRATEGIES = new Set([
	"Control",
	"TemplateMap",
	"TemplateSerena",
	"Graphify",
]);
export const VALID_BENCHMARK_MODES = new Set([
	"live-passive",
	"shadow-replay",
	"triple-run",
]);
export const VALID_RESOLUTIONS = new Set(["promote", "hold", "inconclusive"]);

export function getBenchmarkRunsPath(root) {
	return path.join(
		root,
		"src/lib/template-intelligence/fixtures/template-intelligence-benchmark-runs.jsonl",
	);
}

export function getLocalBenchmarkRunsPath(root) {
	return path.join(
		root,
		".template-intelligence/explicit-benchmark-runs.jsonl",
	);
}

function requireNonEmptyString(value, field) {
	if (typeof value !== "string" || !value.trim()) {
		throw new Error(`${field} must be a non-empty string.`);
	}
	return value.trim();
}

function requireNonNegativeNumber(value, field) {
	if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
		throw new Error(`${field} must be a non-negative number.`);
	}
	return value;
}

function copyDefined(target, source, fields) {
	for (const field of fields) {
		const value = source[field];
		if (value !== undefined && value !== null) target[field] = value;
	}
}

function stableRunId(run) {
	const digest = crypto
		.createHash("sha256")
		.update(JSON.stringify(run))
		.digest("hex")
		.slice(0, 20);
	return `ti_${digest}`;
}

export function normalizeBenchmarkStrategy(strategy) {
	return STRATEGY_ALIASES.get(strategy) ?? strategy;
}

export function createExecutedBenchmarkRun(input) {
	const inputStrategy = requireNonEmptyString(input.strategy, "strategy");
	const strategy = normalizeBenchmarkStrategy(inputStrategy);
	const shellCommands = requireNonNegativeNumber(
		input.shellCommands,
		"shellCommands",
	);
	const semanticCalls = requireNonNegativeNumber(
		input.semanticCalls ?? 0,
		"semanticCalls",
	);
	const graphQueries = input.graphQueries ?? 0;

	const run = {
		schemaVersion: BENCHMARK_SCHEMA_VERSION,
		recordKind: BENCHMARK_RECORD_KIND,
		strategyDefinitionVersion: STRATEGY_DEFINITION_VERSION,
		date: input.date ?? new Date().toISOString().slice(0, 10),
		project: input.project ?? "averlo-next-template",
		taskId: requireNonEmptyString(input.taskId, "taskId"),
		taskName: requireNonEmptyString(input.taskName, "taskName"),
		strategy,
		benchmarkMode: input.benchmarkMode ?? "live-passive",
		measurementSource: input.measurementSource ?? "command",
		sourceCommand: requireNonEmptyString(input.sourceCommand, "sourceCommand"),
		shellCommands,
		semanticCalls,
		lookupActions:
			input.lookupActions ?? shellCommands + semanticCalls + graphQueries,
	};

	if (inputStrategy !== strategy) run.legacyStrategy = inputStrategy;

	copyDefined(run, input, [
		"scenarioId",
		"runGroupId",
		"taskClass",
		"beforeCommit",
		"afterCommit",
		"setupSeconds",
		"buildSeconds",
		"querySeconds",
		"outputBytes",
		"graphNodes",
		"graphEdges",
		"graphQueries",
		"suggestedFiles",
		"actualFiles",
		"missedFiles",
		"unnecessaryFiles",
		"fallbacksUsed",
		"elapsedSeconds",
		"correctness",
		"wrongTurns",
		"generatedArtifactMistakes",
		"resolution",
		"notes",
	]);

	validateExecutedBenchmarkRun(run);
	return { runId: stableRunId(run), ...run };
}

export function validateExecutedBenchmarkRun(run) {
	if (!run || typeof run !== "object") {
		throw new Error("Benchmark run must be an object.");
	}
	if (run.schemaVersion !== BENCHMARK_SCHEMA_VERSION) {
		throw new Error(
			`schemaVersion must be ${BENCHMARK_SCHEMA_VERSION} for executed runs.`,
		);
	}
	if (run.recordKind !== BENCHMARK_RECORD_KIND) {
		throw new Error(`recordKind must be ${BENCHMARK_RECORD_KIND}.`);
	}
	if (run.strategyDefinitionVersion !== STRATEGY_DEFINITION_VERSION) {
		throw new Error(
			`strategyDefinitionVersion must be ${STRATEGY_DEFINITION_VERSION}.`,
		);
	}

	for (const field of [
		"date",
		"project",
		"taskId",
		"taskName",
		"strategy",
		"benchmarkMode",
		"measurementSource",
		"sourceCommand",
	]) {
		requireNonEmptyString(run[field], field);
	}

	if (!VALID_STRATEGIES.has(run.strategy)) {
		throw new Error(
			`strategy must be one of: ${Array.from(VALID_STRATEGIES).join(", ")}.`,
		);
	}
	if (!VALID_BENCHMARK_MODES.has(run.benchmarkMode)) {
		throw new Error(
			`benchmarkMode must be one of: ${Array.from(VALID_BENCHMARK_MODES).join(", ")}.`,
		);
	}
	if (run.resolution !== undefined && !VALID_RESOLUTIONS.has(run.resolution)) {
		throw new Error(
			`resolution must be one of: ${Array.from(VALID_RESOLUTIONS).join(", ")}.`,
		);
	}

	for (const field of ["shellCommands", "semanticCalls", "lookupActions"]) {
		requireNonNegativeNumber(run[field], field);
	}
	for (const field of [
		"setupSeconds",
		"buildSeconds",
		"querySeconds",
		"outputBytes",
		"graphNodes",
		"graphEdges",
		"graphQueries",
		"elapsedSeconds",
		"correctness",
		"wrongTurns",
		"generatedArtifactMistakes",
	]) {
		if (run[field] !== undefined) requireNonNegativeNumber(run[field], field);
	}
	if (run.correctness !== undefined && run.correctness > 3) {
		throw new Error("correctness must be between 0 and 3.");
	}

	if (run.benchmarkMode === "triple-run") {
		requireNonEmptyString(run.runGroupId, "runGroupId");
		requireNonEmptyString(run.scenarioId, "scenarioId");
	}
	if (run.runGroupId !== undefined && run.scenarioId === undefined) {
		throw new Error("scenarioId is required when runGroupId is present.");
	}

	if (run.strategy === "TemplateSerena" && run.semanticCalls === 0) {
		throw new Error("TemplateSerena requires at least one semantic call.");
	}
	if (
		(run.strategy === "Control" || run.strategy === "TemplateMap") &&
		run.semanticCalls !== 0
	) {
		throw new Error(`${run.strategy} cannot contain semantic calls.`);
	}
	if (run.strategy !== "Graphify" && (run.graphQueries ?? 0) !== 0) {
		throw new Error(`${run.strategy} cannot contain Graphify queries.`);
	}
	if (run.strategy === "Graphify") {
		if ((run.graphQueries ?? 0) === 0) {
			throw new Error("Graphify requires at least one successful graph query.");
		}
		if ((run.outputBytes ?? 0) === 0) {
			throw new Error("Graphify requires non-empty graph query evidence.");
		}
		requireNonNegativeNumber(run.buildSeconds, "buildSeconds");
		requireNonNegativeNumber(run.querySeconds, "querySeconds");
	}

	return run;
}

async function acquireLock(lockPath) {
	for (let attempt = 0; attempt < 80; attempt += 1) {
		try {
			return await fs.open(lockPath, "wx", 0o600);
		} catch (error) {
			if (error?.code !== "EEXIST" || attempt === 79) throw error;
			await new Promise((resolve) => setTimeout(resolve, 25));
		}
	}
	throw new Error(`Could not acquire benchmark lock ${lockPath}.`);
}

export async function appendExecutedBenchmarkRun(
	run,
	{ root = process.cwd(), outputPath } = {},
) {
	validateExecutedBenchmarkRun(run);
	requireNonEmptyString(run.runId, "runId");

	const runsPath = outputPath
		? path.resolve(root, outputPath)
		: getLocalBenchmarkRunsPath(root);
	await fs.mkdir(path.dirname(runsPath), { recursive: true });

	const lockPath = `${runsPath}.lock`;
	const lock = await acquireLock(lockPath);
	try {
		const existing = await fs.readFile(runsPath, "utf8").catch(() => "");
		const isDuplicate = existing.split(/\r?\n/).some((line) => {
			if (!line.trim()) return false;
			try {
				return JSON.parse(line).runId === run.runId;
			} catch {
				return false;
			}
		});
		if (isDuplicate) {
			return { status: "duplicate", path: runsPath, run };
		}

		const file = await fs.open(runsPath, "a");
		try {
			await file.write(`${JSON.stringify(run)}\n`, null, "utf8");
		} finally {
			await file.close();
		}
		return { status: "recorded", path: runsPath, run };
	} finally {
		await lock.close();
		await fs.unlink(lockPath).catch(() => undefined);
	}
}
