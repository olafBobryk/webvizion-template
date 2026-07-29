# Template Content Modes

Project creation is positive assembly: choose a route profile and, where the
profile supports it, a content capability.

```bash
npm run create:project -- \
  --profile full \
  --content static \
  --output ../my-project
```

| Profile | Surfaces | Supported content | Default |
| --- | --- | --- | --- |
| `full` | Marketing, auth, dashboard, developer tools | `static`, `payload-ready` | `payload-ready` |
| `app-only` | Auth, dashboard, developer tools | `static` | `static` |
| `marketing-only` | Marketing and developer tools | `static`, `payload-ready` | `payload-ready` |
| `thin-start` | Minimal marketing and intelligence surface | `static`, `payload-ready` | `payload-ready` |

Generated projects are one-way starting points. They contain project code and
an immutable `.template-profile.json` receipt, but omit template profiles,
assembly inventories, and creation tooling. Keep the source template when you
may need to generate another shape.

Developer routes under `/internal` remain local-development tools and return
404 in production.

## Static

Choose `--content static` when the project does not need Payload CMS.

- The project retains committed TypeScript fallback content and the same
  source-neutral marketing render contracts.
- Payload configuration, admin/API routes, runtime code, documentation, and
  packages are never copied into the output.
- Marketing components continue to render small page, layout, and section
  models rather than CMS document shapes.

Static is a creation-time inclusion choice, not a post-creation deletion step.

## Payload-ready

Choose `--content payload-ready` when the project may need Payload later.

- The guarded Payload scaffold is included.
- Admin and API routes remain inactive until the required environment and
  deployment services are configured.
- Pages continue to render fallback documents through the same resolver
  boundary.
- New section renderers should not mirror Payload-only metadata.

Payload-ready mode is not a live CMS. It preserves an activation path without
forcing the frontend to depend on Payload.

## Existing layout-model boundary

The template already has the CMS-neutral contract that activation must
preserve:

- `MarketingPageDocument` and `SiteLayoutDocument` are source-neutral view
  models.
- Page layouts use discriminated sections keyed by `blockType`.
- Marketing components render those models rather than Payload documents.
- `getMarketingPage()` and `getSiteLayout()` are the server-side source
  boundary.
- Committed fallback documents provide the baseline data for migration and
  recovery.

Payload globals, collections, groups, or blocks may be refined for the accepted
editorial contract, but adapters must normalize them into these existing view
models.

## Optional `$cms-backfill` workflow

Once the fallback frontend is stable, the optional `$cms-backfill` workflow can
activate and seed Payload. Treat the existing models, layout, renderers,
resolvers, and fallback documents as pinned inputs:

1. Capture the completed fallback and its visual baseline.
2. Decide the editorial schema without redesigning the frontend contract.
3. Activate the existing Payload-ready scaffold.
4. Seed the exact fallback copy and media.
5. Prove raw and normalized readback plus visual parity before cutover.
6. Retain committed fallback content until migration and publishing are proven.

## Payload-powered Vercel

Payload-powered mode is an activation of a Payload-ready project, not a third
assembly choice.

- Provision Neon Postgres and Vercel Blob.
- Configure `DATABASE_URL`, `PAYLOAD_SECRET`, and
  `BLOB_READ_WRITE_TOKEN`.
- Enable the real Payload admin and API routes.
- Keep fallback documents as the no-env and recovery path.
- Resolve Payload-only relationships, media, SEO, drafts, authors, taxonomy,
  localization, and redirects before data reaches section renderers.

Follow `docs/payload-vercel-neon-blob.md` for the deployment contract.

## Thin-start

Thin-start is a profile, not a content source. Generate it through the same
project command:

```bash
npm run create:project -- \
  --profile thin-start \
  --content static \
  --output .thin-start/workspace
npm run review:thin-start-api -- --root .thin-start/workspace --strict
npm run dev:thin -- --random
```

Its explicit source inventory and package allowlists keep the output small.
There is no in-place activation path.

## Legacy initialized projects

Prune is no longer distributed on the current branch. Existing initialized
projects that still contain their original prune command may maintain it at
their pinned revision. For historical recovery, use the immutable
`checkpoint/profile-prune-v1` tag or the matching
`origin/codex/template-profile-modes` branch.

```bash
git fetch origin refs/tags/checkpoint/profile-prune-v1
git worktree add ../averlo-prune-reference checkpoint/profile-prune-v1
```

Treat that checkout as legacy reference tooling; do not mix its negative flags
or manifests into the current positive-assembly implementation.

## Render contract

The frontend contract remains deliberately small:

- a page has a `slug`, optional metadata, and `layout`;
- a section has a `blockType`;
- section props contain only what the renderer needs; and
- site layout contains simple navigation, CTA, footer, and social-link data.

The frontend speaks “render this page.” Payload is one source that may feed
that shape.
