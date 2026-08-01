# Folder: `src/components/ui/overlays/toast`

## Ownership

This folder owns the client-only transient-feedback host. The supported host
and action contract lives at `UI/Overlays/Toast` in Storybook.

## Dependency and host boundaries

- `ToastHost` mounts exactly once through `ToastClientMount` near the
  application root.
- `src/lib/feedback/toast.ts` is the paired dispatch API; UI consumers do not
  create feature-local Sonner hosts or state.
- The host may depend on focus and theme tokens but must not depend on route or
  feature code.

## Structural invariants

- Toast content, actions, cancel, and dismiss controls retain visible focus and
  semantic Sonner roles.
- Host animation continues to respect shared reduced-motion settings.
- Default host titles and the simple, loading, dismissal, and promise dispatch
  paths remain synchronized with the shared feedback facade.
