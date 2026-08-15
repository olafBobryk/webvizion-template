# Folder: `src/lib/api`

## Role

Reusable API transport and endpoint wrappers. This folder owns fetch clients,
typed errors, endpoint helpers, and API-facing demo/test plumbing.

## Invariants

- Endpoint wrappers should be thin and typed.
- Shared request behavior belongs in the client factory, not repeated in each endpoint file.
- Mocks should work with the same endpoint wrappers instead of creating separate demo-only call paths.
- API utilities should not import UI components or trigger UI side effects directly.
