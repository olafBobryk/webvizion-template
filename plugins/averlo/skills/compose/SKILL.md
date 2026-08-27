---
name: compose
description: Build or correct a native source-backed section, page, shell, or site in a generated Averlo instance and bring it toward visual parity through measured review passes. Use for ordinary Figma-to-code and other reference-to-product composition requests; keep design-system promotion and motion out of this workflow.
---

# Averlo · Compose

Realize and review one authoritative source section at a time. Finish the
active section's implementation and visual correction before loading or
building the next section, then continue directly to the next ordered case in
the same invocation. Composition may organize local implementation, but
it does not decide or mutate shared design-system owners.
`$averlo:systemize-composition` owns that later decision boundary.

Compose packages two mandatory subordinate contracts as sibling plugin
resources: [Repository Workflows](../repository-workflows/SKILL.md) and
[Visual Parity](../visual-parity/SKILL.md). Read each linked `SKILL.md`
completely when its workflow first applies, even when that explicit-only skill
is omitted from the active skill catalogue. Catalogue omission alone is not a
blocker and never authorizes a substitute workflow. Load their routed
references progressively; do not copy their contracts into Compose.

## Establish the source and repository boundary

1. Require a schema-v2 `.template-profile.json` receipt. Read
   [source intake](references/source-intake.md) when the source is Figma or when
   fonts, constituent assets, or external provenance must be resolved.
2. Invoke the linked `$averlo:repository-workflows` once for each genuine
   change unit. Select every applicable route, marketing/shell, composition,
   media, content, loading, and interaction workflow, then load the union of
   concerns once. Section construction is mandatory when creating or
   restructuring a public marketing page or source section.
3. Inspect the complete source focus and current Target before product edits.
   Classify source authority by region. The existing Target header is immutable:
   preserve it and always exclude source-header pixels. Do not propose, plan,
   recommend, sequence, or describe a header redesign. Keep evidenced footer
   work in scope.
4. Decompose the complete focus before implementation. Define stable local case
   IDs for content sections in source order, evidenced footer shell cases, the
   accumulated in-scope gate, and Target-only responsive widths. Each content
   case must name one authoritative Figma section frame, its node ID and bounds,
   one source-neutral block type, one registered renderer, and one stable Target
   selector. Pause rather than substitute a page frame when an authoritative
   section frame or its bounds cannot be identified unambiguously.
   Multiple coherent landmarks may share one case and renderer only when the
   source hierarchy, semantic heading context, interaction, and intended review
   boundary support one honest comparison case. A possible render-preserving
   split remains later human-reviewed Systemize Composition work.
5. Invoke the linked `$averlo:visual-parity` in `frame`. Before any product edit,
   materialize every authoritative source case as a stable PNG at
   `.codex/visual-parity/<task>/reference/<case-id>.png`. Preserve the full-page
   evidence separately for the accumulated gate. A nested crop must retain the
   real source background when the section-frame export does not.
6. Preflight all required fonts and constituent assets once, before the first
   section implementation. Do not begin section work with a known missing font,
   logo, mark, photograph, map, or other authoritative asset.

## Preserve repository and ownership boundaries

1. Preserve repository structure, data boundaries, semantics, accessibility,
   routing, and responsive rendering. Each independently bounded content case
   maps to one `MarketingPageDocument` block, one registered renderer, one
   shared `Section` root, and one stable selector. The accumulated page is a
   comparison gate, never a registered section. The header remains unchanged in
   the shared shell; an evidenced footer is implemented only through its shell
   boundary.
2. Reuse an existing visual owner only when its current Storybook contract
   already matches the source role's purpose and complete observable signature.
   Do not add, extend, rename, merge, retire, retheme, or change defaults for
   `Logo`, Button, Text, Section, or another shared design-system owner. Remove
   those implementation and Storybook files from the planned change set.
3. When no current visual owner fits, keep the fidelity recipe local to the
   route, renderer, section, or footer presentation boundary. Exact source
   logos and marks remain constituent SVG assets used locally until Systemize
   Composition decides whether to promote them.
4. Build real selectable text, semantic controls, responsive layout, exact
   copy, calibrated supplied fonts, and constituent assets. A reference capture
   is evidence only. Rendering a source screenshot, section export, reconstructed
   frame, or other flattened reference as product UI is `native-invalid`
   regardless of its pixel score.

## Run section-scoped work units

