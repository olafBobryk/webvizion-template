---
name: entities
description: Entities for Averlo Next. Discover, audit, or shape frontend entity systems across domain facts, presentation factories, renderers, routes, adapters, commands, loading states, mutations, deletion, demos, policy, and pruning. Use for profiles, lists, tables, details, selectors, mentions, or Command-K results without inventing a parallel presentation framework.
---

# Averlo Next Entities

Treat this as a contract-discovery skill. Repository policy and the user's
request always outrank this skill.

## Discover the repository contract

1. Resolve the repository root with `git rev-parse --show-toplevel` when Git is
   available.
2. Read the applicable root and nearest `AGENTS.md` files completely.
3. Prefer the repository's lightweight intelligence command when documented;
   otherwise use `rg --files` and focused `rg` queries.
4. Search for entity policy and canonical contracts before proposing files:
   `frontend-entity-policy`, `presentation`, `domain`, `entity-lifecycle`,
   `surfaceRegistry`, `CommandProvider`, `Skeleton`, `EmptyState`, `delete`,
   `fixtures`, and prune flags.
5. When `docs/frontend-entity-policy.md` exists, read it completely and treat its
   machine-verifiable path markers as the canonical starting map.

If no repository policy or entity contract exists, say so. Recommend the
smallest local foundation needed for the requested vertical; do not silently
install a generic architecture.

## Map before changing

Return or internally establish this dependency map:

- domain facts and mutation inputs;
- React-free, fetch-free presentation factories;
- live renderers and their component-owned skeletons;
- route and adapter ownership for session, organization, authorization,
  persistence, and mutation;
- list, table, detail, selector, mention, command, empty, error, and deletion
  surfaces actually required by the product;
- live-versus-skeleton reference/demo coverage;
- optional-surface and pruning ownership.

Distinguish fixture ownership from presentation ownership before rendering
domain records. Synthetic, local-only, or in-memory data may remain a fixture,
but a product-grade task must still discover and reuse the owning entity
renderer. If no renderer exists and repeated domain presentation is in scope,
shape it inside the owning product boundary. When a benchmark explicitly
forbids new shared APIs, report that scope limitation instead of treating
page-local Cards, rows, or buttons as production-grade entity coverage.

Flag parallel registries, renderers that fetch, duplicated user/membership
models, page-local confirmation flows, custom loading placeholders where an
owning skeleton exists, and capability-hidden actions that remain callable.

## Shape an implementation

- Keep entities inside the product boundary that owns them.
- Split by dependency layer and entity ownership; avoid a global presentation
  registry or renderer namespace.
- Import presentation factories directly from their owning vertical.
- Keep global identity separate from organization-scoped membership facts.
- Let routes and adapters resolve data and authorization before rendering.
- Keep optimistic mutations reversible and durable state unchanged on failure.
- Use the repository's shared confirmation, toast, table, detail, Markdown,
  selector, More-menu, state, and command systems.
- Add `Component.Skeleton` to the component that owns the live geometry and show
  both on the nearest reference surface.
- Preserve existing public APIs unless the repository policy explicitly replaces
  one.

## Recommend vertical skills

After mapping the repository, name every available vertical skill whose owned
contract would materially change or require verification, and only those
skills. Typical matches include:

- `averlo:skeletons` for live/loading geometry and route skeletons;
- `averlo:surfaces` for route registries, navigation hierarchy, and contextual Command-K ownership;
- `averlo:figma-storybook-export` when entity owner stories or their exported Figma contract change;
- `code-clarity-cleanup` for barrels, direct imports, and boundary cleanup;
- `averlo:design-system` for shared component-policy compliance.

Explain the match in one sentence each. Do not invoke, chain, or simulate those
skills automatically. Let the user or the parent workflow select them.

## Verify

Run repository-provided focused verifiers first, then proportional lint,
typecheck, build, route, mutation-failure, pruning, and visual checks. Prefer
machine-verifiable policy markers over prose-only claims. Report which contracts
were found, which were absent, and any recommendation that remains optional.
