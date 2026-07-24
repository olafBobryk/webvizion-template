# Dashboard route ownership

Follow [`docs/dashboard-page-policy.md`](../../../../docs/dashboard-page-policy.md) for every registered dashboard route.

- Keep `page.tsx` server-owned: authorization, data, presentation conversion, redirects, and not-found decisions live there.
- Put `DashboardSection`, contextual commands, layout, and section composition in the route-local `_components/<Name>Surface.tsx` entry.
- Export named `<Name>Surface` and `<Name>SurfaceSkeleton`; make `loading.tsx` delegate only to that matching entry.
- Keep reusable dashboard entities, tables, layout, commands, and platform helpers under their existing owners. Extract route-local pieces only when they have independent change reasons.
- Preserve live/skeleton DOM geometry, behavior, capabilities, mutation semantics, accessibility, and responsive behavior while refactoring.
