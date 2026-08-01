# Folder: `src/components/ui/primitives/surfaces`

## Ownership

- This folder owns the server-safe Panel, Card, Float, and semantic elevation
  vocabulary used on the Page canvas.
- The public boundary is the explicit `index.ts` facade. Internal composition
  may import sibling modules directly to avoid facade cycles.
- Page is a foundation canvas rather than a React component. Overlay remains an
  interaction context owned by overlay systems.

## Structural invariants

- Keep structure and elevation independent: Card may use float or overlay
  elevation without becoming Float, and Float remains behavior-free.
- Card parts remain under a real Card root and preserve their `data-slot` and
  `group/card` selectors.
- Opaque surfaces publish their resolved fill through `--ui-surface-color`;
  transparent surfaces inherit the nearest owning surface.
- The shared class recipe is implementation-only. Do not export it from the
  public facade or give it a separate Storybook identity.
- Surface primitives must not own portal, focus, dismissal, positioning, or
  modal behavior.
