# Folder: `src/components/ui/input/color`

## Ownership and boundary

This full-start-only folder owns free color entry and semantic swatch selection.
Storybook owns the public consumer contracts.

## Structural invariants

- `ColorPickerPanel` is a private implementation owner shared directly within
  this folder; it must not gain a catalogue identity or public barrel export.
- Both inputs compose the shared `Field`, `InputFrame`, and `Dropdown.Panel`
  topology instead of creating a second overlay system.
- `ColorSwatchInput` keeps semantic `value` and `customColorHex` as independent
  controlled/uncontrolled channels; internal state must not couple their
  ownership.
- Semantic presets remain product-neutral.
