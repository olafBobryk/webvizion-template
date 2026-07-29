<INSTRUCTIONS>
## Internal Surface Contract

- The internal layout renders the shared `SiteShell` with `defaultSiteLayout`. Internal and marketing layouts must import that same shell directly; do not create route-specific shell or chrome adapters.
- Internal pages use the shared `InternalPage` and `InternalPageHeader` composition so the site header offset, section padding, width, and page-heading rhythm stay aligned.
- Use `Card` when a surface has meaningful structure. Add `Card.Header` only when a distinct title, description, or action labels content below it; simple links, metrics, notices, and preview stages should remain headerless.
- Use `Panel` for generic preview canvases and visual test stages. Do not recreate surface background, border, radius, padding, or shadow recipes with raw utility classes.
- Prefer subtraction: keep one page heading, remove repeated descriptions, avoid Card-in-Card composition unless the inner card is itself the component being demonstrated, and do not wrap groups only to create another border.
- Component demos may preserve component-owned visual geometry, but their surrounding frames must use the shared design-system primitives.
- Internal routes remain noindex and production-guarded through the parent layout. Do not weaken that boundary during presentation work.
- `defaultSiteLayout` must remain valid in assembled profiles that omit the marketing surface. It derives optional links from routes available in `appRoutes` and fails closed when a route is absent.
</INSTRUCTIONS>
