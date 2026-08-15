---
name: visual-parity
description: Run fast, reproducible source-versus-target static visual assessments for a focused surface in a generated Averlo instance. Use when an agent needs deterministic screenshots, image-diff ratings, overlays, heatmaps, and a scoped parity or system-fit verdict; do not use in the canonical template or to implement a surface.
---

# Averlo · Visual Parity

Use one matrix to capture Source (the authority) and Target (the implementation),
then rerun only the case that changed. This skill records evidence; it does not
edit the product.

## Run the loop

1. Require a schema-v2 `.template-profile.json` receipt. Stop for the canonical
   template; its legacy design-system parity port remains an explicit archive
   import.
2. Decide which is authoritative. `source` is an immutable Figma/export image,
   pinned rendered surface, or `none`; `target` is the generated instance. Do
   not reverse those labels or compare two moving working trees.
3. Copy [the matrix example](references/matrix.example.json) into the task's
   ignored `.codex/visual-parity/<task>/matrix.json`. Add one case per named
   route/section/state/viewport. Each side is either an existing PNG (`image`)
   or a live URL with an optional crop `selector`.
4. Capture and compare every case:

   ```bash
   node <visual-parity-skill>/scripts/assess.mjs \
     --matrix .codex/visual-parity/<task>/matrix.json \
     --out .codex/visual-parity/<task>/assessment
   ```

   The script fixes reduced motion, viewport, DPR, color scheme, selectors, and
   font readiness from the matrix. It writes `source.png`, `target.png`,
   `overlay.png`, `diff.png`, `side-by-side.png`, per-case metrics, and one
   `summary.json`. Use `--case <id>` for the next iteration; use
   `--require-exact` only for a deliberate exact gate.
5. Start with the lowest `matchRating`, inspect its overlay and heatmap, correct
   Target, and rerun that one case. A score is a prioritization signal, never a
   pass threshold: `exact` requires zero changed RGB pixels. Dimension or alpha
   mismatch is `incomparable`; repair the matrix rather than cropping or masking
   away owned geometry.

## Interpret the matrix

- With Source: give each case `exact`, `accepted-intentional`, `residual`,
  `failed`, or `incomparable`. An intentional residual must be declared before
  capture, outside Target ownership, and visible in its native route context.
- Without Source: use Target's deterministic capture only as a `system-fit`
  baseline. Review the named widths for structure, content continuity,
  accessibility, focus behavior, and visual continuity; never invent a pixel
  parity score against it.
- An exact claim applies only to its matrix case: its static route/selector,
  state, viewport, DPR, fonts, and motion-off capture. Other widths receive a
  system-fit finding, not borrowed pixel parity.

## Hand off

Run `frame` before static work to save the matrix and authority. Run `verify`
after static work against the same matrix and append the verdict/artifact paths
to [the shared focus packet](references/focus-packet.md). Static Composition
owns the approval pause; Motion Composition reuses the verified packet only for
motion-off and settled static endpoints, never intermediate frames.
