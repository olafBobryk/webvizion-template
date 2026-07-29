# Template Intelligence Ledger

## Purpose

- Goal: Add an optional internal template-intelligence surface backed by a generated local repo index.
- Success criteria: The index generates deterministically, the internal visualizer renders it, `--no-intelligence` removes the feature, and verification passes in an isolated worktree.
- Ledger owner: Codex
- Last updated: 2026-05-25

## Operating Rules

- Default autonomy: Proceed within planned chunks.
- Human gates: Stop before broader navigation changes, committed generated artifacts, Serena as a repo dependency, secret scanning, or external services.
- Verification baseline: `npm run intelligence:generate`, `npm run lint`, `npm run build`, legacy removal dry-run, disposable legacy removal verification, browser check on the agent automation URL.
- Handoff file: `docs/worklogs/template-intelligence-handoff.md`

## Status Legend

- `queued`: not started
- `in_progress`: actively being worked
- `blocked`: cannot proceed without external fix or missing dependency
- `needs_human`: decision gate reached
- `fixed`: implementation or review pass complete, not yet verified
- `verified`: checks passed for the chunk
- `signed_off`: human accepted the chunk

## Chunks

| Chunk | Status | Owner/Audience | Scope | Acceptance Criteria | Verification | Notes |
|---|---|---|---|---|---|---|
| 1. Worktree + Ledger Setup | verified | Maintainer/agent | Isolated worktree, branch, ledger, handoff, dev preview | Worktree exists on `codex/template-intelligence`; agent server prints preview URLs | `npm run dev:agent -- --dry-run`; long-lived `npm run dev:agent` | Worktree created at `.worktrees/template-intelligence`; preview started on port 3011 |
| 2. Generator + Artifact Contract | verified | Maintainer/agent | Deterministic scanner and ignored JSON artifact | `.template-intelligence/index.json` generates and remains untracked | `npm run intelligence:generate`; `git status --short --ignored` | Generated 226 files and 8 concepts; artifact is ignored |
| 3. Internal Visualizer | verified | Maintainer/agent | `/internal/intelligence` page and server-side reader | Generated and missing-index states render | Browser check on automation URL | Generated state shows heading, graph, and SVG; missing state shows generation command |
| 4. Legacy removal Integration | verified | Template clone maintainer | `--no-intelligence` optional surface removal | Legacy removal rewrites central files and removes feature scripts/docs/source | Dry-run and disposable real legacy removal | Disposable legacy removal completed and built successfully |
| 5. Docs + Verification | verified | Future maintainer/agent | Docs, handoff, final checks | Docs explain local generated artifact and UA boundary; checks pass | Lint, build, browser check | Understand-Anything kept external and `.understand-anything/` ignored |
| 6. Graph Hardening | verified | Maintainer/agent | Richer graph interaction, responsive canvas, data/detail rail, ledger updates | Graph uses accessible concept buttons, query state, selected detail, strongest links, and mobile-safe canvas | Lint, build, legacy removal dry-run, disposable legacy removal, browser DOM checks | Screenshot at `/tmp/template-intelligence-preview-hardened.png` |
| 7. Graph Upgrade | verified | Maintainer/agent | Physics canvas graph modes, task map, surface ownership, content boundaries, benchmark surface | Graph modes render from normalized server-built graph data and `--no-intelligence` owns new dependencies/scripts/logs | Lint, build, legacy removal dry-run, browser viewport checks | Uses `react-force-graph-2d` with `d3-force`; active benchmark log starts empty |
| 8. Graph Polish | verified | Maintainer/agent | Visual readability only for Task Map and Surface Ownership | Graph density settings, clearer lanes, selected-neighborhood dimming, filtered fit, and center-selected controls work without changing routes or benchmark scope | Lint, build, legacy removal dry-run, browser viewport checks | No new dependencies, routes, or benchmark redesign |
| 9. Digital-Twin Canvas | verified | Maintainer/agent | First-screen graph hero and visible physics canvas | Graph feels like an interactive canvas map above normal page content, with sparse segmented controls | Lint, build, legacy removal dry-run, browser viewport checks | No new dependencies, routes, or benchmark redesign |
| 10. CORAL-G UX Parity | verified | Maintainer/agent | Earlier CORAL-G-inspired map shell, semantic shapes, link labels, legend, and inspector | The graph matched the first local CORAL-G reference while keeping template intelligence colors and data modes | Lint, build, legacy removal dry-run, browser checks | Superseded by Chunk 12 after the current 3D contract-ledger reference was identified |
| 11. Relative Map Placement | verified | Maintainer/agent | Move map below intro, add reusable scroll-focus overlay, and place controls in normal page flow | Index/Benchmarks switcher sits in the intro, graph modes sit above the relative map, and canvas interaction requires explicit focus | Lint, build, browser checks | Keeps the map from claiming first-section layout or accidental page scroll |
| 12. Actual 3D Reference Port | verified | Maintainer/agent | Port the current CORAL-G contract-ledger 3D graph behavior and remove the interim overlay/panel shell | Default map is a real 3D force graph with source-style SpriteText labels, 2D focus remains separate, and node details open from a node-anchored dropdown | Lint, build, legacy removal dry-run, browser checks | Corrects the source reference from the older 2D map to `CORAL-G-contract-ledger/visual-node-map`; colors and data remain template-specific |
| 13. UX Cleanup Route Split | verified | Maintainer/agent | Move the graph to a no-scroll route and simplify the overview | `/internal/intelligence` is a compact overview, `/internal/intelligence/graph` is full-screen, native graph tooltips and eyebrow chrome are removed, and 2D focus shows real neighbors | Lint, build, legacy removal dry-run, browser checks | Benchmark charts and graph colors remain intentionally unchanged |
| 14. Design-System Correction | verified | Maintainer/agent | Bring overview, benchmarks, graph route, and graph header back onto shared primitives | Header is visible and force-scrolled on the graph route, graph uses `Section.Background`, controls use rounded `SegmentedControl`/pill `Button`, and benchmark toggle keeps query behavior | Lint, build, legacy removal dry-run, browser checks, diff check | No graph color or benchmark chart redesign in this pass |
| 15. Graph Control Refinement | verified | Maintainer/agent | Tighten graph section spacing, primary segmented controls, focus-gated canvas interaction, and invisible node detail affordance | Graph mode nav sits at the bottom of the graph section, active segmented pills use primary color, graph focus uses shared `InteractionGate` with Escape release, and node details open without visible trigger chrome | Lint, build, legacy removal dry-run, browser checks, diff check | No graph color, benchmark chart, route, or dependency scope change |
| 16. 2D Focus Map Repair | verified | Maintainer/agent | Repair 2D focus into a local physics map plus next-step preview | 2D centers the focused node, uses D3 link/charge/collision/guide forces for connected nodes, hover-expands one neighbor's next steps, dims unrelated nodes, and promotes clicked nodes | Lint, build, legacy removal dry-run, browser checks, diff check | No new route, dependency, graph mode, or benchmark scope |
| 17. Node Detail Side Panel | verified | Maintainer/agent | Replace moving-node dropdown placement with a stable shared side panel | Selected node details now render in a compact side `Panel` for both 3D and 2D, close on outside/background click, and no longer depend on projected canvas anchor timing | Lint, build, legacy removal dry-run, browser checks, diff check | No graph data, route, dependency, or benchmark scope change |
| 18. Node Detail Flow Alignment | verified | Maintainer/agent | Move the selected-node side panel into the graph route foreground flow | The 3D and 2D node detail panel sits with the title panel and route/view controls instead of inside the graph background layer | Lint, build, legacy removal dry-run, browser checks, diff check | No graph data, route, dependency, or benchmark scope change |
| 19. Graph Visual Semantics | verified | Maintainer/agent | Improve labels, semantic link meaning, and degree-based physics | Labels remain always visible but offset from nodes, link colors explain relationship type through a foreground legend, and node size/repulsion scale with connection count | Lint, build, legacy removal dry-run, browser checks, diff check | No route, dependency, graph mode, benchmark, or generated-artifact scope change |
| 20. Graph Line and Panel Simplification | verified | Maintainer/agent | Remove line travel indicators, move node details left, lower graph nav, and centralize chip label tokens | Graph links are plain semantic lines, node details sit in a left foreground slot outside the top control flex, graph mode nav sits lower, and graph labels consume shared `Chip` visual tokens | Lint, build, legacy removal dry-run, browser checks, diff check | No route, dependency, graph mode, benchmark, or generated-artifact scope change |
| 21. Source Chip and Graph Reference | verified | Maintainer/agent | Source `Chip` from the 2026 zero-emissions platform and make the graph renderer reusable | `Chip` now lives in `ui/misc`, graph labels consume its canvas tokens, Template Intelligence wraps shared `GraphMap`, and `/internal/reference` includes a live 3D + 2D graph example with different node/link content | Lint, build, legacy removal dry-run, browser checks, diff check | `Chip` and shared graph code are design-system assets; `--no-intelligence` does not remove them while reference graph usage remains |

