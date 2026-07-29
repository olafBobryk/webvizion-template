# Folder: `scripts/verify`

## Role

Executable repository verification entrypoints grouped by verification ownership.

## Invariants

- Keep public npm script names stable when moving or renaming an implementation file.
- Resolve repository fixtures and source files from the repository root unless a verifier intentionally tests path-relative behavior.
- Update assembly ownership, template profiles, Template Intelligence, and tracked documentation whenever a verifier path changes.
- Keep shared execution helpers outside this folder when they are also used by non-verification scripts.
- Verification scripts may inspect source text, but must not rewrite product source or generated profile output.

## Adding A Verifier

- Add the executable here using the existing `verify-*.ts` or `verify-*.mjs` convention.
- Expose it through a stable `verify:*` package script.
- Add it to assembly/profile ownership when the verified surface is optional.
