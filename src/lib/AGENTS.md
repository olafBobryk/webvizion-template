# Folder: `src/lib`

## Role

Shared non-UI application utilities. Keep reusable project foundations
independent from React components.

## Invariants

- Network and transport code does not belong in `src/components`.
- Prefer canonical endpoint wrappers over raw `fetch` calls scattered through
  app code.
- Keep the transport layer dependency-injectable: demos and tests should swap the client or fetcher, not duplicate endpoint logic.
- Keep browser-only defaults explicit when they matter, but do not hardwire project assumptions into the factory when injection solves it cleanly.
- UI feedback belongs in `src/app` or `src/components`; `src/lib` should return data or throw typed errors.
