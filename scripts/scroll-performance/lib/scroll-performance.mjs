import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

export const DEFAULT_TARGET_PATH = "/";
export const DEFAULT_AUTORESEARCH_PASS_LIMIT = 12;
export const DEFAULT_PAIRED_SAMPLE_COUNT = 3;
export const DEFAULT_MINIMUM_P95_DELTA_MS = 0.1;
export const DEFAULT_SEVERE_JANK_REGRESSION_LIMIT = 1;
export const DEFAULT_SCROLL_PERFORMANCE_RECORD_PATH = path.join(
	"tmp",
	"scroll-performance-runs.jsonl",
);
export const AUTORESEARCH_RUNTIME_ROOT = path.join(
	"tmp",
	"scroll-performance-autoresearch",
);
export const PRIMARY_METRIC = "p95_frame_ms";
export const PRIMARY_METRIC_DIRECTION = "minimize";
export const PRIMARY_METRIC_AGGREGATION = "median";
export const GEOMETRY_GATE_TOLERANCES = {
	scroll_distance_px: {
		absolute: 80,
		ratio: 0.02,
	},
	scrollable_height_px: {
		absolute: 80,
		ratio: 0.02,
	},
	viewport_height_px: {
		absolute: 1,
		ratio: 0,
	},
};
export const READ_ONLY_SCOPE = [
	"scripts/scroll-performance",
	"scripts/_lib/local-production-preview.mjs",
	"docs/operations/scroll-performance.md",
	"scripts/scroll-performance/fixtures/scroll-performance-runs.example.jsonl",
];

function normalizePath(value) {
	return value
		.replaceAll("\\", "/")
		.replace(/^\.\/+/, "")
		.replace(/\/$/, "");
}

export function normalizeTargetPath(value) {
	const raw =
		String(value ?? DEFAULT_TARGET_PATH).trim() || DEFAULT_TARGET_PATH;

	if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) {
		throw new Error("--path must be a local route path, not an absolute URL.");
	}

	if (!raw.startsWith("/")) {
		throw new Error("--path must start with '/'.");
	}

	return raw;
}

export function normalizeScopePath(value) {
	const normalized = normalizePath(String(value ?? "").trim());
	if (!normalized || normalized.startsWith("../") || normalized === "..") {
		throw new Error(`Invalid mutable scope: ${value}`);
	}
	return normalized;
}

export function roundMetric(value, digits = 3) {
	if (!Number.isFinite(value)) return 0;
	const precision = 10 ** digits;
	return Math.round(value * precision) / precision;
}

