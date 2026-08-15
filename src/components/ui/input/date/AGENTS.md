# Folder: `src/components/ui/input/date`

## Ownership and boundary

This folder owns the canonical single-date and date-range system. DateRangeInput
is full-start-only while DateInput and the shared calendar core remain available
to thin-start.

## Structural invariants

- Both public inputs compose one private `CalendarPopover` and shared date
  utilities.
- `CalendarPopover` owns calendar state and interaction; no second calendar or
  overlay topology may be introduced.
- `Dropdown.Panel` is only the anchored shell. Its content remains one compact
  `Card` using `Card.Header`, `Card.Content`, and a single wrapping
  `Card.Footer` for single and range modes.
- Month and year controls remain separate shared `Dropdown.Listbox` owners.
- `Field` and `InputFrame` remain mounted as the field shell; do not introduce
  independent manual text fields or a second calendar/overlay topology.
- Range draft state stays internal until a complete range is committed.
