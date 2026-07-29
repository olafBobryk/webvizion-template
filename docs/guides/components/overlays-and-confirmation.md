# Overlays and Confirmation

Portal-backed UI uses the shared overlay stack. Choose the specialized modal,
toast, dropdown, or inspection API before consuming low-level portal behavior.

## Overlay Decisions

| Situation | Use |
| --- | --- |
| Standard destructive or confirm-before-action flow | `useConfirmationModal` |
| Click-to-enlarge image | `InspectableImage` or `useImageInspectModal` |
| Custom focused modal content | `useModal` with the shared modal components |
| Server-backed modal form | `ModalForm` and `useModalSubmission` |
| Genuine ordered modal steps | `ModalStepForm` |
| Triggered action menu | `Dropdown.Menu` |
| Selectable entity menu | `Dropdown.Listbox` |
| Independently controlled anchored surface | `Dropdown.Panel` |
| Transient asynchronous feedback | `showToast` |

## Modal Contract

- `ModalShell` owns portal, backdrop, placement, motion, focus, stacking, scroll
  lock, and dismissal.
- `ModalCard` owns the visual modal surface. Hosted content is wrapped by the
  host; direct shell consumers render exactly one `ModalCard`.
- Modal header, content, and footer components own their spacing. Only modal
  content owns standard scrolling.
- Opening establishes a clear focus context, the top modal traps focus and owns
  Escape, and closing restores focus to the invoking control when possible.
- Mutable modals lock every dismissal path while submitting.
- Confirmation callbacks may return `false` after recoverable failure so the
  shared confirmation remains open.
- Use structured details, semantic warnings, confirmation variants, and tones
  rather than replacing the shared confirmation layout.

Do not create a second confirmation system. Change the options supplied to the
shared confirmation primitive when a standard flow needs different copy.

## Avoid

- Page-local modal or toast stacks.
- Ad hoc `createPortal` calls where the shared portal fits.
- Nested cards or panels recreating modal chrome.
- Custom confirmation dialogs for ordinary destructive actions.
- Modal focus or dismissal behavior controlled only by visual styling.

## Owner References

- `src/components/ui/overlays/AGENTS.md`
- `src/components/ui/overlays/modal/AGENTS.md`
- `src/components/ui/overlays/toast/AGENTS.md`
- `src/components/ui/primitives/dropdown/index.ts`
