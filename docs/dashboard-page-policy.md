# Dashboard page policy

This document is the authoritative route-ownership contract for the dashboard. The nearest `AGENTS.md` points here so repository-aware cleanup and feature work discover the same rules.

## Registered surface shape

Every route registered in `dashboardSurfaceRegistry` owns this structure:

```text
<route>/
├── page.tsx
├── loading.tsx
├── _components/
│   └── <Name>Surface.tsx
├── _actions.ts       # only when route-owned mutations exist
└── _lib/             # only when route-owned models are justified
```

The route-local surface entry exports named `<Name>Surface` and `<Name>SurfaceSkeleton` components. A private client implementation may sit behind that entry when provider hooks are required, but a live server surface must not be converted into a client component merely to satisfy the file shape.

`page.tsx` owns authorization, server data loading, presentation conversion, redirects and not-found handling, and the props supplied to the live surface. The surface owns `DashboardSection`, contextual commands, layout, and section composition. `loading.tsx` imports only the matching route-local surface entry and delegates to its named skeleton export.

## Ownership boundaries

- Keep reusable entity presentation, data, layout, command infrastructure, and platform helpers under their existing dashboard owners.
- Keep route-specific sections, tables, and mutation flows beside the route when they have an independent reason to change.
- Preserve public entry points while moving private implementation details behind them.
- A route surface may compose shared component-owned skeletons. It must preserve the live surface's static chrome and geometry.
- Loading boundaries do not duplicate route layout or import another route's `loading.tsx`.
- Registered route pages remain server components. Provider-dependent client work belongs behind the surface entry.

## Explicit exceptions

Only these dashboard pages are exempt because they do not render registered surfaces:

- `/dashboard/overview`: redirect-only compatibility route.
- `/dashboard/organization/members`: redirect-only compatibility route.
- `/dashboard/[...catchAll]`: structural not-found catch-all.

Dashboard `error.tsx` and `not-found.tsx` boundaries are outside this page contract.

## Verification

Run `npm run verify:dashboard-pages` after adding, removing, or moving a dashboard route. The verifier derives required routes from `dashboardSurfaceRegistry`, checks page/loading parity through one route-local surface entry, and rejects stale exceptions, client-marked route pages, missing named exports, or loading-page layout duplication.
