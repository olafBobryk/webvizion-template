# Form semantics

## Contract

Reuse the highest complete input owner for the value type before considering a
raw native control. Use lower-level field or frame primitives only while
building or extending an approved reusable input owner. Keep the native control
mounted when it provides form value, browser semantics, keyboard behavior, file
selection, or accessibility state.

Submit through a real form. Keep the label, description, required state,
validation message, IDs, and accessible relationships connected to the actual
field control. Preserve logical tab order and visible focus. Route invalid-value
feedback through the field rather than browser-native warning bubbles or
transient feedback.

Treat client validation as early feedback and server validation as
authoritative. Preserve entered values after recoverable failure. Do not clear a
successful form unless the product behavior explicitly requires it. Keep file
policy, normalization, authorization, and security validation on the server
even when the client provides hints.

Reuse existing repository form guards when honeypot, cooldown, or file-policy
behavior applies. Keep shared guard helpers UI-agnostic; do not repeat them in
individual handlers. Treat client-side filtering and honeypots as convenience
or abuse controls, not as a security boundary.

Obtain the exact input, field, and form API from the selected owner's Storybook
contract.

## Hard boundaries

- Do not place a raw control directly in a feature when a complete owner covers
  the value type.
- Allow a raw native control only inside an approved reusable owner, or a newly
  authorized reusable owner with an explicit ownership reason.
- Do not replace inline field validation with a toast or generic status banner.
- Do not sever labels, errors, required state, or accessible descriptions from
  the actual form control.
- Do not treat client validation, accepted-file hints, or hidden bot fields as
  server enforcement.
- Do not deep-import input implementation files from an external consumer.

## Repository context

Read only entries that exist and apply to the changed form or input owner:

- `src/components/AGENTS.md` for component-wide form invariants.
- `src/components/ui/input/AGENTS.md` for complete-input ownership, facades, and
  shared structural rules.
- The nearest `src/components/ui/input/**/AGENTS.md` when changing an input
  family's internal topology.
- `src/lib/forms/AGENTS.md` when server guards, cooldowns, or file policy are in
  scope.

Do not load contact-form delivery, credential, recipient, or deployment policy
for an ordinary form task.

## Verification

- Verify native submit behavior, logical keyboard order, label and description
  relationships, required state, and inline errors.
- Verify that recoverable server failure preserves input and that server
  validation remains authoritative.
- Run the focused owner Storybook test when form owner semantics or behavior
  change.
- Add broader catalogue or profile checks only when the public input contract or
  profile inventory changes.
