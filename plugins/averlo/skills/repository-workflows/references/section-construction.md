# Section construction

## Contract

Build source-backed public marketing pages and registered marketing sections
through the repository's route-family, document, and renderer architecture even
when their visual treatment remains local. Select this concern from the
requested marketing-page work before choosing an implementation shape. It owns
mandatory section structure; it does not require a new visual recipe to become
a shared design-system owner.

Place a new public marketing destination in the installed marketing route
family and register its canonical route-surface identity. Keep a source-backed
multi-section route responsible only for resolving a `MarketingPageDocument`
and delegating its ordered blocks to the registered renderer boundary; a
route-local JSX page is not an alternative architecture. Give each
source-neutral `blockType` exactly one registered renderer at
`sections/**/<blockType>/<PascalBlockType>Section.tsx`. Colocate supporting
components with that renderer and reserve the `Section` suffix for the
registered entry point.

Before product edits, enumerate the source hierarchy, bounds, top-level heading
contexts, full-bleed backgrounds, vertical-rhythm changes, and intended
comparison boundaries. Classify them before assigning owners: content cases,
shell cases, excluded regions, and accumulated comparison gates are distinct
groups. Map every independently reviewable content landmark to one stable case
ID, one source-neutral block type, one registered renderer, and one Target
selector. Map an evidenced footer to a shell case and shell selector, never a
block type, registered renderer, or shared `Section` root. Keep an excluded
header out of both inventories, and keep accumulated gates comparison-only. If
two content landmarks have separate source or parity cases, they must remain
separate blocks and renderers even when they share a background, theme, or
continuous visual treatment. Pause when the source does not support an
unambiguous split. Coherent landmarks may share one case and renderer when the
source hierarchy, semantic heading context, interaction, and intended review
boundary support that grouping. Treat a possible later maintainability split as
a human-reviewed Systemize Composition question, not as a Compose failure or a
reason to invent extra parity cases.

Make one block represent one independently reviewable semantic/source section,
not a whole page or an arbitrary collection of sibling bands. A renderer may
contain supporting subregions only when they share one semantic heading context
and comparison selector. Give every block meaningful source-neutral content or
media fields beyond its base ID and type, and render visible page copy and media
from those fields rather than hard-coding a page inside the renderer. The
accumulated page remains a comparison concern and is never registered as a
section.

Use the shared `Section` owner for the semantic root, full-bleed background,
and foreground frame. Obtain its exact imports, props, variants, compounds,
and guarantees from its current Storybook contract. Use `Section.Background`
for owned full-bleed imagery or decoration, and keep foreground content inside
the owner's documented frame rather than rebuilding those layers locally.

Preserve the renderer registry's stable section ID, block type, and label
attributes. Add a more specific stable selector only when a comparison or
interaction genuinely needs one; do not bind selectors to generated classes or
copy. These boundaries must let visual comparison isolate the section without
including adjacent shell or content pixels.

Keep section presentation Tailwind-first. Use a colocated CSS module only for a
documented selector or keyframe requirement that Tailwind cannot express.
Deliver constituent media through the repository media concern. A temporary
source-fidelity recipe may stay local to the renderer or a colocated support
component, but it is not a public owner and must not bypass the registered
renderer or shared `Section` structure.

## Hard boundaries

- Do not place a public marketing page outside the installed marketing route
  family or leave its destination outside the marketing surface registry.
- Do not implement a registered page as one route-local JSX tree or global
  stylesheet.
- Do not make one registered renderer emit multiple independent semantic
  sections, a header, or a footer. Header and footer remain shared shell owners.
- Do not count or describe a shell case as a content block or registered
  renderer, and do not give it a shared `Section`-root obligation.
- Do not merge landmarks that the source framing or parity matrix treats as
  separate cases into one renderer.
- Do not import section implementations directly from a route; delegate through
  `renderMarketingSections` and the registry.
- Do not create product-, campaign-, or Figma-node-specific block types,
  renderer names, or shared owners.
- Do not replace the shared `Section` root, background, or frame with raw local
  wrappers merely to gain pixel control.
- Do not register more than one renderer for a block type or give support
  components the registered `Section` suffix.
- Do not flatten a source frame or section capture into product media.

## Repository context

Read only the paths that exist and apply:

- `src/lib/marketing-content/AGENTS.md`, its document types, fallback document,
  resolver, registry, and `renderMarketingSections` boundary.
- The marketing route-family registry and the requested destination's page
  path.
- The selected block type and registered renderer leaf.
- The shared `Section` Storybook owner and its current contract.
- The route and nearest marketing AGENTS.md only to verify delegation and
  boundaries.
- The media concern's selected asset and resolver paths when imagery changes.

## Verification

- Run `npm run verify:route-surfaces` after creating or moving a public
  marketing page. Use `npm run verify:marketing-sections` while diagnosing
  section topology, then run `npm run verify:marketing` before handoff.
- Verify the destination is registered and its page lives under the marketing
  route family; a successful preview at an unowned App Router path is a
  structural failure.
- Verify that the route resolves a `MarketingPageDocument`, delegates through
  `renderMarketingSections`, and has one source-neutral renderer per block
  type.
- Verify that each block declares meaningful render data, each renderer owns one
  logical source section, and no content renderer contains local header/footer
  or page-level sibling-section structure.
- Verify each registered renderer has exactly one shared `Section` root and that
  its case ID, block type, and stable selector match one decomposition row.
- Verify content cases, shell cases, excluded regions, and accumulated gates are
  distinct, and that only content cases contribute to the registered-renderer
  count.
- Verify the shared `Section` root/background/frame structure against its
  Storybook contract and confirm stable comparison selectors.
- Inspect Tailwind-first presentation, any justified CSS module, and media
  delivery evidence.
- Use the managed preview and report the direct section-anchor URL when one is
  available.
