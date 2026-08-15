# Folder: `src/components/ui/misc/state`

## Ownership

Implementation owners for `StateIndicator`, `ErrorState`, and `IdleState`.

## Public Boundary

- External consumers import the state family and its public types from
  `@/components/ui/misc`.
- Presets import `StateIndicator` directly from their sibling owner; no private
  state implementation is promoted as a separate public surface.

## Structural Invariants

- Presets compose `StateIndicator` instead of duplicating its icon, text,
  action, layout, or variant tree.
- State actions remain shared `Button` primitives, and typography remains
  shared `Text` primitives.
- The base root retains `data-slot="state-indicator"` and `data-variant` for
  composition, testing, and styling ownership.
