---
name: design-system-parity-port
description: Explicit-only Averlo workflow for building a page against an authoritative visual reference, freezing the matched renderer, resolving every temporary presentation role to a canonical owner, and then porting with an exact no-regression gate. Invoke only when the user explicitly requests this skill or the complete two-pass fidelity-to-system process; do not use it for ordinary page building, visual review, or component cleanup.
---

# Design System Parity Port

Build the authoritative page first, then replace the fidelity scaffold with
canonical owners without changing its rendered result. A good first pass is
evidence, not release-ready architecture.

## Required companions

Invoke these skills when their phase begins and follow their instructions:

1. `$target-fidelity` and `$visual-diff-minimizer` for the authoritative build.
2. `$averlo:design-system` before selecting or changing shared owners.
3. `$figma-design-system-port` and `$jsx-visual-parity-refactor` for the port.
4. `$strict-visual-parity` for both verdicts.
5. `$storybook:stories` before creating or editing owner stories.
6. `$breakpoint-review` after desktop geometry is frozen.

Read [references/two-pass-contract.md](references/two-pass-contract.md) before
planning or editing. Use the repository's existing capture and comparator tools;
do not copy them into this skill or invent a second parity harness.

## Establish the task packet

Record the target route, authoritative Figma node or normalized export, exact
desktop viewport and expected full-page dimensions, required copy and assets,
and qualitative breakpoint set. Also record the repository, template lineage,
content mode, allowed routes, and any delivery integrations in scope.

If the reference cannot be made immutable and reproducible, stop before Pass A.

## Pass A: authoritative renderer

1. Inspect repository contracts, Storybook evidence, tokens, content registries,
   and existing capture tooling before editing.
2. Build the smallest faithful renderer. Page-local fidelity CSS and composition
   are temporarily allowed, but content, assets, accessibility, and behavior must
   remain real.
3. Make capture deterministic: fixed viewport and DPR, ready fonts and assets,
   fixed data and seeds, disabled motion, stable color scheme, and no overflow.
4. Tune only declared, bounded, high-impact parameters. Optimize section crops
   before the full page, preserving every accepted best candidate.
5. State the honest authoritative-reference verdict. Never relabel a residual
   difference as exact parity.
6. Freeze the best renderer as an opaque screenshot plus checksum, capture
   configuration, metric report, and source commit. Commit that state before
   starting Pass B.

## Bridge gate: resolve canonical ownership

Pass B must not begin directly from broad "Figma patterns." Derive a concrete
presentation inventory from the frozen Pass A renderer and retain the Figma
node, frame, or normalized-reference provenance for every item.

When the reference reveals a collapsed, expanded, hover, focus, loading, empty,
or otherwise hidden surface, inventory and recover that surface's existing
interaction mechanism before changing presentation owners. Do not port only the
resting screenshot and accidentally remove the state, its data contract, or its
keyboard and dismissal behavior.

Use this required sequence:

`presentation inventory -> component candidate index -> temporary project owner map -> bridge checklist passes -> canonical port`

1. Inventory visible regions, repeated compositions, interaction roles, shell
   elements, typography roles, asset treatments, and every temporary Pass A
   presentation owner.
2. Run the component candidate index from `$averlo:design-system`, then
   inspect relevant Storybook owner documentation or colocated owner stories.
   The index proposes candidates; Storybook and documented public contracts are
   the ownership evidence.
3. Add one temporary owner-map row per inventory item. Record the presentation
   role, Pass A source, reference provenance, candidates reviewed, disposition,
   selected target owner, rationale, consumer impact, parity or story evidence,
   and resolution status.
4. Use exactly one disposition: `reuse`, `extend`, `new-owner`,
   `instance-local`, or `merge-retire`. A `new-owner` row must explain why every
   plausible existing owner is insufficient.
5. Pass the written bridge checklist only when every row is resolved and no
   competing canonical ownership remains unexplained. Keep the map in the task
   packet; do not add a project registry, schema, verifier, or permanent ledger.

An independent-agent review may be used as a handoff tactic, but is not a gate.

## Pass B: canonical port

1. Execute only the resolved owner map. Replace the Pass A presentation
   scaffold with its selected canonical owners; do not retain a parallel
   instance design system. The JSX hierarchy and temporary presentation APIs
   may change; preserve valid behavior, content, and data contracts unless the
   owner map records a compatible migration.
2. Move brand values into the project token layer; move reusable roles into
   generic primitives; move complex reusable composition into source-neutral
   domain owners. Keep content, routes, CMS bindings, contact delivery, and
   product assets in instance adapters.
3. For `merge-retire`, select one survivor, review affected consumers, preserve
   compatibility where required, migrate consumers, verify usage and parity,
   then remove the duplicate. Never add a third owner to avoid the decision.
4. Generalize shell contracts with explicit backward-compatible discriminators.
   Do not encode the source brand, page, or Figma frame in canonical APIs.
5. Add or update lowest-owner stories using literal story-level `tags` and
   `parameters.backport` metadata when the repo supports backports.
6. Remove each temporary fidelity owner only after its canonical replacement
   renders equivalently and is covered by the appropriate owner evidence.
7. Compare the canonical port against the frozen Pass A image. Acceptance is
   zero unexplained changed pixels with identical geometry and capture state.

## Finish and report

Run the repository's lint, typecheck, build, site-layout/catalogue checks,
focused Storybook tests, keyboard/accessibility review, and qualitative
breakpoint captures. Present side-by-side review links when available.

Report two separate verdicts:

- authoritative reference versus the final implementation, including all
  residual metrics;
- frozen Pass A versus the canonical port, which must be exact before release.

Include the frozen checksum and source commit, completed temporary owner map,
owner-placement and merge-retire decisions, stories and public APIs changed,
breakpoint findings, and verification results. Do not hand off or ship the
Pass A scaffold as the finished implementation.
