---
name: systemize-composition
description: Analyze an accepted local composition and migrate well-supported visual roles into the generated Averlo instance's shared design-system owners without changing its rendered target. Use explicitly after visual review when local fidelity recipes should be reused, extended, promoted, merged, retired, or deliberately kept local; do not build the source composition itself.
---

# Averlo · Systemize Composition

Turn a human-accepted visual realization into a more coherent instance design
system without treating the agent's ownership judgment as unquestionable.
Explicit invocation authorizes analysis and high-confidence automatic work; it
does not authorize unresolved medium- or low-confidence shared changes.

## Freeze the accepted target

1. Require a schema-v2 `.template-profile.json` receipt and a current native
   composition at the requested Target. Read `$averlo:visual-parity`'s focus
   packet and [the confidence router](references/confidence.md).
2. Invoke `$averlo:visual-parity` with `integration-parity` cases. Freeze a
   target-before capture and SHA-256 for every affected shell or section scope.
   This frozen Target is the visual authority for systemization; it never
   replaces the product's original source provenance.
3. Invoke `$averlo:repository-workflows` once for the complete change unit.
   Select every applicable UI ownership, catalogue, composition,
   marketing/shell, media, route, and interaction workflow and load their
   concern union once.

## Inventory and route ownership

1. Inventory local typography, controls, links, marks, media treatments, shell
   presentation, repeated layout roles, tokens, defaults, and temporary visual
   wrappers. Compare each with governing policy, documented Storybook owners,
   complete public signatures, current consumers, and prior human decisions in
   `docs/design-system/decisions/` when they exist.
2. For each candidate, state the source evidence, current local recipe,
   plausible owners reviewed, proposed action, affected consumers, public API
   impact, responsive/behavioral evidence, and required proof.
3. Classify the proposal as `high`, `medium`, or `low` using the confidence
   router. Action names never determine confidence by themselves: reuse,
   extension, new ownership, merge-retire, and token/default changes all require
   evidence proportional to their architectural reach.

## Apply or request a decision

- **High confidence:** automatically attempt the migration as one isolated
  change. Update owners, consumers, contracts, and Storybook/catalogue evidence
  together; remove the superseded local or inherited recipe. Accept it only
  when every affected target-before versus target-after case reports
  `changedPixels: 0` and focused repository checks pass.
- **Medium confidence:** do not edit the unresolved shared boundary. Present one
  concrete recommendation, alternatives considered, the missing decision, and
  expected consumer impact for human direction.
- **Low confidence:** preserve the current local boundary and report the source
  or ownership conflict. Do not invent an owner merely to eliminate a local
  recipe.

If an automatic attempt changes pixels or fails its contracts, restore only
that attempt, preserve its evidence, downgrade it from automatic acceptance,
and request human direction. Moving closer to the original design cannot
compensate for a nonzero target-before/target-after result.

## Preserve human decisions

Create or update `docs/design-system/decisions/<focus-slug>.md` only after the
human approves, rejects, or defers a proposal. Record the evidenced role, the
human decision, chosen owner or local boundary, and rationale. Do not write
proposed-but-undecided rows, workflow status, implementation status, confidence
scores, or a second component catalogue. Code, consumers, and Storybook remain
the truth for implemented owners.

Respect an applicable deferred or rejected decision until source or owner
evidence materially changes. After approved work, report integration-parity
artifacts, owner and consumer changes, Storybook evidence, checks, and any
remaining human decisions. Do not invoke Compose automatically; the user may
request another visual correction pass afterward.
