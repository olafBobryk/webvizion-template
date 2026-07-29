# Forms and Submission

Forms use real form semantics, complete input components, field-owned
validation, and explicit pending behavior. Keep transport and server guard logic
outside UI primitives.

## Component Decisions

| Situation | Use |
| --- | --- |
| Label, description, required state, and field message | The input's `Field` contract |
| Text-like shell and focus treatment | The input's `InputFrame` contract |
| Email or password entry | `EmailInput`, `PasswordInput` |
| Password creation or reset | Usually `PasswordInput showStrength` |
| Searchable selection | `SelectInput` or a combobox input |
| Phone, numeric, range, date, color, or file input | The matching `@/components/ui/input` control |
| Choice group | `RadioInput`, `MultiselectInput`, or `ToggleInput` |
| Inline rename | `EditableTextField` |
| Server-backed modal form | `ModalForm` with `useModalSubmission` |
| Ordered multi-step modal | `ModalStepForm` |

## Validation Ownership

- Labels, descriptions, errors, required state, IDs, `aria-describedby`, and
  `aria-invalid` flow through `Field` and the complete input component.
- Validation specific to one value stays attached to that field. Do not replace
  it with a toast or a generic page-local banner.
- Keep the actual interactive input responsible for native semantics, browser
  autofill, and accessibility attributes.
- IDs fall back to `React.useId()` when neither `id` nor `name` supplies one.
- Server validation remains authoritative even when the client provides early
  feedback.

## Submission Lifecycle

1. Submit through a real `<form onSubmit>` so Enter and assistive technology
   follow native behavior.
2. Reject duplicate submission synchronously.
3. Mark the submit `Button` as loading and disable conflicting actions.
4. Preserve entered values on recoverable failure.
5. Apply field-specific errors inline.
6. Route the overall user-action outcome through the feedback convention.
7. Do not clear values automatically unless the product flow requires it.

Modal-backed actions return a local structured result such as
`{ ok, message, fieldErrors? }`. Field keys belong to the form or domain; do not
create one global mutation-result registry.

For server-backed modals, call `beginSubmission()` before the request and stop
when it returns `false`. While pending, block Escape, backdrop, and header-close
dismissal; disable Cancel; and use the submit button's loading state. On
recoverable failure, call `endSubmission()`. Same-route success closes and
performs one local update or one `router.refresh()`. Navigation success performs
one `router.push()` or `router.replace()`, closes while still locked, and does
not follow navigation with `router.refresh()`.

## Review Decisions

The current instructions establish field-owned validation and transient action
feedback, but consumers do not consistently distinguish these cases:

- A server response can contain both field errors and an overall failure. The
  intended default appears to be inline field errors plus one toast for the
  overall action, but duplicate copy in both channels has not been audited.
- Some non-field form failures are currently stored in form-local error state
  and rendered as `StatusMessage`; whether those are persistent prerequisites or
  transient submission outcomes needs an explicit policy decision.
- Successful flows that replace the form with durable next-step instructions
  may be contextual content rather than transient feedback. That boundary needs
  to be confirmed with the feedback guide.

## Avoid

- Click-handler-only submission when a form expresses the interaction.
- Page-local password visibility controls or strength meters.
- Validation toasts that are detached from the invalid field.
- Unlocking or unmounting a recoverable modal failure before users can correct
  it.

## Owner References

- `src/components/ui/input/AGENTS.md`
- `src/components/ui/overlays/modal/AGENTS.md`
- `src/lib/forms/AGENTS.md`
