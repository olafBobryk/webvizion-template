# Route architecture

## Contract

Declare each product destination once in its marketing, auth, or dashboard
family registry. Compose those registries through the shared route-surface
contract for canonical family-prefixed identity, href lookup, exact-or-pattern
matching, typed dynamic hrefs, and installed-route verification.

Keep family enrichment separate from shared route identity. Dashboard metadata
may own labels, descriptions, icons, capabilities, layout width, navigation
placement, parent hierarchy, domain ownership, source roots, and commands.
Marketing and auth consume canonical identities without inheriting dashboard
information architecture. Keep internal developer routes outside the product
surface registry.

Treat those labels and descriptions as route presentation data. Browser titles,
canonicals, robots, Open Graph, and Twitter output belong to the conditional
route-metadata concern and its family factories.

Treat parent identity as semantic information architecture, not filesystem
nesting or cross-link history. Reuse registry metadata across navigation,
ancestor trails, headings, loading states, commands, and domain reporting.
Top-level destinations have no ancestor trail; nested destinations show only
navigable registry-defined ancestors, while the page heading owns the current
destination.

For each registered dashboard route, keep a server-owned page, matching loading
entry, and one route-local named surface entry. The surface owns section
composition, contextual commands, layout, live rendering, and its skeleton.
Keep route-specific sections and mutations local until they acquire an
independent reusable owner.

Keep contextual actions under their canonical surface, register them through
the shell-owned provider, and unregister on unmount. UI visibility is never
authorization. Close command search before navigation or execution.

## Hard boundaries

- Do not create a second route map or duplicate canonical IDs, hrefs, matching,
  dashboard metadata, or hierarchy.
- Do not register summaries, filters, helper UI, repeated renderings, nested
  actions, or internal developer pages as peer product surfaces.
- Do not infer dashboard parentage from folders or cross-links.
- Do not add modal-backed commands without an exposed owning action API.
- Do not grant platform access from organization membership or hide a
  capability without server denial.
- Do not duplicate route layout in loading files.

## Repository context

Read only the route family and consumers being changed:

- `src/lib/surfaces/routeSurface.ts`, `src/config/surfaces.ts`, `src/lib/routes.ts`,
  and the owning family registry for shared identity.
- `src/app/(site)/dashboard/_registry/AGENTS.md` for dashboard enrichment,
  commands, capability, and domain-source ownership.
- `src/app/(site)/dashboard/AGENTS.md` for registered page/loading/surface shape.
- `src/app/(site)/dashboard/platform/AGENTS.md` for the platform access axis.
- `src/app/(site)/(dev)/internal/AGENTS.md` and the nearest internal route
  policy only for internal route availability or development-only behavior.
- `src/app/(site)/(marketing)/_components/AGENTS.md` only when a route identity
  changes public-shell navigation.

## Verification

- Run npm run verify:route-surfaces after family registry or installed-route
  changes.
- Run npm run verify:dashboard-pages and npm run verify:surface-contracts for
  dashboard route shape, metadata, hierarchy, or source ownership.
- Run npm run verify:site-layout when public navigation consumes changed
  identities.
- Verify dynamic href materialization, exact/pattern matching, capability
  denial, ancestor trails, commands, and live/loading vocabulary.
