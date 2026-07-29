# Folder: `src/app/(site)/(marketing)/_components`

## Role
Route-scoped public-site shell components and adapters.

## Use This Folder When
- You are adapting resolved marketing layout data into the shared site shell.
- The component is specific to the public site and should not be treated as shared app chrome.
- You need an adapter that feeds marketing content into a shared component.

## Prefer These Files
- `src/app/(site)/(marketing)/layout.tsx`: passes resolved marketing layout data directly to the shared `SiteShell`.
- `src/app/(site)/_components/layout/SiteShell.tsx`: the one visual shell used by marketing and internal routes.
- `src/app/(site)/_components/layout/siteLayout.ts`: the profile-safe shell contract and default layout data.

## Invariants
- Public navigation data flows through `SiteLayoutDocument` fallback/resolver data, not shared app config.
- Header and footer behavior should stay aligned across breakpoints.
- The marketing header uses grouped `menuGroups` and `searchGroups`; keep desktop and compact search behavior sourced from the same layout data.
- Keep localized routing, language switchers, and brand-specific CTA treatments out of the template header unless they become explicit optional slots.
- Shared header, menu, footer, shell order, and scroll lifecycle belong to `src/app/(site)/_components/layout`; marketing content adaptation remains here.
- Shared building blocks should come from `src/components`, but public-shell content orchestration belongs here.
