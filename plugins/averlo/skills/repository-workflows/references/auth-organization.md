# Auth and organization architecture

## Contract

Keep routes and presentation provider-neutral. Put provider SDK types behind
AuthAdapter, OrganizationAdapter, InvitationAdapter, and IdentityAdapter
boundaries, then compose the selected server adapters without leaking them into
route UI.

Resolve the session and active organization on the server for every protected
dashboard request. Accept a stored organization selection only while an active
membership exists. Keep global account identity separate from
organization-scoped membership and keep platformRole as a separate access axis;
organization ownership or administration never grants platform access.

Use the shared safe-continuation resolver for every user-controlled return
destination. Optional adapter methods fail closed until the provider explicitly
supports them. Authorization is enforced at the server page and mutation, not
only through hidden navigation.

Keep invitation GET pages inert and review-only. Create membership only through
an explicit state-changing action after validating token, recipient,
organization, expiry, revocation, and prior use. Reinvitation invalidates older
pending invitations. Never remove the final verified sign-in identity.

Treat fixture adapters as non-durable review implementations. Private files
require organization authorization, metadata validation, opaque keys,
short-lived signed access, replacement cleanup, and explicit deletion; do not
select a storage provider implicitly.

## Hard boundaries

- Do not import provider SDK types into route or component presentation.
- Do not trust continuation values, stale organization selections, client-only
  capability visibility, or invitation GET requests.
- Do not make optional provider methods appear available by default.
- Do not conflate platform access, organization membership, and global identity.
- Do not treat server-memory fixture state as production persistence.
- Do not install a private-file storage provider without an explicit
  instance-level decision.

## Repository context

Read only the auth capabilities in scope:

- `src/lib/auth/AGENTS.md` and the relevant contracts, server composition,
  adapter, invitation, identity, or private-file module.
- `src/app/(site)/dashboard/_registry/AGENTS.md` when capability visibility,
  server denial, or organization context affects a route.
- `src/app/(site)/dashboard/platform/AGENTS.md` when platform access changes.
- `src/components/AGENTS.md` when a redirect guard or auth UI owner changes.

## Verification

- Run npm run verify:auth for continuation, session, organization, invitation,
  identity, optional-method, and private-file policy changes.
- Run npm run verify:platform for platform access or platform-owned operations.
- Verify 401 and 403 outcomes redirect through the supported route behavior
  rather than rendering blank or permanently loading UI.
- Verify authorization again at execution time for every changed mutation.
