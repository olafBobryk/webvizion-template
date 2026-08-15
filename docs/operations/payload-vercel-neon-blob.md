# Payload on Vercel with Neon and Blob

This template ships with a guarded Payload scaffold. By default, the live
marketing site renders fallback content from `src/lib/marketing-content` and
does not call Payload REST, GraphQL, or an external API from frontend components.

Use this guide when a cloned project should become a real Payload-powered
website on Vercel.

## When To Use This

- Use **Static** mode when the site does not need a CMS. Select
  `--content static` when creating the project so Payload code and packages are
  never included.
- Use **Payload-ready** mode when the CMS decision is not final. Keep this
  scaffold, keep admin/API disabled, and keep building sections from fallback
  render data.
- Use **Payload-powered Vercel** mode when the project will run Payload in
  production. Complete the activation checklist below.

The root README documents project-time content selection. This guide owns the
later Payload-powered activation path.

## Required Vercel Services

- Neon Postgres from the Vercel Marketplace for the Payload database.
- Vercel Blob for Payload media uploads.
- Environment variables configured in Vercel and pulled into local development.

Recommended references:

- [Payload installation](https://payloadcms.com/docs/getting-started/installation)
- [Payload Postgres](https://payloadcms.com/docs/database/postgres)
- [Payload storage adapters](https://payloadcms.com/docs/upload/storage-adapters)
- [Vercel Blob](https://vercel.com/docs/vercel-blob)
- [Neon on Vercel](https://vercel.com/marketplace/neon)

## Environment Variables

Set these in Vercel project settings:

```bash
DATABASE_URL="postgres://..."
PAYLOAD_SECRET="use-a-long-random-secret"
BLOB_READ_WRITE_TOKEN="vercel-blob-token"
```

Then sync them locally:

```bash
vercel env pull .env.local --yes
```

`DATABASE_URL` is provided by the Neon integration. `BLOB_READ_WRITE_TOKEN` is
created when Blob storage is added to the Vercel project. `PAYLOAD_SECRET` must
be generated per project and never committed.

## Local Magic Login

Payload-powered local development can optionally expose a localhost-only
bootstrap link that signs into an existing Payload admin user. This is disabled
by default and must never be configured in Vercel Preview or Production.

Add these values to `.env.local` only:

```bash
PAYLOAD_DEV_MAGIC_LOGIN=1
PAYLOAD_DEV_MAGIC_EMAIL="admin@example.com"
PAYLOAD_DEV_MAGIC_PASSWORD="local-admin-password"
```

When `PAYLOAD_DEV_MAGIC_LOGIN=1`, the dev-server wrapper prints a stable
`Payload Admin URL` beside the local preview URLs. Opening that URL logs in with
the server-only credentials, sets Payload's normal HttpOnly auth cookie, and
redirects to `/admin`.

The magic-login route does not create users and does not include credentials or
tokens in the URL. It only works in `NODE_ENV=development`, on loopback hosts,
outside Vercel, with `DATABASE_URL` and `PAYLOAD_SECRET` configured.

Test the local magic-login setup before relying on it:

1. Run `npm run dev -- --dry-run` without `PAYLOAD_DEV_MAGIC_LOGIN`; it
   should not print a `Payload Admin URL`.
2. Run `PAYLOAD_DEV_MAGIC_LOGIN=1 npm run dev -- --dry-run`; it should print a
   localhost `Payload Admin URL` for the isolated preview port.
3. Start the local dev server with the env values above and an existing Payload
   admin user, then open the printed `Payload Admin URL`.
4. Confirm the link redirects to `/admin` and the browser is signed in.
5. Confirm an external redirect such as
   `/api/dev/payload-login?next=https://example.com` does not leave localhost.
6. Confirm the route returns unavailable when `PAYLOAD_DEV_MAGIC_LOGIN` is
   unset or when required credentials are missing.

## Neon Setup

1. Open the Vercel project dashboard.
2. Install Neon from the Vercel Marketplace.
3. Attach the Neon database to the project.
4. Confirm `DATABASE_URL` is present for Development, Preview, and Production.
5. Pull env vars locally with `vercel env pull .env.local --yes`.

Prefer the Vercel Marketplace integration over manual Neon provisioning because
it keeps project env vars and deployment environments aligned.

## Blob Setup

1. Open the Vercel project dashboard.
2. Add a Blob store to the project.
3. Confirm `BLOB_READ_WRITE_TOKEN` is present for the environments that need CMS
   uploads.
4. Pull env vars locally after the token exists.

The scaffolded Payload config uses `@payloadcms/storage-vercel-blob` for the
`media` collection. When the token is missing, the Blob adapter is disabled and
Payload falls back to local upload behavior.

## Using `$cms-backfill` with this template

After the fallback marketing frontend is complete, the optional
`$cms-backfill` Codex skill can drive Payload activation, seeding, readback,
publishing, and strict visual verification.

Do not apply its generic starting assumption literally. This is not a site that
still needs a frontend content model invented during CMS migration. The
template already has:

- `MarketingPageDocument` and `SiteLayoutDocument` view models;
- a `layout` array of typed sections selected by `blockType`;
- section renderers that consume lightweight props;
- `getMarketingPage()` and `getSiteLayout()` resolver boundaries;
- matching fallback page and site-layout data; and
- a preliminary Payload `Pages`, `SiteLayout`, media, and user scaffold.

Those frontend contracts are pinned inputs to the backfill. The skill should
inventory and preserve them, then refine the Payload editorial schema and map
its documents into the existing models. Its fixed-page guidance concerns what
editors may add, remove, or reorder in Payload; it does not require replacing
the frontend's section-based `layout` model. A fixed Payload global or named
group can still normalize into that layout, while an explicitly reorderable
page can use controlled Payload blocks.

For this repository, reinterpret the skill's infrastructure/modeling stages as
follows:

1. Reuse and audit the installed Payload packages, config, collections,
   globals, block definitions, and server resolver seam.
2. Replace only the disabled admin/API stubs and preliminary schema details
   needed by the accepted editorial contract.
3. Keep the marketing components, layout model, section registry, DOM, styles,
   motion, routes, and fallback data unchanged.
4. Use the committed fallback as the exact seed and parity baseline.
5. Add migrations, Neon, Blob, access controls, draft preview, snapshot
   generation, and publish lifecycle behavior around that existing boundary.
6. Cut over only after seed readback and strict visual parity pass.

Start the skill's process note only for a concrete project activation; the
template itself remains Payload-ready and does not pretend that a backfill has
already occurred.

## Activation Checklist

The current scaffold is Payload-ready, not Payload-powered. It includes guarded,
published-only readback paths for the shared site layout and source-neutral
marketing page documents. The default `MARKETING_CONTENT_SOURCE=fallback` never
initializes Payload. After database setup, seed and verify both content owners
before selecting Payload:

```bash
npm run payload:seed:site-layout
npm run payload:verify:site-layout
npm run payload:seed:marketing-pages
npm run payload:verify:marketing-pages
```

Only then set `MARKETING_CONTENT_SOURCE=payload`. In that mode missing Payload
configuration, failed reads, unpublished or malformed content, and invalid
required surface references fail the build/render instead of silently serving
stale fallback content. Internal destinations store an installed `surfaceId`;
fragments and external destinations store a direct `href`.

To complete full Payload activation:

1. Replace the `/admin` stub with Payload's real Next.js admin page.
2. Replace the `/api/[...slug]` stub with Payload's real route handlers.
3. Keep `payload.config.ts` wired through `@payload-config`.
4. Refine the existing Payload collections, globals, and blocks for the site's
   editorial contract without replacing the established frontend layout model.
5. Keep the existing guarded `getSiteLayout()` and `getMarketingPage()` Local
   API readback boundaries.
6. Map Payload documents into the existing `MarketingPageDocument`,
   `SiteLayoutDocument`, and typed section render contracts used by the
   marketing frontend.
7. Keep fallback documents as the static/Payload-ready source and recovery
   baseline; an explicitly authoritative Payload read must still fail closed.
8. Run a production build and verify `/admin`, `/api`, and the public marketing
   pages with Vercel env vars present.

Do not make marketing components fetch Payload REST or GraphQL directly. Keep
all source-specific logic inside the server-side content resolvers and adapters.

## Content Adapter Rule

Payload schemas may be richer than the frontend render contract. That is
expected. Relationships, media records, SEO fields, draft state, localization,
authors, redirects, and taxonomy data should be resolved before rendering.

Frontend sections should receive simple props that match what the component
renders. If a section later needs more data, extend that section's render props
and then adapt Payload and fallback data into the new shape.
