# Folder: `src/components/ui/input/editable`

## Ownership and boundary

This folder owns reusable display-to-edit field state. External consumers use
`@/components/ui/input`; the `UI/Input/Editable/EditableTextField` Storybook
owner holds its consumer contract.

## Structural invariants

- Keep `Field` mounted across display, edit, pending, and error states.
- Field presentation keeps `InputFrame` mounted so display and edit geometry do
  not shift.
- Mutation, validation, draft, and focus-restoration state remain inside
  EditableTextField rather than moving into structural `Field` or ordinary
  TextInput.
- Pending state keeps the edit topology mounted and disables conflicting
  controls. Errors remain inline through `Field`.
- New presentation modes require a distinct reusable semantic use case; callers
  do not control internal button variants, typography, animation, or layout.
