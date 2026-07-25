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

Developer routes under `/internal` are available only in local development.
They are excluded from public marketing navigation and always return 404 in a
production build.

This template supports three content modes. Choose the lightest mode that matches
the project, and keep the frontend rendering contract independent from the
content source.

## Static

Use this mode when a site does not need Payload CMS.

- Run `npm run prune:template -- --no-payload` in the clone.
- Build pages from plain TypeScript fallback content.
- Keep section data close to the renderer and only type the props the renderer
  needs.
- Do not add Payload packages, admin routes, API routes, or CMS-only metadata.
- Payload documentation may remain as template reference material, but the app
  should not contain Payload runtime code after pruning.

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
