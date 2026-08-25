# Section construction

## Contract

Build registered marketing sections through the repository's document and
renderer architecture even when their source-backed visual treatment remains
local. This concern owns mandatory section structure; it does not require a
new visual recipe to become a shared design-system owner.

Keep the route responsible for resolving a `MarketingPageDocument` and
delegating its ordered blocks to the registered renderer boundary. Give each
source-neutral `blockType` exactly one registered renderer at
`sections/**/<blockType>/<PascalBlockType>Section.tsx`. Colocate supporting
components with that renderer and reserve the `Section` suffix for the
registered entry point.

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

- Do not implement a registered page as one route-local JSX tree or global
  stylesheet.
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
- The selected block type and registered renderer leaf.
- The shared `Section` Storybook owner and its current contract.
- The route and nearest marketing AGENTS.md only to verify delegation and
  boundaries.
- The media concern's selected asset and resolver paths when imagery changes.

## Verification

- Run `npm run verify:marketing-sections` after creating, moving,
  restructuring, registering, or removing a section.
- Verify that the route resolves a `MarketingPageDocument`, delegates through
  `renderMarketingSections`, and has one source-neutral renderer per block
  type.
- Verify the shared `Section` root/background/frame structure against its
  Storybook contract and confirm stable comparison selectors.
- Inspect Tailwind-first presentation, any justified CSS module, and media
  delivery evidence.
- Use the managed preview and report the direct section-anchor URL when one is
  available.
