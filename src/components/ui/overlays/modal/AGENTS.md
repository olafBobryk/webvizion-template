# Folder: `src/components/ui/overlays/modal`

## Ownership

This folder owns the client-only modal host, shell, Card surface, slots,
submission context, and specialized confirmation and image-inspection flows.
Consumer contracts live under `UI/Overlays/Modal*` in Storybook.

## Dependency and host boundaries

- `ModalHost` mounts exactly once through the application mount layer.
- `ModalShell` owns portal, backdrop, placement, motion, focus, stacking, scroll
  lock, and dismissal. It owns no visual surface.
- `ModalHost` wraps hosted content in exactly one `ModalCard`. Direct
  `ModalShell` consumers render exactly one `ModalCard` themselves; `Panel` or
  nested Card shells are forbidden.
- `ModalHeader`, `ModalContent`, and `ModalFooter` own slot spacing. Only
  `ModalContent` owns standard modal scrolling.
- Raw modal events in `@/lib/modal` are host plumbing, not consumer APIs.

## Interaction invariants

- Opening enters a modal focus context; only the top-most modal traps focus and
  handles Escape; closing restores focus to the invoking control when possible.
- Body scroll locking is reference-counted across stacked modals.
- `useModalSubmission` synchronously rejects duplicate submissions and locks
  Escape, backdrop, header-close, Cancel, and conflicting actions while pending.
- The host render helper's `setCloseDisabled` state remains synchronized with
  the shell so every close path observes the same lock.
- Confirmation handlers may return `false` to keep their hosted modal mounted.
  Modal step navigation must never submit until the final enabled step.
