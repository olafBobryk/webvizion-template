# Dashboard registry policy

- Dashboard navigation, ancestor trails, layout width, capability checks, and
  static commands derive from `surfaceRegistry.ts`. Do not mirror dashboard
  routes in the global marketing route registry.
- New surfaces declare their route, parent, sidebar tier, required capability,
  layout width, dashboard domain area, optional non-route source roots, and
  commands in one registry entry.
- Adding, moving, or removing a dashboard destination in a template instance
  requires updating its canonical registry entry in the same change. Standard
  verification discovers unregistered pages and stale registered routes.
- Dashboard domain reporting is derived from relative edited paths. Treat it as
  observed activity only, never proof that a domain was inspected or corrected.
- Capability-hidden destinations must also be denied by their server page; UI
  visibility alone is not authorization.
- Contextual commands register through the shell-owned command provider and must
  unregister when their owning surface unmounts.
- Keep product-specific entities and their presentation below the dashboard
  route boundary. Do not create a global entity renderer or presentation map.
- Platform management is a separate dashboard-owned access axis. Never infer
  `platformRole` from organization owner or administrator membership; keep its
  `/dashboard/platform` routes in this registry and the shared dashboard shell.
- Entity paths, dependency layers, examples, and selection contracts are defined in
  `docs/frontend-entity-policy.md`; registry entries expose routes but do not own
  entity presentation.
