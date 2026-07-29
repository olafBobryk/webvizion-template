# Surfaces and Presentation

Shared primitives own typography, action hierarchy, containers, dividers, and
semantic accents. Compose these owners instead of reproducing their classes in
feature code.

## Presentation Decisions

| Need | Use |
| --- | --- |
| Heading, label, supporting, or muted copy | `Text` |
| Action or button-like link | `Button` |
| Generic surface or grouped layout | `Panel` |
| Structured header/content/action/footer surface | `Card` |
| Page section and optional background media | `Section` |
| Horizontal or vertical separation | `Divider` |
| Compact label, source, filter, or status pill | `Chip` |
| Persistent semantic context independent of the latest action | `StatusMessage` or `StatusMessage.Presence` |

## Surface Ownership

- `Panel` owns non-semantic surfaces, generic groups, and overlay roots.
- `Card` is used only when its structured slots describe the content. Card slots
  belong under a real Card root; do not imitate its data attributes on Panel.
- `Section.Background` owns decorative image, gradient, or node media behind
  normal section flow. Mark it interactive only when it contains real controls.
- `Divider` replaces ad hoc border elements and owns labeled-rule geometry.
- Use the closed semantic accent contract instead of product-specific color
  strings on shared surfaces.
- Opaque panels publish their resolved surface through `--ui-surface-color`.
  Descendants that pre-compose opaque fills consume it rather than assuming the
  page background.
- `--card` owns structured card fills; `--surface` owns generic surfaces and
  overlays.

## Typography and Actions

- Visible copy uses `Text`, standard scaled text utilities, or a shared scaled
  size token. Do not hardcode component-level font families or unscaled text
  sizes.
- `Button` owns loading geometry, icon layout, and visible focus. Loading keeps
  content in flow and places the loader over it so dimensions do not change.
- Use primary, secondary, and ghost for action hierarchy; reserve inverse for
  controls on contextual high-contrast surfaces.
- Express destructive meaning with `tone="danger"`, not a separate danger
  appearance hierarchy.
- Ghost interaction is opacity-only and does not paint a hover surface.

## Transparent Surfaces

- Keep gradient-border treatment on a transparent wrapper and interior fill on
  the inner card or panel.
- Align wrapper and inner radii.
- Preserve a stable outer wrapper when reveal or positioning behavior depends
  on it; do not collapse the structure with `asChild`.
- Route tinted UI backgrounds through the shared surface-tint helper.

## Avoid

- Raw typography utility recipes repeated across components.
- Panel elements imitating Card slots.
- Combining border effect, fill, and transparency on one element when the
  wrapper-plus-inner-surface pattern applies.
- Product-specific colors in shared semantic surface APIs.
- Caller-local backgrounds that bypass inherited surface composition.

## Owner References

- `src/components/ui/primitives/AGENTS.md`
- `src/components/ui/foundations/AGENTS.md`
- `src/components/ui/misc/AGENTS.md`
