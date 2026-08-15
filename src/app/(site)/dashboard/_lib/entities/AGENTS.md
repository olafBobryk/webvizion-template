# Dashboard entity contracts

## Ownership

- Keep global account identity separate from organization-scoped membership facts.
- Domain modules own serializable facts and mutation inputs. Presentation factories derive labels, fields, columns, URLs, semantic variants, and commands without React or data fetching.
- Renderers consume ready presentation models. Routes and adapters resolve sessions, organizations, capabilities, persistence, and mutation.
- Import owning presentation factories directly. Do not add a global entity barrel, renderer registry, or presentation namespace.
- The reference member and record verticals are optional examples, not a framework every product must retain.

## Reuse

- An entity implements only the profile, compact, actor, avatar, list, table, detail, selector, Command-K, Markdown mention, empty, and skeleton surfaces it actually needs.
- Reuse the owning definitions wherever those surfaces appear. New renderers remain under their owning entity.
- Run `npm run verify:frontend-entities` after changing an entity contract,
  renderer, or canonical path.
