---
name: static-composition
description: Build or port a static section, page, shell, or site composition in a generated Averlo instance, optionally against scoped Figma evidence. Use when static hierarchy, layout, tokens, or canonical owners must change before motion; do not use in the canonical template or for motion-only work.
---

# Averlo · Static Composition

Build the native static endpoint and keep working toward the source-backed
terminal condition. This skill owns source realization, design-system
integration, decomposition, the durable composition record, case
interpretation, the correction loop, and goal completion decisions. Visual
Parity owns reproducible evidence; the comparator owns only capture, pixel
measurement, and generated artifacts.

## Choose the delivery shape

- Default to `end-to-end`: one invocation realizes the complete source,
  integrates it into the instance design system, and converges every
  source-backed case to exact parity.
- Use `staged` only when the caller explicitly requests a first pass,
  realization pass, baseline pass, or sequential-agent handoff. The first task
  completes `realization`; a later task resumes the same record for
  `system-integration` and `convergence`.
- A realization handoff is a bounded intermediate deliverable, not composition
  completion or verified parity. Keep nonzero source-backed rows `mismatched`
  and call them measured or baselined.
- Delivery shape changes task coordination, not product standards. Fonts,
  constituent assets, media delivery, source provenance, semantic native DOM,
  complete decomposition, stable selectors, and repository safety checks are
  first-pass requirements and must not be deferred to system integration.

## Establish the record and goal

