# Folder: `src/components/ui/input/date`

## Ownership and boundary

This folder owns the canonical single-date and date-range system. External
consumers import supported inputs and types from `@/components/ui/input`;
Storybook owns their public contracts. DateRangeInput is full-start-only while
DateInput and the shared calendar core remain available to thin-start.

## Structural invariants

- Both public inputs compose one private `CalendarPopover` and the same UTC date
  utilities. Values remain validated `YYYY-MM-DD` strings and use UTC
  arithmetic.
- `CalendarPopover` owns the grid, month navigation, range draft state,
  utilities, focus restoration, keyboard navigation, and dismissal.
- `Dropdown.Panel` is only the anchored shell. Its content remains one compact
  `Card` using `Card.Header`, `Card.Content`, and a single wrapping
  `Card.Footer` for single and range modes.
- Month and year controls remain separate shared `Dropdown.Listbox` owners.
  Range presets stay direct actions in the one footer.
- `Field` and `InputFrame` remain mounted as the field shell; do not introduce
  independent manual text fields or a second calendar/overlay topology.
- Hidden start/end form values are derived from committed range state. The first
  endpoint remains internal draft state until a complete range is committed.
