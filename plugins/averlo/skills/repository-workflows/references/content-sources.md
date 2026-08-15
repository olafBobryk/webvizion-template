# Content-source architecture

## Contract

Preserve three explicit content modes:

- Static excludes Payload code, packages, routes, and deployment material and
  renders committed fallback TypeScript content.
- Payload-ready keeps the guarded scaffold while admin and API routes remain
  unavailable and fallback content remains authoritative.
- Payload-powered activates real server-side readback only after the instance
  completes schema, service, seed, readback, and parity gates.

Keep MarketingPageDocument, SiteLayoutDocument, and discriminated section props
lightweight and source-neutral. Marketing renderers receive only the data they
render. Resolve relationships, media, drafts, SEO, localization, redirects,
taxonomies, and other source metadata inside server resolvers and adapters
before it reaches the frontend.

Keep committed fallback documents as the static source, Payload-ready default,
migration seed, parity baseline, and recovery reference. Extend the frontend
render contract deliberately, then adapt every selected source into it. Do not
replace the established layout model while activating a CMS.

Keep MARKETING_CONTENT_SOURCE on fallback until published content passes seed
and readback verification. Once Payload is explicitly authoritative, missing
configuration, read failures, malformed content, unpublished content, and
invalid required surface references fail closed rather than silently serving
stale fallback data.

Keep external service provisioning separate from implementation. The router may
change guarded Payload config, schema, resolver, adapter, normalization, seed,
readback, or activation gates; provisioning Neon, Blob, Vercel environments,
secrets, and production resources requires its dedicated operational workflow.

## Hard boundaries

- Do not fetch Payload REST, GraphQL, or Local API from frontend components.
- Do not expose Payload document shapes or provider metadata to section
  renderers.
- Do not activate admin or API routes merely because a guarded resolver or seed
  exists.
- Do not silently fall back after an explicitly authoritative Payload read
  fails.
- Do not remove committed fallback content before migration, readback, and
  rendered parity are proven.
- Do not include Payload at all in static assembly.

## Repository context

Read only the selected content mode and source boundary:

- `AGENTS.md` for template content modes and server-adapter rules.
- `src/lib/marketing-content/AGENTS.md` for frontend documents, resolvers,
  blockType render contracts, fallback, and link normalization.
- `src/payload/AGENTS.md` for guarded scaffold and activation ownership.
- `docs/operations/payload-vercel-neon-blob.md` for implementation activation gates;
  treat service and secret setup sections as an operational boundary.
- `template-assembly/AGENTS.md` and the selected profile manifest only when
  source/profile inclusion changes.
- The selected fallback document, resolver, Payload collection/global/block,
  normalizer, seed, and readback verifier.

## Verification

- Run npm run verify:site-layout for source-neutral layout and link contracts.
- Run npm run verify:payload-site-layout and
  npm run payload:verify:site-layout for Payload normalization, seed, or
  readback changes.
- Run npm run verify:profiles when content-mode ownership or installed files
  change.
- Verify static excludes Payload, Payload-ready stays guarded, and an
  authoritative Payload failure remains fatal.
