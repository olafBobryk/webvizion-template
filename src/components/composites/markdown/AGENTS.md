# Folder: `src/components/composites/markdown`

## Role
Reusable markdown rendering surfaces that compose design-system primitives into content-authored pages or sections.

## Use This Folder When
- A page or internal fixture needs markdown rendered through `Text`, `Button`, and shared focus conventions.
- Markdown should remain a plain content string rather than a CMS-shaped page record.
- A small custom directive is needed without introducing route-specific registries.

## Current Contract
- `Markdown.Render` accepts markdown, `default` or `compact` density, optional class styling, an optional generic mention resolver, optional `streaming` incomplete-Markdown handling, and a semantic `contained` or `result` variant. `contained` is the default shared rounded editor-matching surface; `result` is shell-free and must sit beneath a clear caller-owned label. Default density belongs to site/document content; dashboard cards and modals opt into compact density.
- `Markdown.Editor` is the controlled full-start authoring surface. It uses MDXEditor only as the document engine while application `Button`, `Icon`, `Dropdown`, `Listbox`, input, Panel, and modal primitives own the visible UI. It includes a width-aware toolbar, rich/source modes with in-place syntax repair, links, lists, tables, images, code, dividers, the generic button directive, optional mention insertion, and a field-owned `error` contract.
- `Markdown.EditorModalForm` is the dashboard-ready modal composition. Keep editor-specific dialogs on the shared Card-owned modal host rather than introducing package or feature-local overlays.
- Metadata, route titles, and page chrome do not belong in this renderer.
- Supported custom directive:
  - `::button[Label]{href=/path variant=primary tone=default size=md}`

## Import Boundary
- External consumers use `import * as Markdown from "@/components/composites/markdown"` and the public `Markdown.Editor`, `Markdown.EditorModalForm`, and `Markdown.Render` members.
- Full start exposes editing and rendering. Thin start exposes only `Markdown.Render` and renderer-related types.
- Family internals import direct owners. Do not create a runtime `Markdown` object or a private editor barrel.

## Invariants
- Keep markdown output grounded in design-system primitives.
- ReactMarkdown owns completed rendering. Streamdown is a private parser used only when `Markdown.Render streaming` needs incomplete-Markdown recovery. Both engines must consume the same component map, remark transforms, density, wrapper, and semantic variant.
- Keep Streamdown controls, icons, caret, animations, optional plugins, component types, and package classes out of the public API and visible output. Do not import its animation stylesheet. `Markdown.Render` remains presentation-authoritative and thin-profile compatible.
- Route value-specific save failures through `Markdown.Editor error`. The editor
  owns the `Field` message plus `aria-invalid` and `aria-describedby`; callers
  must not add a sibling status banner for the same error.
- Keep renderer and editor authored content on the shared `.markdown-content` contract. A selected editor density must match the renderer density used for the same content context.
- Render task lists with the real compact `ChoiceIndicatorMulti` in `Markdown.Render`. The hidden input remains disabled because rendered Markdown is noninteractive, but do not pass that disabled state into the visual indicator or fade authored task status. Lexical retains its native inline `li[role="checkbox"]` marker and editing behavior; CSS may mirror the shared indicator geometry and tokens but must not mount portals or extra DOM into Lexical-owned content. Keep both representations on the same 18px indicator, use the density-owned optical offset that centers it against the first text line in each surface, and preserve the 12px mark at a 3px inset and 6px gap. Calculate task indentation from that geometry so task labels remain aligned to the ordinary-list text column while the indicator lands exactly on the list's left boundary.
- Suppress list markers only on task items so ordinary bullets remain visible in mixed lists.
- Let Markdown tables fit their container and wrap cell content by default. Rendered tables own a dedicated horizontal-scroll wrapper for genuinely wide content; the rich editor table owns its overflow rather than making the entire editor canvas scroll. Do not restore a universal table minimum width.
- Keep custom directives self-contained and generic.
- Validate directive props before passing them into design-system components.
- Do not expose arbitrary `className`, JSX, HTML passthrough, data registries, or product-specific card directives through markdown.
- Underline is the sole allowlisted HTML-shaped exception: the editor stores it as paired `<u>...</u>` tags and `Markdown.Render` transforms only exact paired tags. Do not enable general raw HTML parsing to support it.
- Keep visible editor controls on the application icon and interaction systems. Package-owned toolbar, menu, and link-dialog UI is not an acceptable shortcut.
- Invalid Markdown remains inside the normal editor in source mode. Disable rich-editing commands in every source state, keep only the mode control available, and do not introduce a separate repair toolbar or textarea.
- Keep responsive toolbar collapse measurement-driven. Collapse structure, text, and history groups in that order, merge them progressively into Editor options, and restore them when width returns.
- Keep `Markdown.Render` thin-start compatible; if it imports a design-system helper, make sure the thin-start API review explicitly allows that helper.
- Keep `Markdown.Editor`, its MDXEditor dependency, editor CSS, and modal editing composition full-start-only. The thin profile must export only `Markdown.Render`.
- `Markdown.EditorModalForm` uses the shared modal submission contract so pending saves reject duplicate submit and lock conflicting dismissal. Callers continue to own persistence and result feedback.
- `Markdown.Editor.Skeleton` mirrors the current density-owned minimum toolbar and content surfaces. Its toolbar uses the same control grouping and measured collapse stages as the live toolbar; command placeholders retain ghost geometry without visible fill, and only the final Editor options placeholder uses the visible secondary treatment. The lower editor surface is one uninterrupted soft skeleton block. It does not predict document-driven editor expansion unless a caller supplies a future explicit sizing contract.
- Mention rendering remains presentation-only: route/adapters resolve entity data, and the renderer/editor must not fetch.
