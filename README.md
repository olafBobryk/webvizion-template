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

**First-time bootstrap:** Create a project from this repository. Read
`AGENTS.md`, help me choose a profile and content mode, materialize it into a new
folder, and verify it before adding project-specific work.

**Already cloned:** Read `AGENTS.md`, inspect the selected profile and content
receipt, and summarize the installed surfaces before changing the project.

**Continue an existing project:** Read the nearest `AGENTS.md`, preserve the
installed route and content boundaries, and prefer existing Storybook owners,
adapters, and shared primitives before adding structure.

## Codex Plugin Skills

| Skill | Use it for |
| --- | --- |
| `$averlo-next:design-system` | Select, build, and review public UI through Storybook-owned component contracts. |
| `$averlo-next:entities` | Discover and shape entity presentation, routes, adapters, mutations, and commands. |
| `$averlo-next:figma-storybook-export` | Capture the generated Storybook catalogue into editable Figma Library frames. |
| `$averlo-next:skeletons` | Keep route loading states and component-owned skeletons aligned with live UI. |
| `$averlo-next:surfaces` | Maintain canonical route registries, navigation, breadcrumbs, metadata, and Command-K entries. |
| `$averlo-next:storybook-backport` | Move approved reusable stories from product instances into the canonical template. |

These repository-specific skills ship with the `averlo-next` Codex plugin. They
guide agent work but are not generated-project runtime dependencies. Activate
the bundled marketplace once after cloning:

```sh
codex plugin marketplace add .
codex plugin list
```

The plugin installs by default. If it is listed but disabled, run
`codex plugin add averlo-next@averlo-next-template`, then start a new Codex
thread. Read `AGENTS.md` before invoking a skill.

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
| `npm run create:project` | Materialize a profile into a new workspace. |
| `npm run dev` | Start an isolated, prewarmed preview. |
| `npm run storybook:preview` | Start or reuse the checkout's managed Storybook/MCP process. |
| `npm run intelligence:generate` | Refresh the local repository map. |
| `npm run intelligence:query -- <topic>` | Find the governing files for focused work. |
| `npm run verify:static` | Run lint, policy, and type checks. |
| `npm run verify:profiles` | Materialize and verify every profile. |
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
