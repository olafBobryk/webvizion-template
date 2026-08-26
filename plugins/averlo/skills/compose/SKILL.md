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
   When the requested focus creates or restructures a public marketing page or
   source section, the router's conditional section-construction concern is
   mandatory before choosing route-local or registered implementation shapes.
3. Inspect the complete source focus and the current Target before editing.
   Classify source authority by region before defining cases. The existing
   Target header is immutable in Compose: preserve it and always exclude source
   header pixels, even when the caller supplies a page frame or asks for header
   or site-shell composition. Treat that exclusion as terminal inside this
   workflow: do not propose, plan, recommend, sequence, or describe a header
   redesign as an optional phase, prerequisite, or follow-up. Keep source-backed
   footer work in scope. Define stable local case IDs for each content section
   in source order, the footer when evidenced, the accumulated in-scope gate,
   and Target-only responsive widths.
   Record excluded regions and their retained authority in the ignored focus
   packet; never present the accumulated gate as whole-frame parity when source
   pixels were excluded.
4. Invoke `$averlo:visual-parity` in `frame` before implementation. Preserve the
   source authority, capture conditions, case order, Target route/selectors, and
   native-evidence requirement in its focus packet.

## Realize the complete focus natively

1. Preserve repository structure, data boundaries, behavior owners, semantics,
   accessibility, routing, and responsive rendering. For registered marketing
   sections, follow the repository's section-construction concern rather than
   flattening the page into a route component or global stylesheet.
   Decompose the source before choosing block types: each independently bounded
   semantic source section maps to one registered block, one renderer, and one
   stable section selector. If two source landmarks have separate comparison
   cases, they must have separate blocks and renderers even when they share a
   background or continuous visual treatment. The accumulated page is a
   comparison gate, never a registered section of its own. Preserve the header
   unchanged through the shared shell and implement an evidenced footer only
   through that shell boundary; never reproduce either inside a content
   renderer.
2. Reuse an existing visual owner only when its current Storybook contract
   already matches the source role's purpose and complete observable signature.
   Do not add, extend, rename, merge, retire, retheme, or change defaults for a
   shared design-system owner in this workflow. This prohibition includes
   `Logo`, Button, Text, Section, and any other Storybook-backed owner. Before
   editing, remove their implementation and Storybook files from the planned
   change set. Exact source logos and marks remain constituent assets used by
   the local section or footer presentation until Systemize Composition decides
   whether to promote them. An evidenced footer may change through its shared
   shell owner, but that does not authorize mutation of nested design-system
   owners or of the header.
3. When no current visual owner fits, keep the fidelity recipe local to the
   correct route, renderer, section, or shell presentation boundary. This is a
   bounded source-realization exception, not a new public API or a claim that
   the local recipe belongs in the design system.
4. Build real selectable text, semantic controls, responsive layout, exact copy,
   calibrated supplied fonts, and constituent assets. A reference capture is
   evidence only.
   Rendering a source screenshot, full-section export, reconstructed frame, or
   other flattened reference as product UI is `native-invalid` regardless of
   its pixel score.
5. Keep stable selectors around each matrix case. Preserve shell and section
   boundaries so comparison and later systemization can isolate the actual
   owner instead of treating the whole page as one image.

## Maintain task-local checkpoint continuity

Create and maintain a runtime working plan with exactly one active checkpoint:

1. Preview and source authority.
2. Decomposition and authority locks.
3. Font and asset preflight.
4. Native implementation.
5. Per-scope Visual Parity baseline.
6. Complete correction sweep.
7. Accumulated gate, responsive review, repository checks, and human checkpoint.

The plan owns progress only for the current task. Keep source cases, authority
locks, and the current checkpoint in the existing ignored Visual Parity focus
packet; do not create a Compose checklist file or any separate durable
coordination artifact.

At checkpoint 2, classify the decomposition into four distinct groups in the
runtime plan and focus packet: content cases, shell cases, excluded regions,
and the accumulated gate. Content cases alone receive block types, registered
renderers, and shared `Section` roots. Shell cases name their shell owner and
selector without entering the content-renderer count. Exclusions name the
retained Target authority without proposing implementation. The accumulated
gate is comparison-only. Do not enter implementation while any row appears in
the wrong group or while the planned change set contains a header or shared
design-system owner.

Refresh only the owning material before entering each checkpoint: source intake
and Visual Parity framing for checkpoint 1; the routed section-construction,
marketing architecture, route, and content-source concerns for checkpoint 2;
source intake and media delivery for checkpoint 3; the current Section
Storybook contract and applicable routed concerns for checkpoint 4; Visual
Parity, its matrix, and its focus packet for checkpoints 5 and 6; and Preview
plus focused repository verification for checkpoint 7. Invoke Repository
Workflows once and Visual Parity only in its documented `frame` and `verify`
modes; refreshing a reference is not another workflow invocation.

After context compaction or a continuation, reload the focus packet, matrix,
active runtime checkpoint, and that checkpoint's owning references before
editing. Rebuild the runtime plan from those facts when the active task no
longer exposes it.

## Complete one measured review pass

Each invocation owns one complete review pass:

1. Implement or inspect the whole requested focus before optimizing a section.
2. Use `$averlo:visual-parity` in `verify` to establish a current baseline for
   every source-backed section and included shell-region case, then the
   accumulated in-scope gate, then Target-only responsive findings. Use the
   repository-owned Preview `--review composition` mode for
   content-plus-footer cases while keeping the human Preview URL on the real
   production shell. Comparable nonzero results are measured, never verified or
   complete.
3. Run one correction sweep in source order. For each nonzero case, address its
   highest-impact Target-owned differences and make as many related edits and
   measurements as useful before advancing. Do not restrict the scope to one
   hypothesis or one edit.
4. Remeasure the accumulated in-scope gate after the sweep and recheck
   responsive behavior at the widths declared in the packet. A source-backed
   score applies only to its supplied viewport and declared authority regions;
   responsive findings remain separately labeled.
5. Stop at a human review checkpoint. Report current and best measurements,
   native evidence, responsive findings, repository checks, artifacts, and the
   verified Preview URL. Zero changed pixels may be reported as exact, but it
   does not bypass human review.

A later request to continue runs another complete correction sweep against the
current Target. Stop early only for a concrete external blocker or when the
requested focus cannot be captured comparably; name the blocker and preserve
the best current evidence without claiming completion.
