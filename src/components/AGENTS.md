<INSTRUCTIONS>
## Component Ownership

- This tree owns reusable components and shared UI. Keep route-specific pieces
  with their route until they acquire an independent shared owner.
- Storybook owns supported public APIs and observable behavior; the nearest
  `AGENTS.md` owns local topology. When `$averlo:repository-workflows` is
  explicitly invoked, its selected concern contracts additionally own the
  implementation workflow; its absence does not block ordinary component work.
- Compose existing owners before adding a reusable component. Do not create a
  parallel control, overlay, feedback, layout, or component-family owner.
- Preserve public names during behavior-neutral moves. Treat a public rename as
  a separate migration with its affected contracts and verification.

## Directory Map

- `branding/`: brand identity.
- `composites/`: reusable compositions above primitives.
- `domain/`: reusable domain-level extensions for assembled projects.
- `mount/`: client-only application hosts.
- `ui/foundations/`: shared tokens and foundations.
- `ui/helpers/`: small component helpers.
- `ui/icons/`: icon rendering and registries.
- `ui/primitives/`: low-level reusable building blocks.
- `ui/input/`: complete form controls.
- `ui/misc/`: cross-cutting display and interaction helpers.
- `ui/motion/`: motion and scroll helpers.
- `ui/overlays/`: portal-backed overlays.
- `ui/time/`: date and relative-time presentation.
</INSTRUCTIONS>
