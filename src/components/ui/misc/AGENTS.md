# Folder: `src/components/ui/misc`

## Role
Cross-cutting UI helpers and feedback components that do not belong to inputs, overlays, or pure primitives.

Read `docs/guides/components/loading-and-async-states.md` for state selection and
skeleton policy. Read `docs/guides/components/feedback-and-status.md` before
choosing between this state family, field messaging, toasts, and
`StatusMessage`.

## Use This Folder When
- You need loading, empty, warning, copy, segmented selection, chip, disclosure, skeleton, file preview, or dynamic-state wrappers.
- The UX pattern is common across pages but not strictly a form input or overlay primitive.

## Prefer These Files
- `src/components/ui/misc/accordion/Accordion.tsx`: disclosure UI and the public owner for the private client/shared accordion split.
- `src/components/ui/misc/Chip.tsx`: compact linked, button, or static chip for source references and lightweight token-like navigation.
- `src/components/ui/misc/CopyField.tsx`: copy-to-clipboard interaction.
- `src/components/ui/misc/HealthCheckIndicator.tsx`: compact service health display backed by a health endpoint.
- `src/components/ui/misc/ImageSwitcher.tsx`: reusable image switcher with stable transitions, eager preloading, swipe support, and shared pagination controls.
- `src/components/ui/misc/Loader.tsx`: spinner loader.
- `src/components/ui/misc/StepIndicator.tsx`: progress indicator used by modal step flows.
- `src/components/ui/misc/PaginationControls.tsx`: compact previous or next pagination controls.
- `src/components/ui/misc/ProfilePicture.tsx`: canonical shadow-free avatar display and overlapping stack for profile images, initials, unknown users, and loading state.
- `src/components/ui/misc/ScrollBorders.tsx`: scroll container with top/bottom edge affordances and an optional return-to-top action.
- `src/components/ui/misc/SegmentedControl.tsx`: segmented option selector.
- `src/components/ui/misc/SocialLinks.tsx`: generic social/profile link cluster backed by the shared icon registry.
- `src/components/ui/misc/SuspenseBoundary.tsx`: loading and error boundary wrapper.
- `src/components/ui/misc/Tooltip.tsx`: hover or focus helper text built on the shared dropdown primitive.
- `src/components/ui/misc/Skeleton.tsx`: loading placeholder.
- `src/components/ui/misc/InspectableImage.tsx`: image trigger for inspect modal.

## Public Surface
- Application, route, composite, demo, and domain consumers import public misc components and types from `@/components/ui/misc`.
- Misc-family internals and lower-level UI dependencies import their owning files directly. In particular, primitives that provide dependencies to misc components must not import the misc barrel and create a cycle.
- The barrel is explicit. Accordion client/shared modules and input-owned file preview helpers are implementation details and are not exported.
- Thin start owns a separate `@/components/ui/misc` barrel that exports only `Skeleton`.

## Invariants
- Prefer these shared UX patterns before introducing page-local versions.
- `Accordion` owns the borderless compact disclosure treatment and should continue to use `Button`, the shared icon registry, and motion conventions rather than ad hoc disclosure code. `Accordion.Card` composes the existing Card root and slots for collapsible structured sections without changing Card defaults.
- `CopyField` should remain the default for copy-to-clipboard UX.
- `Chip` owns every compact label and status surface. Its default chrome is a borderless, opaque, surface-aware soft-fill pill; static Chips remain non-interactive, while link and button Chips receive hover, active, and focus treatment. Only `tone="plain"` stays transparent.
- `SegmentedControl` should remain the default for segmented selection instead of custom pill navs.
- `SuspenseBoundary` and the state components should remain the default path for async loading and error presentation.
  - Use the default plain `StateIndicator` for route statuses and `variant="framed"` for contained entity or table empties.
  - When a loading fallback is a ghost or skeleton version of the final UI, keep the live and fallback layouts structurally identical so transitions can crossfade without layout jump.
