# Feedback and Status

Feedback is selected by ownership and lifetime: field-specific, transient,
persistent contextual, or whole-region state. Do not choose a component from
tone alone.

## Decision Map

| Situation | Preferred owner |
| --- | --- |
| Invalid value or field-specific server error | The input's `Field` message |
| User-triggered async action progress or outcome | `showToast` with `ToastHost` |
| Blocking user decision | `ConfirmationModal` |
| Initial route or region loading | Skeleton or inline loading state |
| Empty, unavailable, or recoverable region state | `StateIndicator`, `IdleState`, or `ErrorState` |
| Persistent context independent of the latest action | `StatusMessage` |
| Persistent context that appears or disappears in place | `StatusMessage.Presence` |
| Durable instructions after a successful flow | Replacement content or `StateIndicator` |

`showToast.success`, `showToast.error`, `showToast.info`, `showToast.loading`,
`showToast.dismiss`, and `showToast.promise` are the shared transient-feedback
API. Toast titles have shared defaults; pass a flow-specific title only when it
adds meaning. Prefer short, neutral, server-driven copy when available.

Use `showToast.promise` for explicit user actions that move through loading and
completion, such as save, apply, submit, retry, upload, or manual refresh. Do not
show loading toasts for initial route entry or background hydration.

## Ownership Rules

- Field validation stays inline through `Field`.
- A complete input owns its own field error, including `Markdown.Editor`.
- Toasts do not replace confirmation or complex recovery UI.
- Initial load uses skeletons or inline state, not toasts.
- Standard destructive decisions use `useConfirmationModal`.
- Region-level retry and empty states use the state component family.
- A fatal prerequisite or unavailable region uses the state family rather than a
  danger-colored notice.
- Durable success instructions replace the editable region or become normal
  content. Do not show the same success again as a toast.
- Do not repeat identical feedback in two channels. A field error and an
  overall toast may coexist only when they communicate distinct information.

## `StatusMessage` Boundary

`StatusMessage` is not a generic form-result banner. Use it only for contextual
information that remains relevant independently of the latest submission, such
as a destructive-impact warning, a simulation warning, a persistent diagnostic,
or route callback context that must survive navigation until the user proceeds.

Use `StatusMessage.Presence` when that same kind of contextual information can
appear or disappear without replacing its surrounding region:

```tsx
<div className="flex flex-col">
  <Control />
  <StatusMessage.Presence open={showContext} tone="info">
    This information remains relevant while the option is enabled.
  </StatusMessage.Presence>
</div>
```

The presence slot owns the space between the preceding content and the message.
Place the pair in a gapless grouping and select `gap="sm"` for the established
`gap-3` rhythm or `gap="md"` for `gap-4`. Do not add a second parent gap or top
margin around the slot. Initially visible messages render immediately; later
open and close changes animate together. Add `role="status"` or `role="alert"`
only when the change should be announced with that urgency.

Tone communicates meaning, not ownership or announcement priority. A danger
tone does not turn a field error, submission failure, or unavailable region into
a valid `StatusMessage` use.

## Avoid

- Toasting field validation.
- Toasting initial page loading.
- Using `StatusMessage` solely because an error needs a red treatment.
- Using `StatusMessage.Presence` for field validation or mutation outcomes.
- Page-local toast systems or status-banner variants.
- Showing identical feedback in multiple channels.

## Owner References

- `src/components/ui/primitives/StatusMessage.tsx`
- `src/components/ui/primitives/Field.tsx`
- `src/lib/feedback/toast.ts`
- `src/components/ui/overlays/toast/AGENTS.md`
- `src/components/ui/misc/state/AGENTS.md`
