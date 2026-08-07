import assert from "node:assert/strict";
import test from "node:test";
import {
	aggregateMetricSamples,
	buildBenchmarkFinalReport,
	compareBenchmarkEnvironments,
	evaluateScrollPerformanceComparison,
} from "./scroll-performance.mjs";

function makeRun({ framesOver33 = 1, p95 = 9, scrollableHeight = 5000 } = {}) {
	return {
		commit: "abc1234",
		end_scroll_y: 4100,
		frame_count: 200,
		frames_over_16_7_per_1000px: 1,
		frames_over_16_7ms: 4,
		frames_over_33_per_1000px: 0.25,
		frames_over_33ms: framesOver33,
		jank_budget_ms: 3,
		jank_budget_ms_per_1000px: 0.75,
		layout_ms: 1,
		layout_ms_per_1000px: 0.25,
		long_task_count: 0,
		long_task_ms: 0,
		long_task_ms_per_1000px: 0,
		max_frame_ms: 40,
		measurement_duration_ms: 3500,
		notes: "fixture",
		p95_frame_ms: p95,
		p99_frame_ms: 18,
		paint_ms: 1,
		paint_ms_per_1000px: 0.25,
		scroll_distance_px: 4100,
		scroll_height_px: scrollableHeight + 900,
		scrollable_height_px: scrollableHeight,
		script_ms: 2,
		script_ms_per_1000px: 0.5,
		severe_jank_budget_ms: 1,
		severe_jank_budget_ms_per_1000px: 0.25,
		start_scroll_y: 0,
		status: "confirm",
		target_path: "/",
		top_3_frame_avg_ms: 25,
		viewport: "1440x900",
		viewport_height_px: 900,
	};
}

function payload(samples, options = {}) {
	const runs = samples.map((p95) => makeRun({ ...options, p95 }));
	return {
		aggregate: makeRun({
			...options,
			p95: aggregateMetricSamples(samples),
		}),
		environment: { fingerprint: options.fingerprint ?? "runtime-a" },
		runs,
	};
}

const benchmark = {
	aggregation: "median",
	minimumDeltaMs: 0.1,
	pairedSampleCount: 3,
	primaryMetric: "p95_frame_ms",
	severeJankRegressionLimit: 1,
};

test("uses the median and symmetric paired sample sets", () => {
	const result = evaluateScrollPerformanceComparison({
		benchmark,
		candidatePayload: payload([8.8, 30, 8.7]),
		controlPayload: payload([9.2, 9.3, 20]),
	});
	assert.equal(result.control, 9.3);
	assert.equal(result.candidate, 8.8);
	assert.equal(result.keep, true);
	assert.throws(
		() =>
			evaluateScrollPerformanceComparison({
				benchmark,
				candidatePayload: payload([8.8, 8.7]),
				controlPayload: payload([9.2, 9.3, 9.4]),
			}),
		/exactly 3/,
	);
});

test("severe-jank gains cannot rescue a p95 regression", () => {
	const result = evaluateScrollPerformanceComparison({
		benchmark,
		candidatePayload: payload([9.5, 9.4, 9.3], { framesOver33: 0 }),
		controlPayload: payload([9.1, 9.2, 9.3], { framesOver33: 4 }),
	});
	assert.equal(result.primaryPass, false);
	assert.equal(result.keep, false);
});

test("the observed provisional win is invalidated by its confirmation", () => {
	const measurement = evaluateScrollPerformanceComparison({
		benchmark,
		candidatePayload: payload([8.6, 8.7, 8.8]),
		controlPayload: payload([9.167, 9.267, 9.367]),
	});
	const confirmation = evaluateScrollPerformanceComparison({
		benchmark,
		candidatePayload: payload([10, 10.1, 10.2]),
		controlPayload: payload([9.167, 9.267, 9.367]),
	});
	assert.equal(measurement.keep, true);
	assert.equal(confirmation.keep, false);
});

test("geometry and named guards veto primary improvements", () => {
	const geometryFailure = evaluateScrollPerformanceComparison({
		benchmark,
		candidatePayload: payload([8.5, 8.6, 8.7], { scrollableHeight: 3500 }),
		controlPayload: payload([9.2, 9.3, 9.4]),
	});
	assert.equal(geometryFailure.keep, false);
	assert.ok(geometryFailure.failedGuards.includes("geometry"));

	const namedGuardFailure = evaluateScrollPerformanceComparison({
		benchmark,
		candidatePayload: payload([8.5, 8.6, 8.7]),
		controlPayload: payload([9.2, 9.3, 9.4]),
		guardResults: { "script:verify:visual": { pass: false } },
	});
	assert.equal(namedGuardFailure.keep, false);
	assert.ok(namedGuardFailure.failedGuards.includes("script:verify:visual"));
});

test("environment mismatches block comparison", () => {
	assert.equal(
		compareBenchmarkEnvironments(payload([9, 9, 9]), payload([8, 8, 8])),
		"runtime-a",
	);
	assert.throws(
		() =>
			compareBenchmarkEnvironments(
				payload([9, 9, 9]),
				payload([8, 8, 8], { fingerprint: "runtime-b" }),
			),
		/fingerprints do not match/,
	);
});

test("final reports can only be generated from terminal state", () => {
	const state = {
		accepted: { head: "abc" },
		benchmark: { targetP95Ms: 8.5 },
		completedPasses: 2,
		confirmedMetric: null,
		invalidationReason: "confirmation regressed",
		passLimit: 12,
		status: "exhausted",
	};
	assert.match(buildBenchmarkFinalReport(state), /Status: exhausted/);
	assert.match(buildBenchmarkFinalReport(state), /confirmation regressed/);
	assert.throws(
		() => buildBenchmarkFinalReport({ ...state, status: "provisional" }),
		/terminal benchmark state/,
	);
});