## Decisions

| Date | Chunk | Decision | Rationale | Status |
|---|---|---|---|---|
| 2026-05-23 | 1 | Use an optional internal surface with generated local index | Matches existing optional internal surfaces while keeping Understand-Anything external | accepted |
| 2026-05-23 | 2 | Add `predev`, `predev:user`, `predev:agent`, and `prebuild` generation hooks | Covers all repo dev server entrypoints plus production build | accepted |
| 2026-05-23 | 3 | Use a dependency-free custom graph | Satisfies the pilot without crossing the external-package gate | accepted |
| 2026-05-23 | 6 | Render graph nodes as HTML controls over presentational SVG edges | Keeps selection accessible and labels readable while preserving weighted graph visuals | accepted |
| 2026-05-23 | 6 | Use a horizontal graph canvas on narrow screens | Prevents label clipping and preserves node readability on mobile widths | accepted |
| 2026-05-24 | 7 | Use force-graph plus physics guide forces for graph modes | User approved the dependency gate and the surface needed more than a fixed radial graph | accepted |
| 2026-05-25 | 9 | Move the intelligence hero graph to a physics canvas | User requested a digital-twin style map, so the optional intelligence surface owns the force-graph dependencies | accepted |
| 2026-05-24 | 8 | Keep graph polish visual-only | Improves readability without broadening benchmark, route, or dependency scope | accepted |
| 2026-05-24 | 9 | Use a first-screen physics graph hero instead of an embedded chart panel | Matches the requested digital-twin map behavior while preserving normal document scroll and existing graph modes | accepted |
| 2026-05-25 | 10 | Copy the local CORAL-G visual node map UX | The user pointed to the concrete Documents reference; the graph now follows its 2D canvas, semantic shapes, legend, reset, and inspector pattern while retaining template colors | accepted |
| 2026-05-25 | 11 | Move graph controls into document flow | The page switcher and graph mode selector are easier to understand when they are above the relative map instead of floating over a first-screen canvas | accepted |
| 2026-05-25 | 12 | Port the actual CORAL-G contract-ledger 3D graph UX | The previous pass copied the wrong 2D reference; the active source uses `react-force-graph-3d`, `three`, and SpriteText labels, with 2D focus as a secondary mode | accepted |
| 2026-05-25 | 13 | Split graph inspection from the overview | The long scrolling index page made the graph harder to use; a dedicated graph route lets the map stay no-scroll while the overview becomes a launcher and benchmark entry point | accepted |
| 2026-05-25 | 14 | Restore shared design-system ownership | The graph route still needs the marketing header and section rhythm; using `Section.Background`, `Button`, `Text`, `Panel`, and rounded `SegmentedControl` keeps the internal surface aligned with template conventions | accepted |
| 2026-05-25 | 15 | Use a shared interaction gate over graph-local canvas state | The canvas is WebGL/canvas-backed, so focus state stays local to the graph, while the gating overlay belongs in `ui/misc` and composes shared `Button`, `Text`, motion timing, and modal-style backdrop behavior | accepted |
| 2026-05-25 | 16 | Treat 2D as a local physics next-step map | The full graph belongs in 3D; 2D should support concentration and navigation by centering one node, keeping direct neighbors connected through force-graph physics, and revealing only the hovered neighbor's next-step context | accepted |

