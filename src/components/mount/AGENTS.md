# Folder: `src/components/mount`

## Ownership

Client-only singleton mounts for global hosts and app-level browser coordination.
They are infrastructure, not public component catalogue owners.

## Structural invariants

- Global hosts mount once, high in the app tree. Feature code must not recreate
  modal, toast, loading, validation, or scroll host boundaries.
- `LoadingScreenMount` is the sole owner of the app-ready signal; overlay focus
  restoration depends on the shared host model remaining intact.
- Use host configuration or a portal target for exceptional placement rather
  than introducing another root mount.
