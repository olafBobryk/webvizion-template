---
name: skeletons
description: Skeletons and loading states for Averlo Next. Use when auditing, creating, or refactoring route loading.tsx files, forced-loading or demo surfaces, Component.Skeleton migrations, component-owned skeleton APIs, loading placeholders, or live/loading design-system parity.
---

# Averlo Next Skeletons

Use this skill to make loading states reflect the real component tree instead of
page-local placeholder drawings. The default posture is conservative: use
existing `Component.Skeleton` APIs, keep static chrome live, and stop for human
direction when the owning component lacks a skeleton.

## First Steps

1. Read the repo and component instructions before editing UI.
2. Inspect the loaded page/component and its loading or forced-loading surface.
3. Identify the owning live component for each visible loading element.
4. Identify the exact loaded copy for every static title, description, action
   label, heading, legend label, and skeleton hidden-sizing string.
5. Identify the loaded typography, component variant, tone, font weight,
   truncation, and relevant class names for text skeletons.
6. Classify every visible element before changing it.

## Classification

- `static chrome`: Keep live and interactive. Examples: page titles, section
  titles, static descriptions, icons, and known-route navigation, including
  header action links whose href and label are known without loaded page data.
- `loaded data`: Render the owning `Component.Skeleton`. Examples: user names,
  emails, avatars, dates, permissions, role labels, counts, table rows, and form
  values sourced from loaded data.
- `loaded action`: Render the owning `Component.Skeleton` when the action's
  label, target, visibility, enabled state, or submit state depends on loaded
  data.
- `unclear dependency`: Inspect the source. If still unclear after inspection,
  ask for direction before changing the loading surface.

## Hard Stops

- If a loaded-data or loaded-action element maps to a component without
  `Component.Skeleton`, stop and ask whether to extend that component.
- Do not hand-roll page-local skeleton bars, fake inputs, or ad hoc rounded
  blocks for component-backed UI.
- Do not import named skeleton aliases in page or route loading call sites when
  `Component.Skeleton` exists.
- Do not silently add a skeleton API unless the current request explicitly
  authorizes extending components.

## Implementation Rules

- Page and route loading call sites should read like the loaded UI:
  `Button.Skeleton`, `Text.Skeleton`, `Field.Skeleton`, `Chip.Skeleton`, and
  other owning component skeletons.
- Component-owned skeleton implementations should use the shared `Skeleton` base
  when the project provides one.
- When implementing or changing a `Component.Skeleton`, derive its default
  hidden text typography from the loaded component's default rendered slot, not
  from a convenient `Text.Skeleton` variant. If the loaded slot uses raw classes
  such as `text-sm`, `font-medium`, a custom line height, or `Text` with
  `variant={null}`/`tone={null}`, the skeleton should carry the equivalent raw
  classes or null variant/tone so loading does not resize on swap.
- Keep this project's soft static skeleton treatment. Do not introduce shimmer.
- Mirror the live component's layout, spacing, breakpoint behavior, height, and
  radius. For repeated or composite surfaces, also compare each visible child
  slot and always-present default control (such as footer actions or add rows),
  including accent, background, padding, and visibility; matching the outer
  container alone is not sufficient.
- Preserve copy parity. Static visible copy in loading surfaces must match the
  loaded component's copy exactly; do not rewrite descriptions, headings,
  titles, labels, legend text, or action text just because the surface is
  loading.
- Prefer importing or reusing the same presentation constants/helpers as the
  loaded component for loading copy. If the loaded component builds copy from
  shared constants, the loading surface should use those same constants instead
  of duplicating string literals.
- Hidden real content used for skeleton sizing should use the exact loaded text
  when the final text is known. When final data is unknown, use a realistic
  exemplar with the same expected length and wrapping behavior, and keep static
  surrounding copy exact.
- `Button.Skeleton` must receive the same action label as the loaded `Button`
  when the label is known so hidden content drives width. Do not use fixed width
  classes for labeled buttons unless the loaded button also has that fixed or
  responsive width.
