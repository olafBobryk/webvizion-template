# Source intake

Read this reference when Compose uses Figma or depends on external fonts,
constituent assets, or durable source provenance.

## Figma authority and isolation

1. Use the installed Figma app connector by default. Call `whoami` and require
   `webvizionagency@gmail.com` unless the caller explicitly selects another
   identity. Do not silently switch to a separately authenticated connector.
2. Load the Figma `figma-use` and `figma-design-to-code` skills. Locate the
   supplied focus and its containing page, preserve the focus ancestry-index
   path, and clone that page once as
   `Agent Space — <source page> — <target>`.
3. Resolve the cloned focus through its ancestry path and verify its type, name,
   and bounds. Use the clone for context, screenshots, and exports; keep the
   original URL and node as immutable visual authority. Never mutate the
   designer's original page.
4. Record connector identity, clone IDs, source URL, and focus bounds in the
   ignored Visual Parity focus packet.

## Fonts, assets, and provenance

1. Preflight required fonts and constituent assets before product edits. Treat
   material as supplied only when it comes from the Target repository, the
   authoritative connector, a caller-supplied path, or an explicitly configured
   shared library.
2. Wait for missing licensed fonts or unavailable exact assets. Do not silently
   substitute a font, borrow from another project or regression, rasterize text,
   or use the reference frame as product UI.
3. Treat supplied font bytes, Figma weight labels, font-internal metadata, and
   CSS weights as separate evidence. Before layout correction, load each supplied
   face under one distinct evidenced CSS weight, wait for `document.fonts`, and
   calibrate representative source text by glyph shape, measured width, line
   breaks, line height, and tracking. Do not map one physical face to a broad
   weight range, permit synthetic bold, or call typography verified merely
   because the expected bytes are present. Disable font synthesis for the
   calibrated scope and pause when no supplied face can reproduce an
   authoritative role.
4. Retain exact constituent asset bytes and follow the repository workflow's
   media-delivery concern. When the authority contains existing vector identity
   artwork, export that exact logo or mark as SVG and commit it as a constituent
   asset, or reuse an identical existing asset. Preserve its geometry and
   `viewBox`; never redraw it, replace it with text or a glyph, or accept a
   surrogate because the original export needs implementation-safe cleanup.
   Download expiring design-tool URLs during implementation; the URL is
   provenance, not a production source.
5. Add durable external-source provenance to `PRODUCT.md` under
   `## Product sources`, recording source, authority, focus, and supplied
   material. Do not record workflow progress or conversion status there.
