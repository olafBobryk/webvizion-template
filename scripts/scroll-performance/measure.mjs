#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";
import {
	startLocalProductionServer,
	stopServer,
} from "../_lib/local-production-preview.mjs";
import {
	DEFAULT_TARGET_PATH,
	normalizeTargetPath,
	roundMetric,
} from "./lib/scroll-performance.mjs";

const PROJECT = "averlo-next-template";
const require = createRequire(import.meta.url);
const DEFAULT_RUNS = 1;
const DEFAULT_VIEWPORT = { width: 1440, height: 900 };
const NORMALIZATION_DISTANCE_PX = 1000;
const WARMUP_MS = 500;
const STEP_SETTLE_MS = 180;
const FINAL_SETTLE_MS = 900;
const SCROLL_PLAN = [
	900, 900, 900, 900, 900, 900, 900, 900, 900, 900, -540, -540, -540, 720,
];

const TRACE_CATEGORIES = [
	"devtools.timeline",
	"blink.user_timing",
	"disabled-by-default-devtools.timeline",
	"disabled-by-default-devtools.timeline.frame",
].join(",");

const SCRIPT_EVENT_NAMES = new Set([
	"EvaluateScript",
	"FunctionCall",
	"EventDispatch",
	"RunMicrotasks",
	"TimerFire",
	"FireAnimationFrame",
	"RequestAnimationFrame",
	"V8.Execute",
]);
const LAYOUT_EVENT_NAMES = new Set([
	"Layout",
	"UpdateLayoutTree",
	"RecalculateStyles",
	"InvalidateLayout",
]);
const PAINT_EVENT_NAMES = new Set([
	"Paint",
	"PrePaint",
	"CompositeLayers",
	"RasterTask",
]);

const INSTRUMENTATION_SCRIPT = `
(() => {
  const state = {
    frames: [],
    longTasks: [],
    running: false,
    rafId: 0,
  };

  const tick = (timestamp) => {
    if (!state.running) return;
    state.frames.push(timestamp);
    state.rafId = window.requestAnimationFrame(tick);
  };

  const longTaskObserver =
    typeof PerformanceObserver !== "undefined"
      ? new PerformanceObserver((list) => {
          if (!state.running) return;
          for (const entry of list.getEntries()) {
            state.longTasks.push(Number(entry.duration) || 0);
          }
        })
      : null;

  try {
    longTaskObserver?.observe({ type: "longtask", buffered: true });
  } catch {}

  window.__scrollPerformanceHarness = {
    reset() {
      state.frames = [];
      state.longTasks = [];
      state.running = false;
      if (state.rafId) {
        window.cancelAnimationFrame(state.rafId);
        state.rafId = 0;
      }
    },
    start() {
      this.reset();
      state.running = true;
      state.rafId = window.requestAnimationFrame(tick);
    },
    stop() {
      state.running = false;
      if (state.rafId) {
        window.cancelAnimationFrame(state.rafId);
        state.rafId = 0;
      }
      return {
        frames: [...state.frames],
        longTasks: [...state.longTasks],
        scrollY: window.scrollY,
        scrollHeight:
          document.scrollingElement?.scrollHeight ?? document.documentElement.scrollHeight,
      };
    },
  };
})();
`;

function printUsage() {
	console.log(`Usage: npm run measure:scroll-performance -- [options]

Options:
  --path /                                Page path to measure (default: ${DEFAULT_TARGET_PATH})
  --ready-selector "[data-ready]"         Optional selector to wait for before scrolling
  --base-url http://127.0.0.1:3100        Attach to an existing production-like preview
  --runs 1|3                              Number of repeated runs (default: ${DEFAULT_RUNS})
  --output path/to/result.json            Write the full result payload to disk
  --headed                                Run Chromium headed for inspection
  --notes "Short note"                    Attach a note to the aggregate result
`);
}

function parseArgs(argv) {
	const flags = new Set();
	const values = new Map();

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (!arg.startsWith("--")) continue;
		if (!arg.includes("=") && (argv[index + 1]?.startsWith("--") ?? true)) {
			flags.add(arg.slice(2));
			continue;
		}

		const [rawKey, inlineValue] = arg.slice(2).split("=");
		const key = rawKey.trim();
		const nextValue = inlineValue ?? argv[index + 1];
		if (inlineValue === undefined) index += 1;
		values.set(key, nextValue);
	}

	return { flags, values };
}

