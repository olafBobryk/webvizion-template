# Folder: `src/components/ui/motion`

## Ownership

Shared scalar sources, scalar visual effects, scroll velocity, cycling, and
text-motion implementations.

## Public boundary

- Family indexes are the external surfaces. Internals import direct owners; do
  not add a broad `@/components/ui/motion` facade or runtime namespace object.
- `MotionProvider`, `MotionScope`, timing, and spring utilities remain
  foundation owners.

## Structural Invariants

- The site-level `MotionProvider` owns the single global motion scheduler.
  Page-local or nested global schedulers are prohibited.
- `MotionSource.Sequence` enters its nearest scheduler once and owns relative
  descendant reveal-source batching.
- Viewport re-entry reset remains scheduler- and source-owned, cascading
  through shared progress. Effects must not install reveal observers or reset
  themselves.
- Fallback and reduced-motion paths must not gate primary copy, focus, keyboard
  access, or essential controls.
- Source progress, scheduler context, participant hooks, and auto-cycle
  controller context remain private. Effects consume progress only through the
  nearest source context.
- `owner-hover` resolves only the nearest `data-motion-owner` ancestor. The
  owner retains semantics, accessible naming, and visible focus treatment.
- Animated rules compose the canonical, unlabeled `Divider` through
  `MotionEffect.Divider`. Never scale labeled divider content.
- `Scroll.Lag` remains the velocity-only exception; indexed owners remain
  outside the scalar source/effect system.
- Implementations resolve timing and spring behavior through foundation owners;
  do not introduce hardcoded page-local timing systems.