- The focus invariant still applies: every interactive surface here must keep visible keyboard focus through the underlying shared controls.
- `Skeleton` should be preferred over one-off shimmer markup, especially when a component-specific skeleton already exists.
- Skeleton parity matters:
  - Skeleton components should mirror the live component's DOM structure, wrapper layout, spacing, and breakpoint classes.
  - Swap content nodes for skeleton nodes, not the surrounding layout containers.
  - Skeleton UIs must remain non-interactive and should not carry hover, click, focus, or blur behavior.
  - Set placeholder shape through `Skeleton radius="none|sm|md|lg|xl|2xl|full"`. Do not put conflicting `rounded-*` utilities or important radius overrides in `className`; CVA owns the single emitted radius utility through this prop.

## How To Use It
- Use plain `Accordion` for compact borderless disclosures. Use `Accordion.Card` when a structured Card header, content, actions, or footer must collapse without changing the expanded Card geometry.
  - Use `Accordion.Skeleton` and `Accordion.Card.Skeleton` for matching loading states. Pass the real title and description for sizing, use `leadingIcon` or `trailingIcon` only when those slots exist, and supply component-owned skeleton nodes through the Card action, content, and footer slots.
- Use `CopyField` whenever the user copies a token, URL, or identifier.
- Use `Chip` for compact source links, statuses, removable filters, and token-like actions.
  - Non-plain Chip tones inherit the nearest `--ui-surface-color` and pre-compose their fills against it. Containers with a distinct uniform surface should declare that variable instead of adding caller-local Chip backgrounds.
	- Use `Chip.Skeleton` with children and explicit `leadingIcon` or `trailingIcon` flags when skeleton-loading a final chip so label width, icon space, height, transparent border geometry, and rounded-full shape match the loaded state.
	- Chip skeleton icon slots default to the same 12px geometry as the live Chip's shared small icons; use `iconSize` only when the loaded Chip intentionally overrides that size.
- Use `Loader` inside asynchronous regions, but avoid duplicating loader behavior already built into `Button` or other components.
- Use `Dropdown.Menu` for action-overflow menus instead of assembling a new icon-trigger dropdown.
  - Prefer `Dropdown.menuOptions` for standard open, edit, and delete actions so tone, icons, labels, ordering, and dividers remain consistent.
- Use `PaginationControls` for compact previous or next paging actions before building page-local pager rows.
- Use `ScrollBorders` when a vertically scrollable region should expose overflow with shared border treatment instead of page-local scroll shadows or one-off borders.
- Use `Tooltip` for short helper copy on hover or focus instead of hand-rolled positioned labels.
- Use `InspectableImage` for click-to-zoom image behavior.
- Use `HealthCheckIndicator` for compact live service status instead of page-local polling badges.
- Use `ImageSwitcher` for small image carousels or before/after-style media switchers before building page-local slideshow state.
- The current convention uses the shared `StatusMessage` primitive for cautionary and status messaging instead of introducing a misc-level warning surface; its narrower ownership boundary remains under review in the feedback guide.
- Use `ProfilePicture` for avatar display before assembling image, initial, or fallback badges by hand. Use `ProfilePictureStack` for overlapping groups; it owns overlap, surface-independent cutouts, z-order, the neutral overflow count, and the group label.
- Keep profile-picture geometry on the shared `sm` (32px), `md` (40px), `lg` (56px), `xl` (80px), and `2xl` (96px) scale. Fallbacks use the same borderless helper-color soft fill as the compact pill/chip family, pre-composed into an opaque color against the nearest inherited `--ui-surface-color`; do not reintroduce local size maps, avatar borders, transparent stack fills, or avatar shadows. Stack separation clips the lower profile around the higher profile so it remains correct on every surface without surface-colored rings.
- Use `SocialLinks` for reusable social/profile link clusters instead of product-local icon-button lists.
- For initial-load loading states, prefer `Skeleton`, `Text.Skeleton`, and component-specific skeletons before toasts.
  - For `SuspenseBoundary ghost`, build the fallback from component skeletons inside the same wrapper and spacing structure as the resolved content.

## Avoid
- Custom copy, disclosure, segmented, or skeleton patterns in page code when the shared component already fits.
- New async wrappers that duplicate `SuspenseBoundary`.
- Skeleton layouts that shrink, jump, or change breakpoint structure compared to the live widget.

## See Also
- `src/components/ui/misc/accordion/AGENTS.md`
- `src/components/ui/misc/state/AGENTS.md`
- `src/components/ui/overlays/modal/AGENTS.md`
- `src/components/ui/overlays/toast/AGENTS.md`
