# Two-pass contract

## Immutable evidence bundle

Before the system port begins, preserve all of the following together:

- normalized opaque reference and its checksum;
- exact viewport, DPR, color scheme, browser/runtime, full-page dimensions, and
  font/asset readiness policy;
- motion-disable and deterministic-data controls;
- accepted objective metrics and any unexplained residuals;
- frozen Pass A screenshot and checksum;
- source commit that produced the frozen renderer;
- bounded optimization variables, ranges, fixed seeds, and accepted candidates.

A checksum change, missing baseline, nondeterministic recapture, or geometry
change invalidates the gate. Re-establish and explicitly approve the baseline
instead of silently continuing.

## Ownership placement

| Concern | Correct owner |
| --- | --- |
| Color, spacing, typography, radius, motion values | Project token/theme layer |
| Reusable semantic control or visual role | Generic primitive/foundation |
| Multi-part reusable section behavior | Source-neutral domain/composite owner |
| Page order, copy, links, CMS fields | Typed content or route adapter |
| Brand artwork and product-specific media | Instance asset adapter |
| Email recipient, delivery provider, persistence | Instance/server integration |
| Header/footer variants | Backward-compatible shell contract |

Canonical owners must not contain a client name, Figma node, page-specific copy,
fixed page coordinates, or one-off asset imports. Instance adapters may select
documented variants and supply content, but must not rebuild their presentation.

## Canonical ownership bridge

Derive the presentation inventory from the frozen Pass A renderer. Figma or the
normalized authoritative reference supplies provenance; it is not itself a
component model. Record the bridge as temporary task evidence, not as a
committed project registry or a second catalogue.

Each owner-map row must contain:

| Field | Requirement |
| --- | --- |
| Presentation role | Name the visible, behavioral, shell, type, or asset responsibility |
| Pass A source | Identify the temporary renderer owner or source location |
| Reference provenance | Link the authoritative node, frame, crop, or normalized evidence |
| Candidates reviewed | List component-index candidates and Storybook/public-contract evidence |
| Disposition | Choose exactly one allowed disposition |
| Target owner | Name the canonical owner or justified instance adapter |
| Rationale | Explain the selection and rejection of plausible competing owners |
| Consumer impact | Identify reviewed consumers, migration needs, and compatibility constraints |
| Evidence | Name the owner story and frozen-parity evidence that will prove the port |
| Status | Mark resolved only when the row can be executed without another ownership decision |

The allowed dispositions are:

| Disposition | Meaning |
| --- | --- |
| `reuse` | Replace the temporary presentation with an existing supported owner |
| `extend` | Add a source-neutral capability to the correct existing owner |
| `new-owner` | Create a canonical owner only after plausible existing owners are disproved |
| `instance-local` | Keep content, assets, integrations, or true product-specific composition outside the canonical system |
| `merge-retire` | Consolidate duplicate canonical definitions into one surviving owner |

## Bridge checklist

Before starting Pass B, confirm every item in writing:

- [ ] Every frozen Pass A presentation role has exactly one owner-map row.
- [ ] Every row retains authoritative-reference provenance.
- [ ] Component-index candidates were treated as candidates, then checked
      against Storybook or another documented public contract.
- [ ] Every row has one disposition and one selected target owner or justified
      instance adapter.
- [ ] Every plausible competing owner has evidence or a rejection rationale.
- [ ] Every `new-owner` row disproves reuse or extension of existing owners.
- [ ] Every `merge-retire` row identifies the survivor, affected consumers,
      compatibility needs, migration proof, and deletion condition.
- [ ] Shared-consumer impact and required owner-story changes are known.
- [ ] Every row is resolved without another ownership decision.
- [ ] The owner map remains temporary task evidence rather than a committed
      registry, schema, verifier, or permanent ledger.

The bridge gate passes only when all items are true and no competing canonical
definition remains unexplained.

## Merge and retire

When duplicate canonical owners are discovered:

1. Choose the survivor from the strongest supported public contract and
   lowest-owner Storybook evidence, not from name or visual resemblance alone.
2. Find and review all affected consumers within the authorized scope.
3. Add a backward-compatible discriminator or adapter only when consumers need
   a staged migration; do not preserve the duplicate as a permanent alias.
4. Migrate consumers and prove the frozen renderer plus relevant owner stories.
5. Confirm no reviewed consumer still depends on the duplicate, then delete its
   implementation, exports, stories, and obsolete relationship metadata.

Never create a third owner to sidestep unresolved ownership.

## Verification matrix

| Comparison | Purpose | Verdict |
| --- | --- | --- |
| Authoritative reference → implementation | Measures design fidelity | Report exact metrics and residuals honestly |
| Frozen Pass A → canonical Pass B | Detects architecture-port regressions | Zero unexplained changed pixels |

Keep the first verdict unchanged during Pass B. The second verdict proves that
the architectural port did not trade away the already-achieved result.

## Hard stops

Stop and ask for direction when:

- the immutable evidence bundle is incomplete or its checksum changed;
- repeated identical captures produce different pixels or geometry;
- a shared API change has consumers outside the reviewed scope;
- any temporary owner-map row is unresolved or lacks candidate evidence;
- a `new-owner` row does not disprove plausible existing owners;
- duplicate canonical owners exist but the survivor or migration impact is
  unresolved;
- the canonical port changes rendered output and no documented owner or token
  can express the frozen result;
- reference access, repository lineage, or required credentials are ambiguous;
- the requested release would ship the temporary Pass A scaffold.

Do not weaken the comparator, expand tolerances, hide anti-aliasing differences,
or redefine the reference to make a failing verdict pass.
