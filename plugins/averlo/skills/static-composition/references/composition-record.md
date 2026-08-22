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
- Delivery shape: <end-to-end | staged>
- Current pass: <realization | system-integration | convergence | complete>
- Realization handoff: <pending | ready | not-applicable>
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

## Owner migration

| Owner axis ID | Owner | Axis or role | Source evidence and affected scopes | Inherited recipe and consumers | Disposition | Resulting owner and consumers | Storybook and catalogue evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| <owner-axis-id> | <documented owner or none> | <exact visual axis or role> | <source fact plus scope IDs> | <current recipe plus consumers> | <allowed disposition> | <final source-neutral owner plus migrated consumers> | <current story, contract, or explicit exclusion> |

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

Owner migration is related to decomposition through the affected scope IDs in
each row. `Owner axis ID` is unique and stable for the durable focus. Write the
complete owner-migration table before the first system-integration Target edit;
a staged realization may leave it empty until its later system-integration
task performs the complete-focus census.

## Owner-migration disposition

- `replace`: Source evidence replaces an inherited visual recipe, or a new
  source-neutral owner replaces a repeated local recipe when no owner existed.
- `merge-retire`: an evidenced role merges into an equivalent owner role and
  the superseded inherited or local recipe is removed.
- `source-supported-retain`: the inherited recipe remains only because current
  Source evidence proves that it already matches the evidenced role or axis.
- `unevidenced-preserve`: the Source does not establish authority for this
  adjacent behavioral, responsive, structural, or visual axis. Preserve it,
  but never report it as converted or use it as evidence that system
  integration covered the axis.
- `instance-local`: preserve product content, exact constituent assets, unique
  geometry, or choreography locally only when it neither overlaps a documented
  owner nor repeats as a visual role.

Apply evidence at owner-axis or role granularity. A Source component, variable,
style, or consistent recurrence across independent roles or scopes can support
a shared axis. One observed value does not authorize adjacent axes: repeated
horizontal gutters may evidence Section `px`, while section-owned `py` and an
unevidenced `maxWidth` remain local or `unevidenced-preserve`. Owner overlap or
repetition cannot resolve as `instance-local`.

Migration is subtractive for evidenced roles. Update every current consumer and
remove the superseded inherited or page-local visual recipe. Preserve
unevidenced axes without inventing a replacement. System integration remains
incomplete while any evidenced row lacks current owner, consumer, contract, and
Storybook/catalogue evidence, or while a source-backed local approximation
remains.

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

## Staged delivery

- `staged` is selected only by an explicit first-pass, realization-pass,
  baseline-pass, or sequential-agent request. Ordinary Static Composition and
  Compose calls remain `end-to-end`.
- During `realization`, implement the complete native focus and establish one
  current comparable baseline for every source-backed row plus current findings
  for every responsive row. Preserve nonzero rows as `mismatched`.
- Set Realization handoff to `ready` only when required fonts, constituent
  assets, media delivery, provenance, stable selectors, native evidence,
  complete baseline evidence, repository safety checks, preview, and human
  review artifacts are current. Then set Current pass to
  `system-integration`. This may complete the bounded realization goal but must
  not set Overall state to `complete`.
- Before `system-integration` edits, census every visible role across the
  complete focus and write the complete owner-migration table. Convert recorded
  scopes onto source-neutral documented owners, retire superseded visual
  recipes, and update their consumers and Storybook evidence. Mark affected
  rows and the full-page gate `stale` after each Target edit.
- Set Current pass to `convergence` only when every evidenced owner-migration
  row is current, every repeated or owner-overlapping role uses its documented
  owner, and preserved unevidenced axes are explicitly excluded from conversion
  claims. Set it to `complete` only with the existing exact and system-fit
  completion requirements.
