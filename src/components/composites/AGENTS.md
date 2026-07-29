# Folder: `src/components/composites`

## Role
Reusable composed components that sit above primitives and inputs but below route-scoped app shells.

## Use This Folder When
- A component assembles several design-system primitives into a reusable rendering surface.
- The component is source-agnostic and does not model a product domain, backend entity, or route-owned workflow.
- A page needs a copyable higher-level component without inheriting page chrome, data loading, or metadata behavior.

## Prefer These Files
- `Markdown.Render`, implemented by `src/components/composites/markdown/MarkdownRenderer.tsx`: shared markdown renderer that maps plain markdown and the generic `::button[...]` directive onto design-system primitives.

## Invariants
- Keep composites grounded in shared design-system primitives and helpers.
- Keep contracts small, synchronous, and caller-owned.
- Do not import route-scoped content, product data, or backend adapters into this folder.
- If a composite becomes route-specific, move that wrapper to the route and keep only the reusable core here.
