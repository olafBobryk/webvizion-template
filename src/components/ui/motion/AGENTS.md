# Folder: `src/components/ui/motion`

## Role

Shared entrance, scroll, cycling, and text-motion helpers for cases where motion
meaningfully improves presentation.

Read `docs/guides/components/interaction-and-responsive-rendering.md` before
adding motion. CSS transitions remain the default for micro-interactions.

## Public Families

- Import `* as Reveal` from `@/components/ui/motion/reveal` for entrance motion.
- Import `* as Scroll` from `@/components/ui/motion/scroll` for scroll-driven effects.
- Import `* as AutoCycle` from `@/components/ui/motion/auto-cycle` for timed active-item state.
- Import `LetterWave` directly from its owner for hover-only character motion.
- `MotionProvider`, `MotionScope`, and timing utilities remain foundation owners.

Family indexes are the only external surfaces. Internals import direct owners;
do not add a broad `@/components/ui/motion` barrel or runtime namespace object.

## Reveal Model

- The site-level `MotionProvider` owns one global reveal scheduler. Callers never mount a second scheduler.
- Global participants wait for app readiness and viewport entry, then batch in document order.
- `Reveal.Sequence` enters the nearest scheduler once and staggers its descendants relatively.
- Sequences can nest. Late-mounted descendants form a new local batch.
- `Reveal.Item`, `Image`, `Text`, `Highlight`, `Scramble`, and `Number` all participate directly.
- Do not wrap a specialized Reveal effect in `Reveal.Item` merely to schedule it.
- Conditional content remains caller-owned; Reveal has no `active`, `ready`, or viewport-bypass prop.
- `Reveal.Image` defaults to `loadStrategy="ignore-load"`. Use `wait-for-load` only when media readiness should delay that participant.
- Missing `MotionProvider` is an implementation error. Production fallback content must remain statically visible.
- Reduced motion and `?motion=off&reveal=off` render participants immediately without hidden transform state.

## Other Motion

- Use `Scroll.Highlight`, `Lag`, `Parallax`, and `Width` sparingly for scroll-linked presentation.
- Use `AutoCycle.Root` with `AutoCycle.useController()` for finite active-item cycles that pause for hover or focus.
- Use `LetterWave` only as a hover accent beneath a parent `group` class.
- Use shared timing and spring foundations instead of hardcoded transitions.
- Motion must never gate focus, keyboard access, primary copy, or essential controls.

## Avoid

- Arbitrary dependency graphs, hidden page-local schedulers, or compatibility aliases.
- Layering several entrance participants around the same visual element.
- Hiding SEO-critical or accessibility-critical content behind client-only motion state.
- Adding motion to components that already communicate state through sufficient animation.
