# Composition and Public APIs

Use the highest-level existing component that owns the requested UX. Drop down
to primitives only when no complete component fits, and introduce a reusable
component only when extending an existing owner would harm its coherence.

## Selection Order

| Need | Preferred starting point |
| --- | --- |
| Complete form control | `@/components/ui/input` |
| Common loading, state, copy, disclosure, or display helper | `@/components/ui/misc` |
| Portal-backed modal or toast behavior | `@/components/ui/overlays` and its documented APIs |
| Reusable above-primitive composition | `src/components/composites/` |
| Custom arrangement with standard behavior | `src/components/ui/primitives/` |
| Focus, settings, motion, or surface tokens | `src/components/ui/foundations/` |

Search the component tree and internal demo before writing raw buttons, inputs,
labels, dropdowns, dialogs, feedback surfaces, or layout widgets.

## API Shape

| Relationship | Naming pattern | Example |
| --- | --- | --- |
| Independent owner | Standalone export | `Button`, `SelectInput` |
| Cohesive peer family | ES-module namespace | `Markdown.Editor`, `Markdown.Render` |
| Structurally owned slot | Runtime compound | `Card.Header`, `Reveal.Item` |
| Subordinate representation | Component-owned companion | `Button.Skeleton` |

- ES-module namespaces are ordinary named exports consumed with
  `import * as Family`; do not create runtime namespace objects for dot syntax.
- Runtime compounds are for actual structural ownership, not merely related
  names.
- Curated family barrels use explicit named exports, never `export *`.
- External consumers use the documented family entrypoint. Family internals and
  lower-level dependencies import direct owners when a barrel would invert the
  dependency graph or create a cycle.
- Reduced profiles expose deliberate subsets of the same family and omit
  unavailable members rather than stubbing them.

## Reusable Feature Workflow

1. Implement the feature in its canonical owner folder.
2. Update its public exports and types only as needed for a coherent API.
3. Add a focused live example and copyable usage snippet to the internal demo.
4. Record component-specific constraints in the nearest `AGENTS.md`.
5. Update these guides only when the feature changes a cross-cutting decision.
6. Verify touched files, public contracts, profiles, and rendered behavior.

Preserve public names during behavior-neutral file moves. Treat API renames as
a separate checkpoint that updates consumers, demos, manifests, verification,
and Template Intelligence together.

## Avoid

- One-file or route-local barrels with no meaningful public boundary.
- Feature-local clones of an existing component with small stylistic changes.
- Generic helper folders that obscure an existing owner.
- Editing several component families before checking for a higher-level match.
- Default `useMemo` or `useCallback`; add memoization only for correctness or
  measured performance.

## Owner References

- `src/components/ui/AGENTS.md`
- `src/components/ui/input/AGENTS.md`
- `src/components/ui/misc/AGENTS.md`
- `src/components/composites/AGENTS.md`
