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

## Resolve workflow authority

Before creating the record, calling a Source tool, or editing the Target,
confirm that this skill's resolved path exists and, when installed-plugin
metadata is available, that its version matches the enabled Averlo plugin. If
an explicit invocation resolved no Static Composition skill, a missing path, or
a stale plugin version, stop and report a workflow resolution failure. Do not
substitute Repository Workflows, a generic Figma skill, or an inferred static
implementation. Figma skills are subordinate source adapters after this
workflow selects the connector and permits source preflight.

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
7. Preflight every required font and constituent asset. Treat material as
   supplied only when it comes from the Target repository, the authoritative
   source connector, a path supplied in the current task, or an explicitly
   configured shared asset library. Do not silently search or borrow from
   sibling repositories, prior worktrees, previous regressions, or arbitrary
   user directories. Record the approved provenance of licensed fonts and
   required assets in Preflight. A Figma image or SVG is usable only when its
   exact bytes can be retained; a reference screenshot is not a constituent
   asset. When a required source is unavailable, set the record and applicable
   row to `waiting`, name it in Preflight and Next action
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
4. responsive system-fit cases.

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
For a page or site, when the caller supplies no responsive widths, create
Target-only rows for 390, 768, 1024, and 1440 pixels during decomposition. These
rows remain distinct from source-backed cases even when a width is shared.

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

## Baseline every scope, then run the correction loop

1. First establish current evidence for the complete focus. Select the next
   `queued` constituent source-backed row in matrix order, set it to `active`,
   and set Active scope to its scope ID. Work on only that scope during the
   turn, but make and measure as many related Target changes as useful. Set a
   comparable zero row to `exact`; set a comparable nonzero row to `mismatched`
   and advance. After every constituent row has a baseline, measure the
   full-page gate, then every responsive row. Set a passing responsive row to
   `system-fit-verified` and a failing one to `mismatched`. Do not begin the
   correction phase until every row has current baseline evidence.
2. During correction, select one `mismatched` or `stale` row, set it to
   `active`, and address its highest-impact Target-owned differences. A
   correction pass may explore multiple changes and measurements inside that
   scope; it is not restricted to one hypothesis or one edit.
3. Before editing Target code, mark affected measured rows `stale`; every Target
   code change makes the full-page gate `stale`. Unaffected scoped evidence may
   remain current only when its owners and rendered output are unchanged. A
   change affecting a blocked row reopens it as `stale` and resets its counter.
4. Capture with motion disabled and run `$averlo:visual-parity` in `verify` for
   the active case. Read its raw comparable flag, dimensions, changed pixels,
   threshold diagnostics, channel deltas, native evidence, and artifact paths.
   Static Composition alone interprets those facts for the progress row.
5. Treat `comparable: false` as a capture defect to repair or a concrete
   blocker. Set a source-backed row to `exact` only when it is comparable,
   natively implemented, current, and reports `changedPixels: 0`. A nonzero
   result becomes `mismatched`; threshold counts and channel deltas diagnose work
	   but never satisfy the terminal condition.
6. Replace current metrics and Target identity after each assessment, including
   the mechanical Target-capture SHA-256. At the end of a correction pass,
   reset Non-improving turns when changed pixels or mean delta improves over the
   preceding comparable assessment; otherwise increment it once. A pure
   recapture of the same Target capture without Target-owned work neither
   increments nor resets the counter. The first baseline starts at zero. Promote
   the best `source.png`, `target.png`, and `diff.png` exactly as the record
   contract defines. Update the record before ending every turn.
7. A nonzero full-page result reopens the smallest owning scope that explains
   it, then returns to the full-page row after that owner changes.
8. At three consecutive non-improving correction passes for one scope, set that
   row to `blocked`, preserve its best evidence, and continue with any
   independent queued, stale, or mismatched row. Likewise, a scoped waiting row
   does not stop independent work. Set Overall state and the goal to `blocked`
   only when no actionable rows remain and at least one blocked row prevents
   completion. A globally required preflight blocker may still block the whole
   focus after three repeated checks. Report acknowledged incompletion, best
   metrics, promoted evidence, and the concrete incapability; never waive
   renderer noise.
9. Once every source-backed row is `exact`, rerun the complete source-backed
   matrix against the current Target identity. Reopen any nonzero or stale row.
   Then reverify responsive Target-only rows at the named widths, run repository
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
