---
name: compose
description: Build or correct a native source-backed section, page, shell, or site in a generated Averlo instance and bring it toward visual parity through measured review passes. Use for ordinary Figma-to-code and other reference-to-product composition requests; keep design-system promotion and motion out of this workflow.
---

# Averlo · Compose

Create the strongest native visual realization the current pass can support,
measure it honestly, and return it for human review. Composition may organize
local implementation, but it does not decide or mutate shared design-system
owners. `$averlo:systemize-composition` owns that later decision boundary.

## Establish the source and repository boundary

1. Require a schema-v2 `.template-profile.json` receipt. Read
   [source intake](references/source-intake.md) when the source is Figma or when
   fonts, constituent assets, or external provenance must be resolved.
2. Invoke `$averlo:repository-workflows` once for each genuine change unit.
   Select every applicable route, marketing/shell, composition, media, content,
   loading, and interaction workflow, then load the union of concerns once.
   When registered marketing sections are created or restructured, the router's
   conditional section-construction concern is mandatory.
3. Inspect the complete source focus and the current Target before editing.
   Define stable local case IDs for the shell boundaries, content sections in
   source order, the accumulated full-page gate, and Target-only responsive
   widths. Keep this matrix and its working receipt under ignored
   `.codex/visual-parity/`.
4. Invoke `$averlo:visual-parity` in `frame` before implementation. Preserve the
   source authority, capture conditions, case order, Target route/selectors, and
   native-evidence requirement in its focus packet.

## Realize the complete focus natively

1. Preserve repository structure, data boundaries, behavior owners, semantics,
   accessibility, routing, and responsive rendering. For registered marketing
   sections, follow the repository's section-construction concern rather than
   flattening the page into a route component or global stylesheet.
2. Reuse an existing visual owner only when its current Storybook contract
   already matches the source role's purpose and complete observable signature.
   Do not add, extend, rename, merge, retire, retheme, or change defaults for a
   shared owner in this workflow.
3. When no current visual owner fits, keep the fidelity recipe local to the
   correct route, renderer, section, or shell presentation boundary. This is a
   bounded source-realization exception, not a new public API or a claim that
   the local recipe belongs in the design system.
4. Build real selectable text, semantic controls, responsive layout, exact copy,
   supplied fonts, and constituent assets. A reference capture is evidence only.
   Rendering a source screenshot, full-section export, reconstructed frame, or
   other flattened reference as product UI is `native-invalid` regardless of
   its pixel score.
5. Keep stable selectors around each matrix case. Preserve shell and section
   boundaries so comparison and later systemization can isolate the actual
   owner instead of treating the whole page as one image.

## Complete one measured review pass

Each invocation owns one complete review pass:

1. Implement or inspect the whole requested focus before optimizing a section.
2. Use `$averlo:visual-parity` in `verify` to establish a current baseline for
   every source-backed shell/section case, then the full-page gate, then
   Target-only responsive findings. Comparable nonzero results are measured,
   never verified or complete.
3. Run one correction sweep in source order. For each nonzero case, address its
   highest-impact Target-owned differences and make as many related edits and
   measurements as useful before advancing. Do not restrict the scope to one
   hypothesis or one edit.
4. Remeasure the full-page gate after the sweep and recheck responsive behavior
   at the widths declared in the packet. A source-backed score applies only to
   its supplied viewport; responsive findings remain separately labeled.
5. Stop at a human review checkpoint. Report current and best measurements,
   native evidence, responsive findings, repository checks, artifacts, and the
   verified Preview URL. Zero changed pixels may be reported as exact, but it
   does not bypass human review.

A later request to continue runs another complete correction sweep against the
current Target. Stop early only for a concrete external blocker or when the
requested focus cannot be captured comparably; name the blocker and preserve
the best current evidence without claiming completion.
