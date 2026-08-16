# Catalogue contracts

## Contract

Treat Storybook navigation as the public UI catalogue. Keep one app-safe typed
catalogue contract beside each lowest complete owner and make that owner's story
consume the same contract for documentation and executable guarantees.
Storybook owns supported imports, selection guidance, variants, compounds,
exclusions, examples, and observable behavior.

When a supported variant axis changes, expose every supported value in the
lowest owner's teaching story or generated catalogue axis. Representative
examples alone are not sufficient evidence for an extended axis. Give each
value source-neutral selection guidance so another task can distinguish reuse
from a genuinely new role without consulting incidental consumers.

Keep implementation topology in the nearest AGENTS.md. Do not repeat consumer
contracts in higher-level stories, agent files, generated manifests, or a
central registry.

Generate catalogue and component-export projections from owner contracts.
Application code must never import Storybook, CSF, stories, or catalogue
modules. Preserve generated owner order and fixed export sections. Keep export
previews shell-free, scoped to their portal and preview identifiers, and limited
to one authored axis at a time.

Keep helpers, controllers, styling recipes, skeleton implementations, raw icon
maps, overlay plumbing, and other internal modules private unless an owner
contract deliberately promotes them. Preserve profile-specific public
inventories; a reduced profile exposes an intentional subset rather than
placeholder APIs.

## Hard boundaries

- Do not create a central owner index, handwritten catalogue registry, or
  second public component inventory.
- Do not infer public support from a source export or internal import.
- Do not give private helpers, styling recipes, parser internals, host
  infrastructure, or implementation modules independent catalogue identities.
- Do not import stories or catalogue contracts into product runtime code.
- Do not remove prior demonstration coverage until its useful variants, states,
  compositions, and failures exist at the correct lowest owners.
- Do not document a public variant only at the product or section that first
  requested it.

## Repository context

Read only the owner families and catalogue surfaces affected:

- `.storybook/CatalogRules.mdx`, `src/lib/component-catalog/contract.tsx`, and the
  selected owner's colocated story and catalogue contract.
- `src/components/AGENTS.md`, `src/components/ui/AGENTS.md`, and the nearest
  branding, composites, domain/assistant, foundations, helpers, icons, input,
  misc, motion, overlays, primitives, or time AGENTS.md.
- `src/app/(component-export)/internal/demo/AGENTS.md` when the shell-free export
  projection changes.
- `template-profiles/thin-start/AGENTS.md` when a public profile inventory
  changes.
- `docs/benchmarks/design-system-agent-benchmark.md` only when benchmark
  procedure or catalogue-quality evidence changes; raw run fixtures remain
  evidence, not skill context.

## Verification

- Update the owner contract, Docs rendering, teaching story, and executable
  guarantees together.
- Run focused Storybook tests for the changed owners.
- Run npm run verify:storybook-catalog and npm run catalog:check for catalogue
  or generated-manifest changes.
- Run npm run verify:profiles when profile-visible owners or exports change.
- Run npm run verify:component-sweep only when the shared export projection
  changes.
