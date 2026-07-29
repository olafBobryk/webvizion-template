# Dashboard route ownership

- Keep the dashboard a product-neutral reference application. Capability fixtures demonstrate reusable patterns and must not introduce product-specific domain assumptions into shared routes or components.
- Every route registered in `dashboardSurfaceRegistry` owns `page.tsx`, `loading.tsx`, and one route-local `_components/<Name>Surface.tsx` entry. Add `_actions.ts` or `_lib/` only for genuinely route-owned behavior.
- Keep `page.tsx` server-owned: authorization, data loading, presentation conversion, redirects, and not-found decisions live there. Provider-dependent client work sits behind the surface entry.
- The surface owns `DashboardSection`, contextual commands, layout, and section composition and exports named `<Name>Surface` and `<Name>SurfaceSkeleton` components.
- `loading.tsx` imports only that matching surface entry and delegates to its skeleton; it does not duplicate route layout or another route's loading boundary.
- Redirect-only `/dashboard/overview` and `/dashboard/organization/members` pages plus the structural `/dashboard/[...catchAll]` not-found route are exempt from the registered-surface shape.
- Keep reusable dashboard entities, tables, layout, commands, and platform helpers under their existing owners. Keep route-specific sections and mutations beside their route until they have an independent shared owner.
- Preserve public entries plus live/skeleton DOM geometry, behavior, capabilities, mutation semantics, accessibility, and responsive behavior while refactoring.
- Run `npm run verify:dashboard-pages` after adding, removing, or moving a dashboard route.
