import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

export const DEFAULT_TARGET_PATH = "/";
export const DEFAULT_AUTORESEARCH_PASS_LIMIT = 12;
export const DEFAULT_SCROLL_PERFORMANCE_RECORD_PATH = path.join(
	"tmp",
	"scroll-performance-runs.jsonl",
);
export const AUTORESEARCH_RUNTIME_ROOT = path.join(
	"tmp",
	"scroll-performance-autoresearch",
);
export const PRIMARY_METRIC_TOLERANCES = {
	frames_over_33ms: 1.0,
	p95_frame_ms: 0.5,
};
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
	"docs/guides/scroll-performance.md",
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
		baseDir,
		latestMeasurementPath: path.join(baseDir, "latest-measurement.json"),
		resultsPath: path.join(baseDir, "results.jsonl"),
		runLogPath: path.join(baseDir, "run.log"),
		statePath: path.join(baseDir, "state.json"),
		tag: safeTag,
	};
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
	const p95Delta = roundMetric(candidate.p95_frame_ms - accepted.p95_frame_ms);
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

	const p95Improved = p95Delta < 0;
	const framesOver33Improved = framesOver33Delta < 0;
	const withinFramesTolerance =
		framesOver33Delta <= PRIMARY_METRIC_TOLERANCES.frames_over_33ms;
	const withinP95Tolerance = p95Delta <= PRIMARY_METRIC_TOLERANCES.p95_frame_ms;

	if (p95Improved && framesOver33Improved) {
		return {
			deltas,
			gated: false,
			geometryDeltas: geometry.deltas,
			geometryFailures: [],
			keep: true,
			primaryMetric: "both",
			reason: "Improved both primary metrics.",
		};
	}

	if (p95Improved && withinFramesTolerance) {
		return {
			deltas,
			gated: false,
			geometryDeltas: geometry.deltas,
			geometryFailures: [],
			keep: true,
			primaryMetric: "p95_frame_ms",
			reason: `Improved p95_frame_ms while keeping frames_over_33ms within the ${PRIMARY_METRIC_TOLERANCES.frames_over_33ms} frame tolerance.`,
		};
	}

	if (framesOver33Improved && withinP95Tolerance) {
		return {
			deltas,
			gated: false,
			geometryDeltas: geometry.deltas,
			geometryFailures: [],
			keep: true,
			primaryMetric: "frames_over_33ms",
			reason: `Improved frames_over_33ms while keeping p95_frame_ms within the ${PRIMARY_METRIC_TOLERANCES.p95_frame_ms}ms tolerance.`,
		};
	}

	return {
		deltas,
		gated: false,
		geometryDeltas: geometry.deltas,
		geometryFailures: [],
		keep: false,
		primaryMetric: null,
		reason:
			"Did not improve a primary metric without breaching the cross-metric tolerance.",
	};
}

export function summarizeScrollPerformanceResult(run) {
	return `p95 ${run.p95_frame_ms}ms, p99 ${run.p99_frame_ms}ms, >33ms frames ${run.frames_over_33ms}`;
}
