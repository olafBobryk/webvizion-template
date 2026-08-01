# Folder: `src/components/ui/foundations`

## Ownership

This folder owns library-wide focus, motion, settings, appearance, text-scale,
surface-tint, and CSS-token infrastructure. Consumer contracts and executable
examples live under `UI/Foundations/*` in Storybook.

## Dependency and runtime boundaries

- Foundation modules must not depend on higher-level primitives, inputs,
  overlays, or feature code.
- `SettingsProvider`, motion override hooks, and `MotionProvider` are client
  boundaries. Pure token modules such as `focus.ts`, `motionTiming.ts`,
  `spring.ts`, and `surfaceTint.ts` remain usable without React state.
- `MotionProvider` owns root timing variables and the global reveal scheduler;
  `MotionScope` may override timing variables only for its subtree.
- Appearance and text scale remain application-root state. Route-local theme
  stores, route-owned `.dark` effects, and root font-size mutation are forbidden.

## Structural invariants

- Shared focus tokens are the only library-level focus-ring recipes; do not
  weaken visible focus or duplicate them in feature code.
- Motion transitions and springs retain their semantic moment mapping. Normal
  CSS interactions must not acquire a `motion/react` dependency solely to use a
  spring.
- Theme switching remains an atomic two-frame CSS-transition transaction; it
  must not stop, restart, or remount animations, loaders, or motion timelines.
- `--background`, `--surface`, `--card`, and `--popover` remain independent
  Page, Panel, Card, and Float fill owners.
- Surface tint recipes preserve their interpolation space, tint strength, and
  underlying surface, including inherited `--ui-surface-color` ownership.
