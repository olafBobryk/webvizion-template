# Template Intelligence Review Handoff

## Task

Review and improve the Template Intelligence visual surface, architecture
direction, implementation quality, and ship readiness.

## Current State

- Main checkout:
  `/Users/olafbobryk/Documents/Code/Personal/2025/averlo-next-template`
- Template Intelligence is optional template infrastructure.
- Generated artifacts stay ignored:
  `.template-intelligence/`, `.serena/`, `.next-*`, `tsconfig.next-*.json`.
- Active benchmark log intentionally starts empty:
  `docs/worklogs/template-intelligence-benchmark-runs.jsonl`
- Placeholder data for visual QA lives in:
  `docs/worklogs/template-intelligence-benchmark-runs.example.jsonl`

## What Exists

- Generated repo intelligence:
  - `npm run intelligence:generate`
  - `.template-intelligence/index.json`
  - `.template-intelligence/agent-map.json`
- Direct task lookup:
  - `npm run intelligence:query -- dev-server`
  - topics: `route-architecture`, `ui-primitives`, `legacy-subtraction`,
    `content-modes`, `dev-server`, `new-internal-surface`
- Graph surface:
  - `/internal/intelligence?view=index`
  - segmented graph modes: Concepts, Task Map, Surface Ownership, Content
    Boundaries
- Benchmark recording:
  - `npm run intelligence:record`
  - `npm run intelligence:record:clear -- --yes`
  - `/internal/intelligence?view=benchmarks`
  - `/internal/intelligence?view=benchmarks&example=on`
- Optional Serena setup:
  - `npm run intelligence:serena:setup -- --dry-run`
  - user-local only, no repo dependency

## Key Files

- Visual route:
  `src/app/(site)/(marketing)/internal/intelligence/page.tsx`
- Interactive graph:
  `src/app/(site)/(marketing)/internal/intelligence/TemplateIntelligenceGraph.tsx`
- Server readers and graph builders:
  `src/lib/template-intelligence/index.ts`
  `src/lib/template-intelligence/graphs.ts`
- Generator and agent map:
  `scripts/generate-template-intelligence.mjs`
- Recording CLIs:
  `scripts/record-template-intelligence-benchmark.mjs`
  `scripts/clear-template-intelligence-benchmark.mjs`
- Serena setup:
  `scripts/setup-template-intelligence-serena.mjs`
- Legacy removal ownership:
  `retired generator script`

## Review Focus

- Graph modes should be readable at desktop, wide desktop, tablet, and mobile.
- Task Map should expose concrete starting files, not only high-level concepts.
- Surface Ownership should match the `--no-intelligence` dry-run and show broader
  optional-surface blast radius.
- Content Boundaries should keep static, Payload-ready, and Payload-powered
  responsibilities clear.
- Placeholder benchmark data must be impossible to confuse with real run
  history.

## Verification Baseline

```bash
npm run intelligence:generate
npm run intelligence:query -- dev-server
npm run intelligence:query -- legacy removal
npm run intelligence:query -- content-modes
npm run intelligence:serena:setup -- --dry-run
retired generator command -- --dry-run --no-intelligence
npm run lint
npm run build
git diff --check
git status --short --ignored
```

Browser checks must use the isolated agent server:

```bash
npm run dev:agent
```

Check:

- `/internal/intelligence?view=index&motion=off&reveal=off`
- `/internal/intelligence?view=benchmarks&motion=off&reveal=off`
- `/internal/intelligence?view=benchmarks&example=on&motion=off&reveal=off`

## Stop Conditions

Stop and ask before publishing, committing generated artifacts, broadening
navigation architecture, adding Serena as a repo dependency, or using secrets or
external service scans.
