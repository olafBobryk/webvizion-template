# Media delivery

## Contract

Treat marketing media delivery as a repository-wide rendering contract, not a
page-local Figma implementation detail. Retain the exact constituent image,
mark, or icon bytes from the authoritative source. Never use a flattened
section or page capture as product implementation.

Commit raster marketing imagery and import it statically by default. Render it
with `next/image`, intrinsic dimensions, a truthful responsive `sizes` value,
and `placeholder="blur"`; let supported static imports supply their generated
blur data. Commit exact SVG marks and icons as constituent assets, but do not
add a meaningless raster blur placeholder to vector artwork.

Decorative and brand imagery defaults to presentation-owned committed assets.
Editorial or product content imagery may instead come from a configured content
source. Resolve either path before it reaches a section renderer through a
small source-neutral media value: a static branch carries `StaticImageData`; a
remote branch carries `src`, `width`, `height`, and `blurDataURL`. Both carry
the owning alt contract. Use empty alt text only for genuinely decorative
media; require authored alt text for content. A justified owner may depart from
the default content/decorative sourcing split, but must retain the same delivery
and accessibility guarantees.

Download expiring design-tool asset URLs during implementation and retain their
exact bytes under the owning marketing asset boundary. The URL is provenance,
not a production source. Preload only the image proven to be the route's LCP.

When a legitimate runtime or framework boundary requires departing from an
exemptable delivery default, place one
`averlo-media-exception-next-line <rule> -- <rationale>` annotation immediately
before the affected use. One annotation exempts one reported rule once. Treat
the annotation as a reviewable local decision, not a file-level opt-out. Never
annotate ordinary static imagery merely to avoid importing or resolving it.

## Hard boundaries

- Do not ship expiring Figma, localhost MCP, temporary export, or task-artifact
  URLs.
- Do not render a reference screenshot, full section, or full page as one image
  to satisfy visual comparison.
- Do not use public-path strings for committed raster marketing imagery when a
  static import is available.
- Do not omit blur delivery for raster imagery, fabricate a blur unrelated to
  the asset, or apply raster placeholder rules to SVG artwork.
- Do not pass Payload media records, provider metadata, or unresolved
  relationships into a section renderer.
- Do not treat decorative media as CMS content by default or content imagery as
  decorative merely to avoid authored alternative text.
- Do not attempt to exempt expiring Figma/MCP URLs, task artifacts, or flattened
  reference captures; those rules are non-waivable.

## Repository context

Read only the media boundary being changed:

- `src/lib/marketing-content/AGENTS.md`, `src/lib/marketing-content/types.ts`,
  and `src/lib/marketing-content/resolvers.ts` for the source-neutral resolved
  media boundary.
- `src/app/(site)/(marketing)/_components/AGENTS.md` for public shell media.
- `src/payload/AGENTS.md` when provider-backed media normalization changes.
- The selected section owner, fallback document, resolver, and colocated asset
  modules.

## Verification

- Inspect rendered image ownership, exact asset provenance, static imports,
  intrinsic sizing, responsive `sizes`, blur behavior, alt semantics, and LCP
  preload selection.
- Verify that no expiring design-tool URL or flattened reference capture appears
  in product source or the rendered target.
- Run `npm run verify:marketing-media` while diagnosing media ownership and
  delivery. Run `npm run verify:marketing` before handing off a complete
  marketing change so section, shell, and media contracts are checked together.
- Run the applicable Payload page or layout verifier when provider-backed media
  normalization changes.
