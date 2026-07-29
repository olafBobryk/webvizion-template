# Marketing content boundary

- Marketing components render source-neutral `MarketingPageDocument`, `SiteLayoutDocument`, and discriminated section props. They never consume Payload document shapes directly.
- `getMarketingPage()` and `getSiteLayout()` are server-side source boundaries. Normalize CMS relationships, media, drafts, SEO, localization, redirects, taxonomies, and other source metadata before it reaches renderers.
- Committed TypeScript fallback documents remain the static source, the Payload-ready default, and the migration/recovery baseline until external readback is proven.
- New sections declare only the data their renderer needs and preserve the existing `blockType` layout contract; do not turn the frontend model into a generic page builder.
- Public navigation and CTAs use source-neutral route/link data and must not expose local-only internal routes.
- Static assembly excludes Payload completely. Payload-ready assembly adds the guarded source adapter without changing these frontend contracts.
