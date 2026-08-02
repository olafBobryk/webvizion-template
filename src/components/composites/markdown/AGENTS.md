# Folder: `src/components/composites/markdown`

## Ownership

This folder owns reusable Markdown rendering, authoring, loading, and modal-form
composition. Storybook `Composites/Markdown` owns supported public members,
selection guidance, examples, variants, and observable behavior.

## Public and profile boundary

- The namespace facade remains `src/components/composites/markdown/index.ts`;
  family internals import direct owners and do not create a runtime namespace.
- Full start exposes editing and rendering. Thin start remains renderer-only and
  must not include MDXEditor, editor CSS, or modal authoring composition.

## Invariants
- Keep markdown output grounded in design-system primitives.
- ReactMarkdown owns completed rendering. Streamdown is a private parser used only when `Markdown.Render streaming` needs incomplete-Markdown recovery. Both engines must consume the same component map, remark transforms, density, wrapper, and semantic variant.
- Keep Streamdown controls, icons, caret, animations, optional plugins, component types, and package classes out of the public API and visible output. Do not import its animation stylesheet. `Markdown.Render` remains presentation-authoritative and thin-profile compatible.
- Keep renderer and editor authored content on the shared `.markdown-content` contract.
- Renderer task markup stays noninteractive and does not change Lexical-owned
  editor DOM. Task-list styling must not suppress ordinary mixed-list markers.
- Tables own their local overflow; never force a universal minimum width or
  move table overflow to the entire editor canvas.
- Keep custom directives self-contained and generic.
- Validate directive props before passing them into design-system components.
- Do not expose arbitrary `className`, JSX, HTML passthrough, data registries, or product-specific card directives through markdown.
- Underline is the sole allowlisted HTML-shaped exception: the editor stores it as paired `<u>...</u>` tags and `Markdown.Render` transforms only exact paired tags. Do not enable general raw HTML parsing to support it.
- Keep visible editor controls on the application icon and interaction systems;
  package-owned toolbar, menu, and link-dialog UI is not an acceptable shortcut.
- Source mode remains inside the editor and responsive toolbar collapse remains
  measurement-driven; neither may create a second editor or repair surface.
- Keep `Markdown.Render` thin-start compatible; if it imports a design-system helper, make sure the thin-start API review explicitly allows that helper.
- Keep `Markdown.Editor`, its MDXEditor dependency, editor CSS, and modal editing composition full-start-only. The thin profile must export only `Markdown.Render`.
- `Markdown.Editor.Skeleton` preserves the live editor's density-owned minimum
  toolbar and content topology without predicting document-driven expansion.
- Mention rendering remains presentation-only: route/adapters resolve entity data, and the renderer/editor must not fetch.
