# Owner discovery

## Contract

Find the highest complete existing owner for the requested responsibility before
composing lower-level pieces or adding a new primitive.

Use this evidence order:

1. Read the root and nearest applicable `AGENTS.md` for ownership, dependency
   direction, source topology, server/client boundaries, and prohibitions.
2. Inspect the relevant Storybook owner documentation and its colocated contract
   or story for supported imports, variants, compounds, exclusions, examples,
   and executable guarantees.
3. Use callable Storybook documentation when it is already available. Do not
   install a service, guess an owner ID, or infer a prop solely for discovery.
4. If ownership remains unresolved, use the component catalogue as a candidate
   list, then the documented public facade and the minimum implementation
   source needed to resolve the gap.

Treat repository intelligence and source-level exports as routing evidence, not
as proof of public support. External consumers use Storybook-supported owners or
curated family facades. Internal owners may use direct modules when dependency
direction or cycle avoidance requires it.

Before extending a public variant axis, inspect its complete Storybook contract
and search current consumers. Compare the proposed role's observable behavior,
semantic purpose, and full visual signature against every supported value. Reuse
an equivalent value instead of adding a product-, section-, route-, brand-, or
source-named alias. When a genuinely new shared value is required, update its
owner contract, exhaustive teaching evidence, and affected consumers together
so the next task discovers the current system from its canonical owner.

Keep shared behavior with the narrowest coherent owner. Compose existing owners
before adding custom UI. Add a wrapper only when it owns distinct reusable
behavior rather than renaming an owner or forwarding its API. Keep client
boundaries at the smallest stateful or browser-dependent owner, and keep
server-safe exports free of client-only dependency paths.

## Hard boundaries

- Do not replace a complete owner with raw controls or page-local behavior.
- Do not treat an internal helper, styling recipe, implementation export, or
  cross-file usage as a supported consumer API.
- Do not create a parallel component tree, overlay host, catalogue, registry, or
  owner index.
- Do not invent an API when the selected owner lacks the required contract.
  Report the missing boundary and obtain explicit scope to extend or add an
  owner.
- Do not add two public variants with equivalent behavior and visual signatures
  under contextual names, or hide a reusable typography role in caller-owned
  classes.
- Preserve public names during behavior-neutral moves. Treat a rename as a
  separate migration with consumer, profile, catalogue, and verifier updates.
- Keep additive class extensions from removing required semantics, focus,
  slots, or structural selectors.
- Treat a caller-owned visual class or style override as an API gap rather than
  an escape hatch unless the user explicitly directs that departure.

## Repository context

Read only entries that exist and apply to the changed owner:

- `src/components/AGENTS.md` for component-wide workflow and documentation
  ownership.
- `src/components/ui/AGENTS.md` for shared UI dependency and public-catalogue
  boundaries.
- `src/components/ui/primitives/AGENTS.md` when selecting or changing a
  primitive.
- The nearest descendant `AGENTS.md` for internal topology the public contract
  cannot express.
  Exact component selection belongs to the current repository's owner contracts.

## Verification

- For a public component API, primitive, shared token, or family migration,
  record owner evidence with
  `npm run design-system:evidence -- --target <source> --owner <owner-story>`.
- Run focused Storybook behavior and accessibility checks for meaningful owner
  changes.
- Run `npm run verify:storybook-catalog` for catalogue or public-owner contract
  changes, and profile verification when the owner differs across profiles.
- Fix semantic accessibility defects directly. Obtain direction before changing
  established visual design solely to address a visual audit finding.
