# Folder: `src/components/ui/input/selection`

## Ownership and boundary

This folder owns searchable, combobox, and compact button-based selection
controls. External consumers use supported exports from `@/components/ui/input`;
Storybook owns their consumer contracts. Implementations import `InputSkeleton`
and choice primitives directly rather than self-importing the public barrel.

## Private topology

- Combobox content, listbox, filtering, active-index, chip, and controller
  modules remain implementation details without public exports or catalogue
  identities.
- Searchable inputs compose shared `Dropdown` and `Listbox` owners and retain
  their portal, active-option, selection, and keyboard topology.

## Structural invariants

- Checkbox-style option marks reuse the choice subsystem.
- ComboboxMultiSelectInput's selected rail stays single-line and horizontally
  scrollable; its query input keeps a small text-relative minimum instead of
  forcing selected tokens to wrap.
- ButtonMultiSelectInput expresses selection only through shared Button
  variants: primary when selected and secondary otherwise. Do not add choice
  indicators, per-button classes, size overrides, or configurable variants.
