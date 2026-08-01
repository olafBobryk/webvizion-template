# Folder: `src/components/ui`

## Ownership

- This tree owns the shared design-system and UX-system implementation.
- Keep the existing family taxonomy: primitives, foundations, helpers, icons,
  input, misc, motion, overlays, and time.
- External consumers use a Storybook-supported public owner or curated family
  facade. Family internals may import direct owners when required to preserve
  dependency direction and avoid cycles.

## Structural Invariants

- Lower-level families must not depend on higher-level consumers or page code.
- Shared behavior stays with the narrowest coherent owner; do not create a
  parallel shared-component tree or feature-local overlay infrastructure.
- Focus remains visible and token-driven. Reusable shortcuts remain scoped to
  their owner rather than installing global listeners.
- Keep server-safe exports free of client-only dependency paths. Client
  boundaries belong at the smallest stateful or browser-dependent owner.
- Memoization is exceptional and justified by correctness or measured cost.

## Documentation Boundary

- Storybook navigation is the public UI catalogue. Each supported owner keeps
  its app-safe consumer contract and fixed preview adapters in a colocated
  `*.catalog.tsx` module; its story consumes that contract for Docs and
  executable guarantees.
- The optional Component Sweep discovers those same contracts through its
  generated manifest. Product components must never import catalogue modules.
- `AGENTS.md` files retain only ownership, dependency, prohibition, and
  non-observable topology rules. Do not duplicate supported APIs, variants,
  selection advice, examples, or observable behavior here.
- Catalogue migrations begin at Storybook `UI/Guides/Catalog Rules`; ordinary
  component selection begins at the relevant owner Docs page.