## Findings

| Date | Chunk | Finding | Severity | Follow-up |
|---|---|---|---|---|
| 2026-05-23 | 1 | Repo has `dev:agent` but no `wt:*` scripts | low | Use direct `git worktree` commands |
| 2026-05-23 | 4 | Existing legacy removal fallback renderer reused header nav entries for footer nav entries | medium | Fixed renderer to emit footer-safe links without `sections` |
| 2026-05-23 | 5 | Worktree installs trigger Next workspace-root warnings because the main checkout also has a lockfile | low | Warning only; builds still pass |
| 2026-05-23 | 6 | Mobile-width DOM check found concept buttons could overflow the graph bounds | medium | Reworked graph viewport into a scrollable canvas; follow-up DOM check found zero overflowing graph buttons |

## Verification Log

| Date | Chunk | Command/Check | Result | Evidence |
|---|---|---|---|---|
| 2026-05-23 | 1 | `npm run dev:agent -- --dry-run` | passed | Printed URL `http://localhost:3011` and Automation URL |
| 2026-05-23 | 2 | `npm run intelligence:generate` | passed | Generated `.template-intelligence/index.json` with 226 files and 8 concepts |
| 2026-05-23 | 2 | `git status --short --ignored` | passed | `.template-intelligence/` listed as ignored, not tracked |
| 2026-05-23 | 4 | `retired generator command -- --dry-run --no-intelligence` | passed | Planned expected route/source/docs/script removals |
| 2026-05-23 | 4 | Disposable `retired generator command -- --yes --no-intelligence` | passed | Built successfully after surface removal; `/internal/intelligence` absent from route list |
| 2026-05-23 | 5 | `npm run lint` | passed | Biome checked 239 files |
| 2026-05-23 | 5 | `npm run build` | passed | Build generated `/internal/intelligence` route |
| 2026-05-23 | 5 | Browser check on `http://localhost:3011/internal/intelligence?motion=off&reveal=off` | passed | Heading, graph heading, and relationship SVG found |
| 2026-05-23 | 5 | Missing-index browser check | passed | Missing state and `npm run intelligence:generate` command found |
| 2026-05-23 | 6 | Browser graph DOM check | passed | Search input, SVG, selected buttons, and Strongest Links section found |
| 2026-05-23 | 6 | Mobile viewport DOM check at 390px | passed | Scrollable graph canvas present; 8 graph buttons; zero graph button overflow |
| 2026-05-23 | 6 | Disposable legacy removal after worklog owned-path update | passed | Reduced worklogs and built successfully |
| 2026-05-24 | 7 | Graph upgrade verification suite | passed | Generate/query/legacy removal/lint/build plus desktop, wide, tablet, mobile graph checks |
| 2026-05-24 | 8 | Graph polish verification suite | passed | Density controls, Focus links, Center, filtered Fit, benchmark views, and all graph modes verified on isolated agent preview |
| 2026-05-24 | 9 | Digital-twin canvas verification suite | passed | First-screen hero canvas, visible canvas motion over time, prompt chip, sparse segmented controls, mode switching, and below-hero content scroll verified on isolated agent preview |
| 2026-05-25 | 10 | CORAL-G UX parity verification suite | passed | Lint, build, legacy removal dry-run, all four nonblank moving 2D graph modes, semantic node shapes, legend, reset, inspector, mobile canvas, and unchanged benchmark view |
| 2026-05-25 | 11 | Relative map placement verification suite | passed | Lint, build, graph starts below intro, Index/Benchmarks switcher is visible in intro, graph mode switching works, and mobile canvas remains reachable |
| 2026-05-25 | 12 | Actual 3D reference port verification suite | passed | Lint, build, legacy removal dry-run, 3D overview and 2D focus render nonblank, node labels match the source SpriteText pattern, and node details use an anchored dropdown instead of the removed overlay/panel shell |
| 2026-05-25 | 13 | UX cleanup route split verification suite | passed | Lint, build, legacy removal dry-run, overview/benchmark/graph routes render, all four graph modes remain available, and 2D focus renders selected-node neighborhoods |
| 2026-05-25 | 14 | `npm run lint` | passed | Biome checked 245 files |
| 2026-05-25 | 14 | `npm run build` | passed | Build generated `/internal/intelligence` and `/internal/intelligence/graph` |
| 2026-05-25 | 14 | `retired generator command -- --dry-run --no-intelligence` | passed | Planned expected intelligence route/source/docs/script/dependency removals |
| 2026-05-25 | 14 | Browser design-system correction check | passed | Overview, benchmark real/placeholder toggle, graph route header, rounded segmented controls, 3D/2D switch, graph modes, and dropdown behavior passed on isolated agent preview |
| 2026-05-25 | 14 | `git diff --check` | passed | No whitespace errors |
| 2026-05-25 | 15 | `npm run lint` | passed | Biome checked 245 files |
| 2026-05-25 | 15 | `npm run build` | passed | Build generated `/internal/intelligence` and `/internal/intelligence/graph` |
| 2026-05-25 | 15 | `retired generator command -- --dry-run --no-intelligence` | passed | Planned expected intelligence route/source/docs/script/dependency removals |
| 2026-05-25 | 15 | Browser graph control refinement check | passed | Primary segmented controls, bottom graph nav, focus gate, Escape release, invisible node trigger, dropdown close, and all graph modes passed on isolated agent preview |
| 2026-05-25 | 15 | Browser design-system route smoke check | passed | Overview, benchmark, graph route, 3D/2D switch, graph mode switching, and dropdown behavior passed on isolated agent preview |
| 2026-05-25 | 15 | `git diff --check` | passed | No whitespace errors |
| 2026-05-25 | 16 | `npm run lint` | passed | Biome checked 247 files |
| 2026-05-25 | 16 | `npm run build` | passed | Build generated `/internal/intelligence` and `/internal/intelligence/graph` |
| 2026-05-25 | 16 | `retired generator command -- --dry-run --no-intelligence` | passed | Planned expected intelligence route/source/docs/script/dependency removals |
| 2026-05-25 | 16 | Browser 2D focus repair check | passed | Graph gate, 2D focus, hidden pre-focus anchors, focused node dropdown, graph mode switching, and benchmark/overview smoke checks passed on isolated agent preview |
| 2026-05-25 | 16 | `git diff --check` | passed | No whitespace errors |
| 2026-05-25 | 17 | `npm run lint` | passed | Biome checked 247 files |
| 2026-05-25 | 17 | `npm run build` | passed | Build generated `/internal/intelligence` and `/internal/intelligence/graph` |
| 2026-05-25 | 17 | `retired generator command -- --dry-run --no-intelligence` | passed | Planned expected intelligence route/source/docs/script/dependency removals |
| 2026-05-25 | 17 | Browser node detail side panel check | passed | 2D center node and visible 3D node opened the side panel, outside clicks closed it, graph modes switched, and old projected dropdown trigger text was absent |
| 2026-05-25 | 17 | Browser overview/benchmark smoke check | passed | Overview, real benchmark, and placeholder benchmark routes rendered on isolated agent preview |
| 2026-05-25 | 17 | `git diff --check` | passed | No whitespace errors |
| 2026-05-25 | 18 | `npm run lint` | passed | Biome checked 247 files |
| 2026-05-25 | 18 | `npm run build` | passed | Build generated `/internal/intelligence` and `/internal/intelligence/graph` |
| 2026-05-25 | 18 | `retired generator command -- --dry-run --no-intelligence` | passed | Planned expected intelligence route/source/docs/script/dependency removals |
| 2026-05-25 | 18 | Browser node detail flow check | passed | 2D selected-node panel rendered in the foreground controls flow and outside the graph canvas background; 3D uses the same foreground panel path |
| 2026-05-25 | 18 | `git diff --check` | passed | No whitespace errors |
| 2026-05-25 | 19 | `npm run lint` | passed | Biome checked 247 files |
| 2026-05-25 | 19 | `npm run build` | passed | Build generated `/internal/intelligence` and `/internal/intelligence/graph` |
| 2026-05-25 | 19 | `retired generator command -- --dry-run --no-intelligence` | passed | Planned expected intelligence route/source/docs/script/dependency removals |
| 2026-05-25 | 19 | Browser graph visual semantics check | passed | Foreground connection legend rendered, all graph modes switched, 2D and 3D rendered with always-visible offset labels, and overview/benchmark smoke routes loaded |
| 2026-05-25 | 19 | `git diff --check` | passed | No whitespace errors |
| 2026-05-25 | 20 | `npm run lint` | passed | Biome checked 248 files |
| 2026-05-25 | 20 | `npm run build` | passed | Build generated `/internal/intelligence`, `/internal/intelligence/graph`, and internal demo routes |
| 2026-05-25 | 20 | `retired generator command -- --dry-run --no-intelligence` | passed | Planned expected intelligence route/source/docs/script/dependency removals |
| 2026-05-25 | 20 | Browser graph simplification check | passed | Connection legend rendered, selected-node panel appeared in a left foreground slot outside the top controls row, graph mode nav sat near the bottom edge, and graph canvases rendered |
| 2026-05-25 | 20 | Browser route smoke check | passed | Overview, benchmark, and UI primitives demo routes rendered; demo includes `Chip` |
| 2026-05-25 | 20 | `git diff --check` | passed | No whitespace errors |

## Next Handoff

- Current chunk: complete
- Next task: Human review or commit/publish flow.
- Stop conditions: Broader nav architecture, Serena repo dependency, committed generated artifact, or secret/env scanning.
