# Folder: `src/components/ui/misc/state`

## Role
Reusable state indicators for empty, idle, and error presentations.

## Use This Folder When
- A feature needs a consistent empty-state, idle-state, or retry block.
- You want a standard icon, text, and action layout for status messaging.
- You are wiring loading or error handling into `SuspenseBoundary` or other async wrappers.

## Prefer These Files
- `src/components/ui/misc/state/State.tsx`: exports the base `StateIndicator`, with plain route-status and framed contained-state variants.
- `src/components/ui/misc/state/ErrorState.tsx`: error-focused preset.
- `src/components/ui/misc/state/IdleState.tsx`: idle or empty-state preset.

## Invariants
- Use `StateIndicator` or its presets instead of ad hoc icon-plus-copy-plus-button stacks.
- Use the state family when a condition owns the availability of its route or
  region, including fatal prerequisites. Do not substitute a danger-colored
  `StatusMessage`.
- Keep route-level dashboard statuses on the default plain variant. Use `variant="framed"` only when the state owns a contained entity or table region.
- State actions should stay on shared `Button` primitives so focus, loading, and semantics remain consistent.
- Text should continue to use `Text` variants, not hardcoded typography classes.
- The focus invariant matters for retry or recovery actions: keyboard users must see and reach the actionable control clearly.

## How To Use It
- Use `ErrorState` for recoverable failures with a retry action.
- Use `IdleState` for empty or not-yet-started states.
- Use normal content or `StateIndicator` when a completed form is replaced by
  durable instructions or a next action.
- Use the default plain `StateIndicator` directly for minimal route statuses. Use `variant="framed"` for contained entity or table empties that need the shared dashed shell.

## Avoid
- Bespoke empty states for every feature when the shared state pattern already communicates the condition.
- Wrapping state actions in non-standard clickable containers.