After decomposition and global preflight, process one content case at a time in
source order, followed by each included footer shell case. Do not create,
stub, style, or otherwise implement a later case during the active case's work
unit. Shared route/document registry wiring may expose only the blocks already
implemented; it must not become a whole-page implementation escape hatch.

For every active case:

1. Reload this skill, `.codex/visual-parity/<task>/focus.md`, the active matrix
   row, and only the repository references routed for the case.
2. Load the Figma `figma-use` and `figma-design-to-code` instructions when first
   required. Call `get_design_context` with the active section frame's exact
   file key and node ID. A call on the page frame, containing page, accumulated
   frame, or a sibling is not design context for the section and cannot
   authorize implementation. Inspect the stable local reference PNG beside the
   returned structural context.
3. Implement or correct only the active block/renderer or shell case and its
   colocated support components. Keep one shared `Section` root for a content
   case and preserve all authority locks.
4. Use `$averlo:visual-parity` in `verify` to create current source, Target,
   overlay, heatmap, side-by-side, and mechanical metrics for the active case.
   Use Preview `--review composition` for every header-excluded case. Reject a
   capture containing excluded pixels or unequal authority regions as
   incomparable and repair its crop, selector, review state, or Target-owned
   dimensions before interpreting pixels.
5. Inspect the current artifacts at native scale and run a compare-correct-
   compare loop. One cycle may contain multiple related hypotheses and edits,
   but it remains owned by the same case.

## Decide section closure honestly

`changedPixels: 0` is the only `exact` result. Every comparable nonzero result
remains `measured`; never call it verified, exact, or complete.

A measured case may close for human-visible advancement only when native-scale
inspection of its source, Target, overlay, and heatmap finds no identifiable
Target-owned mismatch in:

- layout geometry, spacing, alignment, size, or responsive behavior;
- typography face, calibrated weight, width, line break, line height, or
  tracking;
- asset identity, crop, scale, position, or treatment;
- color, fill, border, opacity, shadow, blend, map, or image treatment.

Improvement alone, elapsed effort, a low mean delta, a low threshold ratio,
suspected antialiasing, or a generic renderer-noise claim cannot close a case.
Glyph-edge or renderer noise may explain a nonzero measurement only after the
native-scale artifacts contain no concrete correctable pattern from the list
above. The focus packet records the result as measured and retains the exact
metrics; it does not record a justification narrative.

If any concrete Target-owned mismatch remains, continue the same case. If an
authoritative bound is unknowable, a required dependency is unavailable, or a
repair would cross a protected authority boundary, end at an honestly
unfinished human checkpoint with the active case and evidence intact. Do not
advance to later cases.

## Advance between section boundaries

When a case closes and another ordered case remains, update the ignored focus
packet by making the next ordered case active, then immediately continue within
the same model response. Do not stop for user input, end the response, invoke a
Stop hook, emit a continuation token, or request `/compact` at an ordinary
section boundary.

Before editing the newly active case, reload the focus packet, its matrix row,
this skill, and only that case's owning references. Do not rely on remembered
page-level Figma context. The workflow must not depend on compaction or a new
turn to preserve section focus. Do not add a goal, composition
record, checklist file, app-server controller, durable attempt ledger, or
other continuation mechanism.

Only two conditions may end an invocation before the final human-review
checkpoint: the active case has a concrete external or authority blocker, or
the runtime itself interrupts the turn. A closed section with another ordered
case is never a terminal condition.

## Close the accumulated review

After every scoped content and included shell case has closed:

1. Measure the accumulated content-plus-footer gate using symmetrically included
   source and Target regions. A full source frame compared with a
   header-hidden Target is invalid.
2. Inspect the accumulated source, Target, overlay, and heatmap at native scale.
   If a concrete drift belongs to an earlier case, make that case active again
   and correct it immediately before remeasuring the gate.
3. After the accumulated gate closes, capture Target-only responsive findings
   at the packet's declared widths and run focused repository checks. Do not
   fabricate source parity for widths Figma did not supply.
4. Stop at a human review checkpoint. Report every case's exact current metrics
   and label it `exact` or `measured`, plus native evidence, responsive findings,
   repository checks, artifacts, blockers, and verified normal and composition-
   review Preview URLs. Write `Human review: pending`; only the user's explicit
   response may change it to `accepted` or `continue-requested`.

A later user request resumes the active unfinished or reopened case before any
later work. Systemize Composition and Animate never start implicitly.
