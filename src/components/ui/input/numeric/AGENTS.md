# Folder: `src/components/ui/input/numeric`

## Ownership and boundary

This folder owns typed, fixed-unit, and range-style numeric controls. External
consumers use `@/components/ui/input`; Storybook owns the consumer contracts.
Family implementations import their owning siblings directly.

## Structural invariants

- Preserve real number and range inputs, native min/max/step semantics, and
  `Field` plus `InputFrame` topology.
- Unit presentation remains separate from numeric value ownership.
- SliderInput keeps its range control, progress track, numeric field, and unit
  vertically aligned inside one InputFrame. The visible custom track never
  replaces the native range input.
