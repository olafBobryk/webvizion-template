# Folder: `src/components/ui`

## Role

Main design-system and UX-system entry point. Search this tree before creating a
shared or page-local interface pattern.

## Choose an Owner

- Low-level structure and styling: `primitives/`.
- Complete form controls: import from `@/components/ui/input`.
- Shared state, loading, display, copy, disclosure, and utility patterns: import
  from `@/components/ui/misc`.
- Modals, toasts, and portal-backed systems: `overlays/`.
- Reveal or scroll motion: `motion/`.
- Date and relative-time presentation: `time/`.
- Icons and icon transitions: `icons/` and `helpers/`.
- Focus, settings, timing, and surface tokens: `foundations/`.

The pattern decision guides live at `docs/guides/components/README.md`. The
nearest child `AGENTS.md` owns implementation details after an owner is chosen.

## Invariants

- Start with the highest-level component that matches the UX and extend through
  supported props, variants, slots, or composition.
- Preserve the existing taxonomy instead of creating a parallel shared folder.
- External consumers use documented public entrypoints; family internals import
  direct owners when required for dependency direction.
- Focus remains visible and token-driven across interactive UI.
- Initial loading uses inline state or skeletons, not toasts.
- Reusable shortcuts remain scoped and use the shared hotkey convention.
- Memoization is exceptional and justified, not automatic.

## Avoid

- Custom markup that duplicates an existing input, overlay, state, feedback, or
  surface component.
- Dropping directly to primitives before checking for a complete component.
- Feature-local overlay stacks or global keyboard listeners.
- Putting a shared behavior in a folder whose owner does not match it.
