---
name: composition-realization
description: Create the complete native first-pass realization of a source-backed section, page, shell, or site in a generated Averlo instance. Use directly for an intentional first-pass or baseline handoff, or when Averlo Compose selects the realization plane; do not perform design-system migration, final convergence, or motion.
---

# Averlo · Composition Realization

Build the complete source focus natively and establish honest baseline evidence.
This plane owns source access, preflight, decomposition, product realization,
and initial measurements. It does not migrate shared owners or promise parity.

## Start from the shared record

1. Require a schema-v2 `.template-profile.json` receipt. Read
   [Compose's record contract](../compose/references/composition-record.md) and
   [`visual-parity`'s focus packet](../visual-parity/references/focus-packet.md).
2. Reuse the record supplied by Compose. For a direct invocation, resolve or
   create `docs/composition/<focus-slug>.md`, link it from `docs/README.md`, call
   `get_goal`, and create one plane-scoped goal only when no compatible active
   goal exists:

   ```text
   Invoke $averlo:composition-realization to complete the realization plane in <record-path> using its plane terminal condition.
   ```

3. Set Active plane to `composition-realization` and Realization handoff to
   `active`. A peer running under Compose reuses its goal and never changes the
   goal status.

## Establish source authority

1. For Figma, call the installed app connector's `whoami` and require
   `webvizionagency@gmail.com` by default. Do not use the separately
   authenticated generic Figma MCP unless the caller explicitly selects it.
2. Load the Figma `figma-use` and `figma-design-to-code` skills. Locate the
   supplied focus and its containing page, clone that whole page once as
   `Agent Space — <source page> — <target>`, resolve the cloned focus by its
   ancestry-index path, and record connector identity and clone IDs. Never
   mutate the designer's original page.
3. Add durable external-source provenance to `PRODUCT.md` under
   `## Product sources`; keep decomposition and progress only in the composition
   record.
4. Preflight every required font and constituent asset before implementation.
   Material is supplied only by the Target repository, authoritative connector,
   an explicitly supplied path, or a configured shared library. Do not silently
   borrow from sibling projects or old regressions. Wait for a missing licensed
   font or exact asset; never substitute, rasterize text, or ship a reference
   frame as product UI.

## Decompose and realize the complete focus

1. Inspect the complete source before section work. Write one stable scope ID
   in both Source decomposition and Source progress for shared header/footer,
   content sections in source order, the full-page accumulated-layout gate, and
   Target-only responsive cases. Default responsive widths are 390, 768, 1024,
   and 1440 pixels. Pause only when decomposition is materially ambiguous.
2. Invoke `$averlo:visual-parity` in `frame` and
   `$averlo:repository-workflows` for the actual route, marketing/shell,
   composition, media, content, and catalogue concerns.
3. Build the entire declared focus with selectable text, semantic controls,
   responsive native layout, exact copy, supplied fonts, and constituent
   repository assets. Section-local components, exact local variables, and
   local CSS are allowed during this plane. Do not promote speculative shared
   variants merely to appear systemized.
4. Preserve shell and section boundaries and stable Target selectors so later
   planes can work one recorded scope at a time. Reference captures remain
   evidence and can never become Target implementation.

## Baseline without giving up

Measure every constituent source-backed scope, then the full page, then each
responsive Target-only scope. Use `$averlo:visual-parity` in `verify` and record
raw comparable state, capture identity, changed pixels, mean delta, native
evidence, and artifacts. Call every comparable nonzero source case `baselined`
or `measured`, never `verified` or complete.

Set Realization handoff to `ready` only when the complete focus is native,
fonts/assets/provenance are current, every decomposition row has current
baseline evidence, responsive findings and stable selectors exist, repository
safety checks are recorded, and a current Preview review artifact is linked.
Set Active plane to `composition-system-integration`; do not set Overall state
or the composition complete.

For a direct plane goal only, call `update_goal` with `complete` at this handoff.
Under Compose, leave its goal active and return control immediately.
