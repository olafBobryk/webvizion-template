# Authentication and organization policy

- Keep application routes and presentation provider-neutral. Provider SDKs
  belong behind adapters in this directory and must not leak into dashboard or
  auth-page components.
- Resolve the session and active organization on the server for every dashboard
  request. A selected organization is valid only while an active membership
  exists.
- Use `getSafeContinuationPath` for every user-controlled continuation. Never
  redirect directly from `next`, callback, invitation, or provider values.
- Optional adapter methods are unavailable by default. Call
  `assertAuthMethodAvailable` before executing a provider-specific flow.
- Invitation GET pages are review-only. Membership creation must happen through
  an explicit POST or server action after recipient, token, organization,
  expiry, revocation, and reuse checks.
- Never remove the final verified identity that can authenticate an account.
- The fixture adapter is non-durable and stores opaque sessions in server
  memory. It is a reference implementation, not the recommended production
  persistence model.
- The fixture implementation is organized under `fixture/`. The adapter and
  verification scripts import its explicit `fixture/index.ts` surface; modules
  inside the family import their direct owners and must not self-import through
  that index.
- Private files require organization authorization, validated metadata, opaque
  storage keys, short signed-access lifetimes, replacement cleanup, and explicit
  deletion. No storage provider is installed by default.