1. Require a schema-v2 `.template-profile.json` receipt. Read
   [the composition-record contract](references/composition-record.md) and
   [`visual-parity`'s focus packet](../visual-parity/references/focus-packet.md).
2. Resolve the stable `docs/composition/<focus-slug>.md` path for this focus and
   Target. Load it when it exists; otherwise create its header immediately and
   link it from `docs/README.md` under `## Composition records`. Reuse this path
   across correction turns and later tasks. The record, not conversation
   history or an ignored artifact, owns current composition progress.
3. Call `get_goal`. When no compatible active goal exists, create the one goal
   for this task's declared delivery stage. For a staged realization task use:

   ```text
   Invoke $averlo:static-composition to complete the realization pass in <record-path> using the skill-defined realization terminal condition.
   ```

   For an end-to-end task, or a task resuming `system-integration` or
   `convergence`, use:

   ```text
   Invoke $averlo:static-composition to continue the composition in <record-path> using the skill-defined terminal condition.
   ```

	Substitute the concrete record path. Omit `token_budget` unless the caller
	explicitly supplied one. Reuse a compatible active goal for the same delivery
	stage and never replace an unrelated unfinished goal. A completed realization
	goal does not satisfy the composition terminal condition; the durable record
	must still advance through system integration and convergence. When a previous
	compatible goal ended blocked,
	re-run the blocked preflight and treat it as cleared only when the required
	evidence now passes. Then create a new goal from the same incomplete record
	before any Source call or Target edit on that resumed turn. If the replacement
	goal cannot be created, keep the record waiting or blocked and do not resume
	implementation. Never create child goals or duplicate the record's source,
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
   composition row, progress row, and Visual Parity matrix case. Before the
   first system-integration edit, also write the composition record's complete
   owner-migration table at the exact owner-axis or role granularity supported
   by Source evidence.
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

## Realize the complete source

1. Build the full declared focus natively before promoting new shared visual
   abstractions. Preserve shell and section ownership boundaries so the later
   integration pass can convert one recorded scope at a time. A staged
   realization may use section-local components, exact local font variables,
   and section-local CSS; it must not encode product- or section-specific roles
   into shared primitives merely to appear systemized.
2. Use the exact supplied copy, fonts, constituent assets, source hierarchy,
   and visual treatments. Keep text selectable, controls semantic, and layout
   responsive. Never use a reference frame as product implementation.
3. Frame and measure every constituent source-backed scope, then the full-page
   gate, then every responsive Target-only scope. A first-pass baseline is
   evidence for the next task, not a parity claim.
4. A staged realization reaches its terminal condition only when the complete
   source focus exists natively, all required fonts and assets are approved and
   delivered through repository contracts, every decomposition row has current
   comparable baseline evidence, responsive rows have current findings, stable
   Target selectors exist, repository safety checks are recorded, and the
   current preview and human-review artifacts are linked. Nonzero rows remain
   `mismatched`.
5. At that terminal condition, set Realization handoff to `ready`, advance
   Current pass to `system-integration`, update the record, and complete only
   the staged realization goal. Do not set Overall state or the composition
   record to `complete`. In end-to-end delivery, do not pause: continue directly
   into system integration with the same record and goal.

## Build the one system

1. Before changing a realized scope, census every visible role across the
   complete source focus. Map typography, controls, links, marks, media,
   repeated shells, and layout owners to the current implementation and every
   existing documented owner and consumer. This complete-focus census prevents
   a later section from creating a duplicate role or confusing a product
   variation with an instance-wide system variant. Write one stable
   owner-migration row for every evidenced role or axis and every adjacent
   inherited axis that must be distinguished as unevidenced before the first
   Target edit.
2. Keep one coherent design system in the Target instance. An authoritative
   reference supersedes inherited template visuals for every evidenced role;
   existing visual tokens, variants, and owner treatments are inventory, not
   fidelity constraints. Preserve semantic HTML, accessibility, supported
   interaction, data, routing, and framework boundaries while replacing the
   visual implementation they carry.
3. Apply owner precedence before deciding implementation locality. A
   source-backed role that falls within an existing documented owner's domain
   must migrate through that owner even when the realization currently uses a
   page-local component. When no owner exists, a visual role repeated across
   consumers or independent scopes must gain a source-neutral owner. Owner
   overlap or repetition can never be justified as `instance-local`; only the
   role's product content, constituent asset, unique geometry, or choreography
   may remain local.
4. Scope authority to the exact evidenced axis or role. Treat an axis as shared
   only when a Source component, variable, style, or consistent recurrence
   across independent roles or scopes supports that conclusion. One observed
   value does not authorize changes to adjacent axes. For example, repeated
   horizontal gutters may replace a shared Section `px` axis, while
   section-specific `py` remains local and an unevidenced `maxWidth` contract
   remains preserved and explicitly unconverted. Preserve behavioral,
   responsive, and structural axes that the Source does not evidence.
5. Make every genuine typography role an instance-wide `Text` variant during
   system integration. Before adding it, compare its family, weight, size, line
   height, tracking, responsive behavior, and purpose against the complete
   documented axis, source-focus census, and current consumers. Reuse an
   equivalent role instead of adding a contextual alias. Use source-neutral
   system names, never
   product, section, route, brand, or Figma-node names. Update the owner contract
   and exhaustive Storybook type-scale evidence in the same change. Keep
   section geometry and choreography with the section.
6. Assign every owner-migration row exactly one disposition:
   `replace`, `merge-retire`, `source-supported-retain`,
   `unevidenced-preserve`, or `instance-local`. `source-supported-retain`
   requires evidence that the inherited recipe already matches the Source.
   `unevidenced-preserve` keeps an adjacent axis or role because the Source
   supplies no authority for it and must never be reported as converted.
   `instance-local` is valid only for product content, exact constituent
   assets, unique geometry, or choreography that does not overlap an owner or
   repeat as a visual role.
7. Make migration subtractive for every evidenced role. Replace its inherited
   visual recipe, or merge and retire the superseded recipe; update all current
   consumers and remove duplicated page-local visual recipes after owner
   adoption. A new source-neutral owner replaces the repeated local recipe when
   no owner existed. Do not retain an unchanged template treatment for a
   source-backed role, invent replacements for unevidenced axes, claim
   preserved axes were converted, add a parallel theme, or change the canonical
   Averlo template.
8. Keep visible product structure native: text remains selectable,
   controls retain semantics and behavior, sections own real responsive layout,
   and media uses constituent assets. A full-frame capture may be Source
   evidence but must never render as Target product UI.
9. Follow the repository workflow's media-delivery concern for every marketing
   image, mark, or icon. Do not ship expiring design-tool URLs.
10. Convert one recorded shell or section scope at a time. Before each Target
   edit, mark affected rows and the full-page gate `stale`; after conversion,
   remeasure that scope and update every affected owner-migration row. Treat
   componentization as a render-preserving refactor, then correct any difference
   it introduces.
11. Advance Current pass to `convergence` only after every Source-evidenced
   owner-migration row is current, every affected consumer uses the resulting
   owner, superseded local and inherited visual recipes are removed, and the
   corresponding owner contracts, exhaustive Storybook/catalogue evidence, and
   `unevidenced-preserve` exclusions are current. Do not start final zero-diff
   convergence against temporary page-local approximations. An
   `instance-local` claim that overlaps an owner or repeated role leaves system
   integration incomplete.

## Baseline every scope, then run the correction loop

1. During realization, first establish current evidence for the complete focus. Select the next
   `queued` constituent source-backed row in matrix order, set it to `active`,
   and set Active scope to its scope ID. Work on only that scope during the
   turn, but make and measure as many related Target changes as useful. Set a
   comparable zero row to `exact`; set a comparable nonzero row to `mismatched`
   and advance. After every constituent row has a baseline, measure the
   full-page gate, then every responsive row. Set a passing responsive row to
   `system-fit-verified` and a failing one to `mismatched`. Do not begin the
   correction phase until every row has current baseline evidence. In staged
   delivery, hand off after the realization terminal condition instead of
   entering correction. In end-to-end delivery, complete system integration
   before entering final correction.
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
	   but never satisfy the terminal condition. In commentary and handoff, call a
	comparable nonzero scope measured or baselined, never verified. Reserve
	verified source-backed parity for a current `exact` row.
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

Call `update_goal` with `complete` for a staged realization goal only after its
realization terminal condition is recorded and the record has advanced to
`system-integration`. This completes the bounded first-pass task, not the
composition. For an end-to-end, system-integration, or convergence goal, call
`update_goal` with `complete` only after the record itself is `complete`, every
source-backed row is current and `exact`, the full-page gate is current and
exact, responsive rows are `system-fit-verified`, and native evidence,
repository checks, promoted artifacts, and human review are current. If the
goal has a token budget, report the final usage returned by the goal tool.

## Handoff to motion

The committed composition record is the static checkpoint. Mark human approval
`pending` in the focus packet. `$averlo:compose` pauses here by default; a direct
caller may explicitly record a bypass. Approval is a motion handoff checkpoint,
not permission to complete a nonzero source-backed row.
