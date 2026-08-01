# Folder: `src/components/ui/misc`

## Ownership

This folder owns cross-cutting state, loading, display, copy, disclosure, media,
and utility components that are neither complete inputs nor overlays.

Storybook `UI/Misc/*` owner pages are authoritative for availability, supported
imports, selection guidance, compounds, examples, variants, and observable
behavior. Keep each consumer contract in the lowest-level owner story; do not
recreate an owner index or consumer guide here.

## Public Boundary

- External application, route, composite, demo, and domain consumers import
  supported components and types from `@/components/ui/misc`.
- Misc internals and lower-level UI dependencies import direct owners where
  required to preserve dependency direction. Primitives must not import the
  misc barrel and create a cycle.
- The barrel is explicit. Accordion client/shared modules and input-owned file
  preview helpers remain private.
- Thin start owns a separate `@/components/ui/misc` facade that exports only
  `Skeleton`.

## Structural Invariants

- Component-specific skeletons preserve the live owner’s outer DOM, wrapper
  layout, spacing, and breakpoint structure while replacing content nodes.
  Skeleton trees remain non-interactive.
- `Skeleton` radius is owned by its `radius` variant. Do not combine it with
  caller-provided radius utilities that compete with the emitted class.
- Chip and profile-picture soft fills continue to resolve against the inherited
  `--ui-surface-color`; callers do not own replacement background recipes.
- Profile-picture stacks own overlap clipping and z-order without
  surface-colored rings.
- `ImageSwitcher` owns its preload layers, transition queue, swipe threshold,
  and shared pagination composition.
- `SuspenseBoundary` keeps controlled and React Suspense modes in one owner and
  preserves live/fallback geometry in ghost mode.

## Related Structural Rules

- Accordion implementation topology: `accordion/AGENTS.md`.
- State-family implementation topology: `state/AGENTS.md`.
