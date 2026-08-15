<INSTRUCTIONS>
## Internal Surface Contract

- The canonical internal layout renders the shared `SiteShell` with `defaultSiteLayout` for profiles without marketing. When a profile includes marketing, assembly relocates this route tree beneath the marketing route group so the marketing layout owns the shell. Do not create route-specific shell or chrome adapters.
- Internal pages use the shared `InternalPage` and `InternalPageHeader` composition so the site header offset, section padding, width, and page-heading rhythm stay aligned.
- Use `Card` when a surface has meaningful structure. Add `Card.Header` only when a distinct title, description, or action labels content below it; simple links, metrics, notices, and preview stages should remain headerless.
- Use `Panel` for generic preview canvases and visual test stages. Do not recreate surface background, border, radius, padding, or shadow recipes with raw utility classes.
- Prefer subtraction: keep one page heading, remove repeated descriptions, avoid Card-in-Card composition unless the inner card is itself the component being demonstrated, and do not wrap groups only to create another border.
- Component demos may preserve component-owned visual geometry, but their surrounding frames must use the shared design-system primitives.
- Internal routes remain noindex. Their runtime availability is profile-driven: selected surfaces stay reachable in production unless their nearest policy explicitly declares them development-only. `/internal/testing` is development-only and must remain production-gated; omitted surfaces fail closed because assembly removes both their routes and generated navigation entries. Production guards on `/api/debug`, `/api/dev`, and `/api/internal` remain separate and must not be weakened.
- `defaultSiteLayout` must remain valid in assembled profiles that omit the marketing surface. It derives optional links from the installed app surface registry and generated internal-route map, then fails closed when a destination is absent.
</INSTRUCTIONS>
