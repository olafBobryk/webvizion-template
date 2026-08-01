# Folder: `src/components/ui/primitives`

## Role

This folder owns the lowest-level reusable UI components. Higher-level UI may
compose primitives; primitives may depend on foundations and lower-level
implementation helpers, but must not depend on complete inputs, overlays,
composites, domain components, or routes.

## Catalogue and Public API

- Storybook `UI/Guides/Catalog Rules` is authoritative for catalogue authoring,
  migration, and verification policy.
- Storybook `UI/Primitives/*` is authoritative for primitive availability,
  supported imports, selection guidance, compounds, exclusions, examples, and
  executable behavior.
- Define and export the typed owner contract in the owner's colocated
  `*.stories.tsx` file. The shared Storybook helper owns only its schema and
  renderer; do not create a separate registry, index, or copy of consumer
  guidance here.
- Treat a source-level export as internal unless the Storybook contract and the
  documented primitive facade support it. Cross-file implementation use does
  not establish a public API.

## Structural Invariants

- Keep component-owned skeleton imports server-safe. Split client behavior from
  shared types and skeleton exports when a primitive would otherwise pull a
  server consumer across a client boundary.
- Surface structure, chrome, elevation, slot topology, and inspection
  attributes are owned by `surfaces/AGENTS.md` and the
  `@/components/ui/primitives/surfaces` facade.
- Recursive Dropdown and Listbox branches render portal-backed sibling surfaces
  beside the parent row. When no option has children, preserve the exact flat
  DOM. Keep navigation, active descendants, focus return, and dismissal scoped
  to the owning cascade level.
- Keep dropdown positioning, controller behavior, collection semantics, and
  shared class recipes in their existing internal owners. Do not fork those
  systems in a consumer or expose their raw pieces as a new facade.
- Component `className` extensions are additive. Do not let an override remove
  required semantics, focus behavior, slot identity, or structural selectors.

## Verification

- Update the owner story's local contract and executable stories together.
- Run `npm run test-storybook` and `npm run verify:storybook-catalog` for
  catalogue changes.
- Run the focused skeleton or surface verifier when its structural invariant
  changes. Dropdown interaction and cascade behavior are enforced by its owner
  stories.