- Button skeleton color should reflect the loaded button variant only for
  primary-family buttons. Loaded `default`, `primary`, and `primaryDark` buttons
  should use the component's soft primary skeleton treatment; secondary,
  outline, ghost, danger, and other non-primary variants should stay on the
  neutral skeleton treatment unless product direction says otherwise.
- Hidden skeleton text must also match the loaded typography contract. Use the
  same `Text` variant/tone or the same raw typography classes as the loaded
  element, including font size, font weight, line height, truncation, alignment,
  and muted/default color treatment. Do not substitute `Text.Skeleton
  variant="support"` or another convenient variant when the loaded element is a
  table cell, link, caption, heading, chip label, or custom text class.
- For table rows, inspect the loaded column renderer before writing skeleton
  cells. Match the cell's text size, weight, color, alignment, wrapping, and
  primary/secondary text structure.
- Table skeleton wrappers must mirror the loaded table's structural selectors,
  including last-row border removal, bottom padding, footer-row behavior, and
  rounded bottom corners. Do this at the table/panel skeleton level instead of
  patching individual row call sites.
- If the live component has a border, reserve the same border width in the
  skeleton, usually with `border-transparent`.
- Keep hidden sizing content non-interactive, non-selectable, and visually
  hidden.
- Keep static navigation or chrome live when it does not rely on loaded data.
  Do not omit or skeletonize known-route header actions just because the rest of
  the page is in a loading state.

## Boundary Example: Settings Page

Keep live:

- Page title, section titles, section descriptions, and section icons.
- Static known-route navigation, such as an `Administration` link whose href is
  known without loaded page data.
- Static chart/panel titles and descriptions sourced from presentation
  constants.

Skeleton:

- Avatar, profile name, email, and loaded form values.
- Permission and role chips sourced from loaded account/project data.
- Account detail values such as joined date.
- Save actions tied to loaded form state or loaded record identity.

Inspect or ask:

- Actions such as `Sign out` or `Update password` if it is unclear whether they
  depend on loaded page data or only global auth/session chrome.
- Static footer notes. Under the strict rule, keep them live unless product
  direction explicitly asks for skeleton rhythm.

## Verification

- Grep changed route/loading surfaces for named skeleton aliases and raw skeleton
  placeholders.
- Compare loaded and loading copy for touched surfaces, especially panel titles,
  descriptions, action labels, field labels, and chart legends. Prefer a source
  check against shared presentation constants over visual guessing.
- Compare loaded and loading button labels for touched actions. Confirm
  `Button.Skeleton` children match known loaded button text and that fixed width
  classes are only present when the loaded button has the same width constraint.
- Compare loaded and loading button variants for touched actions. Primary-family
  loaded buttons should render primary-tinted `Button.Skeleton`; non-primary
  button skeletons should remain neutral.
- For page headers and static action regions, compare loaded and loading chrome.
  Known-route navigation buttons should remain real `Button` links with matching
  href, label, size, and variant instead of becoming skeletons or disappearing.
- Compare loaded and loading typography for touched skeleton text. For
  component-owned skeleton APIs, compare each default skeleton text slot against
  the loaded component's default slot classes, variant, tone, line height, font
  weight, and truncation. For tables, inspect each loaded column renderer and
  confirm skeleton cells use matching `Text.Skeleton` variants or equivalent raw
  classes.
- For repeated or composite surfaces, perform a child-parity pass against the
  loaded component: verify child order, slot variants (including accent or
  background), and default controls such as add rows or footers before closing.
- For every touched component with a loading counterpart, compare the live and
  skeleton component invocations before closing: wrapper, count, `className`,
  breakpoint/layout props, and structural IDs. Remove a skeleton-only layout
  override unless the live invocation has the same override; child-copy parity
  alone is not sufficient.
- For table skeletons, compare the final body row against the loaded table's
  final body row: border-bottom state, bottom padding, row corner rounding, and
  footer/view-more behavior must match at the shared skeleton component level.
- Run the smallest relevant formatter/lint/type checks for touched files.
- If visual preview ownership is available, verify the forced loading state and
  the normal loaded state.
- In the final note, report any element left live because it was classified as
  static chrome, and any hard stop that requires human direction.
