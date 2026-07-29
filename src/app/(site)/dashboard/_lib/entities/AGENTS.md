# Dashboard entity contracts

These markers are verified repository contracts. Update them when a canonical entity path moves.

<!-- entity-contract:policy-version=2 -->
<!-- entity-contract:foundation=src/app/(site)/dashboard/_lib/presentation/contracts.ts -->
<!-- entity-contract:account-domain=src/app/(site)/dashboard/_lib/entities/account/domain.ts -->
<!-- entity-contract:account-presentation=src/app/(site)/dashboard/_lib/entities/account/presentation.ts -->
<!-- entity-contract:member-domain=src/app/(site)/dashboard/_lib/entities/member/domain.ts -->
<!-- entity-contract:member-presentation=src/app/(site)/dashboard/_lib/entities/member/presentation.ts -->
<!-- entity-contract:invitation-presentation=src/app/(site)/dashboard/_lib/entities/invitation/presentation.ts -->
<!-- entity-contract:organization-domain=src/app/(site)/dashboard/_lib/entities/organization/domain.ts -->
<!-- entity-contract:organization-presentation=src/app/(site)/dashboard/_lib/entities/organization/presentation.ts -->
<!-- entity-contract:record-domain=src/app/(site)/dashboard/_lib/entities/record/domain.ts -->
<!-- entity-contract:record-presentation=src/app/(site)/dashboard/_lib/entities/record/presentation.ts -->
<!-- entity-contract:reference-demo=src/app/(site)/dashboard/reference/entities/page.tsx -->
<!-- entity-contract:optional-surface=dashboardReferenceEntities -->

## Ownership

- Keep global account identity separate from organization-scoped membership facts.
- Domain modules own serializable facts and mutation inputs. Presentation factories derive labels, fields, columns, URLs, semantic variants, and commands without React or data fetching.
- Renderers consume ready presentation models. Routes and adapters resolve sessions, organizations, capabilities, persistence, and mutation.
- Import owning presentation factories directly. Do not add a global entity barrel, renderer registry, or presentation namespace.
- The reference member and record verticals are optional examples, not a framework every product must retain.

## Reuse and mutation

- An entity implements only the profile, compact, actor, avatar, list, table, detail, selector, Command-K, Markdown mention, empty, and skeleton surfaces it actually needs.
- Reuse the owning definitions wherever those surfaces appear. New renderers remain under their owning entity.
- Loading counterparts use `Component.Skeleton`, preserve live geometry, and appear beside the live surface on the internal entity reference route.
- Mutations stay route- or adapter-owned. Optimistic updates require rollback; destructive actions use the shared confirmation system and return `false` after recoverable failure.
- Same-route modal completion performs one local update or refresh. Detail deletion uses replacement navigation and never combines navigation with refresh.
- Run `npm run verify:frontend-entities` after changing an entity contract, renderer, mutation lifecycle, or canonical path.
