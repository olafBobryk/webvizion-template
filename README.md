# Averlo Next Template

![Averlo Next Template banner](public/averlo-next-template-banner.png)

Clone the template, choose the route profile and content mode that fit the
project, then build the project-specific design system on the resulting Next.js
App Router scaffold.

Averlo Next Template is intentionally small at the live page layer: a marketing
shell, typed section rendering, fallback content, shared primitives, motion
foundations, agent-safe dev tooling, and optional Payload CMS scaffolding. The
goal is to let agents implement a real design system and site structure without
starting from a blank app or first dismantling a demo-heavy product.

## Instant Setup

Template repository: [https://github.com/olafBobryk/averlo-next-template](https://github.com/olafBobryk/averlo-next-template)

### First-Time Bootstrap

Copy this prompt into Codex or another coding agent when you have not cloned
the template yet:

**Create a new Averlo Next Template project from `https://github.com/olafBobryk/averlo-next-template`. Clone it into a new local folder, then read `AGENTS.md`, `README.md`, and `docs/template-content-modes.md`. Keep secrets, deploy hooks, environment files, generated agent indexes, local build output, and local service metadata out of Git. Use the existing marketing shell, section registry, UI primitives, content-mode docs, prune tooling, and agent dev-server workflow as the starting point. Help me choose static, Payload-ready, or Payload-powered mode before changing the content architecture.**

Equivalent shell-first setup:

```sh
git clone https://github.com/olafBobryk/averlo-next-template.git my-site
cd my-site
npm install
npm run dev
```

Choose and materialize a route profile before project-specific implementation:

```sh
npm run create:project -- --profile full --output ../my-full-project
npm run create:project -- --profile app-only --output ../my-dashboard-project
npm run create:project -- --profile marketing-only --output ../my-site
```

`app-only` keeps authentication, dashboard, and local developer tools while
removing marketing and Payload. `marketing-only` keeps the broad shared UI,
marketing, local developer tools, and Payload-ready scaffold without auth or
dashboard. `thin-start` remains the minimal marketing specialist profile.

### Already Cloned

**Set up this repository as an Averlo Next Template project. Read `AGENTS.md`, `README.md`, and `docs/template-content-modes.md` first. Summarize the current content mode, route shell, section registry, UI primitive surface, and optional template workflows. Keep secrets, deploy hooks, environment files, generated indexes, and local build output out of Git. Use `npm run dev:agent` for browser automation and do not use the user's dev server for agent testing.**

### Continue Existing Project

**Continue this Averlo Next Template project. Read the nearest `AGENTS.md` files before changing code. Summarize what has been customized, which optional surfaces are still present, which content mode is active, and what checks are needed. Prefer existing UI primitives, section renderers, resolvers, and template scripts before adding new structure.**

## Public Safety

This repo is intended to be public-template safe. Do not commit local secrets,
tokens, deploy hooks, database URLs, Payload secrets, `.env` files, generated
agent indexes, local Vercel metadata, build output, dependency folders, raw
client files, or throwaway worktrees.

Use ignored local files or platform environment stores for secrets. Keep
source-specific CMS and deployment details behind server-side resolvers and
adapters so the frontend continues to render a small page/section contract.

## What Ships Here

- **Next.js App Router foundation:** public route shell, API routes, metadata,
  sitemap generation, guarded Payload routes, and error states.
- **Marketing shell:** header, compact/full navigation, footer, scroll
  controller, menu/search data, and route-level reveal motion.
- **Typed section renderer:** lightweight page and section types, fallback
  content, a renderer registry, and a starter home hero section.
- **Design-system starting point:** primitives, inputs, overlays, motion
  helpers, focus/motion foundations, branding, and mount components.
- **Content modes:** static fallback content, Payload-ready scaffold, or
  Payload-powered Vercel setup.
- **Agent workflows:** Template Intelligence with warm-optional Serena,
  isolated agent dev server, filesystem-backed route profiles, template pruning, smoke checks,
  page-target scroll-performance autoresearch harnesses, and
  optional thin-start activation.

## Included Workflows

### Agent Dev Server

Use the isolated agent dev server for browser testing and automation:

```sh
npm run dev:agent
```

The normal `npm run dev` and `npm run dev:user` paths are reserved for a human
local server.

### Template Intelligence

Generate and query the local map before substantial implementation work:

```sh
npm run intelligence:generate
npm run intelligence:query -- route-architecture
npm run intelligence:query -- ui-primitives
npm run intelligence:query -- content-modes
```

Serena semantic lookup is optional and warm-local, not required ceremony. Use
`npm run intelligence:serena:status` to inspect it, use
`npm run intelligence:serena:ensure` when semantic navigation or a Hybrid
benchmark needs a warm service, and use `npm run intelligence:serena:stop` to
clean up the local server. Normal implementation work should continue with
Template Intelligence, `rg`, and file reads when Serena is cold. The generated
`.template-intelligence/`, `.serena/`, `.codex/serena.json`, and `.codex/tmp/`
paths are ignored local artifacts. See `docs/template-intelligence.md` for the
full workflow.

### Scroll Performance

Measure an existing page when a candidate changes motion, scrolling, shared
shell behavior, or a page section with expensive scroll effects:

```sh
npm run measure:scroll-performance -- --path /internal/demo/ui/primitives --output tmp/scroll-performance.json
npm run record:scroll-performance -- --input tmp/scroll-performance.json
```

The measurement harness injects timing instrumentation into the real page path,
records normalized per-1000px work/jank metrics, and gates auto-keeps when page
height or measured scroll distance changes enough to suggest a visual/layout
change.

For bounded agent exploration, use the page-target scroll-performance
autoresearch harness, inspired by the metric loop in
[autoresearch-skill](https://github.com/wjgoarxiv/autoresearch-skill). It
creates a disposable worktree around one real page target and one or more
mutable scopes, then lets a worker test exactly one committed candidate against
the accepted baseline:

```sh
npm run setup:scroll-performance-autoresearch -- --tag home-hero --path / --mutable src/lib/marketing-content/sections/homeHero
cd .worktrees/scroll-performance-autoresearch-home-hero
npm run score:scroll-performance -- --tag home-hero --runs 1 --label "baseline"
```

Then make exactly one committed candidate inside the mutable allowlist and score
it:

```sh
npm run score:scroll-performance -- --tag home-hero --runs 1 --label "candidate"
```

The harness owns the measurement, scoring, run log, state, and worktree loop;
project instances own the target page and mutable file allowlist. The worker
writes `state.json`, `results.jsonl`, `latest-measurement.json`, and `run.log`
under ignored `tmp/scroll-performance-autoresearch/<tag>/`. It keeps eligible
candidates, gates layout/geometry changes, and resets discarded or gated
candidates back to the accepted baseline inside the disposable worktree.
Preview setup first with `--dry-run`. See
`docs/worklogs/scroll-performance-benchmark.md` for the full scoring contract.

### Content Modes

Choose the lightest content mode that fits the project:

- **Static:** remove Payload with `npm run prune:template -- --no-payload` and
  build from TypeScript fallback content.
- **Payload-ready:** keep guarded Payload files, but do not expose live
  admin/API routes until CMS editing is required.
- **Payload-powered Vercel:** enable real Payload admin/API routes, provision
  Neon Postgres and Vercel Blob, and adapt Payload documents into the same
  lightweight render props.

Read `docs/template-content-modes.md` for mode boundaries and
`docs/payload-vercel-neon-blob.md` before activating Payload on Vercel.

### Lightweight Prune

Dry-run before removing optional surfaces:

```sh
npm run prune:template -- --dry-run --no-dashboard --no-demo --no-scroll-performance --no-dictionary --no-reference --no-playground
```

Apply the lightweight route-surface prune after reviewing the plan:

```sh
npm run prune:template -- --yes --no-dashboard --no-demo --no-scroll-performance --no-dictionary --no-reference --no-playground
```

For a static site, remove Payload explicitly:

```sh
npm run prune:template -- --yes --no-dashboard --no-demo --no-scroll-performance --no-dictionary --no-reference --no-playground --no-payload
```

When `prune:template` detects the canonical `averlo-next-template` `main`
checkout, it prints a warning because pruning that checkout can collapse the
full template into a reduced instance shape. Dry-runs remain allowed, but
mutating prunes on canonical `main` require `--confirm-template-root`; use a
clone, branch, or worktree for project-specific pruning.

### Thin-Start Mode

Thin-start is a filesystem-backed template profile. Its default command creates
a complete disposable workspace under the ignored `.thin-start/` directory, so
the thin and full profiles can run side by side without rewriting this checkout.

```sh
npm run create:thin-start
npm run review:thin-start-api -- --root .thin-start/workspace --strict
npm run dev:thin -- --random
```

Use `--output <path>` for another isolated workspace. Only new project
instances should use the guarded `--in-place --confirm-instance` path. Read
`docs/thin-start-creation-boundary.md` before in-place activation.

## Repository Layout

```text
.
|-- AGENTS.md
|-- README.md
|-- docs/
|   |-- payload-vercel-neon-blob.md
|   |-- responsive-rendering.md
|   |-- template-content-modes.md
|   |-- template-intelligence.md
|   `-- thin-start-creation-boundary.md
|-- public/
|   `-- averlo-next-template-banner.png
|-- scripts/
|   |-- dev-server.mjs
|   |-- generate-template-intelligence.mjs
|   |-- prune-template.mjs
|   |-- scroll-performance/
|   |-- template-intelligence-serena-service.mjs
|   |-- create-thin-start.mjs
|   `-- verify-smoke.mjs
|-- src/
|   |-- app/
|   |   |-- (site)/(marketing)/
|   |   |-- (payload)/
|   |   `-- api/
|   |-- components/
|   |   |-- branding/
|   |   |-- mount/
|   |   `-- ui/
|   |-- lib/
|   |   `-- marketing-content/
|   `-- payload/
|-- package.json
`-- next.config.ts
```

## Useful Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Human local development server. |
| `npm run dev:agent` | Isolated server for agent browser testing. |
| `npm run dev:thin` | Refresh and run the materialized thin profile. |
| `npm run verify:static` | Biome plus TypeScript checks. |
| `npm run build` | Production Next.js build. |
| `npm run verify:smoke` | Route smoke verification. |
| `npm run verify:profiles` | Materialize every profile in a disposable temp matrix. Add `-- --integration` for installs and profile-owned checks. |
| `npm run measure:scroll-performance` | Measure scroll performance on a real page path. |
| `npm run setup:scroll-performance-autoresearch` | Create a disposable page-target scroll-performance worker worktree. |
| `npm run score:scroll-performance` | Score the accepted baseline or one committed candidate in a scroll worker. |
| `npm run prune:template` | Remove optional template surfaces in a clone. |
| `npm run create:project` | Materialize `full`, `app-only`, `marketing-only`, or `thin-start`. |
| `npm run create:thin-start` | Materialize the optional thin-start profile. |

## Deployment

The template is designed for Vercel. Static and Payload-ready projects can ship
without live Payload routes. Payload-powered projects should use Neon Postgres
for `DATABASE_URL`, Vercel Blob for `BLOB_READ_WRITE_TOKEN`, and a
project-specific `PAYLOAD_SECRET`.
