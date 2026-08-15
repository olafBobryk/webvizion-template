# Route metadata

## Contract

Keep browser document metadata distinct from navigation and presentation
metadata. Route registries own installed identity and canonical hrefs. Dashboard
and auth registries own their route labels and descriptions. Source-neutral
marketing page documents may own their title and description, but never route
identity, canonical path, indexability, or provider-specific fields.

Use one centralized metadata factory per route family:

- Dashboard and auth titles are `Route name | App name` and are always
  `noindex, nofollow`.
- Public marketing document titles are `App name | Route name`; the marketing
  homepage uses the app name alone.
- Internal development routes use route-first titles and remain
  `noindex, nofollow`.

Keep canonical, Open Graph, Twitter, robots, title, and description output in
parity. Derive canonicals from installed route hrefs, not CMS input or request
query strings. Code-owned marketing utility routes use static repository
metadata until their rendered document migrates to a source-neutral page
contract.

Resolve dynamic marketing metadata through the same server source boundary as
the rendered page. Memoize the resolved document for the request so metadata
and body cannot observe different CMS reads. When Payload is authoritative,
missing, unpublished, malformed, or unreadable page metadata fails with the
page read instead of silently falling back.

## Hard boundaries

- Do not hardcode the app name, title separator, robots policy, canonical, or
  social metadata independently in route pages.
- Do not use navigation labels as a second marketing content document or copy
  dashboard registry metadata into page-local exports.
- Do not let Payload control route hrefs, canonicals, robots, or provider-shaped
  metadata in frontend contracts.
- Do not index dashboard, auth, internal testing, component-export, or other
  private development routes.
- Do not perform a second provider read solely for metadata.

## Repository context

Read only the family and source boundary being changed:

- `src/config/metadataConfig.ts` and `src/lib/metadata.ts` for shared family
  factories and static marketing metadata.
- `src/config/surfaces/*.ts` and
  `src/app/(site)/dashboard/_registry/surfaceRegistry.ts` for installed route
  identity, labels, and descriptions.
- `src/app/(site)/(auth)/layout.tsx`, `src/app/(site)/dashboard/layout.tsx`, and
  the selected marketing page or layout for family metadata ownership.
- `src/lib/marketing-content/types.ts`,
  `src/lib/marketing-content/resolvers.ts`, and the selected source adapter only
  when a marketing document supplies metadata.
- `src/payload/collections/Pages.ts` and the selected page normalizer, seed, or
  readback verifier only for Payload-powered page metadata.
- `scripts/verify/verify-route-metadata.ts` for deterministic classification and
  title-order policy.

## Verification

- Run npm run verify:route-metadata after changing route titles, descriptions,
  canonicals, robots, social metadata, family factories, or route
  classification.
- Run npm run verify:route-surfaces when installed identity or hrefs change.
- Run npm run verify:payload-pages for Payload page schema, normalization, or
  source selection changes.
- Verify dashboard/auth route-first titles, marketing app-first titles, the
  homepage exception, private noindex behavior, and metadata/body source
  parity.
