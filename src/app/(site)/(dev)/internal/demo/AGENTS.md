<INSTRUCTIONS>
# Component Sweep

## Ownership

- `/internal/demo` is an application-native projection of colocated
  `*.catalog.tsx` owner contracts. It is not a second component registry.
- `scripts/generate-component-catalog.mjs` owns the deterministic static import
  manifest. Never hand-edit or hand-register entries in the generated file.
- A catalogue contract owns its fixed fixtures and render adapters. The route
  owns only ordering, one-axis projection layout, stage geometry, and failure
  isolation.

## Boundaries

- Storybook remains the executable documentation and test environment. Stories
  import the same colocated contracts for Docs; application code never imports
  `.storybook` or CSF modules.
- Declare only finite scalar visual axes. Keep children, callbacks, arbitrary
  copy, class names, and fixture data inside the target render adapter.
- Project one axis at a time around a complete declared baseline. Never turn
  the sweep into a Cartesian-product renderer.
- Give each visually renderable compound its own target. Hooks, providers, and
  type-only compounds remain documentation-only.
- Use the three shared stage presets. Do not add arbitrary per-owner stage
  classes.
- Keep interactive and portaled previews inside `PortalScope`; overlays must
  not escape into the page-level document. The scope also isolates modal event
  channels, and the route prefixes fixture IDs so simultaneous previews do not
  create cross-stage label or ARIA references.
- All catalogue modules, the manifest, generator, verifier, and this route
  belong to the optional `demo` assembly surface. Product components must not
  depend on them.
</INSTRUCTIONS>
