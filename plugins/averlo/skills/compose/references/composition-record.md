# Composition record

Keep one committed record for each durable composition focus. Compose owns the
lifecycle metadata; its peer skills own their named sections. The runtime goal
continues work from this record but never replaces it.

## Location and evidence

- Store the record at `docs/composition/<focus-slug>.md` and link it from
  `docs/README.md` under `## Composition records`.
- Reuse the same path for the same focus and Target across tasks and planes.
- Promote best and exact source evidence under
  `docs/composition/evidence/<focus-slug>/<scope-id>/` as `source.png`,
  `target.png`, and `diff.png`.
- Promote integration evidence under
  `docs/composition/evidence/<focus-slug>/<scope-id>/integration/` as
  `before.png`, `after.png`, and `diff.png`.
- Keep matrices, full comparator output, working receipts, and intermediate
  captures under ignored `.codex/visual-parity/` paths.

## Required shape

```markdown
# Composition: <focus>

- Focus: <section | page | shell | site plus stable name>
- Target: <route, selector, or Storybook story>
- Authoritative source: <original immutable URL or export>
- Agent Space: <connector identity and clone IDs, or not applicable>
- Plugin version: <installed Averlo plugin version>
- Terminal plane: <composition-convergence | motion-composition>
- Active plane: <composition-realization | composition-system-integration | composition-convergence | motion-composition | complete>
- Overall state: <queued | active | waiting | blocked | complete>
- Active scope: <scope-id or none>
- Preflight: <ready or concrete blocker>
- Repeated blocker checks: <non-negative integer>
- Current Target identity: <revision plus Target-capture SHA-256 when measured>

## Plane handoffs

| Plane | Status | Terminal evidence | Next action or blocker |
| --- | --- | --- | --- |
| composition-realization | <pending, active, ready, waiting, or blocked> | <native baseline receipt> | <action or blocker> |
| composition-system-integration | <pending, active, ready, waiting, or blocked> | <owner and integration-parity receipt> | <action or blocker> |
| composition-convergence | <pending, active, exact, waiting, or blocked> | <source-exact receipt> | <action or blocker> |
| motion-composition | <not-requested, pending, active, complete, waiting, or blocked> | <motion receipt> | <action or blocker> |

## Source decomposition

| Scope ID | Order | Kind | Original source node/bounds | Agent Space node/crop | Target route/selector | Shell boundary | Terminal condition |
| --- | ---: | --- | --- | --- | --- | --- | --- |
| <scope-id> | 1 | shell-header | <node or bounds> | <node or crop> | <route and selector> | includes header only | changedPixels: 0 |

## Realization evidence

- Native implementation: <route source and DOM evidence>
- Fonts and assets: <approved provenance and delivery>
- Responsive baseline: <widths and findings>
- Repository safety: <commands and results>
- Human review: <current Preview URL and artifacts>

## Owner migration

| Owner axis ID | Owner | Axis or role | Source evidence and affected scopes | Inherited recipe and consumers | Disposition | Resulting owner and consumers | Storybook and catalogue evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| <owner-axis-id> | <documented owner or none> | <exact axis or role> | <fact plus scope IDs> | <recipe plus consumers> | <allowed disposition> | <owner plus migrated consumers> | <current evidence or exclusion> |

## Integration parity

| Scope ID | Before Target identity | After Target identity | Changed pixels | Mean delta | Evidence | Status |
| --- | --- | --- | ---: | ---: | --- | --- |
| <scope-id> | <frozen realization capture SHA-256> | <integrated capture SHA-256> | 0 | 0 | <before/after/diff> | integration-exact |

## Source progress

| Scope ID | Status | Current changed pixels | Best changed pixels | Current mean delta | Best mean delta | Current Target identity | Best Target identity | Non-improving turns | Evidence | Next action or blocker |
| --- | --- | ---: | ---: | ---: | ---: | --- | --- | ---: | --- | --- |
| <scope-id> | queued | — | — | — | — | — | — | 0 | — | <next action> |

## Completion evidence

- Native implementation: <current source and DOM evidence>
- Owner integration: <current owner, consumer, contract, and catalogue evidence>
- Responsive findings: <width to system-fit result and artifact>
- Repository checks: <command to current result>
- Human review: <verified Preview URLs and artifacts>
- Incompletion: <none or acknowledged blocker with best evidence>
```

