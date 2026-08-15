# Folder: `src/components/ui/primitives`

## Role

- This folder owns the lowest-level reusable UI components. Higher-level UI may
  compose primitives; primitives must not depend on complete inputs, overlays,
  composites, domain components, or routes.
- A primitive is public only through its supported Storybook owner contract and
  documented facade. Source exports and cross-file implementation use are
  internal evidence, not public API.

## Structural Invariants

- Keep component-owned skeleton imports server-safe. Split client behavior from
  shared types and skeleton exports when needed to protect a server boundary.
- Surface structure, chrome, elevation, slot topology, and inspection attributes
  belong to `surfaces/AGENTS.md` and its facade.
- Recursive Dropdown and Listbox branches render portal-backed sibling surfaces
  beside the parent row. Preserve the exact flat DOM when no option has children,
  and keep navigation, active descendants, focus return, and dismissal with the
  owning cascade level.
- Keep dropdown positioning, controller behavior, collection semantics, and
  shared class recipes in their internal owners. Do not fork or expose their raw
  pieces from a consumer.
- `className` extensions are additive: they must not remove required semantics,
  focus behavior, slot identity, or structural selectors.
