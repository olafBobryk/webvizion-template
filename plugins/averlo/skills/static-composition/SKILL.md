---
name: static-composition
description: Build or port a static section, page, shell, or site composition in a generated Averlo instance, optionally against scoped Figma evidence. Use when static hierarchy, layout, tokens, or canonical owners must change before motion; do not use in the canonical template or for motion-only work.
---

# Averlo · Static Composition

Build the native static endpoint and keep working toward the source-backed
terminal condition. This skill owns decomposition, the durable composition
record, case interpretation, the correction loop, and the goal completion
decision. Visual Parity owns reproducible evidence; the comparator owns only
capture, pixel measurement, and generated artifacts.

## Establish the record and goal

1. Require a schema-v2 `.template-profile.json` receipt. Read
   [the composition-record contract](references/composition-record.md) and
   [`visual-parity`'s focus packet](../visual-parity/references/focus-packet.md).
2. Resolve the stable `docs/composition/<focus-slug>.md` path for this focus and
   Target. Load it when it exists; otherwise create its header immediately and
   link it from `docs/README.md` under `## Composition records`. Reuse this path
   across correction turns and later tasks. The record, not conversation
   history or an ignored artifact, owns current composition progress.
3. Call `get_goal`. When the record is incomplete and no compatible active goal
   exists, call `create_goal` once with:

   ```text
   Invoke $averlo:static-composition to continue the composition in <record-path> using the skill-defined terminal condition.
   ```

   Substitute the concrete record path. Omit `token_budget` unless the caller
   explicitly supplied one. Reuse a compatible active goal and never replace an
   unrelated unfinished goal. When a previous compatible goal ended blocked and
   its recorded blocker has been cleared, create a new goal from the same
   incomplete record. Never create child goals or duplicate the record's source,
   decomposition, or completion rules in the goal objective.
4. When Source is a Figma design, resolve the execution identity and isolate the
   designer's page before calling `get_design_context`, downloading assets, or
   framing parity:
   - Default to the installed Figma app connector
     (`mcp__codex_apps__figma_*`). Call its `whoami` and require
     `webvizionagency@gmail.com`. Do not default to the separately authenticated
     generic Figma MCP (`mcp__figma__*`). Use another identity only when the
     caller explicitly selects it.
   - If the app connector is unavailable or reports another identity, set the
     record to `waiting`, increment Repeated blocker checks only on a later turn
     that repeats the same blocker, and leave the goal active. Do not ask a
     designer to change file permissions until the required connector has been
     checked.
   - Load the Figma `figma-use` and `figma-design-to-code` skills. Through the
     app connector, locate the supplied node and its containing `PageNode`,
     preserve the node's ancestry-index path, and clone that whole page once.
     Name the clone `Agent Space — <source page> — <target>` and use the ancestry
     path to resolve the equivalent node in the clone. Verify its type, name,
     and bounds, then record the connector identity, cloned page ID, and cloned
     focus-node ID.
   - Reuse that exact Agent Space page on continuations. Never mutate the
     original page. Context reads, screenshots, and asset exports use the cloned
     focus node, while the original URL and node remain visual authority.
5. When a persistent external source informs the product, add or update a
   `## Product sources` table in `PRODUCT.md` with its canonical source,
   authority, scope, and supplied material. Preserve provenance there; keep
   decomposition and progress only in the composition record.
6. Inspect the complete declared source focus and the Target's current tokens,
   documented owners, variants, and consumers. Write the complete source and
   progress tables before implementation. Use one stable scope ID for the
   composition row, progress row, and Visual Parity matrix case.
7. Preflight every required font and constituent asset. A Figma image or SVG is
   usable only when its exact bytes can be retained; a reference screenshot is
   not a constituent asset. When a required source is unavailable, set the
   record and applicable row to `waiting`, name it in Preflight and Next action
   or blocker, update the record before ending the turn, and leave the goal
   active. Do not silently substitute a font, rasterize text, or weaken the
   reference.
8. Invoke `$averlo:visual-parity` in its `frame` phase with the composition
   record and scope IDs. Every source-backed case uses literal zero changed RGB
   pixels. Responsive Target-only cases use system-fit review, never borrowed
   source parity.
9. Invoke `$averlo:repository-workflows` when implementation begins. Select the
   applicable composition, interaction, route, marketing/shell, catalogue, and
   content concerns from the actual change unit. Do not bypass the router with
   a parallel component-selection workflow.

## Frame ordered inner scopes

For a page or site, write and process these Source decomposition rows in order:

1. shared header and footer shell cases;
2. content sections in source order;
3. each original full-page source frame as an accumulated-layout gate;
4. responsive system-fit cases after source-backed parity resolves.

Use explicitly supplied shell or section Figma nodes when present. Otherwise
inspect Figma metadata, derive nested nodes and exact bounds, and obtain the
smallest source context that preserves the real page background. An image
endpoint may crop those bounds from the original frame while Target uses a
stable DOM selector. Section cases exclude header and footer pixels. The final
full-page case includes them. If the source decomposition is materially
ambiguous, record the ambiguity, set Overall state to `waiting`, and leave the
goal active rather than inventing section boundaries.

A single section needs its scoped source-backed row and responsive system-fit
evidence. A site repeats page sections and full-page gates in source order while
comparing the shared shell once unless the source proves distinct variants.

## Build the one system

1. Keep one coherent design system in the Target instance. An authoritative
   reference supersedes inherited template visuals for every evidenced role;
   existing visual tokens, variants, and owner treatments are inventory, not
   fidelity constraints. Preserve semantic HTML, accessibility, supported
   interaction, data, routing, and framework boundaries while replacing the
   visual implementation they carry.
2. Make every genuine typography role an instance-wide `Text` variant on first
   use. Before adding it, compare its family, weight, size, line height,
   tracking, responsive behavior, and purpose against the complete documented
   axis, source-focus census, and current consumers. Reuse an equivalent role
   instead of adding a contextual alias. Use source-neutral system names, never
   product, section, route, brand, or Figma-node names. Update the owner contract
   and exhaustive Storybook type-scale evidence in the same change. Keep
   section geometry and choreography with the section.
3. For every changed role, choose one disposition: reuse, extend, replace, new
   owner, instance-local, or merge-retire. Generalize only source-neutral
   behavior; retain product copy, assets, and page choreography in the instance.
4. Let reference-backed evidence replace the shared tokens and owners it
   supports. Do not invent replacements for unevidenced roles, claim they were
   converted, add a parallel theme, or change the canonical Averlo template.
5. Implement visible product structure natively: text remains selectable,
   controls retain semantics and behavior, sections own real responsive layout,
   and media uses constituent assets. A full-frame capture may be Source
   evidence but must never render as Target product UI.
6. Follow the repository workflow's media-delivery concern for every marketing
   image, mark, or icon. Do not ship expiring design-tool URLs.

## Continue the record-backed goal loop

1. Select the first unresolved row in matrix order, set it to `active`, and set
   Active scope to its scope ID. Work on only that scoped source-backed case and
   its highest-impact Target-owned mismatch during the correction turn.
2. Before editing Target code, mark affected measured rows `stale`; every Target
   code change makes the full-page gate `stale`. Unaffected scoped evidence may
   remain current only when its owners and rendered output are unchanged.
3. Capture with motion disabled and run `$averlo:visual-parity` in `verify` for
   the active case. Read its raw comparable flag, dimensions, changed pixels,
   threshold diagnostics, channel deltas, native evidence, and artifact paths.
   Static Composition alone interprets those facts for the progress row.
4. Treat `comparable: false` as a capture defect to repair or a concrete
   blocker. Set a source-backed row to `exact` only when it is comparable,
   natively implemented, current, and reports `changedPixels: 0`. A nonzero
   result remains `active`; threshold counts and channel deltas diagnose work
   but never satisfy the terminal condition.
5. Replace current metrics and Target identity after each assessment. Reset
   Non-improving turns when changed pixels or mean delta improves over the
   preceding comparable assessment; otherwise increment it. Promote the best
   `source.png`, `target.png`, and `diff.png` exactly as the record contract
   defines. Update the record before ending every turn.
6. Advance only after the active source-backed row is `exact`. After shell and
   sections resolve, run the full-page gate. A nonzero full-page result reopens
   the smallest owning scope that explains it, then returns to the full-page
   row.
7. At three consecutive non-improving turns for one scope, or three turns
   repeating the same external blocker, set the row and Overall state to
   `blocked`, update the record, and call `update_goal` with `blocked`. Report
   acknowledged incompletion, best metrics and promoted evidence, and the
   concrete incapability. Never claim completion or silently waive renderer
   noise.
8. Once every source-backed row is `exact`, rerun the complete source-backed
   matrix against the current Target identity. Reopen any nonzero or stale row.
   Then verify responsive Target-only rows at the named widths, run repository
   checks, save human-review evidence, and update Completion evidence.

Call `update_goal` with `complete` only after the record itself is `complete`,
every source-backed row is current and `exact`, the full-page gate is current
and exact, responsive rows are `system-fit-verified`, and native evidence,
repository checks, promoted artifacts, and human review are current. If the goal
has a token budget, report the final usage returned by the goal tool.

## Handoff to motion

The committed composition record is the static checkpoint. Mark human approval
`pending` in the focus packet. `$averlo:compose` pauses here by default; a direct
caller may explicitly record a bypass. Approval is a motion handoff checkpoint,
not permission to complete a nonzero source-backed row.
