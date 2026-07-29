# Feedback and Status

Feedback is selected by ownership and lifetime: field-specific, transient,
persistent contextual, or whole-region state. Do not choose a component from
tone alone.

## Current Decision Map

| Situation | Current preferred owner |
| --- | --- |
| Invalid value or field-specific server error | The input's `Field` message |
| User-triggered async action progress or outcome | `showToast` with `ToastHost` |
| Blocking user decision | `ConfirmationModal` |
| Initial route or region loading | Skeleton or inline loading state |
| Empty, unavailable, or recoverable region state | `StateIndicator`, `IdleState`, or `ErrorState` |
| Inline information, success, warning, or danger copy not already owned by a field, action, or region | Currently `StatusMessage`; exact boundary unresolved |

`showToast.success`, `showToast.error`, `showToast.info`, `showToast.loading`,
`showToast.dismiss`, and `showToast.promise` are the shared transient-feedback
API. Toast titles have shared defaults; pass a flow-specific title only when it
adds meaning. Prefer short, neutral, server-driven copy when available.

Use `showToast.promise` for explicit user actions that move through loading and
completion, such as save, apply, submit, retry, upload, or manual refresh. Do not
show loading toasts for initial route entry or background hydration.

## Channel Rules Already Established

- Field validation stays inline through `Field`.
- Toasts do not replace confirmation or complex recovery UI.
- Initial load uses skeletons or inline state, not toasts.
- Standard destructive decisions use `useConfirmationModal`.
- Region-level retry and empty states use the state component family.

## Review Decisions

### `StatusMessage` ownership

`StatusMessage` is currently documented broadly as a semantic inline surface for
information, success, warning, and danger copy. That leaves agents free to use
it as a generic form-result banner, which conflicts with field-owned validation,
action toasts, and region-level state components.

The proposed policy for review—not yet adopted—is:

> `StatusMessage` is not a generic form-result banner. Use it only for
> persistent contextual information that remains relevant independently of the
> latest submission.

Examples that appear consistent with that direction include a destructive
impact warning inside confirmation, an invalid invitation prerequisite, or a
durable callback status on an auth screen. Current form and editor-modal uses
need classification after this policy is accepted or changed.

### Duplicate error channels

Some flows currently render an inline `StatusMessage` and call
`showToast.error` with the same failure. Decide whether the inline message is a
field correction, a persistent contextual condition, or redundant action
feedback. Also decide whether identical copy may ever appear in both channels or
whether each channel must communicate distinct information.

### Durable success instructions

Password recovery and similar flows may replace the editable form state with
instructions that remain relevant. Decide whether that is persistent content,
a region state, or a toast before auditing consumers.

## Avoid

- Toasting field validation.
- Toasting initial page loading.
- Using `StatusMessage` solely because an error needs a red treatment.
- Page-local toast systems or status-banner variants.
- Showing identical failure copy in multiple channels without distinct purpose.

## Owner References

- `src/components/ui/primitives/StatusMessage.tsx`
- `src/components/ui/primitives/Field.tsx`
- `src/lib/feedback/toast.ts`
- `src/components/ui/overlays/toast/AGENTS.md`
- `src/components/ui/misc/state/AGENTS.md`
