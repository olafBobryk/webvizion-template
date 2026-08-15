# Visual composition

## Contract

Use the shared `Page → Panel → Card → Float` vocabulary to describe visual
composition:

- **Page** is the application canvas rather than a surface component.
- **Panel** provides broad grouping and layout.
- **Card** owns a structured header, content, action, or footer unit.
- **Float** provides behavior-free temporary visual chrome.

Keep structure and elevation independent. A Card may use float or overlay
elevation without becoming a Float. Overlay is behavioral context, not a fifth
visual surface: the overlay owner supplies portal, placement, focus, dismissal,
and scroll behavior around a Card or Float.

Treat page-section flow and background media as section ownership. A semantic
section background may publish context for selective descendant styling, but it
does not inherit Panel, Card, or Float ownership and does not acquire their
radius, elevation, fill, or slot contract. Keep controls, compact status, media,
code, previews, and inset content with their existing owners.

Keep stable wrappers when they own layout, reveal, positioning, or transparent
border treatment. For transparent gradient borders, keep the border on the
outer wrapper and the surface fill on the inner owner with aligned radii. Keep
semantic accents inside the closed shared contract, and route tinting through
the shared surface treatment rather than product-specific caller colors.

Use the supported surface facade from the Storybook owner contract. Keep shared
class recipes and inspection helpers private. Do not imitate another owner's
slots, data attributes, typography recipe, or token responsibilities.

## Hard boundaries

- Do not turn overlay behavior into a surface primitive or make a surface own
  portals, focus, dismissal, positioning, or modal context.
- Do not create an additional Inset, shell, section, or wrapper surface merely
  to rename existing composition.
- Do not give persistent application chrome content-card spacing solely because
  it uses Panel structure.
- Do not treat headings, breadcrumbs, navigation rows, or footer flow as new
  surface primitives.
- Do not export an implementation-only styling recipe as a public owner.
- Do not remove stable wrappers without proving that layout, reveal, border,
  and positioning ownership remain intact.

## Repository context

Read only entries that exist and apply to the changed composition:

- `src/components/ui/primitives/surfaces/AGENTS.md` when surface structure,
  facade, elevation, fill, or slot topology changes.
- `src/components/ui/primitives/AGENTS.md` when primitive dependency direction
  or public contracts change.
- The nearest layout, section, shell, or overlay `AGENTS.md` when its stable
  wrapper or context changes.

## Verification

- Verify owner hierarchy, wrapper stability, slot order, surface fill, radius,
  elevation, border treatment, semantic accents, and responsive layout.
- Run `npm run verify:surface-contracts` when shared visual surface contracts or
  their structural consumers change.
- Run the focused Storybook owner test for changed surface behavior or public
  contracts.
- Use managed breakpoint review when the composition changes materially across
  viewport sizes.
