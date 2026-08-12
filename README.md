# Averlo Next Template

![Averlo Next Template banner](public/averlo-next-template-banner.png)

A production-oriented Next.js template for assembling focused marketing sites,
authenticated applications, or both. It includes route registries, an
organization-aware dashboard, records and an approval-gated assistant, a
Storybook-owned component catalogue, isolated previews, and optional Payload
infrastructure.

The generated project contains only the surfaces selected by its profile.
Developer routes and template assembly machinery stay outside the product, and
frontend components remain independent of their content source.

Create a clean project directly from the published initializer:

```sh
npx create-averlo my-project --profile thin-start --content static
```

The command installs dependencies by default and initializes an independent
local `main` repository with one commit and no remote. Use `--no-install` to
generate the project and lockfile without `node_modules`. Non-interactive
callers must provide the destination and `--profile`; interactive terminals
prompt for missing choices.

## Instant Setup

```sh
git clone https://github.com/olafBobryk/averlo-next-template.git averlo-template
cd averlo-template
npm install
npm run create:project -- --profile full --content payload-ready \
  --output ../my-project
cd ../my-project
npm run dev
```

### Agent Prompts

Storybook uses the same checkout and source environment as the isolated Next
preview, but it remains a separate Vite process. Start the Next preview first,
then let the managed command reuse or start the checkout's sole Storybook
instance:

```sh
codex plugin marketplace add .
codex plugin list
```

The command prints the Storybook URL and records it in ignored
`.codex/storybook-preview.json`. Use `npm run storybook:status` to rediscover
it; do not run raw `storybook dev` or assume a fixed port.

## Profiles

| Profile | Production surfaces | Content | Default |
| --- | --- | --- | --- |
| `full` | Marketing, auth, dashboard | `static`, `payload-ready` | `payload-ready` |
| `app-only` | Auth, dashboard | `static` | `static` |
| `marketing-only` | Marketing | `static`, `payload-ready` | `payload-ready` |
| `thin-start` | Minimal marketing foundation | `static`, `payload-ready` | `payload-ready` |

Profile assembly is positive: only explicitly owned files, packages, scripts,
and local developer surfaces are copied. The generated project records its
immutable starting configuration in `.template-profile.json`.

## What Is Included

- Next.js App Router surfaces for marketing, authentication, organizations,
  records, dashboard administration, platform operations, and the assistant.
- Shared UI foundations for inputs, overlays, feedback, motion, focus, branding,
  responsive shells, and loading states.
- Colocated Storybook owner contracts, teaching stories, accessibility checks,
  and an app-safe component catalogue.
- Static marketing documents plus guarded Payload-ready resolvers that emit the
  same lightweight render contracts.
- Isolated Next previews, managed Storybook/MCP hosting, template intelligence,
  profile verification, and performance tooling.

Legacy orchestration is a dormant compatibility capability. It is excluded by
default and should not gain new product or template coupling.

## Architecture and Content

```text
profile + content mode -> positive assembly -> generated project
fallback or Payload data -> server resolver -> render contract -> section UI
```

The content source is replaceable; route ownership, render contracts, and
section presentation remain stable.

- `static` excludes Payload code and packages.
- `payload-ready` keeps the guarded scaffold while live admin/API routes remain
  inactive.
- `payload-powered` is an explicit activation path using Neon Postgres, Vercel
  Blob, and project environment secrets.

Internal routes under `/internal` are development tools and are not public
product surfaces.

## Essential Commands

| Command | Purpose |
| --- | --- |
| `npm run create:project` | Materialize a route profile into a project workspace. |
| `npm run orchestration:init` | Explicitly install the transitional legacy orchestration capability. |
| `npm run dev` | Start an isolated, prewarmed preview on a random port. |
| `npm run dev:local` | Start the former local server flow on port 3000–3010. |
| `npm run dev:agent` | Compatibility alias for `npm run dev`. |
| `npm run dev:inspect` | Start a preview with the code-inspector sidecar enabled. |
| `npm run storybook:preview` | Start or reuse the current checkout's Storybook server. |
| `npm run storybook:status` | Show the paired preview and Storybook URLs. |
| `npm run storybook:stop` | Stop only a Storybook server launched by the coordinator. |
| `npm run measure:storybook-performance` | Capture a cold-cache developer-catalog baseline from the managed Storybook instance. |
| `npm run verify:static` | Run static policy, formatting, and type checks. |
| `npm run verify:profiles` | Materialize and verify every profile. |
| `npm run verify:create-averlo` | Pack and smoke-test the public initializer without publishing it. |
| `npm run build` | Create the production build. |

Start `npm run dev` before Storybook. Use `npm run storybook:status` to recover
the managed URLs; do not assume fixed ports or run raw `storybook dev`.

## Public Safety and Deployment

Keep secrets, environment files, deploy hooks, local Vercel metadata, generated
indexes, build output, dependencies, private source material, and temporary
worktrees out of Git. Use ignored local files or platform environment storage
for credentials.

The template targets Vercel. Static and Payload-ready projects deploy without
live Payload routes. Follow the Payload guide before activating Neon, Blob,
admin/API routes, or `MARKETING_CONTENT_SOURCE=payload`.

## Repository Layout

```text
AGENTS.md                 Repository and agent boundaries
docs/guides/              Architecture and operational guides
scripts/                  Assembly, preview, and verification tooling
src/app/                  Product, developer, API, and Payload routes
src/components/           Shared UI and domain components
src/lib/marketing-content Source-neutral documents and resolvers
template-profiles/        Installable profile manifests
```

## Guides

- [Component system](docs/guides/components/README.md)
- [Payload on Vercel with Neon and Blob](docs/guides/payload-vercel-neon-blob.md)
- [Template Intelligence](docs/guides/template-intelligence.md)
- [Scroll performance](docs/guides/scroll-performance.md)
