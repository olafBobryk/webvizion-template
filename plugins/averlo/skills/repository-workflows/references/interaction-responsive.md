# Interaction and responsive behavior

## Contract

Preserve visible, token-driven focus for every interactive control. Use native
keyboard behavior when it covers the interaction, scoped shared shortcuts for
reusable commands, and owner-managed navigation for composite widgets. Keep
semantics, accessible names, focus entry, and focus return with the interaction
owner.

Use responsive CSS or Tailwind classes for layout, styling, and lightweight
visibility. Use a client breakpoint branch only when a hidden branch would
otherwise mount expensive work such as observers, animation runtimes, media,
canvas, or duplicated decorative DOM. Never client-gate primary copy, headings,
navigation, essential controls, or accessibility affordances.

Use the shared motion provider, scheduler, timing, and spring system. Let a
motion source own activation and overall progress while its effect owns visual
mapping and internal phasing. Do not create page-local schedulers, reveal
observers, reset systems, or hardcoded timing families. Keep reduced-motion and
fallback paths fully readable, focusable, and operable.

Use the shared portal and host model for modal, dropdown, and toast behavior.
Keep portal creation, stacking, top-most state, focus entry and restoration,
dismissal, and scroll locking with the specialized overlay owner. Keep anchored
non-blocking work with its dropdown owner and focused blocking work with its
modal owner.

Keep loading placeholders non-interactive. Keep ownership semantics and visible
focus on the real interaction owner when motion or decorative wrappers are
added. Use camelCase SVG attributes in JSX. Add memoization only for correctness
or measured performance, not by default.

## Hard boundaries

- Do not remove or replace a shared visible focus treatment with a page-local
  visual rule.
- Do not install global listeners for a reusable shortcut or fork a composite
  owner's keyboard navigation.
- Do not use client-only breakpoint state for SEO-critical or accessibility-
  critical content.
- Do not introduce a second global motion scheduler, page-local reveal observer,
  or timing system.
- Do not call portal primitives directly when a specialized overlay owner
  covers the interaction.
- Do not let reduced motion, fallback rendering, or animation wrappers gate
  semantics, primary content, keyboard access, or controls.

## Repository context

Read only entries that exist and apply to the changed interaction:

- `src/components/ui/motion/AGENTS.md` when shared motion sources, effects,
  scheduling, timing, or reduced-motion behavior changes.
- `src/components/ui/overlays/AGENTS.md` when shared portal or host ownership
  changes.
- `src/components/ui/overlays/modal/AGENTS.md` when modal focus, stacking,
  dismissal, or scroll ownership changes; read the nearest other overlay
  `AGENTS.md` for its internal topology.
- `src/components/ui/primitives/AGENTS.md` and the nearest interactive owner
  `AGENTS.md` when dropdown, listbox, focus, or structural selectors change.

Do not preload every motion, overlay, or input owner for ordinary responsive CSS
work.

## Verification

- Verify keyboard access, visible focus, accessible names, focus entry and
  return, dismissal, reduced motion, and affected breakpoint behavior.
- Run the focused Storybook owner test for changed interaction behavior and its
  accessibility assertions.
- Run `npm run verify:modals` when modal host, focus, stacking, scroll lock, or
  dismissal topology changes.
- Use managed browser or breakpoint review for expensive responsive branches or
  material layout changes.
- Fix semantic accessibility defects directly. Obtain direction before changing
  established visual design solely to resolve contrast, spacing, typography,
  layout, or focus-style findings.
