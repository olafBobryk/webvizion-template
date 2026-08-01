# Forms and Submission

Forms combine complete input owners, native form semantics, field-owned
validation, and explicit pending behavior.

## Cross-Family Decisions

- Prefer the complete input matching the value type. Drop to `Field`,
  `InputFrame`, or choice primitives only when building another reusable input.
- Labels, descriptions, required state, and value-specific errors remain with
  the field. Toasts never replace field validation.
- Submit through a real form, reject duplicate submission synchronously, mark
  the submit action pending, and disable conflicting actions.
- Preserve entered values on recoverable failure. Server validation remains
  authoritative even when the client provides early feedback.
- A result distributes by ownership: field errors stay inline; a distinct
  user-action outcome may use transient feedback; an unavailable region uses
  the state family.
- Modal submissions lock every dismissal path while pending. Recoverable
  failures unlock in place; successful navigation performs one navigation and
  does not add a redundant refresh.

Exact input, modal-form, button, and field APIs live on their Storybook owners.
