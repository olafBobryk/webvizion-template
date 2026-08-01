# Folder: `src/components/ui/input/choice`

## Ownership

This folder owns the native choice composition layer and complete grouped radio,
checkbox, and toggle fields. Consumer contracts live with the `UI/Input/Choice`
Storybook owners.

## Dependency direction

- External consumers use supported exports from `@/components/ui/input`.
- Family implementations import `ChoiceField` and `ChoiceIndicators` directly.
- Do not add a separate `CheckboxInput`; MultiselectInput owns checkbox-style
  grouped input.

## Structural invariants

- Keep the native input in the DOM. `ChoiceField` owns the label/input
  relationship and Enter activation; the visible indicator remains a sibling
  driven by peer/group state.
- Focus lands on the real visually hidden input. Indicators consume the shared
  peer focus tokens, including the error treatment.
- Borderless indicator geometry stays integer-aligned: default radio and
  checkbox are 22px with 12px marks at 5px insets; compact checkbox is 18px
  with a 12px mark at 3px; default toggle is 42x26px with a 22x18px thumb at
  4px; compact toggle centers the scaled default indicator in a 34x20px slot.
- Selection and hover never transform radio or checkbox marks; use color and
  opacity so artwork does not drift through subpixel scaling.
- Full-start checkbox artwork renders through the shared `Icon` registry.
  Thin-start retains its local fallback because it does not select the icon
  subsystem.
