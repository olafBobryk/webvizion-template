# Folder: `src/components/ui/helpers`

## Ownership

This folder owns small reusable interaction helpers used by higher-level UI.
Consumer contracts live under `UI/Helpers/*` in Storybook.

## Dependency and runtime boundaries

- Helpers may compose foundations, icons, and primitives but must not depend on
  inputs, overlays, or feature code.
- Stateful helpers remain client components and keep their timers and cleanup
  inside the owning hook.

## Structural invariants

- `IconSwap` owns only the visual state transition. The surrounding control
  owns its accessible name, keyboard semantics, and focus treatment.
- `useCopyAction` owns clipboard execution, copied-state timing, and cleanup;
  `CopyStatusIcon` owns only the corresponding decorative icon state.
- Do not fork either helper into component-local animation or clipboard state.
