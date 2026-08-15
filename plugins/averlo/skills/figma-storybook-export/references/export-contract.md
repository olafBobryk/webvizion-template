# Export contract

## Section registry

The generated catalogue remains the only owner registry. Derive sections from canonical family and group data in this order:

1. Overview
2. Foundations
3. Icons
4. Helpers
5. Primitives
6. Input
7. Time
8. Misc
9. Overlays
10. Assistant
11. Utilities

Use 1440px frames at y = 0, with x = index * 1600. Preserve generated order inside each content section. Overview is an index and has no owners.

## Included content

- All 74 UI catalogue owners.
- Assistant Message and Assistant Status.
- Documentation-only owners as label and description rows.
- Authored representative fixtures and one-axis state projections.

Exclude all 13 Dashboard owners.

## Renderer

Render section headings and descriptions, subgroup headings when applicable, owner names, roles, short descriptions, bare preview stages, compact state labels, and whitespace.

Use 96px outer margins, 640px standard stages, and 1248px wide or overlay stages. Keep the light appearance deterministic and disable motion and reveal.

Do not render site chrome, catalogue cards, panels, dividers, navigation, decorative borders, or shadows. Component-owned borders and shadows are allowed.

The application route and Storybook stories must consume the same renderer and catalogue data. Application code must not import Storybook runtime modules or story files.

## Storybook

Create one fullscreen story per section. Disable controls and use accessibility error mode. Resolve the 11 story IDs from Storybook inventory or changed-story output; never construct them.

The isolated Storybook iframe is the Figma capture source. Capture [data-component-export-section] at 1440px after the story is visibly ready.

## Figma

Preserve Library page 28:2, Quick Pilot page 0:1, the existing 11 category frame IDs, frame names, order, width, x and y, variables, styles, and all Quick Pilot descendants.

Each Library frame must contain exactly one captured root. Set the target frame to non-auto-layout, the captured root to local 0,0, and the frame height to the captured root height.

Figma output is an editable section capture. It is not a reusable native component library.
