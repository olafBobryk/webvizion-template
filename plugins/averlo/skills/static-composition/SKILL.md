---
name: static-composition
description: Build or port a static section, page, shell, or site composition in a generated Averlo instance, optionally against scoped Figma evidence. Use when static hierarchy, layout, tokens, or canonical owners must change before motion; do not use in the canonical template or for motion-only work.
---

# Averlo · Static Composition

Build the native static endpoint and keep working toward the source-backed
terminal condition. This skill owns the goal, focus order, correction loop, and
completion decision. Visual Parity owns case-level interpretation; the
comparator owns only captures, pixel measurements, and artifacts.

## Establish one goal and packet

1. Require a schema-v2 `.template-profile.json` receipt and read
   [`visual-parity`'s focus packet](../visual-parity/references/focus-packet.md).
2. Call `get_goal`. If no compatible goal exists, call `create_goal` once with:

   ```text
   Invoke $averlo:static-composition to complete <focus> at <target> against <source> using the skill-defined terminal condition.
   ```

   Substitute the concrete focus, target, and source. Omit `token_budget` unless
   the caller explicitly supplied one. Reuse a compatible active goal; do not
   replace an unrelated unfinished goal. The one top-level goal owns the whole
   requested section, page, shell, or site. Never create child goals, a
   conversion state machine, or a goal ledger. The ordered matrix, receipt, and
   goal-turn history are sufficient evidence and working context.
3. When Source is a Figma design, resolve the execution identity and isolate the
   designer's page before calling `get_design_context`, downloading assets, or
   framing parity:
   - Default to the installed Figma app connector
     (`mcp__codex_apps__figma_*`). Call its `whoami` and require
     `webvizionagency@gmail.com`. Do not default to the separately authenticated
     generic Figma MCP (`mcp__figma__*`). Use another identity only when the
     caller explicitly selects it.
   - If the app connector is unavailable or reports another identity, leave the
     goal active and report a connector-identity mismatch. Do not ask a designer
     to change file permissions until the required connector has been checked.
   - Load the Figma `figma-use` and `figma-design-to-code` skills. Through the
     app connector, locate the supplied node and its containing `PageNode`,
     preserve the node's ancestry-index path, and clone that whole page once.
     Name the clone `Agent Space — <source page> — <target>` and use the ancestry
     path to resolve the equivalent node in the clone. Verify its type, name,
     and bounds, then record the connector identity, cloned page ID, and cloned
     focus-node ID in the packet.
   - Reuse that exact verified Agent Space page on goal continuations; never
     create one clone per turn. Never mutate the original page. All subsequent
     context reads, screenshots, and asset exports use the cloned focus node,
     while the original URL and node remain the product's visual authority.
4. Invoke `$averlo:visual-parity` in its `frame` phase. Default every
   source-backed case to literal zero changed RGB pixels unless the caller
   explicitly declared another terminal condition. A zero-diff objective
   cannot use an intentional nonzero exception.
5. When a persistent external source informs the product, add or update a
   `## Product sources` table in `PRODUCT.md` with its canonical source,
   authority, scope, and supplied material. Record provenance, never conversion
   progress, implementation status, or a second component catalogue.
6. Inspect the complete declared source focus and the target's current tokens,
   documented owners, variants, and consumers before implementing an individual
   scope. Use the resulting role census as working analysis, not a permanent
   registry.
7. Preflight every required font and constituent asset. A Figma image or SVG
   asset is usable only when its exact bytes can be retained; a reference
   screenshot is not a constituent asset. When a required font file or other
   source asset is unavailable from Figma, the repository, or a user-supplied
   lawful source, stop before implementation and request it. Leave the goal
   active. The next goal continuation re-invokes this skill from its objective;
   do not silently substitute a font, rasterize text, or weaken the reference.
8. Invoke `$averlo:repository-workflows` when implementation begins. Select the
   applicable composition, interaction, route, marketing/shell, catalogue, and
   content concerns from the actual change unit. Do not bypass the router with
   a parallel component-selection workflow.

## Frame ordered inner scopes

For a page or site, build one ordered comparison matrix beneath the top-level
goal:

1. shared header and footer shell cases;
2. content sections in source order;
3. each original full-page source frame as the accumulated-layout gate;
4. responsive system-fit cases, after source-backed parity is resolved.

Use explicitly supplied shell or section Figma nodes when present. Otherwise
inspect Figma metadata, derive nested nodes and exact bounds, and obtain the
smallest source context that preserves the real page background. An image
endpoint may crop those bounds from the original frame while Target uses a
stable DOM selector. Section cases exclude header and footer pixels. The final
full-page case includes them. Pause with the goal active only when the source
decomposition is materially ambiguous; do not invent section boundaries.

A single section focus needs only its scoped source-backed case and responsive
system-fit evidence. A site repeats page sections and full-page gates in source
order while comparing the shared shell once unless the source proves distinct
shell variants.

## Build the one system

1. Keep one coherent design system in the target instance. An authoritative
   reference supersedes inherited template visuals for every evidenced role;
   existing visual tokens, variants, and owner treatments are inventory, not
   fidelity constraints. Preserve semantic HTML, accessibility, supported
   interaction, data, routing, and framework boundaries while replacing the
   visual implementation they carry.
2. Make every genuine typography role an instance-wide `Text` variant on first
   use. Before adding it, compare its family, weight, size, line height,
   tracking, responsive behavior, and purpose against the complete documented
   axis, the source-focus census, and current consumers; reuse an equivalent
   role instead of adding a contextual alias. Name shared variants for a
   source-neutral system role or scale, never a product, section, route, brand,
   or Figma node. Update the owner contract and exhaustive Storybook type-scale
   evidence in the same change. Keep section geometry and choreography with the
   section rather than encoding them into typography variants.
3. For every changed role, choose one disposition: reuse, extend, replace, new
   owner, instance-local, or merge-retire. Generalize only source-neutral
   behavior; retain product copy, assets, and true page choreography in the
   instance.
4. Let the reference-backed focus replace the shared tokens and owners its
   evidence supports. Do not invent replacements for unevidenced roles, claim
   they were converted, add a parallel theme, or change the canonical Averlo
   template.
5. Implement visible product structure natively: text remains selectable text,
   controls keep their semantics and behavior, sections own real responsive
   layout, and media uses constituent assets. A full-frame or full-page capture
   may be Source evidence but must never render as Target product UI.
6. Follow the repository workflow's media-delivery concern for every marketing
   image, mark, or icon. Do not ship expiring design-tool URLs.

## Continue the goal loop

1. Work on one scoped source-backed case per correction turn. Follow matrix
   order, and within that case address its highest-impact Target-owned mismatch.
   Do not spread a correction pass across the whole page.
2. Capture with motion disabled and run `$averlo:visual-parity` in `verify` for
   that case. Treat `comparable: false` as a capture defect to repair or a
   concrete blocker. For the default zero-diff objective, only
   `changedPixels: 0` resolves the case. Threshold counts and channel deltas are
   diagnostic signals, not completion thresholds.
3. Advance only after the active scoped case resolves. After all shell and
   section cases resolve, run the original full-page frame. A nonzero full-page
   result reopens the smallest owning scope that explains the accumulated
   mismatch, then returns to the full-page gate.
4. Track stalls from the consecutive goal-turn history for the same active
   case, not in a new repository file. A turn improves when either
   `changedPixels` or `meanAbsoluteChannelDelta` decreases from the preceding
   turn. Reset the count after either metric improves or the active case
   changes. The default stall threshold is three consecutive non-improving goal
   turns; a caller may explicitly raise, but not lower, it.
5. After the stall threshold, or after the same external blocker has repeated
   for the goal tool's required three turns, call `update_goal` with `blocked`.
   Report acknowledged incompletion, the best current measurements and
   artifacts, and the concrete incapability or external blocker. Never claim
   completion, silently waive renderer noise, or keep an irrecoverable goal
   active.
6. Once every source-backed case has individually reached `changedPixels: 0`,
   rerun the complete source-backed matrix against the current Target so one
   `summary.json` proves every case at the same implementation identity. Reopen
   any nonzero case. Only after that accumulated gate remains zero, verify
   responsiveness separately at the named widths. Do not fabricate source
   parity where Figma supplied no source frame. Run the repository checks
   selected by the router and save human-review artifacts.

Call `update_goal` with `complete` only when every source-backed case satisfies
the declared terminal condition and the current `verify` receipt contains
native implementation evidence, responsive findings, repository-check results,
and reviewable artifacts for the current Target. If the goal has a token budget,
report the final usage returned by the goal tool.

## Handoff to motion

Record product provenance, resolved owners, consumer impact, native-render
evidence, responsive findings, repository checks, and the current visual-parity
receipt. Mark human approval `pending`. `$averlo:compose` pauses here by default;
a direct caller may explicitly mark the approval bypassed. Human approval is a
motion handoff checkpoint, not permission to call a nonzero zero-diff case
complete.
