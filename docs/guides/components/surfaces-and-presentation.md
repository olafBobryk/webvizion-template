# Surfaces and Presentation

Use the shared **Page → Panel → Card → Float** vocabulary to describe how
content sits in the interface. Structure and elevation are separate axes: a
Card can rise to float or overlay elevation without becoming a Float.

| Responsibility | Owner |
| --- | --- |
| Application canvas | Page (`--background`; no surface component) |
| Broad grouping and layout | Panel |
| Structured header/content/action/footer unit | Card |
| Behavior-free temporary chrome | Float |
| Portal, focus, dismissal, and modal context | Overlay owner composed around Card or Float |
| Page-section flow and background media | Section |
| Controls, compact status, and inset content | Their existing component owners |

Import public surfaces only through the family facade:

```tsx
import {
  Card,
  Float,
  Panel,
  type CardHeadingProps,
  type CardProps,
  type FloatProps,
  type PanelProps,
  type SurfaceBackground,
  type SurfaceElevation,
  type SurfaceRadius,
} from "@/components/ui/primitives/surfaces";
```

## Cross-Family Rules

- Use semantic backgrounds (`page`, `panel`, `card`, `float`, `muted`, or
  `transparent`), radii (`none`, `float`, `panel`, or `card`), and elevations
  (`panel`, `card`, `float`, or `overlay`).
- Overlay is behavioral context, not a fifth surface primitive. Modal systems
  own portals, focus trapping, dismissal, and placement; their visual content
  is normally a Card at overlay elevation.
- Float owns visual chrome only. Dropdowns, tooltips, and popovers provide the
  interaction and positioning around it.
- Persistent shell chrome uses Panel structure without acquiring content-card
  spacing: headers use the Page background with no radius, while sidebars use
  the Panel background with no radius. Both remain at Panel elevation.
- Page headings, breadcrumbs, navigation rows, and footer flow are layout or
  content, not additional surfaces. Their owning header, sidebar, or Section
  provides the relevant context.
- Do not introduce an Inset surface for controls, code, media, file previews,
  or contained content. Those owners keep their existing presentation.
- Semantic accents use the closed shared contract rather than product-specific
  colors.
- Transparent gradient borders keep border treatment on an outer wrapper and
  surface fill on the inner owner, with aligned radii.
- Stable wrappers remain intact when reveal or positioning depends on them.
- Tinted backgrounds flow through the shared surface-tint helper.
- Do not imitate another owner's slots, data attributes, typography recipe, or
  surface-token responsibilities.

Exact variants, compounds, examples, light/dark appearance, and observable
guarantees live in Storybook at `UI/Primitives/Surfaces`.
