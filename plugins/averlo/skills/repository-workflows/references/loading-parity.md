# Loading parity

## Contract

Use the live rendering as the reference for its loading state. Inspect both
states before editing, identify the owner of every visible loading element, and
classify each element:

- **Static chrome:** its copy, destination, and visibility do not depend on
  loaded data. Keep it live and interactive.
- **Loaded data:** its content depends on loaded data. Use the owning
  component's skeleton contract.
- **Loaded action:** its label, destination, visibility, enabled state, or
  submission state depends on loaded data. Use the owning action's skeleton
  contract.
- **Unclear dependency:** inspect the data and presentation source. Ask for
  direction if ownership remains unclear.

Prefer an owner-provided skeleton. Use a generic skeleton only for content with
no component owner or inside an explicitly approved reusable owner. If a
component-backed element has no skeleton contract, report the missing owner
extension instead of drawing a page-local approximation unless the request
explicitly authorizes that extension.

Mirror the live tree, not merely its outer rectangle. Preserve wrapper
hierarchy, child order, repetition, spacing, alignment, breakpoints, height,
radius, border reservation, typography, truncation, semantic accents, and
always-present controls. Keep known static copy exact and reuse its presentation
constants when available.

Use known final copy for hidden sizing content. When data is unknown, use a
realistic exemplar with equivalent length and wrapping. Keep all placeholder
content non-interactive, non-selectable, and inaccessible as an action. Preserve
the repository's established static skeleton treatment; do not introduce a new
shimmer or motion treatment without direction.

Treat pending actions separately from initial or region loading: pending state
belongs to the owning action. Empty, idle, unavailable, recoverable-error, and
fatal-prerequisite states belong to the unavailable region's state owner rather
than a toast or colored notice.

## Hard boundaries

- Do not hand-roll bars, fake fields, or ad hoc rounded blocks for
  component-backed UI.
- Do not silently add a component skeleton API without authorization.
- Do not skeletonize or omit known-route navigation, headings, descriptions, or
  other independent static chrome.
- Do not change visible copy, typography, variants, or layout merely because the
  surface is loading.
- Do not attach handlers, focusability, action semantics, or live-region noise
  to a visual placeholder.
- Do not use transient feedback for initial route or region loading.

## Repository context

Read only entries that exist and apply to the changed loading owner:

- `src/components/AGENTS.md` for component-owned skeleton policy.
- `src/components/ui/primitives/AGENTS.md` when a primitive skeleton or
  server-safe export changes.
- `src/components/ui/misc/state/AGENTS.md` when an empty, idle, unavailable, or
  recoverable region state changes.
- The nearest component or input `AGENTS.md` when its skeleton topology changes.

Do not load route-registry surface guidance solely because the loading state is
rendered on a route.

## Verification

- Compare live and loading invocations, wrappers, child order, counts,
  structural IDs, responsive props, copy, typography, variants, and controls.
- Compare repeated structures and their final row, footer, border, padding, and
  corner behavior.
- Run `npm run verify:component-skeletons` for shared component skeleton
  contracts.
- Run `npm run verify:route-skeletons` for route loading ownership and coverage.
- Run `npm run verify:entity-skeletons` when reusable entity geometry changes.
- When managed visual review is available, compare normal and forced-loading
  states at the relevant breakpoints.