function readString(values, key) {
	const value = values.get(key);
	return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readPositiveInteger(values, key, fallback) {
	const raw = values.get(key);
	if (raw === undefined) return fallback;
	const parsed = Number.parseInt(String(raw), 10);
	if (!Number.isFinite(parsed) || parsed < 1) {
		throw new Error(`--${key} must be a positive integer.`);
	}
	return parsed;
}

function quantile(values, ratio) {
	if (values.length === 0) return 0;
	const sorted = [...values].sort((a, b) => a - b);
	const position = Math.min(
		sorted.length - 1,
		Math.max(0, Math.ceil(sorted.length * ratio) - 1),
	);
	return sorted[position];
}

function sumFrameBudget(frameDurations, threshold) {
	return roundMetric(
		frameDurations.reduce(
			(sum, duration) => sum + Math.max(0, duration - threshold),
			0,
		),
	);
}

function averageLargest(values, count) {
	if (values.length === 0) return 0;
	const largest = [...values].sort((a, b) => b - a).slice(0, count);
	return roundMetric(
		largest.reduce((sum, value) => sum + value, 0) / largest.length,
	);
}

function perNormalizedDistance(value, scrollDistancePx) {
	if (!Number.isFinite(scrollDistancePx) || scrollDistancePx <= 0) return 0;
	return roundMetric((value / scrollDistancePx) * NORMALIZATION_DISTANCE_PX);
}

function getCommit() {
	const result = spawnSync("git", ["rev-parse", "--short", "HEAD"], {
		encoding: "utf8",
	});
	if (result.status !== 0) {
		return "unknown";
	}
	return result.stdout.trim() || "unknown";
}

function buildEnvironmentEvidence({ browserVersion, viewport }) {
	const descriptor = {
		architecture: os.arch(),
		browser: `chromium ${browserVersion}`,
		cachePolicy:
			"fresh browser context per sample; production build per revision",
		nextVersion: require("next/package.json").version,
		nodeVersion: process.version,
		platform: `${os.platform()} ${os.release()}`,
		playwrightVersion: require("playwright/package.json").version,
		viewport: `${viewport.width}x${viewport.height}`,
	};
	return {
		...descriptor,
		fingerprint: createHash("sha256")
			.update(JSON.stringify(descriptor))
			.digest("hex"),
		freshRuntime: true,
		sessionId: randomUUID(),
	};
}

async function readProtocolStream(session, handle) {
	let raw = "";
	let eof = false;

	while (!eof) {
		const chunk = await session.send("IO.read", { handle });
		raw += chunk.data ?? "";
		eof = chunk.eof === true;
	}

	await session.send("IO.close", { handle }).catch(() => {});
	return raw;
}

async function startTrace(session) {
	await session.send("Tracing.start", {
		categories: TRACE_CATEGORIES,
		transferMode: "ReturnAsStream",
	});
}

async function stopTrace(session) {
	const tracingComplete = new Promise((resolve) => {
		session.once("Tracing.tracingComplete", resolve);
	});

	await session.send("Tracing.end");
	const event = await tracingComplete;
	const raw = await readProtocolStream(session, event.stream);
	return JSON.parse(raw);
}

function findTraceMarkTimestamps(traceEvents) {
	let startTs = null;
	let endTs = null;

	for (const event of traceEvents) {
		if (event.name === "scroll-performance-start") {
			startTs = event.ts ?? startTs;
		}
		if (event.name === "scroll-performance-end") {
			endTs = event.ts ?? endTs;
		}
	}

	return { endTs, startTs };
}

function sumTraceDuration(traceEvents, names, startTs, endTs) {
	let total = 0;

	for (const event of traceEvents) {
		if (event.ph !== "X" || !names.has(event.name)) continue;
		if (typeof event.ts !== "number" || typeof event.dur !== "number") continue;
		if (startTs !== null && event.ts < startTs) continue;
		if (endTs !== null && event.ts > endTs) continue;
		total += event.dur / 1000;
	}

	return roundMetric(total);
}

function buildRunResult({
	commit,
	frameDurations,
	layoutMs,
	longTasks,
	notes,
	paintMs,
	scrollMetrics,
	scriptMs,
	targetPath,
	viewport,
}) {
	const framesOver16 = frameDurations.filter((value) => value > 16.7).length;
	const framesOver33 = frameDurations.filter((value) => value > 33).length;
	const jankBudgetMs = sumFrameBudget(frameDurations, 16.7);
	const severeJankBudgetMs = sumFrameBudget(frameDurations, 33);
	const longTaskMs = roundMetric(
		longTasks.reduce((sum, value) => sum + value, 0),
	);
	const measurementDurationMs = roundMetric(
		frameDurations.reduce((sum, value) => sum + value, 0),
	);
	const scrollDistancePx = roundMetric(scrollMetrics.scrollDistancePx, 0);

	return {
		commit,
		end_scroll_y: roundMetric(scrollMetrics.endScrollY, 0),
		frame_count: frameDurations.length,
		frames_over_16_7_per_1000px: perNormalizedDistance(
			framesOver16,
			scrollDistancePx,
		),
		frames_over_16_7ms: framesOver16,
		frames_over_33_per_1000px: perNormalizedDistance(
			framesOver33,
			scrollDistancePx,
		),
		frames_over_33ms: framesOver33,
		jank_budget_ms: jankBudgetMs,
		jank_budget_ms_per_1000px: perNormalizedDistance(
			jankBudgetMs,
			scrollDistancePx,
		),
		layout_ms: roundMetric(layoutMs),
		layout_ms_per_1000px: perNormalizedDistance(layoutMs, scrollDistancePx),
		long_task_count: longTasks.length,
		long_task_ms: longTaskMs,
		long_task_ms_per_1000px: perNormalizedDistance(
			longTaskMs,
			scrollDistancePx,
		),
		max_frame_ms: roundMetric(Math.max(0, ...frameDurations)),
		measurement_duration_ms: measurementDurationMs,
		notes,
		p95_frame_ms: roundMetric(quantile(frameDurations, 0.95)),
		p99_frame_ms: roundMetric(quantile(frameDurations, 0.99)),
		paint_ms: roundMetric(paintMs),
		paint_ms_per_1000px: perNormalizedDistance(paintMs, scrollDistancePx),
		scroll_distance_px: scrollDistancePx,
		scroll_height_px: roundMetric(scrollMetrics.scrollHeightPx, 0),
		scrollable_height_px: roundMetric(scrollMetrics.scrollableHeightPx, 0),
		script_ms_per_1000px: perNormalizedDistance(scriptMs, scrollDistancePx),
		severe_jank_budget_ms: severeJankBudgetMs,
		severe_jank_budget_ms_per_1000px: perNormalizedDistance(
			severeJankBudgetMs,
			scrollDistancePx,
		),
		script_ms: roundMetric(scriptMs),
		start_scroll_y: roundMetric(scrollMetrics.startScrollY, 0),
		status: "measured",
		target_path: targetPath,
		top_3_frame_avg_ms: averageLargest(frameDurations, 3),
		viewport_height_px: roundMetric(scrollMetrics.viewportHeightPx, 0),
		viewport: `${viewport.width}x${viewport.height}`,
	};
}

function averageMetric(runs, key) {
	return roundMetric(
		runs.reduce((sum, run) => sum + Number(run[key] ?? 0), 0) / runs.length,
	);
}

function buildAggregate({ commit, notes, runs, targetPath, viewport }) {
	return {
		commit,
		end_scroll_y: averageMetric(runs, "end_scroll_y"),
		frame_count: averageMetric(runs, "frame_count"),
		frames_over_16_7_per_1000px: averageMetric(
			runs,
			"frames_over_16_7_per_1000px",
		),
		frames_over_16_7ms: averageMetric(runs, "frames_over_16_7ms"),
		frames_over_33_per_1000px: averageMetric(runs, "frames_over_33_per_1000px"),
		frames_over_33ms: averageMetric(runs, "frames_over_33ms"),
		jank_budget_ms: averageMetric(runs, "jank_budget_ms"),
		jank_budget_ms_per_1000px: averageMetric(runs, "jank_budget_ms_per_1000px"),
		layout_ms: averageMetric(runs, "layout_ms"),
		layout_ms_per_1000px: averageMetric(runs, "layout_ms_per_1000px"),
		long_task_count: averageMetric(runs, "long_task_count"),
		long_task_ms: averageMetric(runs, "long_task_ms"),
		long_task_ms_per_1000px: averageMetric(runs, "long_task_ms_per_1000px"),
		max_frame_ms: averageMetric(runs, "max_frame_ms"),
		measurement_duration_ms: averageMetric(runs, "measurement_duration_ms"),
		notes:
			notes ??
			(runs.length > 1
				? `confirm aggregate across ${runs.length} runs`
				: "fast single-run measurement"),
		p95_frame_ms: averageMetric(runs, "p95_frame_ms"),
		p99_frame_ms: averageMetric(runs, "p99_frame_ms"),
		paint_ms: averageMetric(runs, "paint_ms"),
		paint_ms_per_1000px: averageMetric(runs, "paint_ms_per_1000px"),
		run_count: runs.length,
		scroll_distance_px: averageMetric(runs, "scroll_distance_px"),
		scroll_height_px: averageMetric(runs, "scroll_height_px"),
		scrollable_height_px: averageMetric(runs, "scrollable_height_px"),
		script_ms_per_1000px: averageMetric(runs, "script_ms_per_1000px"),
		severe_jank_budget_ms: averageMetric(runs, "severe_jank_budget_ms"),
		severe_jank_budget_ms_per_1000px: averageMetric(
			runs,
			"severe_jank_budget_ms_per_1000px",
		),
		script_ms: averageMetric(runs, "script_ms"),
		start_scroll_y: averageMetric(runs, "start_scroll_y"),
		status: runs.length > 1 ? "confirm" : "fast",
		target_path: targetPath,
		top_3_frame_avg_ms: averageMetric(runs, "top_3_frame_avg_ms"),
		viewport_height_px: averageMetric(runs, "viewport_height_px"),
		viewport: `${viewport.width}x${viewport.height}`,
	};
}

async function performScrollPath(page) {
	const positions = [await page.evaluate(() => Math.round(window.scrollY))];

	await page.mouse.move(
		Math.round(DEFAULT_VIEWPORT.width / 2),
		Math.round(DEFAULT_VIEWPORT.height / 2),
	);

	for (const deltaY of SCROLL_PLAN) {
		await page.mouse.wheel(0, deltaY);
		await page.waitForTimeout(STEP_SETTLE_MS);
		positions.push(await page.evaluate(() => Math.round(window.scrollY)));
	}

	await page.waitForTimeout(FINAL_SETTLE_MS);

	const endScrollY = await page.evaluate(() => Math.round(window.scrollY));
	if (positions.at(-1) !== endScrollY) {
		positions.push(endScrollY);
	}

	let scrollDistancePx = 0;
	for (let index = 1; index < positions.length; index += 1) {
		scrollDistancePx += Math.abs(positions[index] - positions[index - 1]);
	}

	return {
		endScrollY,
		scrollDistancePx,
		startScrollY: positions[0] ?? 0,
	};
}

async function runMeasurement({
	baseUrl,
	browser,
	commit,
	readySelector,
	targetPath,
	viewport,
}) {
	const context = await browser.newContext({ viewport });
	await context.addInitScript(INSTRUMENTATION_SCRIPT);
	const page = await context.newPage();
	const session = await context.newCDPSession(page);

	try {
		const url = new URL(targetPath, baseUrl);
		await page.goto(url.toString(), { waitUntil: "networkidle" });
		if (readySelector) {
			await page.waitForSelector(readySelector);
		}
		await page.waitForFunction(
			() => !document.querySelector("[data-loading-screen-mount='true']"),
		);
		await page.waitForTimeout(WARMUP_MS);

		await startTrace(session);
		await page.evaluate(() => {
			performance.mark("scroll-performance-start");
			window.__scrollPerformanceHarness?.start();
		});

		const scrollPath = await performScrollPath(page);

		const snapshot = await page.evaluate(() => {
			performance.mark("scroll-performance-end");
			return window.__scrollPerformanceHarness?.stop();
		});
		const trace = await stopTrace(session);
		const traceEvents = Array.isArray(trace.traceEvents)
			? trace.traceEvents
			: [];
		const { endTs, startTs } = findTraceMarkTimestamps(traceEvents);
		const frameDurations = [];
		for (let index = 1; index < snapshot.frames.length; index += 1) {
			frameDurations.push(snapshot.frames[index] - snapshot.frames[index - 1]);
		}
		const viewportHeightPx = await page.evaluate(() => window.innerHeight);
		const scrollHeightPx = Number(snapshot.scrollHeight) || 0;
		const scrollMetrics = {
			...scrollPath,
			scrollHeightPx,
			scrollableHeightPx: Math.max(0, scrollHeightPx - viewportHeightPx),
			viewportHeightPx,
		};

		return buildRunResult({
			commit,
			frameDurations,
			layoutMs: sumTraceDuration(
				traceEvents,
				LAYOUT_EVENT_NAMES,
				startTs,
				endTs,
			),
			longTasks: snapshot.longTasks,
			notes: `scrollY=${Math.round(snapshot.scrollY)} of ${Math.round(snapshot.scrollHeight)}; distance=${Math.round(scrollMetrics.scrollDistancePx)}`,
			paintMs: sumTraceDuration(traceEvents, PAINT_EVENT_NAMES, startTs, endTs),
			scrollMetrics,
			scriptMs: sumTraceDuration(
				traceEvents,
				SCRIPT_EVENT_NAMES,
				startTs,
				endTs,
			),
			targetPath,
			viewport,
		});
	} finally {
		await context.close();
	}
}

async function writeOutput(outputPath, payload) {
	const absolutePath = path.isAbsolute(outputPath)
		? outputPath
		: path.join(process.cwd(), outputPath);
	await fs.mkdir(path.dirname(absolutePath), { recursive: true });
	await fs.writeFile(
		`${absolutePath}`,
		`${JSON.stringify(payload, null, 2)}\n`,
	);
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	if (args.flags.has("help")) {
		printUsage();
		return;
	}

	const targetPath = normalizeTargetPath(readString(args.values, "path"));
	const readySelector = readString(args.values, "ready-selector");
	const runCount = readPositiveInteger(args.values, "runs", DEFAULT_RUNS);
	const baseUrl = readString(args.values, "base-url");
	const outputPath = readString(args.values, "output");
	const notes = readString(args.values, "notes");
	const commit = getCommit();

	let server = null;
	if (!baseUrl) {
		server = await startLocalProductionServer();
	}

	const resolvedBaseUrl = baseUrl ?? server.baseUrl;
	const browser = await chromium.launch({
		headless: !args.flags.has("headed"),
	});

	try {
		const runs = [];
		for (let index = 0; index < runCount; index += 1) {
			runs.push(
				await runMeasurement({
					baseUrl: resolvedBaseUrl,
					browser,
					commit,
					readySelector,
					targetPath,
					viewport: DEFAULT_VIEWPORT,
				}),
			);
		}

		const payload = {
			aggregate: buildAggregate({
				commit,
				notes,
				runs,
				targetPath,
				viewport: DEFAULT_VIEWPORT,
			}),
			capturedAt: new Date().toISOString(),
			environment: buildEnvironmentEvidence({
				browserVersion: browser.version(),
				viewport: DEFAULT_VIEWPORT,
			}),
			project: PROJECT,
			route: targetPath,
			runs,
			schemaVersion: 1,
		};

		if (outputPath) {
			await writeOutput(outputPath, payload);
			console.log(`Wrote measurement payload to ${outputPath}`);
		}

		console.log(
			`Measured ${targetPath} on ${payload.aggregate.viewport}: p95 ${payload.aggregate.p95_frame_ms}ms, p99 ${payload.aggregate.p99_frame_ms}ms, >33ms frames ${payload.aggregate.frames_over_33ms}.`,
		);
		console.log(JSON.stringify(payload, null, 2));
	} finally {
		await browser.close();
		await stopServer(server?.child);
	}
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
