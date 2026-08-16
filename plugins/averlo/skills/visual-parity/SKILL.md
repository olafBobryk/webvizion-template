---
name: visual-parity
description: Run fast, reproducible source-versus-target static visual assessments for a focused surface in a generated Averlo instance. Use when an agent needs deterministic screenshots, raw pixel measurements, overlays, heatmaps, and scoped parity or system-fit evidence; do not use in the canonical template or to implement a surface.
---

# Averlo · Visual Parity

Use one matrix to capture Source (the authority) and Target (the implementation).
This skill owns case-level interpretation of the comparator's mechanical output
for the owning workflow, but it does not edit the product or decide when the
Static Composition goal is complete.

## Frame the evidence

1. Require a schema-v2 `.template-profile.json` receipt. Stop for the canonical
   template; its legacy design-system parity port remains an explicit archive
   import.
2. Decide which side is authoritative. `source` is an immutable Figma/export
   image, pinned rendered surface, or `none`; `target` is the generated instance.
   Do not reverse those labels or compare two moving working trees.
3. Copy [the matrix example](references/matrix.example.json) into the task's
   ignored `.codex/visual-parity/<task>/matrix.json`. Add one case per named
   route, section, state, and source-backed viewport in the order supplied by
   the owning workflow. Each side is either an existing PNG (`image`) or a live
   URL with an optional crop `selector`. An image endpoint may specify
   `crop: { x, y, width, height }` to retain the original page background around
   a nested Figma scope.
4. Record the current Target route, selector, capture conditions, and repository
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
   `summary.json`. It exits successfully whenever capture and measurement
   succeed, including for nonzero differences. It never decides a verdict.
3. Read `comparable`, dimensions, total and changed pixels, threshold-changed
   pixels, ratios, channel deltas, and artifact paths. Threshold metrics and
   mean delta help diagnose and prioritize work; they are not pass thresholds.
   `comparable: false` plus its technical reason means the capture must be
   repaired or the owning goal must eventually block. Never reinterpret it as
   completion or mask away Target-owned geometry.

## Interpret for the workflow

- With Source, record `exact` only when the case is comparable,
  `changedPixels` is zero, and native implementation evidence is current.
  Record a nonzero case as `unresolved`, not as a weaker match class.
- `accepted-intentional` is available only when an explicitly nonzero workflow
  declared and approved the exception before capture, the difference is outside
  Target ownership, and the native route context shows it. It is unavailable
  whenever the declared objective is zero-diff.
- Use `incomparable` for a technical comparison incompatibility and
  `native-invalid` for flattened or otherwise non-native Target evidence.
  Neither can complete a source-backed case.
- Without Source, use Target's deterministic capture only as a `system-fit`
  baseline. Review named widths for structure, content continuity,
  accessibility, focus behavior, and visual continuity; never invent a pixel
  parity score against it.
- An exact claim applies only to its matrix case: static route/selector, state,
  viewport, DPR, fonts, and motion-off capture. Other widths receive a
  system-fit finding, not borrowed pixel parity.
- A pixel comparator cannot prove implementation independence. `exact` is
  invalid until the receipt names native source/DOM evidence and confirms that
  no flattened reference image owns the compared surface.

## Hand off

Run `frame` before static work to save authority, decomposition, matrix order,
and capture conditions. Run `verify` after the current Target capture and
separate raw measurements from workflow results in
[the shared focus packet](references/focus-packet.md). A `frame` receipt, an
assessment from a prior Target revision, or a receipt missing native,
responsive, or repository-check evidence cannot satisfy Static Composition's
terminal condition.

Static Composition owns case ordering, correction turns, the goal terminal
condition, and the approval pause. Motion Composition reuses a current verified
packet only for motion-off and settled static endpoints, never intermediate
frames.
