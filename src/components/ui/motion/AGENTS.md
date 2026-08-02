# Folder: `src/components/ui/motion`

## Ownership

Shared entrance, scroll, cycling, and text-motion implementations. Storybook
`UI/Motion/*` owner pages are authoritative for supported imports, selection,
family members, examples, configuration, and observable behavior.

## Public boundary

- Family indexes are the external surfaces. Internals import direct owners; do
  not add a broad `@/components/ui/motion` facade or runtime namespace object.
- `MotionProvider`, `MotionScope`, timing, and spring utilities remain
  foundation owners.

## Structural Invariants

- The site-level `MotionProvider` owns the single global reveal scheduler.
  Page-local or nested global schedulers are prohibited.
- `Reveal.Sequence` enters its nearest scheduler once and owns relative
  descendant batching. Specialized reveal effects participate directly rather
  than being wrapped in another `Reveal.Item` solely for scheduling.
- Fallback and reduced-motion paths must not gate primary copy, focus, keyboard
  access, or essential controls.
- Reveal scheduler context, participant hooks, count-up internals, scroll
  motion values, and auto-cycle controller context remain private.
- Implementations resolve timing and spring behavior through foundation owners;
  do not introduce hardcoded page-local timing systems.
