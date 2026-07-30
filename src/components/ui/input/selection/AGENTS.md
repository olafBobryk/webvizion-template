# Folder: `src/components/ui/input/selection`

## Role

Searchable, combobox, and compact button-based selection controls.

## Public Surface

- External consumers import selection components and public option types from `@/components/ui/input`.
- Family implementations import `InputSkeleton` and choice primitives directly instead of importing the public barrel.

## Invariants

- Preserve `Dropdown`, `Listbox`, portal, keyboard-navigation, active-option, and selection semantics.
- Use the choice subsystem for checkbox-style indicators instead of duplicating them here.
- `ComboboxMultiSelectInput` follows the normal `sm` input shell by default. Its selected-item rail stays single-line and scrolls horizontally; its query input keeps only a small text-relative minimum so one selected token does not force an avoidable wrap.
- `ButtonMultiSelectInput` expresses selection only through the shared `Button` variants: `primary` when selected and `secondary` otherwise. Do not add choice indicators, per-button classes, size overrides, or configurable variants.
