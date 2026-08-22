---
name: visual-parity
description: Run fast, reproducible source-versus-target static visual assessments for a focused surface in a generated Averlo instance. Use when an agent needs deterministic screenshots, raw pixel measurements, overlays, heatmaps, and scoped parity or system-fit evidence; do not use in the canonical template or to implement a surface.
---

# Averlo · Visual Parity

Use one matrix to capture a pinned reference and current Target. For source
parity, the reference is the authoritative Source. For render-preserving system
integration, it is the frozen realized Target and must be labeled an integration
baseline rather than product authority. This skill owns reproducible capture
and measurement evidence. It does not edit the product, assign composition
status, or decide when a composition goal is complete.

## Frame the evidence

1. Require a schema-v2 `.template-profile.json` receipt. Stop for the canonical
   template; its legacy design-system parity port remains an explicit archive
   import.
2. Decide which side is pinned. `source` is an immutable Figma/export image, a
   frozen realized Target used only for integration parity, or `none`; `target`
   is the current generated instance. Never compare two moving working trees.
3. Record whether the case is `source-parity`, `integration-parity`, or
   `responsive-system-fit` in the focus packet. An integration baseline never
   becomes a product-authority claim.
4. Copy [the matrix example](references/matrix.example.json) into the task's
   ignored `.codex/visual-parity/<task>/matrix.json`. Add one case per named
   route, section, state, and source-backed viewport in the order supplied by
   the owning composition peer. Use the composition record's stable scope ID as the case
   ID. Each side is either an existing PNG (`image`) or a live URL with an
   optional crop `selector`. An image endpoint may specify
   `crop: { x, y, width, height }` to retain the original page background around
   a nested Figma scope.
5. Record the current Target route, selector, capture conditions, and repository
   revision or dirty-worktree identity in the focus packet. A later Target edit
   makes the preceding assessment stale until that case is recaptured.

## Measure the active case

1. Prove that Target is native product implementation before interpreting its
   comparison: inspect its route source and rendered DOM for real text,
   controls, layout, and constituent media. A source/reference bitmap that
   spans the compared surface may appear only on the Source side. If Target
   renders the reference, a full-frame export, or a reconstructed screenshot as
   product UI, record `native-invalid` regardless of the pixel measurement.
2. Capture and compare the active case:

   ```bash
   node <visual-parity-skill>/scripts/assess.mjs \
     --matrix .codex/visual-parity/<task>/matrix.json \
     --out .codex/visual-parity/<task>/assessment \
     --case <case-id>
   ```

   The script fixes reduced motion, viewport, DPR, color scheme, selectors, and
   font readiness from the matrix. It writes `source.png`, `target.png`,
   `overlay.png`, `heatmap.png`, `side-by-side.png`, per-case metrics, and one
   `summary.json`. Each capture reports a SHA-256 identity. The script exits
   successfully whenever capture and measurement succeed, including for
   nonzero differences. It never decides a verdict.
3. Read `comparable`, capture SHA-256 identities, dimensions, total and changed
   pixels, threshold-changed pixels, ratios, channel deltas, and artifact
   paths. Threshold metrics and mean delta help diagnose and prioritize work;
   they are not pass thresholds.
   `comparable: false` plus its technical reason means the capture must be
   repaired or the owning goal must eventually block. Never reinterpret it as
   completion or mask away Target-owned geometry.

## Preserve the evidence boundary

- Report raw comparable state, capture SHA-256 identities, dimensions, pixel
  counts, ratios, channel deltas, artifact paths, capture conditions, and
  current native evidence.
  Never translate those values into a composition row status.
- Without Source, capture Target deterministically for responsive review and
  record the named viewport and findings. Do not invent a pixel parity score.
- A source-backed measurement applies only to its matrix case: route or
  selector, state, viewport, DPR, fonts, and motion-off capture. Other widths
  remain Target-only responsive evidence.
- A pixel comparator cannot prove implementation independence. Preserve current
  source and DOM evidence and the flattened-reference check so the owning
  composition peer can interpret the measurement.
- `comparable: false` and a native-invalid Target are evidence defects, not
  alternate verdicts. Preserve the technical reason for the owning workflow.

## Hand off

Run `frame` before static work to save authority, composition-record identity,
matrix order, and capture conditions. Run `verify` after the current Target
capture and write measurements and evidence to
[the shared focus packet](references/focus-packet.md). A `frame` receipt, an
assessment from a prior Target revision, or a receipt missing native evidence
cannot support a current composition-record update.

Composition Realization owns source framing and baselines; Composition System
Integration owns integration-parity interpretation; Composition Convergence
owns source-parity interpretation, correction turns, and exact status. Compose
owns plane order, the shared goal, and the approval pause. Motion Composition
reuses a current verified packet only for motion-off and settled static
endpoints, never intermediate frames.
