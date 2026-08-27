---
name: visual-parity
description: Capture and mechanically compare a generated Averlo surface against an authoritative source or earlier target evidence. Use explicitly for reproducible source-parity, descriptive before/after integration, responsive-system-fit, or static motion-endpoint evidence; do not implement product UI or decide workflow completion.
---

# Averlo · Visual Parity

Own reproducible capture and raw pixel evidence. `$averlo:compose` interprets
source-parity measurements, `$averlo:systemize-composition` interprets
target-before/target-after measurements, and `$averlo:animate` interprets
static endpoint evidence. This skill never edits product code, assigns their
workflow status, or decides whether a human should accept a result.

## Frame the evidence

1. Require a schema-v2 `.template-profile.json` receipt. Stop for the canonical
   template; this workflow measures generated instances.
2. Choose one comparison purpose:
   - `source-parity`: immutable source image versus current Target;
   - `integration-parity`: earlier Target evidence versus current Target;
   - `responsive-system-fit`: current Target at a named width without a claimed
     source score;
   - `static-endpoint`: accepted motion-off Target versus a motion endpoint.
3. Copy [the matrix example](references/matrix.example.json) into ignored
   `.codex/visual-parity/<task>/matrix.json` and keep the packet at
   `.codex/visual-parity/<task>/focus.md`. Use stable task-local case IDs for
   each named route, shell, section, state, source-backed viewport, full-page
   gate, or responsive case. The focus packet owns their order for the current
   review pass.
4. Each matrix side is an existing PNG or a live URL with an optional selector.
   An image side may specify `crop: { x, y, width, height }` so a nested source
   scope retains its real surrounding background. For Figma composition,
   materialize each authoritative section frame as a stable ignored reference
   PNG before product implementation; measurement must not depend on repeatedly
   fetching a changing or expiring design-tool image.
5. Record source authority, comparison purpose, Target route/selectors, capture
   conditions, repository revision or dirty identity, and current review
   checkpoint in [the focus packet](references/focus-packet.md). A Target edit
   makes affected measurements stale until recaptured.

## Measure a case

1. Inspect route source and rendered DOM before interpreting pixels. Prove that
   the Target contains real text, controls, layout, and constituent media. A
   source/reference bitmap spanning the compared Target surface is allowed only
   on the pinned evidence side. If the Target renders a reference, full-frame
   export, or reconstructed screenshot as product UI, record `native-invalid`
   regardless of the pixel measurement.
2. Capture and compare:

   ```bash
   node <visual-parity-skill>/scripts/assess.mjs \
     --matrix .codex/visual-parity/<task>/matrix.json \
     --out .codex/visual-parity/<task>/assessment \
     --case <case-id>
   ```

   The script fixes reduced motion, viewport, DPR, color scheme, selectors, and
   font readiness from the matrix. It writes source, target, overlay, heatmap,
   side-by-side, per-case metrics, and `summary.json`. It succeeds whenever
   capture and measurement succeed, including for nonzero differences, and
   never decides a verdict.
3. Report comparability, capture SHA-256 identities, dimensions, total and
   changed pixels, threshold diagnostics, ratios, channel deltas, and artifact
   paths. Threshold counts and mean delta diagnose differences; they are not
   pass thresholds.
4. Treat `comparable: false` as a capture defect or blocker. Do not mask owned
   pixels, force dimensions, or reinterpret it as completion.

## Preserve the evidence boundary

- A source-backed measurement applies only to its exact route or selector,
  state, viewport, DPR, font state, and motion condition.
- Responsive cases without supplied source frames report Target findings, not
  invented parity scores.
- An integration baseline is descriptive target-before evidence, never product
  source authority. Zero changed pixels reports identical captures; a nonzero
  result reports the measured difference without deciding whether it was
  intended or acceptable.
- A static-endpoint comparison proves only its named settled endpoint, not
  intermediate motion quality.
- Native evidence is independent of the pixel comparator and can veto a zero
  measurement. Preserve source/DOM evidence and the flattened-reference check
  with every current assessment.

When an owning workflow requests before/after evidence, run `frame` before its
Target edit and `verify` after the current capture. A stale frame receipt, a
mismatched Target identity, or a receipt missing native evidence cannot support
a current review claim.
