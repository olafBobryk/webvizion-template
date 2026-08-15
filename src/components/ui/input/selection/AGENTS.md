# Folder: `src/components/ui/input/selection`

## Ownership and boundary

This folder owns searchable, combobox, and compact button-based selection
controls. Implementations import `InputSkeleton` and choice primitives directly
rather than self-importing the public facade.

## Private topology

- Combobox content, listbox, filtering, active-index, chip, and controller
  modules remain implementation details without public exports or catalogue
  identities.
- Searchable inputs compose shared `Dropdown` and `Listbox` owners and retain
  their portal and active-option topology.

## Structural invariants

- Checkbox-style option marks reuse the choice subsystem.
- ComboboxMultiSelectInput owns the selected rail and query layout; callers do
  not provide replacement token layouts.
- ButtonMultiSelectInput expresses selection through shared Button variants;
  do not add choice indicators or configurable visual overrides.
