# Folder: `src/components/composites`

## Ownership

Reusable composed components sit above primitives and inputs but below
route-scoped app shells. Each public family owns its consumer contract and
examples in its lowest-level Storybook owner.

## Invariants
- Keep composites grounded in shared design-system primitives and helpers.
- Keep contracts small, synchronous, and caller-owned.
- Do not import route-scoped content, product data, or backend adapters into this folder.
- If a composite becomes route-specific, move that wrapper to the route and keep only the reusable core here.
