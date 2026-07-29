# Folder: `src/components/ui/overlays/modal`

## Role
Shared modal shell, host, and hooks for confirmation dialogs, image inspection, and future modal flows. `ConfirmationModal` is a first-class Halo primitive, not a demo-only example.

Cross-cutting selection and submission behavior lives in
`docs/guides/components/overlays-and-confirmation.md` and
`docs/guides/components/forms-and-submission.md`. This file owns modal-specific
implementation constraints.

## Use This Folder When
- A feature needs blocking or focused dialog UI.
- The product needs confirmation, image inspection, or a reusable custom modal.
- You need modal behavior that participates in the app-wide modal host.

## Prefer These Files
- `src/components/ui/overlays/modal/ModalShell.tsx`: base portal-backed modal shell.
- `src/components/ui/overlays/modal/ModalCard.tsx`: mandatory Card-backed modal surface and width contract.
- `src/components/ui/overlays/modal/ModalHost.tsx`: app-wide modal renderer.
- `src/components/ui/overlays/modal/useModal.tsx`: low-level modal hook.
- `src/components/ui/overlays/modal/ConfirmationModal.tsx`: shared confirmation dialog content.
- `src/components/ui/overlays/modal/useConfirmationModal.tsx`: easiest path for destructive or confirm actions.
- `src/components/ui/overlays/modal/ModalForm.tsx`: standard form body/footer and multi-step modal composition.
- `src/components/ui/misc/StepIndicator.tsx`: canonical progress UI for `ModalStepForm`.
- `src/components/ui/overlays/modal/ImageInspectModal.tsx`: shared image-viewing modal.
- `src/components/ui/overlays/modal/useImageInspectModal.tsx`: easiest path for image-inspection UX.

## Invariants
- `ModalHost` must be mounted once near the app root through the mount layer.
- New modal flows should prefer `useConfirmationModal`, `useImageInspectModal`, or `useModal` instead of home-grown dialog state.
- Custom mutable modals should call the `setCloseDisabled` render helper while submitting so Escape, backdrop, and explicit close actions share one close lock.
- The focus invariant is especially strict here:
  - Opening a modal should move users into a clear modal focus context.
  - Focus should remain trapped in the top-most modal while it is open.
  - `Escape` should affect only the top-most modal.
  - Closing a modal should restore focus predictably to the invoking control when possible.
- `ModalShell` owns only overlay behavior: portal, backdrop, placement, motion, focus, stacking, scroll lock, and dismissal.
- `ModalHost` wraps hosted content in `ModalCard`. Direct `ModalShell` consumers must render exactly one `ModalCard` themselves.
- `ModalCard` is the visual surface owner. Do not put `Panel` in `ModalShell`, nest another `Card` around modal slots, or recreate modal chrome with local class overrides.
- Header, content, and footer spacing belongs to `ModalHeader`, `ModalContent`, and `ModalFooter`; only `ModalContent` owns standard modal scrolling.
- Async mutation modals use `useModalSubmission`. Its synchronous guard rejects duplicate submits, and the shell blocks Escape, backdrop, and header-close dismissal while pending. Disable Cancel and pass `isSubmitting` to the submit Button and `ModalStepForm` where applicable.
- Destructive confirmation patterns should reuse the shared confirmation modal before introducing custom dialog copy and controls.
- Confirmation handlers may return `false` to keep the modal open. Use structured `details`, semantic warnings, `confirmVariant`, and `confirmTone` instead of replacing the shared confirmation layout. Destructive confirmations default to the shared soft-danger tone.
- Form flows should begin with `ModalForm`; use `ModalStepForm` only when the interaction has real ordered steps rather than cosmetic progress.
- Do not add a second confirmation system. If a standard confirm-before-action flow needs different copy, pass different options to `useConfirmationModal`.

## How To Use It
- Use `useConfirmationModal` for delete, remove, disconnect, or other confirm-before-action flows.
- Use `useImageInspectModal` or `InspectableImage` for click-to-enlarge imagery.
- Use `useModal` only when a new modal type truly needs custom content beyond the existing specialized helpers.
- Use typed `cardProps`, `maxWidth`, and `placement` for supported modal differences. Extend the shared contract before adding feature-local shell chrome.
- For recoverable failure, show field errors inline, use `showToast.error` for the overall result, call `endSubmission()`, and keep the modal values mounted. Same-route success closes and updates locally or refreshes once. Navigation success performs one push or replace, closes while still locked, and leaves pending UI to the destination route boundary; never navigate and refresh together.

## Avoid
- Page-local dialog stacks with their own focus logic.
- Custom confirm modals for standard destructive flows.
- Page-local pending booleans in server-backed modal forms when `useModalSubmission` can coordinate the shell and footer.
- Breaking focus trap or focus return behavior for styling reasons.
