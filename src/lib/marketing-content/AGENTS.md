# Marketing content boundary

- Marketing components render source-neutral `MarketingPageDocument`, `SiteLayoutDocument`, and discriminated section props. They never consume Payload document shapes directly.
- `getMarketingPage()` and `getSiteLayout()` are server-side source boundaries. Normalize CMS relationships, media, drafts, SEO, localization, redirects, taxonomies, and other source metadata before it reaches renderers.
- Committed TypeScript fallback documents remain the static source, the Payload-ready default, and the migration/recovery baseline until external readback is proven.
- New sections declare only the data their renderer needs and preserve the existing `blockType` layout contract; do not turn the frontend model into a generic page builder.
- Marketing route pages resolve documents and delegate their `layout` to `renderMarketingSections()`; they do not import or compose registered section renderers directly.
- Each registered `blockType` owns one named renderer. Its path may use any number of organizational folders, but must end in `sections/**/<blockType>/<PascalBlockType>Section.tsx`; the leaf folder and renderer name describe content structure, never the product or brand. For example, use `heroes/homeHero/HomeHeroSection.tsx`, never `pearl/PearlHeroSection.tsx`.
- Intermediate section folders classify the section family (`heroes/`, `articles/`, and similar); they do not change the canonical leaf folder or renderer name. Supporting components may be colocated under that leaf folder, but only the registered renderer uses the `*Section` name.
- Use Tailwind classes for marketing-section layout and presentation. Do not add page-level or global CSS for a marketing section. A colocated CSS module needs a specific selector or keyframe rationale that Tailwind cannot express.
- Run `npm run verify:marketing-sections` after adding, moving, removing, or renaming a marketing section.
- Public navigation and CTAs use the exclusive `surfaceId` or `href` link contract. Registered destinations use installed Marketing or Auth surface IDs; profile-installed internal routes remain plain generated links and stay outside marketing content documents.
- Static assembly excludes Payload completely. Payload-ready assembly adds the guarded source adapter without changing these frontend contracts.
- Keep `MARKETING_CONTENT_SOURCE=fallback` until the published `site-layout` global and marketing page documents have passed seed/readback verification. Once explicitly set to `payload`, configured read or normalization failures are fatal; do not silently replace authoritative CMS content with stale fallback data.
