# Scroll Performance Benchmark

## Purpose

Track deterministic scroll-performance measurements against real existing page
paths. The template owns the measurement harness and disposable worktree loop;
project instances choose the target page and the mutable file scopes.

Live measurement output belongs in local runtime files under `tmp/`. The
committed example log remains schema reference only.

## Commands

Run a fast single measurement against a page:

```bash
npm run build
npm run measure:scroll-performance -- --path /internal/demo/ui/primitives --output tmp/scroll-performance.json
```

For pages that need a specific element before measurement starts, add:

```bash
npm run measure:scroll-performance -- --path / --ready-selector "#home-hero" --output tmp/home-scroll.json
```

Record the aggregate result:

```bash
npm run record:scroll-performance -- --input tmp/scroll-performance.json
```

Create a disposable autoresearch worktree for a real page target:

```bash
npm run setup:scroll-performance-autoresearch -- --tag home-hero --path / --mutable src/lib/marketing-content/sections/homeHero
```

Preview the setup without creating a worktree:

```bash
npm run setup:scroll-performance-autoresearch -- --tag page-smoke --path /internal/demo/ui/primitives --mutable src/components/ui/primitives --dry-run
```

Score the accepted baseline or one committed candidate inside the worktree:

```bash
npm run score:scroll-performance -- --tag home-hero
```

## Result Schema

Each recorded aggregate run stores:

- `target_path`
- `p95_frame_ms`
- `p99_frame_ms`
- `max_frame_ms`
- `top_3_frame_avg_ms`
- `frame_count`
- `measurement_duration_ms`
- `frames_over_16_7ms`
- `frames_over_33ms`
- `frames_over_16_7_per_1000px`
- `frames_over_33_per_1000px`
- `jank_budget_ms`
- `jank_budget_ms_per_1000px`
- `severe_jank_budget_ms`
- `severe_jank_budget_ms_per_1000px`
- `long_task_ms`
- `long_task_count`
- `long_task_ms_per_1000px`
- `script_ms`
- `script_ms_per_1000px`
- `layout_ms`
- `layout_ms_per_1000px`
- `paint_ms`
- `paint_ms_per_1000px`
- `scroll_height_px`
- `scrollable_height_px`
- `scroll_distance_px`
- `start_scroll_y`
- `end_scroll_y`
- `viewport_height_px`
- `viewport`
- `commit`
- `status`
- `notes`

Additive work and jank metrics include a `*_per_1000px` normalized form so the
score does not reward candidates that reduce page height or measured scroll
distance. Tail frame metrics such as `p95_frame_ms`, `p99_frame_ms`,
`max_frame_ms`, and `top_3_frame_avg_ms` stay in milliseconds because a stutter
is experienced as time. Those metrics are protected by the geometry gate below.

## V1 Keep Rule

- Fast pass: one run.
- Confirm pass: three runs.
- A candidate is gated before performance scoring if it changes the measured
  page shape beyond the tolerance:
  - exact `target_path` match,
  - exact `viewport` match,
  - `scrollable_height_px` within `2%` or `80px`,
  - `scroll_distance_px` within `2%` or `80px`,
  - `viewport_height_px` within `1px`.
- A gated candidate is recorded as `gate`, reset back to the accepted baseline,
  and should be reviewed as a visual/layout change rather than auto-kept as a
  performance win.
- A kept result must improve at least one primary metric:
  - `p95_frame_ms`, or
  - `frames_over_33ms`
- If `p95_frame_ms` is the improved primary metric, `frames_over_33ms` must not
  regress by more than `1.0` averaged frame.
- If `frames_over_33ms` is the improved primary metric, `p95_frame_ms` must not
  regress by more than `0.5ms`.
- If both primary metrics improve, the result is eligible to keep without using
  the cross-metric tolerance.

## Surface Ownership

`retired generator command -- --no-scroll-performance` removes the grouped scripts,
benchmark docs, package scripts, and Playwright dependency. It does not own an
internal route because measurements run against real page paths.

Thin-start does not include this tooling by default. If a thin-start instance
needs scroll-performance measurement, add it intentionally after activation.

## Notes

- Scoring uses a production-like local build against real page paths; internal
  developer routes remain blocked in production mode.
- The benchmark surface is process infrastructure only; it does not authorize
  page changes by itself.
- Disposable loop runs keep `results.jsonl`, `latest-measurement.json`,
  `state.json`, and optional `run.log` under
  `tmp/scroll-performance-autoresearch/<tag>/`.
- The score loop resets discarded candidate commits in its disposable
  autoresearch worktree back to the accepted baseline. Do not run candidate
  scoring from a worktree that contains uncommitted or unrelated work.