export function isNonNegativeNumber(value) {
	return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export function isValidScrollPerformanceRun(value) {
	if (!value || typeof value !== "object") return false;

	return (
		typeof value.commit === "string" &&
		isNonNegativeNumber(value.end_scroll_y) &&
		isNonNegativeNumber(value.frame_count) &&
		isNonNegativeNumber(value.frames_over_16_7_per_1000px) &&
		isNonNegativeNumber(value.p95_frame_ms) &&
		isNonNegativeNumber(value.p99_frame_ms) &&
		isNonNegativeNumber(value.frames_over_16_7ms) &&
		isNonNegativeNumber(value.frames_over_33_per_1000px) &&
		isNonNegativeNumber(value.frames_over_33ms) &&
		isNonNegativeNumber(value.jank_budget_ms) &&
		isNonNegativeNumber(value.jank_budget_ms_per_1000px) &&
		isNonNegativeNumber(value.long_task_ms) &&
		isNonNegativeNumber(value.long_task_count) &&
		isNonNegativeNumber(value.long_task_ms_per_1000px) &&
		isNonNegativeNumber(value.script_ms) &&
		isNonNegativeNumber(value.script_ms_per_1000px) &&
		isNonNegativeNumber(value.layout_ms) &&
		isNonNegativeNumber(value.layout_ms_per_1000px) &&
		isNonNegativeNumber(value.max_frame_ms) &&
		isNonNegativeNumber(value.measurement_duration_ms) &&
		isNonNegativeNumber(value.paint_ms) &&
		isNonNegativeNumber(value.paint_ms_per_1000px) &&
		isNonNegativeNumber(value.scroll_distance_px) &&
		isNonNegativeNumber(value.scroll_height_px) &&
		isNonNegativeNumber(value.scrollable_height_px) &&
		isNonNegativeNumber(value.severe_jank_budget_ms) &&
		isNonNegativeNumber(value.severe_jank_budget_ms_per_1000px) &&
		isNonNegativeNumber(value.start_scroll_y) &&
		isNonNegativeNumber(value.top_3_frame_avg_ms) &&
		isNonNegativeNumber(value.viewport_height_px) &&
		typeof value.target_path === "string" &&
		typeof value.viewport === "string" &&
		typeof value.status === "string" &&
		typeof value.notes === "string"
	);
}

export function parseScrollPerformanceCandidate(value) {
	const candidate =
		value && typeof value === "object" && value.aggregate
			? value.aggregate
			: value;

	if (!isValidScrollPerformanceRun(candidate)) {
		throw new Error(
			"Input does not contain a valid scroll performance result.",
		);
	}

	return candidate;
}

export function sanitizeTag(value) {
	const normalized = String(value ?? "")
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	if (!normalized) {
		throw new Error(
			"Provide a non-empty --tag using lowercase letters, numbers, or hyphens.",
		);
	}

	return normalized;
}

export function getAutoresearchBranchName(tag) {
	return `codex/autoresearch-scroll-performance-${sanitizeTag(tag)}`;
}

export function getAutoresearchWorktreeName(tag) {
	return `scroll-performance-autoresearch-${sanitizeTag(tag)}`;
}

export function getAutoresearchWorktreePath({ cwd = process.cwd(), tag }) {
	return path.join(cwd, ".worktrees", getAutoresearchWorktreeName(tag));
}

export function resolveAutoresearchRuntimePaths({ cwd = process.cwd(), tag }) {
	const safeTag = sanitizeTag(tag);
	const baseDir = path.join(cwd, AUTORESEARCH_RUNTIME_ROOT, safeTag);

	return {
		benchmarkRunsPath: path.join(baseDir, "benchmark-runs.jsonl"),
		baseDir,
		finalReportPath: path.join(baseDir, "final_report.md"),
		latestMeasurementPath: path.join(baseDir, "latest-measurement.json"),
		resultsPath: path.join(baseDir, "results.jsonl"),
		runLogPath: path.join(baseDir, "run.log"),
		statePath: path.join(baseDir, "state.json"),
		tag: safeTag,
	};
}

export function aggregateMetricSamples(
	samples,
	method = PRIMARY_METRIC_AGGREGATION,
) {
	if (!Array.isArray(samples) || samples.length === 0) {
		throw new Error("Metric samples must be a non-empty array.");
	}

	const values = samples.map((value, index) => {
		if (typeof value !== "number" || !Number.isFinite(value)) {
			throw new Error(`Metric sample ${index + 1} must be a finite number.`);
		}
		return value;
	});

	if (method === "mean") {
		return roundMetric(
			values.reduce((sum, value) => sum + value, 0) / values.length,
		);
	}
	if (method !== "median") {
		throw new Error(`Unsupported benchmark aggregation: ${method}`);
	}

	const sorted = [...values].sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	return roundMetric(
		sorted.length % 2 === 0
			? (sorted[middle - 1] + sorted[middle]) / 2
			: sorted[middle],
	);
}

function getPrimarySamples(payload, metric, expectedCount) {
	if (!payload || typeof payload !== "object" || !Array.isArray(payload.runs)) {
		throw new Error("Benchmark evidence must include raw measurement runs.");
	}
	if (payload.runs.length !== expectedCount) {
		throw new Error(
			`Expected exactly ${expectedCount} ${metric} samples; received ${payload.runs.length}.`,
		);
	}
	return payload.runs.map((run, index) => {
		const value = run?.[metric];
		if (typeof value !== "number" || !Number.isFinite(value)) {
			throw new Error(`Run ${index + 1} is missing finite ${metric}.`);
		}
		return value;
	});
}

export function compareBenchmarkEnvironments(...payloads) {
	const fingerprints = payloads.map(
		(payload) => payload?.environment?.fingerprint,
	);
	if (
		fingerprints.some(
			(fingerprint) => typeof fingerprint !== "string" || !fingerprint,
		)
	) {
		throw new Error(
			"Every benchmark measurement must include an environment fingerprint.",
		);
	}
	if (new Set(fingerprints).size !== 1) {
		throw new Error("Benchmark environment fingerprints do not match.");
	}
	return fingerprints[0];
}

export function evaluateScrollPerformanceComparison({
	benchmark,
	candidatePayload,
	controlPayload,
	guardResults = {},
}) {
	const metric = benchmark?.primaryMetric ?? PRIMARY_METRIC;
	const sampleCount =
		benchmark?.pairedSampleCount ?? DEFAULT_PAIRED_SAMPLE_COUNT;
	const aggregation = benchmark?.aggregation ?? PRIMARY_METRIC_AGGREGATION;
	const minimumDeltaMs =
		benchmark?.minimumDeltaMs ?? DEFAULT_MINIMUM_P95_DELTA_MS;
	const severeJankRegressionLimit =
		benchmark?.severeJankRegressionLimit ??
		DEFAULT_SEVERE_JANK_REGRESSION_LIMIT;
	if (metric !== PRIMARY_METRIC) {
		throw new Error(`Unsupported scroll benchmark primary metric: ${metric}`);
	}
	if (!Number.isInteger(sampleCount) || sampleCount < 3) {
		throw new Error("pairedSampleCount must be an integer of at least 3.");
	}
	if (!(minimumDeltaMs > 0)) {
		throw new Error("minimumDeltaMs must be greater than zero.");
	}

	const controlSamples = getPrimarySamples(controlPayload, metric, sampleCount);
	const candidateSamples = getPrimarySamples(
		candidatePayload,
		metric,
		sampleCount,
	);
	const control = aggregateMetricSamples(controlSamples, aggregation);
	const candidate = aggregateMetricSamples(candidateSamples, aggregation);
	const absoluteDelta = roundMetric(control - candidate);
	const relativeDelta =
		control > 0 ? roundMetric(absoluteDelta / control, 6) : 0;
	const geometry = evaluateScrollPerformanceGeometry({
		accepted: parseScrollPerformanceCandidate(controlPayload),
		candidate: parseScrollPerformanceCandidate(candidatePayload),
	});
	const severeJankDelta = roundMetric(
		parseScrollPerformanceCandidate(candidatePayload).frames_over_33ms -
			parseScrollPerformanceCandidate(controlPayload).frames_over_33ms,
	);
	const normalizedGuardResults = {
		geometry: {
			details: geometry.failures,
			pass: geometry.pass,
		},
		severe_jank: {
			delta: severeJankDelta,
			limit: severeJankRegressionLimit,
			pass: severeJankDelta <= severeJankRegressionLimit,
		},
		...guardResults,
	};
	const failedGuards = Object.entries(normalizedGuardResults)
		.filter(([, result]) => result?.pass !== true)
		.map(([name]) => name)
		.sort();

	return {
		absoluteDelta,
		aggregation,
		candidate,
		candidateSamples,
		control,
		controlSamples,
		failedGuards,
		geometryDeltas: geometry.deltas,
		guardResults: normalizedGuardResults,
		guardsPass: failedGuards.length === 0,
		keep: absoluteDelta >= minimumDeltaMs && failedGuards.length === 0,
		minimumDeltaMs,
		primaryMetric: metric,
		primaryPass: absoluteDelta >= minimumDeltaMs,
		relativeDelta,
	};
}

export const TERMINAL_BENCHMARK_STATUSES = new Set([
	"blocked",
	"exhausted",
	"succeeded",
]);

export function buildBenchmarkFinalReport(state) {
	if (!state || !TERMINAL_BENCHMARK_STATUSES.has(state.status)) {
		throw new Error(
			"A final report requires a validated terminal benchmark state.",
		);
	}
	const confirmed = state.confirmedMetric;
	const metricLine = confirmed
		? `${confirmed.metric}: ${confirmed.value}ms (${roundMetric(confirmed.relativeImprovement * 100, 2)}% improvement from the initial baseline)`
		: "No confirmed target-crossing metric.";
	return `# Scroll-performance autoresearch report\n\n- Status: ${state.status}\n- Accepted revision: ${state.accepted?.head ?? "unknown"}\n- Confirmed result: ${metricLine}\n- Target: ${state.benchmark?.targetP95Ms ?? "not configured"}\n- Completed passes: ${state.completedPasses ?? 0}/${state.passLimit ?? 0}\n- Invalidation reason: ${state.invalidationReason ?? "none"}\n`;
}

export async function ensureJsonLineFile(filePath) {
	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(filePath, "", { encoding: "utf8", flag: "a" });
}

export async function appendJsonLine(filePath, value) {
	await ensureJsonLineFile(filePath);
	await fs.appendFile(filePath, `${JSON.stringify(value)}\n`, "utf8");
}

export async function readJsonFile(filePath) {
	return JSON.parse(await fs.readFile(filePath, "utf8"));
}

export async function writeJsonFile(filePath, value) {
	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function isPathWithinMutableScope(filePath, mutableScopeAllowlist) {
	const normalizedFile = normalizePath(filePath);

	return mutableScopeAllowlist.some((scopePath) => {
		const normalizedScope = normalizeScopePath(scopePath);
		return (
			normalizedFile === normalizedScope ||
			normalizedFile.startsWith(`${normalizedScope}/`)
		);
	});
}

export function getUnauthorizedPaths(filePaths, mutableScopeAllowlist) {
	return filePaths.filter(
		(filePath) => !isPathWithinMutableScope(filePath, mutableScopeAllowlist),
	);
}

function formatMetricDelta(value) {
	const prefix = value > 0 ? "+" : "";
	return `${prefix}${roundMetric(value)}`;
}

function metricLimit(baseValue, tolerance) {
	return Math.max(tolerance.absolute, Math.abs(baseValue) * tolerance.ratio);
}

export function evaluateScrollPerformanceGeometry({ accepted, candidate }) {
	const failures = [];
	const deltas = {};

	if (candidate.target_path !== accepted.target_path) {
		failures.push(
			`target_path changed from ${accepted.target_path} to ${candidate.target_path}`,
		);
	}

	if (candidate.viewport !== accepted.viewport) {
		failures.push(
			`viewport changed from ${accepted.viewport} to ${candidate.viewport}`,
		);
	}

	for (const [metric, tolerance] of Object.entries(GEOMETRY_GATE_TOLERANCES)) {
		const acceptedValue = accepted[metric];
		const candidateValue = candidate[metric];

		if (
			!isNonNegativeNumber(acceptedValue) ||
			!isNonNegativeNumber(candidateValue)
		) {
			failures.push(`missing comparable ${metric}`);
			continue;
		}

		const delta = roundMetric(candidateValue - acceptedValue);
		const limit = roundMetric(metricLimit(acceptedValue, tolerance));
		deltas[metric] = {
			accepted: acceptedValue,
			candidate: candidateValue,
			delta,
			limit,
		};

		if (Math.abs(delta) > limit) {
			failures.push(
				`${metric} changed by ${formatMetricDelta(delta)} (limit ${limit})`,
			);
		}
	}

	return {
		deltas,
		failures,
		pass: failures.length === 0,
	};
}

export function decideScrollPerformanceKeep({ accepted, candidate }) {
	const geometry = evaluateScrollPerformanceGeometry({ accepted, candidate });
	const p95Delta = roundMetric(accepted.p95_frame_ms - candidate.p95_frame_ms);
	const framesOver33Delta = roundMetric(
		candidate.frames_over_33ms - accepted.frames_over_33ms,
	);
	const deltas = {
		frames_over_33ms: framesOver33Delta,
		p95_frame_ms: p95Delta,
	};

	if (!geometry.pass) {
		return {
			deltas,
			gated: true,
			geometryDeltas: geometry.deltas,
			geometryFailures: geometry.failures,
			keep: false,
			primaryMetric: null,
			reason: `Geometry gate failed: ${geometry.failures.join("; ")}.`,
		};
	}

	const severeJankPass =
		framesOver33Delta <= DEFAULT_SEVERE_JANK_REGRESSION_LIMIT;
	if (p95Delta >= DEFAULT_MINIMUM_P95_DELTA_MS && severeJankPass) {
		return {
			deltas,
			gated: false,
			geometryDeltas: geometry.deltas,
			geometryFailures: [],
			keep: true,
			primaryMetric: "p95_frame_ms",
			reason: `Improved p95_frame_ms by ${p95Delta}ms while keeping severe jank within the ${DEFAULT_SEVERE_JANK_REGRESSION_LIMIT} frame guard.`,
		};
	}

	return {
		deltas,
		gated: false,
		geometryDeltas: geometry.deltas,
		geometryFailures: [],
		keep: false,
		primaryMetric: null,
		reason: severeJankPass
			? `Did not improve p95_frame_ms by the required ${DEFAULT_MINIMUM_P95_DELTA_MS}ms.`
			: `Severe-jank guard failed: frames_over_33ms regressed by ${framesOver33Delta}.`,
	};
}

export function summarizeScrollPerformanceResult(run) {
	return `p95 ${run.p95_frame_ms}ms, p99 ${run.p99_frame_ms}ms, >33ms frames ${run.frames_over_33ms}`;
}
