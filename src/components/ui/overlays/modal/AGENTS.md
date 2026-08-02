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

## State topology

- The modal shell owns the top-most focus context and reference-counted body
  scroll lock across stacked modals.
- Submission and close-disable state stay centralized so every hosted close
  path observes the same lock. Modal step state must not submit early.
