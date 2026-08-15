# Entity architecture

## Contract

Keep entity work inside the product boundary that owns it and separate four
dependency layers:

1. Serializable domain facts and mutation inputs.
2. React-free, fetch-free presentation factories.
3. Data-ready renderers and component-owned skeletons.
4. Routes and adapters that resolve session, organization, authorization,
   persistence, and mutation.

Import each entity's presentation factory directly. Reuse its labels, fields,
columns, URLs, semantic variants, commands, and rendering models across lists,
tables, details, selectors, mentions, commands, empty states, and loading
states. Implement only the surfaces the product needs.

Keep global account identity separate from organization-scoped membership
facts. Keep fixture and report domains explicit, resettable, and free of
external writes unless an instance deliberately adds persistence.

Let the live renderer own loading geometry as Component.Skeleton. Let
route/adapter owners hold mutations. Optimistic changes must roll back on
returned or thrown failures. Destructive changes use the shared confirmation
system; detail deletion replaces navigation once and does not refresh the
deleted route, while collection completion may refresh.

Reuse dashboard-owned tables, details, selectors, state, Markdown, commands,
feedback, and overlays. An entity-specific selector composes the shared
selector and owns only its presentation model and option renderer. Add an
assistant tool wrapper only for a real typed tool contract and execution path.

## Hard boundaries

- Do not add a global entity barrel, renderer registry, presentation namespace,
  or cross-product entity map.
- Do not fetch sessions, capabilities, organization state, or persistence from
  renderers or presentation factories.
- Do not duplicate identity markup, presentation definitions, confirmation,
  loading placeholders, or mutation lifecycle in consumers.
- Do not treat fixtures as durable production persistence or allow
  capability-hidden actions to remain callable.
- Do not turn optional reference entities into a framework every instance must
  retain.

## Repository context

Read only the entity verticals and consumers in scope:

- `src/app/(site)/dashboard/_lib/AGENTS.md` and
  `src/app/(site)/dashboard/_lib/entities/AGENTS.md` for dependency layers and
  canonical contract markers.
- `src/app/(site)/dashboard/_components/entities/AGENTS.md` for renderer, table,
  selector, deletion, and assistant-tool topology.
- `src/app/(site)/dashboard/AGENTS.md` for route-local versus reusable ownership.
- `src/app/(site)/dashboard/platform/AGENTS.md` for resettable platform fixtures
  and access-axis separation.
- `src/components/domain/assistant/AGENTS.md` and
  `src/components/composites/markdown/AGENTS.md` only when entity presentation
  enters those owners.
- The selected entity's domain, presentation, renderer, route, adapter, owner
  story, and nearest AGENTS.md.

## Verification

- Run npm run verify:frontend-entities after entity contract, renderer,
  lifecycle, or canonical-path changes.
- Add npm run verify:entity-skeletons for live/loading geometry and
  npm run verify:entity-deletion for deletion behavior when focused checks are
  sufficient.
- Verify optimistic rollback, authorization at execution time, selector
  behavior, repeated presentation reuse, and live/skeleton owner parity.