## Relationships and ownership

Source decomposition, Integration parity, and Source progress relate through
stable `Scope ID`. Every decomposition ID appears exactly once in Source
progress. Integration parity contains each source-backed scope affected by
owner migration; responsive-only scopes do not require integration parity.
Owner migration relates to decomposition through its affected scope IDs.

- Compose alone updates lifecycle metadata and Plane handoffs.
- Composition Realization owns Source decomposition and Realization evidence and
  creates the initial Source progress measurements.
- Composition System Integration owns Owner migration and Integration parity.
- Composition Convergence owns current/best Source progress, stall counts, and
  Completion evidence after the integration handoff.
- Visual Parity owns raw receipts and artifacts, never these statuses.

Only one plane and one scope may be active. A direct peer invocation may update
its own handoff but cannot skip its predecessor's terminal evidence.

## Owner-migration dispositions

- `replace`: Source evidence replaces an inherited recipe, or a new neutral
  owner replaces a repeated local recipe.
- `merge-retire`: an evidenced role merges into an equivalent owner and the
  superseded recipe is removed.
- `source-supported-retain`: current Source evidence proves the inherited recipe
  already matches the evidenced role or axis.
- `unevidenced-preserve`: Source supplies no authority for an adjacent axis;
  preserve it without claiming conversion.
- `instance-local`: product content, exact constituent assets, unique geometry,
  or choreography only when it neither overlaps an owner nor repeats.

System Integration remains incomplete while an evidenced row lacks a current
owner, migrated consumers, retired prior recipe, contract, and Storybook or
catalogue evidence. A shared semantic wrapper with route-local visual styling
does not satisfy visual ownership.

## Source-progress statuses

- `queued`: framed but not baselined.
- `active`: the one scope owned by the current correction turn.
- `mismatched`: current comparable evidence is nonzero or responsive system fit
  failed.
- `waiting`: named external material or access is missing.
- `stale`: a Target change invalidated prior source evidence.
- `exact`: current native source-backed evidence reports `changedPixels: 0`.
- `system-fit-verified`: a Target-only responsive case passed review.
- `blocked`: three qualifying non-improving turns or repeated blocker checks
  exhausted the scoped workflow.

Realization records nonzero source cases as `mismatched`, never verified.
System Integration uses `integration-exact` only for target-before versus
target-after zero; that label never asserts source parity. Convergence alone
sets source-backed cases `exact`.

## Invalidation and promotion

1. A Realization Target edit marks affected Source progress and the full-page
   row stale after their first measurement.
2. Before System Integration edits, freeze the affected Target captures in
   Integration parity. Every affected row must return to target-to-target zero.
   Then refresh its source measurement for the current implementation identity.
3. A Convergence edit marks affected Source progress and the full-page row
   stale. Unaffected evidence remains current only when its owners and rendered
   output are unchanged.
4. Replace current metrics after each assessment. Promote source evidence when
   changed pixels strictly improve, or tie while mean delta improves. A zero
   result is always promoted.
5. Reset Non-improving turns when changed pixels or mean delta improves;
   otherwise increment it once after a comparable correction turn. A pure
   recapture with the same Target SHA-256 does not count. Keep current state
   only; do not append an attempt history.
6. Set Overall state `complete` only after Convergence handoff `exact`, every
   source-backed row and full-page gate is current and exact, responsive rows
   are system-fit-verified, and Completion evidence is current. Motion remains
   a later explicit plane and never weakens static completion.

## Legacy record upgrade

When opening a record written by the retired monolithic workflow:

- Map `Current pass: realization` to Active plane `composition-realization`;
  `system-integration` to `composition-system-integration`; `convergence` to
  `composition-convergence`; and `complete` to `complete`.
- Preserve the former Realization handoff and populate the four Plane handoff
  rows from the evidence actually present. Never infer a ready handoff from the
  old label alone.
- Rename Progress to Source progress without changing scope IDs, metrics, target
  identities, or promoted artifacts.
- Add Integration parity before any new system-integration edit. Do not invent
  target-to-target evidence for historical migrations.
