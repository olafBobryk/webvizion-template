# Composition and Public APIs

Choose the highest-level owner that completely owns the requested behavior.
Use a complete input or finished overlay before assembling primitives; add a
reusable composition only when no existing owner can remain coherent while
covering the use case.

## Cross-Family Rules

- External consumers use Storybook-supported standalone modules or curated
  family facades. Internal direct imports do not establish public support.
- Panel, Card, and Float are exposed only through
  `@/components/ui/primitives/surfaces`; their shared styling recipe remains an
  internal implementation detail for higher-level chrome owners.
- Lower-level owners may import direct implementation modules to preserve
  dependency direction and avoid barrel cycles.
- Runtime compounds express real structural ownership; ES-module namespaces
  group cohesive peers; component-owned companions cover subordinate forms such
  as skeletons.
- Curated barrels use explicit exports and reduced profiles expose deliberate
  subsets rather than placeholders.
- Preserve public names during behavior-neutral moves. Treat API renames as a
  separate migration with consumer, profile, catalogue, and verifier updates.
- Add a wrapper only when it owns distinct reusable behavior, not to rename or
  forward an existing API.

The relevant Storybook owner decides which import, compound, props, and examples
are supported. The nearest `AGENTS.md` decides structural dependency and source
topology.
