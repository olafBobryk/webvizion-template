# Fresh-Chat Handoff: Template Intelligence

Use $chunked-delivery-planner
Use $agent-worktree-workflow

## Active Plan

- Goal: Build an optional internal intelligence surface backed by a generated local repo index.
- Ledger: `docs/worklogs/template-intelligence-ledger.md`
- Handoff source: `docs/worklogs/template-intelligence-handoff.md`
- Current chunk: Chunk 16 2D Focus Map Repair
- Status: verified
- Default autonomy: Human review, commit, or publish flow can proceed after checks pass.

## Completed

- Created worktree `.worktrees/template-intelligence` on branch `codex/template-intelligence`.
- Installed worktree dependencies.
- Started long-lived agent dev server at `http://localhost:3011`.
- Added deterministic local scanner at `scripts/generate-template-intelligence.mjs`.
- Added ignored `.template-intelligence/index.json` artifact flow.
- Added `/internal/intelligence` visualizer and server-side reader.
- Hardened the graph into accessible HTML concept controls over dependency-free SVG edges.
- Added query state, selected concept details, strongest links, source-type nodes, and mobile-safe horizontal graph canvas.
- Upgraded the visual graph to a force-graph digital-twin style map after the
  dependency gate was explicitly approved.
- Added segmented graph modes for Concepts, Task Map, Surface Ownership, and
  Content Boundaries.
- Polished graph readability with mode-aware density settings, Task Map
  path-family lanes, Surface Ownership ownership lanes, selected-neighborhood
  dimming, filtered fit behavior, and center-selected controls.
- Reworked the intelligence index graph into a first-screen digital-twin canvas
  hero with visible physics, sparse segmented controls, and the content below
  scrolling normally after the hero.
- Reworked the graph UX to match the current local CORAL-G contract-ledger
  visual node map reference: default `react-force-graph-3d` overview,
  `three-spritetext` node labels, physics interaction, and a separate 2D focus
  mode while retaining template intelligence colors.
- Moved the map below the intro/stats section, moved Index/Benchmarks into the
  intro, and moved graph mode controls above the relative canvas.
- Removed the interim click-focus overlay, legend shell, and
  side-inspector-first interaction. Node details later moved back to a compact
  side panel after projected dropdown anchors proved unreliable against moving
  canvas nodes.
- Split the graph onto `/internal/intelligence/graph` as a no-scroll full-screen
  route.
- Simplified `/internal/intelligence` to the overview stats, graph launcher, and
  benchmark CTA; removed redundant generated concept/file/source panels.
- Removed graph eyebrow chrome, native force-graph hover tooltip labels, and the
  broken Index/Benchmarks segmented switcher.
- Repaired 2D focus endpoint resolution so force-graph-mutated link endpoints
  still produce selected-node neighborhoods.
- Restored design-system ownership for the intelligence surfaces:
  `/internal/intelligence/graph` now keeps the marketing header visible in its
  force-scrolled state, renders the graph through `Section.Background`, and uses
  shared `Text`, `Panel`, `Button`, and rounded `SegmentedControl` primitives.
- Replaced the benchmark Real runs/Placeholder switch with a rounded
  `SegmentedControl` while preserving the benchmark query-string behavior.
- Refined graph controls: graph section spacing is compact under the forced
  header, active segmented pills use the primary color, graph mode navigation is
  bottom-aligned inside the graph section, and canvas interaction is protected by
  a shared `InteractionGate` overlay with modal-style dark backdrop and Escape
  release.
- Removed the visible selected-node trigger chip. Node details now render in a
  shared `Panel` on the side of the graph for both 3D and 2D, avoiding projected
  anchor drift while keeping the canvas labels clean.
- Repaired 2D focus into a local physics next-step map: the focused node stays
  centered, direct neighbors stay connected through D3 link/charge/collision and
  guide forces, hovering a direct neighbor reveals that neighbor's next-step
  nodes in an outer preview ring, unrelated nodes dim, and clicking any visible
  node promotes it to the centered focus node.
- Replaced projected node dropdown anchors with a stable side panel and
  outside-click close behavior after moving nodes made the popup position feel
  unreliable.
- Moved the selected-node side panel into the graph route's foreground document
  flow with the title panel and controls, so 3D and 2D inspection use the same
  section layout instead of rendering inside the canvas background layer.
- Added graph visual semantics polish: always-visible labels are offset away
  from nodes, node size and repulsion scale with connection count, link colors
  stay semantic by relationship type, and a compact foreground legend explains
  connection meanings.
- Removed directional arrows and moving particles from graph lines, moved the
  selected-node panel to a left-side foreground slot outside the top controls
  flex row, and lowered the bottom graph-mode segmented control by tightening
  graph section padding.
- Ported the source `Chip` component into `src/components/ui/misc`, removed the
  temporary primitive Chip, moved the graph renderer into reusable `GraphMap`,
  and added `/internal/reference` as the live 3D + 2D graph implementation
  reference. Template Intelligence now supplies graph content while the shared
  renderer owns the UX.
- Added generated `.template-intelligence/agent-map.json` and
  `npm run intelligence:query -- <topic>`.
- Added active/placeholder benchmark JSONL logs, recording CLIs, and
  `/internal/intelligence?view=benchmarks`.
- Added optional user-local Serena setup docs and dry-run script.
- Added `--no-intelligence` legacy removal support, including the worklog files.
- Documented the local artifact and Understand-Anything external boundary.

## Next Task

- Start with: Review `/internal/intelligence`, `/internal/intelligence/graph`,
  and the benchmark view, then decide whether to commit and merge/publish.
- Scope: Source/docs/scripts only; generated `.template-intelligence/`, `.next-*`, `node_modules`, and `tsconfig.next-*` stay untracked.
- Acceptance criteria: The branch remains buildable, removable, previewable, and generated artifacts stay untracked.
- Stop for human if: Broader nav architecture change, Serena repo dependency, generated artifact commit, or secret scanning is proposed.

## Context

- Repo/workspace: `/Users/olafbobryk/Documents/Code/Personal/2025/averlo-next-template`
- Branch: current checkout
- Preview: start with `npm run dev:agent`
- Automation: use the printed automation URL with `motion=off&reveal=off`
- Auth/data context: No credentials used; scanner excludes env/secrets and external services.

## Commands

- Generate: `npm run intelligence:generate`
- Query: `npm run intelligence:query -- dev-server`
- Benchmark: `npm run intelligence:record`, `npm run intelligence:record:clear -- --yes`
- Serena dry run: `npm run intelligence:serena:setup -- --dry-run`
- Run: `npm run dev:agent`
- Verify: `npm run lint`, `npm run build`, `retired generator command -- --dry-run --no-intelligence`
- Disposable legacy removal verification used: copy worktree to `/tmp/averlo-next-template-legacy removal-verify`, install, then run `retired generator command -- --yes --no-intelligence`

## Human Gates

- Broader navigation architecture changes.
- Serena as a repo dependency.
- Committing generated intelligence artifacts.
- Secret/env or external-service scanning.
