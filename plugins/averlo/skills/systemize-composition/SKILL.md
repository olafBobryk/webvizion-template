---
name: systemize-composition
description: Analyze an accepted local composition, review its local renderer boundaries, and migrate well-supported visual roles into the generated Averlo instance's shared design-system owners while accounting for possible visual effects across consumers. Use explicitly after visual review when local boundaries or fidelity recipes should be split, reused, extended, promoted, merged, retired, or deliberately kept local; do not build the source composition itself.
---

# Averlo · Systemize Composition

Turn a human-accepted visual realization into a more coherent instance design
system without treating the agent's ownership judgment as unquestionable.
Explicit invocation authorizes analysis and high-confidence automatic work; it
does not authorize unresolved medium- or low-confidence shared changes.

Systemize Composition packages [Repository Workflows](../repository-workflows/SKILL.md)
and [Visual Parity](../visual-parity/SKILL.md) as mandatory subordinate
contracts. Read each linked `SKILL.md` completely when its workflow first
applies, even when that explicit-only skill is omitted from the active skill
catalogue. Catalogue omission alone is not a blocker and never authorizes a
substitute workflow. Load their routed references progressively instead of
duplicating their contracts here.

## Inspect the accepted composition

1. Require a schema-v2 `.template-profile.json` receipt and a current native
   composition at the requested Target. Read the linked
   `$averlo:visual-parity` focus packet and
   [the confidence router](references/confidence.md).
2. Inventory candidates before deciding whether before/after evidence is useful.
   Plan-only analysis does not require capture work. When a selected migration
   benefits from `integration-parity` evidence, use the linked
   `$averlo:visual-parity` only for its relevant scopes and treat the resulting
   measurements as descriptive, temporary evidence rather than product source
   authority or a durable page copy.
3. Invoke the linked `$averlo:repository-workflows` once for the complete
   change unit. Select every applicable UI ownership, catalogue, composition,
   marketing/shell, media, route, and interaction workflow and load their
   concern union once.

## Inventory and route ownership

1. Inventory local typography, controls, links, marks, media treatments, shell
   presentation, repeated layout roles, tokens, defaults, and temporary visual
   wrappers. Also inspect whether an accepted registered renderer groups
   multiple coherent semantic or interaction roles that could be split or
   merged. Such grouping is not retroactively a Compose failure when it formed
   one honest source/parity case. Compare each candidate with governing policy,
   documented Storybook owners, complete public signatures, current consumers,
   and prior human decisions in `docs/design-system/decisions/` when they exist.
2. For each candidate, state the source evidence, current local recipe,
   plausible owners reviewed, proposed action, affected consumers, public API
   impact, responsive/behavioral evidence, and required proof.
   When relevant, explain that its visual effect may be render-preserving,
   intentionally changing, uncertain, or different between consumers. This is
   contextual awareness, not a visual-effect status, schema, or acceptance
   strategy. Do not assume either preservation or change merely because a role
   becomes shared.
3. Classify the proposal as `high`, `medium`, or `low` using the confidence
   router. Action names never determine confidence by themselves: reuse,
   extension, new ownership, merge-retire, and token/default changes all require
   evidence proportional to their architectural reach.
4. Classify a renderer or section-boundary split/merge as `medium` by default.
   Present its semantic and maintenance benefit for human direction instead of
   automatically rewriting accepted local topology. After approval, apply the
   boundary change through the routed repository concerns and run focused route
   and marketing-section checks. Use before/after evidence when it materially
   helps review the result.

## Apply or request a decision

- **High confidence:** automatically attempt the migration as one isolated
  change. Update owners, consumers, contracts, and Storybook/catalogue evidence
  together; remove the superseded local or inherited recipe and run the focused
  repository checks. When before/after measurements are useful, report them
  alongside the relevant expected or uncertain visual effects. A pixel
  difference alone neither accepts nor rejects a systemization.
- **Medium confidence:** do not edit the unresolved shared boundary. Present one
  concrete recommendation, alternatives considered, the missing decision, and
  expected consumer impact for human direction.
- **Low confidence:** preserve the current local boundary and report the source
  or ownership conflict. Do not invent an owner merely to eliminate a local
  recipe.

If an automatic attempt fails its owner, consumer, API, Storybook, repository,
accessibility, or behavioral contracts, restore only that attempt, preserve its
evidence, downgrade it from automatic acceptance, and request human direction.
Do not restore or accept an attempt solely because its pixels changed or stayed
the same; explain relevant visual consequences in the handoff.

## Preserve human decisions

Create or update `docs/design-system/decisions/<focus-slug>.md` only after the
human approves, rejects, or defers a proposal. Record the evidenced role, the
human decision, chosen owner or local boundary, and rationale. Do not write
proposed-but-undecided rows, workflow status, implementation status, confidence
scores, or a second component catalogue. Code, consumers, and Storybook remain
the truth for implemented owners.

Do not place a purely local renderer-boundary decision in the design-system
decision document unless it also decides a shared design-system owner. The
implemented document types, registry, renderers, and repository checks remain
the truth for local architecture.

Respect an applicable deferred or rejected decision until source or owner
evidence materially changes. After approved work, report any collected
before/after artifacts, relevant visual consequences, owner and consumer
changes, Storybook evidence, checks, and any remaining human decisions. Do not
invoke Compose automatically; the user may request another visual correction
pass afterward.
