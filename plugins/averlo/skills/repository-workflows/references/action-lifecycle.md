# Action lifecycle

## Contract

Give every user-initiated state change one clear lifecycle owner. Reject a
duplicate start synchronously, expose pending state through the owning action,
and make conflicting actions consistently unavailable until the result settles.

Distribute results by ownership and lifetime:

- Keep value-specific validation with the field.
- Use the shared transient-feedback owner for a distinct user-action outcome.
- Use the region-level state owner when a region becomes empty, unavailable, or
  recoverably failed.
- Keep persistent context in persistent content, and turn durable post-success
  instructions into replacement content.

Different channels may coexist only when they communicate different ownership
and meaning. Do not repeat the same result through a field, banner, toast, and
replacement state.

Require the shared confirmation flow before destructive or explicitly
confirm-before-action changes. During a mutable modal action, centralize pending
and close-disable state so Escape, backdrop, explicit close, and every other
dismissal path observe the same lock. On recoverable failure, unlock the flow in
place. On successful navigation, perform one navigation and do not add a
redundant refresh.

Keep optimistic changes reversible. Restore prior UI state and leave durable
state unchanged when the mutation fails. Preserve entered or selected values
when recovery can continue in place.

Obtain exact action, confirmation, feedback, and state APIs from their Storybook
owners.

## Hard boundaries

- Do not use transient feedback for initial loading or field validation.
- Do not use a semantic notice as a generic mutation-result banner.
- Do not create a page-local confirmation dialog, toast host, portal stack, or
  parallel feedback event system.
- Do not allow a second action to start before the first pending guard is
  observable.
- Do not duplicate confirmation, feedback, navigation, refresh, or durable-state
  ownership.
- Do not keep a failed optimistic change visible as though it succeeded.

## Repository context

Read only entries that exist and apply to the changed action:

- `src/components/ui/overlays/AGENTS.md` when shared portal or host behavior
  changes.
- `src/components/ui/overlays/modal/AGENTS.md` when confirmation, pending close
  locks, or modal dismissal changes.
- `src/components/ui/overlays/toast/AGENTS.md` when transient-feedback host
  behavior changes.
- `src/lib/feedback/AGENTS.md` when feedback dispatch or event contracts change.

Do not load contact-form delivery or route-surface registry workflows for a
generic mutation.

## Verification

- Verify the immediate duplicate-action guard, visible pending state, and
  consistent disabling of conflicting actions.
- Verify recoverable failure, retained input or selection, optimistic rollback,
  confirmation, and each dismissal path affected by the change.
- Run `npm run verify:mutation-policy` when shared mutation or modal-form policy
  changes.
- Run `npm run verify:modals` when modal ownership, host topology,
  confirmation, or dismissal behavior changes.
- Run the focused owner Storybook test for changed action, confirmation,
  feedback, or region-state behavior.
