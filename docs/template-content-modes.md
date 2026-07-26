# Template Content Modes

Route profiles and content modes are separate decisions. Select a route profile
first with `npm run create:project -- --profile <id>`:

- `full`: marketing, auth, dashboard, local developer tools, Payload-ready
- `app-only`: auth, dashboard, local developer tools; no marketing or Payload
- `marketing-only`: broad marketing, local developer tools, Payload-ready; no dashboard/auth
- `thin-start`: minimal marketing specialist profile

The command defaults to `--engine prune` for compatibility. Add
`--engine assemble` to create the same route contract from positive ownership.
Assembled outputs are intentionally one-way project starts: they omit the
template profile manifests, assembly inventory, and prune/materializer scripts.
Keep the source template checkout if you may need to regenerate a different
profile later.

The two-engine state is an accepted compatibility period, not the final setup
architecture. See `docs/positive-assembly-transition.md` for the positive-only
target, Payload/static capability gap, exit gates, and prune removal sequence.

Developer routes under `/internal` are available only in local development.
They are excluded from public marketing navigation and always return 404 in a
production build.

This template supports three content modes. Choose the lightest mode that matches
the project, and keep the frontend rendering contract independent from the
content source.

## Static

Use this mode when a site does not need Payload CMS.

- In a template clone or a project materialized with the `prune` engine, run
  `npm run prune:template -- --yes --no-payload`.
- Build pages from plain TypeScript fallback content.
- Keep section data close to the renderer and only type the props the renderer
  needs.
- Do not add Payload packages, admin routes, API routes, or CMS-only metadata.
- Payload documentation may remain as template reference material, but the app
  should not contain Payload runtime code after pruning.

`--no-payload` is intentionally prune-surface syntax. It is available only in
a checkout that retains `prune:template`. A project created with
`--engine assemble` is a one-way output and does not contain the prune command.
Its Payload inclusion is determined by the selected assembly profile:
`app-only` excludes Payload, while `full`, `marketing-only`, and `thin-start`
currently include the Payload-ready surface. Assembly does not currently expose
`--no-payload` as a post-creation modifier.

Static sites should still use the same render helpers under
`src/lib/marketing-content` when present. The important rule is that the
frontend renders simple page and section data, not a CMS schema.

## Payload-ready

Use this mode when the client might want Payload later, or when the decision is
not final while the site is being built.

- Keep the guarded Payload scaffold in the project.
- Keep Payload admin/API routes disabled until the project is ready to run a
  real CMS.
- Build sections from fallback documents and lightweight renderer props.
- Add new section renderers without forcing them to mirror Payload schema
  details.
- When Payload becomes required, add Payload schemas and adapter code that maps
  CMS documents into the same render props.

Payload-ready mode is intentionally not a live CMS. The scaffold exists so the
project can be activated without rewriting the frontend.

### Existing layout-model boundary

This template is already beyond the generic hard-coded-site starting point:

- `MarketingPageDocument` and `SiteLayoutDocument` are source-neutral view
  models.
- A marketing page already exposes a `layout` of discriminated sections keyed
  by `blockType`.
- Marketing layout and section components already render those models rather
  than Payload documents.
- `getMarketingPage()` and `getSiteLayout()` are the server-side source
  boundary.
- Committed fallback documents already provide the baseline data that a CMS
  backfill should seed and prove.

Payload activation must preserve this layout model. Payload globals,
collections, groups, or blocks may be refined to match the accepted editorial
contract, but they must normalize into the existing page, layout, and section
view models instead of replacing them.

### Optional `$cms-backfill` workflow

Once the fallback frontend is stable, the optional `$cms-backfill` Codex skill
is the recommended activation and migration workflow. Its generic plan starts
from an established site that may not yet have a CMS-neutral layout model. That
assumption is false for this template: the model and renderer boundary above
already exist and are the contract to preserve.

When applying the skill here:

1. Pin the completed fallback site and capture its visual baseline.
2. Treat the existing marketing view models, layout array, section renderers,
   and resolvers as established inputs—not work to redesign.
