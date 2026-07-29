# Auth and organization adapters

The full-start template ships an organization-first reference application with
provider-neutral contracts. Its default fixture adapter is deliberately useful
for local review and deliberately unsuitable as production persistence.

## Runtime model

- The browser receives an opaque `HttpOnly`, `SameSite=Lax` session cookie.
- Fixture sessions, users, memberships, organizations, invitations, and
  identities live in server memory and reset with the server process.
- Every `/dashboard/**` request resolves the session and active organization on
  the server. One active membership is selected automatically; multiple active
  memberships require `/select-organization`.
- A stored selection is discarded if its membership is revoked. Signing out
  deletes the session, which also clears organization selection.
- The default singleton organization and demo entry keep a generated app simple
  while retaining the organization boundary needed to productize it later.

## Replacement seam

Implement `AuthAdapter`, `OrganizationAdapter`, `InvitationAdapter`, and
`IdentityAdapter` from `src/lib/auth/contracts.ts`, then replace the adapter
composition exported by `src/lib/auth/server.ts`. Keep route components and
dashboard presentation free of provider SDK types.

Adapter methods that are not implemented must remain unavailable. The shared
availability registry and `assertAuthMethodAvailable` make magic links,
recovery, password updates, and identity linking fail closed until a provider
explicitly supports them.

## Invitations and identities

Invitation links render an inert GET review screen. The explicit acceptance
action validates the token, recipient email, organization, expiry, revocation,
and prior use before creating a membership and consuming the invitation in one
fixture-state transition. Reinviting the same email to the same organization
revokes older pending invitations.

Identity removal rejects deletion of the final verified sign-in identity. A
production adapter must enforce the same rule transactionally with its identity
provider.

## Private files

`src/lib/auth/private-files.ts` defines authorization, validation, opaque key,
metadata, signed-access, replacement-cleanup, and deletion contracts. The
template does not install or silently select a storage provider. Signed access
defaults to five minutes and uploads default to a 10 MB allowlisted policy.

## Fixture review accounts

- `operator@averlo.local` / `demo-password`: singleton demo organization.
- `multi@averlo.local` / `demo-password`: organization-selection flow.
- `invitee@averlo.local` / `demo-password`: invitation flow before membership.

The deterministic fixture invitation uses ID
`00000000-0000-4000-8000-000000000001` and token
`fixture-invitation-token`. These values are public template fixtures, not
secrets.

Run `npm run verify:auth` for safe-continuation, singleton, multi-organization,
revoked-selection, invitation, reinvite, identity, method-availability, and
private-file-policy checks.
