---
name: systemize-composition
description: Analyze an accepted local composition, review its local renderer boundaries, and migrate well-supported visual roles into the generated Averlo instance's shared design-system owners while accounting for possible visual effects across consumers. Use explicitly after visual review when local boundaries or fidelity recipes should be split, reused, extended, promoted, merged, retired, or deliberately kept local; do not build the source composition itself.
---

# Averlo · Systemize Composition

Turn a human-accepted visual realization into a more coherent instance design
system without treating the agent's ownership judgment as unquestionable.
Explicit invocation authorizes analysis and high-confidence automatic work; it
does not authorize unresolved medium- or low-confidence shared changes.

In a generated instance, inherited template visuals are replaceable scaffolding,
not product design authority. A complete inherited Storybook contract proves the
owner's responsibility and current API; it does not make that owner's visual
recipe a fidelity constraint. Accepted source evidence should move matching
roles toward their central instance owners while previously systemized product
work remains protected.

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
2. Establish owner provenance from the generated repository itself. Find its
   reachable initialization commit, compare each candidate owner's initial tree
   with the current committed and working-tree state, and inspect that path's
   history. Never create a fresh template for this comparison. An unchanged
   owner is inherited scaffolding. A changed or newly added owner may contain
   prior product systemization; inspect its current code, Storybook contract,
   consumers, history, and applicable human decisions before recommending an
   overwrite. If initialization history is missing or ambiguous, report
   provenance uncertainty and route the concrete proposal to human review.
   Do not add provenance comments, annotations, or another ledger.
3. Inventory candidates before deciding whether before/after evidence is useful.
   Plan-only analysis does not require capture work. When a selected migration
   benefits from `integration-parity` evidence, use the linked
   `$averlo:visual-parity` only for its relevant scopes and treat the resulting
   measurements as descriptive, temporary evidence rather than product source
   authority or a durable page copy.
   A plan-only or explicitly non-automatic invocation recommends candidates at
   every confidence level but applies none.
4. Invoke the linked `$averlo:repository-workflows` once for the complete
   change unit. Select every applicable UI ownership, catalogue, composition,
   marketing/shell, media, route, and interaction workflow and load their
   concern union once.

## Inventory and route ownership

1. Inventory local typography signatures, controls, links, identity and
   contextual marks, media treatments, shell and footer presentation, repeated
   layout roles, tokens, defaults, and temporary visual wrappers. Account for
   every domain in the final audit as a migration candidate, already-correct
   ownership, genuinely contextual work, or insufficient evidence. Do not
   silently omit a domain merely because its candidates are not automatic.
2. Decompose each candidate before assigning ownership:
   - identify semantic, interactive, visual, and token-level atoms;
   - route each atom to the lowest existing owner whose responsibility contains
     that role;
   - then inspect whether a repeated relationship among those atoms owns a
     coherent source-neutral compound, layout, or behavior.
   An existing owner-domain match must resolve through reuse, extension, default
   replacement, or merge-retire in that owner. A mismatching inherited visual
   recipe is a replacement candidate, not justification for leaving overlapping
   work local or inventing a parallel primitive.
   Independently reviewable sections, shell regions, states, or consumers count
   as independent scopes even when they belong to one page. Route concentration
   may lower confidence, but it cannot erase a repeated candidate or its central
   migration recommendation.
3. Choose the migration shape deliberately. Replace an inherited default when
   the accepted source evidences the canonical instance role; add an opt-in
   variant for an additional repeated role; promote a token only for its exact
   repeated cross-owner axis; and propose a compound owner only when the
   relationship adds coherent responsibility beyond its constituent owners.
   Keep source copy, one-off geometry, contextual assets, and choreography local
   unless they independently satisfy shared ownership.
4. Preserve interaction semantics while decomposing visual compounds. One user
   action remains one interactive root and one tab stop even when it has several
   Button-owned visual segments. A repeated segmented action may gain a shared
   source-neutral compound above those roles. When the relationship owns the
   multi-segment layout, do not hide that responsibility inside the primitive's
   variant axis: migrate each action segment through Button, then let the higher
   compound compose them without adding a second interactive root. Evaluate the
   inherited primary Button recipe and the higher compound as separate migration
   candidates. Do not substitute an icon-only action owner for a labelled primary
   action merely because both contain the same directional symbol, and do not
   render duplicate controls for one action.
5. Also inspect whether an accepted registered renderer groups multiple coherent
   semantic or interaction roles that could be split or merged. Such grouping is
   not retroactively a Compose failure when it formed one honest source/parity
   case. Compare each candidate with governing policy, documented Storybook
   owners, complete public signatures, current consumers, provenance, and prior
   human decisions in `docs/design-system/decisions/` when they exist.
6. Apply the same axis discipline to foundations. Compare every repeated full
   typography signature and purpose with all `Text` values; recommend an existing
   value, inherited-default replacement, or source-neutral opt-in variant instead
   of deferring the entire question to font ownership. Inspect repeated Section
   axes independently so global horizontal gutters do not absorb local vertical
   rhythm or max width. Surface repeated colors, radii, and spacing across
   independent scopes as token/default candidates even when their page-level
   reach keeps them non-automatic.
7. For each candidate, state the source evidence, current local recipe,
   inherited-versus-prior-product evidence, plausible owners reviewed,
   recommended owner/default/variant/token/compound action, affected consumers,
   public API impact, responsive/behavioral evidence, superseded inherited and
   local recipes to retire, unresolved conflict or human decision, and required
   proof.
   When relevant, explain that its visual effect may be render-preserving,
   intentionally changing, uncertain, or different between consumers. This is
   contextual awareness, not a visual-effect status, schema, or acceptance
   strategy. Do not assume either preservation or change merely because a role
   becomes shared.
8. Classify the proposal as `high`, `medium`, or `low` using the confidence
   router. Action names never determine confidence by themselves: reuse,
   extension, new ownership, compounds, merge-retire, and token/default changes
   all require evidence proportional to their architectural reach.
9. Classify a renderer or section-boundary split/merge as `medium` by default.
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
  concrete central migration, alternatives considered, owners and recipes it
  would replace or retire, the missing decision, and expected consumer impact
  for human direction.
- **Low confidence:** preserve the current local boundary while reporting the
  source or ownership conflict and the concrete migration that would follow if
  that conflict were resolved. Do not invent an owner merely to eliminate a
  genuinely contextual local recipe. Existing owner overlap cannot resolve as
  local solely because the inherited owner currently looks different.

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
