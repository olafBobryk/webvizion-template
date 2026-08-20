# Static-composition record

Keep one committed record for each durable composition focus. The record is the
project's continuing composition context across correction turns and later
tasks. The Codex goal resumes work from it but does not replace it.

## Location and discovery

- Store the record at `docs/composition/<focus-slug>.md`.
- Reuse the same path for the same focus and Target; never create one record per
  task, attempt, or agent.
- Link every record from `docs/README.md` under `## Composition records`.
- Store promoted evidence at
  `docs/composition/evidence/<focus-slug>/<scope-id>/source.png`, `target.png`,
  and `diff.png`.
- Keep matrices, full comparator output, working receipts, and intermediate
  captures under ignored `.codex/visual-parity/` paths.

## Required shape

```markdown
# Composition: <focus>

- Focus: <section | page | shell | site plus stable name>
- Target: <route, selector, or Storybook story>
- Authoritative source: <original immutable URL or export>
- Agent Space: <connector identity, cloned page ID, cloned focus-node ID, or not applicable>
- Plugin version: <installed Averlo plugin version>
- Terminal condition: <zero changed RGB pixels for source-backed scopes>
- Overall state: <queued | active | waiting | blocked | complete>
- Active scope: <scope-id or none>
- Preflight: <ready or concrete font, asset, source-access, or other blocker>
- Repeated blocker checks: <non-negative integer>
- Current Target identity: <revision plus Target-capture SHA-256 when measured>

## Source decomposition

| Scope ID | Order | Kind | Original source node/bounds | Agent Space node/crop | Target route/selector | Shell boundary | Terminal condition |
| --- | ---: | --- | --- | --- | --- | --- | --- |
| <scope-id> | 1 | shell-header | <node or bounds> | <node or crop> | <route and selector> | includes header only | changedPixels: 0 |

## Progress

| Scope ID | Status | Current changed pixels | Best changed pixels | Current mean delta | Best mean delta | Current Target identity | Best Target identity | Non-improving turns | Evidence | Next action or blocker |
| --- | --- | ---: | ---: | ---: | ---: | --- | --- | ---: | --- | --- |
| <scope-id> | queued | — | — | — | — | — | — | 0 | — | <next action> |

## Completion evidence

- Native implementation: <current source and DOM evidence>
- Responsive findings: <width to system-fit result and promoted artifact>
- Repository checks: <command to current result>
- Human review: <verified preview URL and review artifacts>
- Incompletion: <none or acknowledged blocker with best evidence>
```

The Source decomposition and Progress tables are related by `Scope ID`. Every
scope ID must be unique in each table and appear exactly once in both. Matrix
case IDs use the same value. Use stable, source-neutral IDs that survive agent
and task changes.

## Row status

- `queued`: framed but not yet the active correction scope.
- `active`: the one scope being implemented or corrected this turn.
- `mismatched`: current evidence exists, but the row's source-backed exact or
  responsive system-fit terminal condition is not satisfied.
- `waiting`: the scope cannot advance until named external material or access is
  supplied; the overall goal remains active until the repeated-blocker limit.
- `stale`: prior evidence was invalidated by a Target change and must be
  recaptured.
- `exact`: the current source-backed case is comparable, natively implemented,
  and reports `changedPixels: 0` at the current Target identity.
- `system-fit-verified`: a responsive Target-only case passed its named review;
  it is never a source-parity claim.
- `blocked`: the same external blocker or non-improving scoped correction
  reached its allowed consecutive-turn limit.

Only one row may be `active`. Source-backed rows resolve only as `exact`.
Responsive rows resolve only as `system-fit-verified`. A current unresolved row
is `mismatched`; `queued` means it has no baseline yet.

## Update and invalidation rules

1. Write the complete source decomposition before implementation. If source
   access prevents decomposition, create the record header, set Overall state
   to `waiting`, name the source-access blocker in Preflight, and leave both
   tables empty until the source can be inspected.
2. Establish one current baseline for every constituent source-backed row in
   matrix order, then the full-page row, then every responsive row. Process one
   active row per turn. Set a comparable nonzero or failed system-fit row to
   `mismatched` and continue until every row has a baseline.
3. Before changing Target code, set the chosen row to `active`, mark every
   affected previously measured row `stale`, and always mark the final
   full-page row `stale`. A Target change affecting a blocked row reopens it as
   `stale` and resets its Non-improving turns.
4. A correction pass may make and measure any number of related Target changes
   within its one active scope. After its final comparable assessment, reset
   Non-improving turns when changed pixels or mean delta improves over the
   preceding comparable assessment; otherwise increment it once. The first
   baseline starts at zero. A pure recapture with the same Target-capture
   SHA-256 and no Target-owned work neither increments nor resets the counter.
   Do not require or retain a single hypothesis or append-only attempt log.
5. Replace current metrics and Target identity after each assessment. Include
   the comparator's Target-capture SHA-256 so an unchanged recapture is
   mechanically distinguishable from a new rendered Target.
6. Promote evidence when changed pixels strictly improve, or when changed
   pixels tie and mean delta strictly improves. Replace the committed
   `source.png`, `target.png`, and `diff.png`, and update Best metrics and Best
   Target identity together. A zero result is always promoted.
7. Evidence from another Target identity remains explicitly historical best
   evidence. It cannot satisfy current completion while the row is `stale`.
8. Update the record before ending every correction turn, including preflight
   waits and blocked outcomes. Keep current state only; do not append an attempt
   history.
9. A row reaching its non-improving limit becomes `blocked`, but independent
   queued, stale, or mismatched rows remain actionable. Set Overall state to
   `blocked` only when no actionable rows remain and at least one blocked row
   prevents completion.
10. Set Overall state to `complete` only when every source-backed row is current
    and `exact`, the full-page row is current and `exact`, responsive rows are
    `system-fit-verified`, and Completion evidence is current. Otherwise it is
    `active`, `waiting`, or `blocked` according to the unresolved row.
