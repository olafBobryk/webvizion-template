<INSTRUCTIONS>
## Purpose
Keep the demo catalogue behind one canonical public aggregator while allowing each page family to own its fixtures and JSX.

## Source of Truth
- `src/app/(site)/(dev)/internal/demo/content.tsx` is the stable public aggregator and the only import surface for consumers.
- Canonical page objects live in private `_content/pages/<page-id>.tsx` modules. Types live in `_content/types.ts`; relationships live in `_content/relationships.ts`.
- The page renderer and nav continue to read `demoPages` from `content.tsx`; consumers must not import private page modules.
- Keep interactive fixtures with their owning page. Promote a helper only when multiple page modules consume it, and name the shared module after the responsibility it owns.

## Content Schema (Required Fields)
Each entry in `demoPages` must include:
- `id`: unique, kebab‑case string (used for keys).
- `slug`: array of path segments (e.g., `["ui", "primitives"]`).
- `title`: page title.
- `description`: short page summary.
- `visibility` (optional): `"public"` or `"dev-only"`. Omit for normal pages.
- `groups`: array of groups.

Each `group` must include:
- `id`: unique within the page.
- `title`: group title.
- `description`: short group summary.
- `items`: array of demo items.
- `columns` (optional): grid class overrides (e.g., `"grid-cols-1 lg:grid-cols-2"`).

Each `item` must include:
- `id`: unique within the group.
- `name`: component or concept label shown on the card.
- `label`: short descriptor shown in the card header.
- `kind`: `"component"` or `"usage"`.
- `related` (optional): `{ uses: string[]; usedIn: string[] }`.
- `skeleton` (optional, component only): `{ name?, label?, className?, related?, Render }`.

For `kind: "component"`:
- Provide `Render()` returning the demo JSX.
- Keep any hooks inside the `Render` component.
- If the component exposes `.Skeleton`, add a `skeleton` entry so it appears in `/skeleton` compare view.

For `kind: "usage"`:
- Provide `snippet` (string) for the CopyField.

## Adding a New Demo
1. Add or update the owning module under `_content/pages/`.
2. Register a new page once in the ordered `demoPages` array in `content.tsx`.
3. Add items using the same card types.
4. If needed, add `relatedMap` entries in `_content/relationships.ts` to support “Uses / Used by”.
5. Keep slug segments aligned with the source folder being documented, usually `src/components` and, where relevant, shared utilities like `src/lib`.
6. For skeleton support, add a `skeleton` config and verify `/internal/demo/**/skeleton`.
7. Use `visibility: "dev-only"` for playground pages such as `/internal/demo/test`; they stay routable but are hidden from overview and sidebar in production.

## Demo Requirement
- New reusable features in `src/components` should normally add coverage in the owning page module.
- New reusable features in `src/lib` should add demo coverage here when they have a public API, interactive behavior, or are intended for reuse by agents.
- A reusable feature is not considered documented until its page-owned content, usage snippet, and any required relationship entries are present together.

## Naming + Slugs
- `id`: kebab‑case.
- `slug`: mirror the components folder path.
- `title`: human‑readable (Title Case).
- `visibility`: prefer `"public"` unless the page is experimental or purely for local testing.

## Demo Idea (Structure Example)
```ts
{
  id: "ui-primitives",
  slug: ["ui", "primitives"],
  title: "UI Primitives",
  description: "Typography, buttons, layout",
  groups: [
    {
      id: "typography",
      title: "Typography",
      description: "Text variants",
      items: [
        {
          id: "text",
          kind: "component",
          name: "Text",
          label: "Typography variants",
          related: relatedMap.Text,
          Render() {
            return (
              <div className="flex flex-col gap-1">
                <Text as="h3" variant="headingXs">Heading XS</Text>
                <Text variant="body">Body text</Text>
              </div>
            );
          },
        },
        {
          id: "section-usage",
          kind: "usage",
          name: "Section",
          label: "Page section",
          snippet: "<Section><Section.Background>...</Section.Background>...</Section>",
        },
      ],
    },
  ],
}
```

## Skeleton View
- Any page with skeletons automatically has a `/internal/demo/**/skeleton` view.
- Default demo pages do **not** show skeletons.
- Skeleton view renders paired cards (live + skeleton) for direct comparison.

## Production Visibility
- `visibility: "dev-only"` pages are hidden from the overview and sidebar when `process.env.NODE_ENV === "production"`.
- Dev-only pages still resolve directly by URL so they can be shared internally when needed.
</INSTRUCTIONS>