3. Decide the editorial schema separately. Fixed pages may use globals and
   named groups even though the normalized frontend model remains a section
   layout; genuinely reorderable content may use controlled blocks.
4. Activate and refine the existing Payload-ready scaffold rather than
   installing an unrelated CMS architecture.
5. Seed the exact fallback copy and media, read back raw Payload data and
   normalized view models, and prove visual parity before switching sources.
6. Keep committed fallback content until migrations, readback, preview,
   publishing, and the Payload-backed snapshot are verified.

The skill is optional orchestration; this document and
`docs/payload-vercel-neon-blob.md` remain the repository-owned architecture
contract.

## Payload-powered Vercel

Use this mode when Payload is known to be part of the production website.

- Enable real Payload admin and API routes.
- Provision Neon Postgres and Vercel Blob for the Vercel project.
- Configure `DATABASE_URL`, `PAYLOAD_SECRET`, and `BLOB_READ_WRITE_TOKEN`.
- Keep fallback documents as the no-env, no-content, and preview safety path.
- Resolve Payload documents through server-side content resolvers. Do not fetch
  Payload REST or GraphQL directly from marketing components.

In this mode, Payload schemas may include CMS-only details such as relationships,
media objects, SEO fields, draft state, authors, taxonomies, localization, and
redirect metadata. Resolve that richer data in adapters before it reaches the
frontend renderer.

## Legacy Surface Pruning

Use pruning for a project that has already been initialized and needs to remove
individual optional surfaces. New projects should prefer `create:project`.

```bash
npm run prune:template -- --dry-run --no-dashboard --no-demo --no-scroll-performance --no-dictionary --no-reference --no-playground
```

If the plan is accepted, apply the lightweight route-surface prune:

```bash
npm run prune:template -- --yes --no-dashboard --no-demo --no-scroll-performance --no-dictionary --no-reference --no-playground
```

Payload is independent from this route-surface choice. A static lightweight
instance should opt into Payload removal explicitly:

```bash
npm run prune:template -- --yes --no-dashboard --no-demo --no-scroll-performance --no-dictionary --no-reference --no-playground --no-payload
```

The prune command accepts renamed package identities after template import by
checking the expected Averlo template file/script shape. A mutating prune on
the canonical template `main` checkout requires `--confirm-template-root`;
dry-runs remain allowed. When the command detects the canonical template
`main` checkout, it also prints a warning before the plan because pruning that
checkout can collapse the full template into a reduced instance shape. Prefer a
clone, branch, or worktree for project-specific pruning.

## Render Contract

The shared contract should stay small:

- a page has a `slug`, optional metadata, and `layout`
- a section has a `blockType`
- section props include only what the renderer needs
- site layout includes simple nav, CTA, footer, and social link data

Avoid making static or Payload-ready builds speak a full Payload-shaped contract.
The frontend should speak "render this page"; Payload is one source that can feed
that shape.

## Thin-Start Instances

Thin-start is an optional filesystem-backed profile, not a fourth content
source. By default it materializes a complete ignored workspace beside the full
template so both profiles can be developed independently.

Materialize and verify the isolated profile:

```bash
npm run create:thin-start
npm run review:thin-start-api -- --root .thin-start/workspace --strict
npm run dev:thin -- --random
```

Only a new project instance should use the guarded in-place path:

```bash
npm run create:thin-start -- --dry-run --in-place
npm run create:thin-start -- --yes --in-place --confirm-instance
npm install
npm run review:thin-start-api -- --strict
npm run build
```

The `--confirm-instance` flag is intentional friction. In-place activation parks
the original components under ignored `.thin-start/reference/`; that reference
must not enter the live import graph.

Use normal `npm run prune:template -- [flags]` for broad route/content-mode
surface removal. Use thin-start activation only when the desired instance shape
is the accepted minimal primitive surface. The detailed boundary lives in
`docs/thin-start-creation-boundary.md`.
