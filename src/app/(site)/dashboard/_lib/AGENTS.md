# Dashboard data and presentation policy

- Keep domain facts, presentation factories, fixture adapters, and lifecycle
  contracts in separate dependency layers.
- Presentation factories are React-free and fetch-free. Routes and adapters own
  sessions, organization resolution, authorization, persistence, and mutation.
- Entity contracts stay dashboard-owned. Do not introduce a global presentation
  registry, renderer namespace, or cross-product entity map.
- Keep global user identity separate from organization membership facts.
- Keep fixture-only support and product-report domains under `_lib/platform`.
  They are dashboard-owned, reset through the debug fixture reset, and must not
  send email, upload files, or perform external writes.
- Entity verticals define only the presentation surfaces they need. Keep domain facts serializable, presentation factories React-free and fetch-free, renderers data-ready, and route or adapter code responsible for authorization and mutation.
- Reuse entity-owned presentation definitions across tables, details, selectors, Command-K, Markdown mentions, empty states, and loading surfaces instead of copying labels or variants into consumers.
