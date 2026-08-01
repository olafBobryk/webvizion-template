# Folder: `src/components/ui/input/files`

## Ownership and boundary

This folder owns controlled file selection and profile-picture fields. External
consumers import supported owners and types from `@/components/ui/input`;
Storybook owns their consumer contracts.

## Private topology

- `FilePreview` and `FileInspectModal` are private FileInput composition owners
  and must not gain public exports or catalogue identities.
- FileInput owns client-side form state and presentation only. Upload transport,
  persistence, progress, server deletion, and authoritative validation remain
  outside this family.
- The editable file rail ends with the shared dashed add tile. Read mode reuses
  the same preview topology without add/remove controls.

## Structural invariants

- Keep the native file input synchronized with controlled visual state across
  selection, replacement, removal, form reset, reset signals, and unmount.
- Object URLs are revoked when pending files are replaced or the component
  unmounts.
- `accept` drives picker, capture, and drag/drop client filtering, but never
  represents a security boundary; server handlers validate independently.
- Mixed batches retain accepted files and report rejected files without
  discarding valid selections.
