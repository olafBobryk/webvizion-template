# Interaction and Responsive Rendering

Interaction behavior must remain accessible, stable on first render, and
respectful of user settings. Prefer shared tokens and CSS behavior before
component-local JavaScript.

## Interaction Decisions

| Situation | Use |
| --- | --- |
| Focus styling on a shared control | Tokens from `ui/foundations/focus.ts` |
| Lightweight responsive layout or visibility | Tailwind responsive classes |
| Hidden branch with expensive mounted work | `useTailwindBreakpoints` |
| Ordinary hover, press, or micro-transition | Shared CSS motion utilities |
| Entrance or scroll choreography | Shared motion components |
| Reusable keyboard shortcut | `@tanstack/react-hotkeys` |
| Native control behavior already covers the key | Native behavior only |

## Accessibility and Focus

- Every interactive control preserves visible keyboard focus. Do not remove a
  native outline without the shared replacement.
- `InputFrame` owns shell focus through `focus-within`; the real input remains
  focusable and owns its semantic attributes.
- Choice indicators use the shared peer focus tokens.
- Listbox active, selected, pointer, and keyboard states remain distinct.
- Focus visibility and access to controls must not depend on motion.

## Responsive Rendering

- Use responsive classes for layout, spacing, ordering, alignment, and
  lightweight visibility changes. CSS-hidden React subtrees still render and
  hydrate.
- Use breakpoint hooks only when the hidden branch would otherwise mount costly
  animation scenes, observers, canvas/WebGL/Rive, media, timers, listeners,
  measurements, or duplicated decorative DOM.
- Breakpoint hooks are false before their first client effect. Never gate
  primary content, headings, SEO copy, or essential accessibility affordances
  behind them.

## Motion

- Respect reduced motion through `SettingsProvider` and `useMotionAllowed`.
- CSS is the default for micro-interactions; use `motion/react` for genuine
  layout, reveal, or staged motion.
- Use shared timing and spring tokens rather than hardcoded durations.
- Marketing pages already provide a route-level `Reveal.Root`; add a scoped
  root only for isolated or non-marketing surfaces.
- Use `MotionScene` for choreography across multiple dependencies rather than
  page-local booleans and callback chains.
- Use `Reveal.Image` for image reveal and stage ownership. Its default ignores
  load state; select `loadStrategy="wait-for-load"` only when image readiness
  must gate reveal or later content.
- Automation can disable motion through `?motion=off` and `?reveal=off`.

## Rendering Details

- Use camelCase SVG attributes in JSX and TSX, including `clipPath`,
  `strokeWidth`, `stopColor`, and `maskType`.
- Avoid default `useMemo` and `useCallback`; use them only when correctness or
  measured performance requires stable identity or cached work.
- Application appearance and text scale remain owned by `SettingsProvider`.
  Do not add route-local theme or scale authorities.

## Avoid

- Ad hoc focus rings or global key listeners.
- Client breakpoint gates for essential content.
- Motion layered over already animated controls without a UX purpose.
- Hardcoded Motion durations or easings in feature code.
- Route-local appearance, reduced-motion, or typography-scale state.

## Owner References

- `src/components/ui/foundations/AGENTS.md`
- `src/components/ui/motion/AGENTS.md`
- `src/components/ui/primitives/AGENTS.md`
