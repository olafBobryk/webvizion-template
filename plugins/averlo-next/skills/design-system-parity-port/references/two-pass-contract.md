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
- the canonical port changes rendered output and no documented owner or token
  can express the frozen result;
- reference access, repository lineage, or required credentials are ambiguous;
- the requested release would ship the temporary Pass A scaffold.

Do not weaken the comparator, expand tolerances, hide anti-aliasing differences,
or redefine the reference to make a failing verdict pass.
