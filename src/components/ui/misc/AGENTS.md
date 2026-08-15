# Folder: `src/components/ui/misc`

## Ownership

This folder owns cross-cutting state, loading, display, copy, disclosure, media,
and utility components that are neither complete inputs nor overlays.

## Dependency and profile boundary

- Misc internals and lower-level UI dependencies import direct owners where
  required to preserve dependency direction. Primitives must not import the
  misc facade and create a cycle.
- The barrel is explicit. Accordion client/shared modules and input-owned file
  preview helpers remain private.
- Thin start owns a separate `@/components/ui/misc` facade that exports only
  `Skeleton`.

## Structural Invariants

- Component-specific skeletons preserve the live owner’s outer DOM, wrapper
  layout, spacing, and breakpoint structure while replacing content nodes.
  Skeleton trees remain non-interactive.
- Chip and profile-picture soft fills continue to resolve against the inherited
  `--ui-surface-color`; callers do not own replacement background recipes.
- Profile-picture stacks own overlap clipping and z-order without
  surface-colored rings.
- `ImageSwitcher` owns its preload and transition lifecycle; `SuspenseBoundary`
  keeps controlled and React Suspense modes in one owner.

## Related Structural Rules

- Accordion implementation topology: `accordion/AGENTS.md`.
- State-family implementation topology: `state/AGENTS.md`.
