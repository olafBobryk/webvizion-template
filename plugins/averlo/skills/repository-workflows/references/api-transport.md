# API transport

## Contract

Keep reusable network behavior under src/lib/api and outside UI components.
Build thin typed endpoint wrappers over a shared request client. Centralize base
URL handling, headers, response parsing, error shaping, cancellation, and other
cross-endpoint behavior in the client rather than repeating it.

Keep the transport injectable. Tests, demos, and fixtures replace the fetcher or
client while using the same endpoint wrappers as real code. Make
browser-specific defaults explicit, but inject project-specific environment or
service assumptions instead of hardwiring them into generic helpers.

Return typed data or throw typed transport errors. Let routes, actions, or UI
owners translate results into feedback and presentation. Keep server-only
credentials and privileged headers behind server boundaries.

Keep public exports small and deliberate. Add a broad facade export only when
the wrapper is intended for reuse across owners.

## Hard boundaries

- Do not scatter raw fetch calls across routes or components when an endpoint
  wrapper owns the contract.
- Do not import UI components, dispatch feedback, navigate, or mutate visual
  state from API utilities.
- Do not create demo-only endpoint functions that drift from real wrappers.
- Do not duplicate parsing, error shaping, auth headers, or retry behavior in
  individual endpoint files.
- Do not expose secrets or privileged service clients to browser bundles.

## Repository context

Read only the transport boundary being changed:

- `src/lib/AGENTS.md` for shared non-UI library ownership.
- `src/lib/api/AGENTS.md` for client, wrapper, mock, and public-export policy.
- `src/lib/api/createApiClient.ts`, the selected endpoint wrapper, and
  `src/lib/api/createMockFetch.ts` when their behavior applies.
- The calling server action, route handler, or adapter for result ownership.
- `references/contact-delivery.md` only when contact delivery is also selected.

## Verification

- Test the endpoint wrapper through both the real-shaped client contract and an
  injected mock transport.
- Verify typed success, non-success, malformed-response, cancellation, and
  network-failure paths relevant to the change.
- Run focused tests plus lint and typecheck for changed public transport
  contracts.
- Confirm no UI or secret-bearing dependency enters the transport's public
  client boundary.
