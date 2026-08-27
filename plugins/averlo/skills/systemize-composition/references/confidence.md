# Systemization confidence

Confidence answers one question: may this proposed shared-system change proceed
without another human ownership decision? It is categorical evidence, not a
numeric score and not a measure of how attractive the change seems.

## Evidence dimensions

Assess every proposal across all of these dimensions:

| Dimension | Required evidence |
| --- | --- |
| Source role | Complete purpose and visual signature, including relevant states and responsive behavior; independent recurrence is required when a new shared owner or compound is claimed. |
| Owner choice | Governing policy and Storybook evidence identify the owner whose semantic responsibility contains the role; a mismatching inherited visual recipe does not count as a competing owner. |
| API shape | The proposed import, props, variants, tokens, defaults, and compatibility behavior are source-neutral and fully specified. |
| Consumer reach | Current and generated-profile consumers are enumerated; possible behavioral and visual consequences are understood well enough to describe, including when their exact effect is uncertain. |
| Semantic behavior | Semantics, accessibility, interaction, loading, media, and responsive contracts affected by the change are known and preserved. |
| Instance provenance | The current owner is compared with the generated repository's initialization commit and path history; unchanged inherited scaffolding is distinguished from changed or newly added product work. |
| Proof | The relevant owner, consumer, repository, and Storybook checks are known; before/after captures remain optional descriptive evidence when useful. |

Confidence is the lowest supported dimension. Strong evidence in one dimension
cannot compensate for missing evidence in another.

Treat independently reviewable sections, shell regions, states, and consumers
as independent scopes even when they share one route. Evidence concentrated in
one page may prevent automatic acceptance, but it does not make a repeated role
invisible or justify omitting a non-automatic central migration.

## Classification

### High

Every dimension is complete, no veto below applies, and the proposed action can
be implemented without another product or ownership choice. High confidence
authorizes an isolated automatic attempt, not acceptance in advance. Applicable
contracts must still pass, but visual preservation is not assumed and a pixel
difference is not an ownership-confidence verdict.

Action-specific evidence includes:

- **Reuse:** purpose, semantics, behavior, and full visual signature match one
  already-supported owner/API.
- **Extension:** the existing owner domain is unambiguous; the addition is
  source-neutral and non-duplicative; affected consumers opt in or have fully
  evidenced compatibility; exhaustive owner teaching evidence is defined.
- **Default replacement:** the accepted source evidences the canonical instance
  role for that owner; the current recipe is inherited scaffolding rather than a
  conflicting prior product decision; every affected default consumer is known.
- **New owner:** the role recurs across independent scopes or consumers; no
  existing owner or composition covers it; its responsibility and minimal API
  are coherent without product, route, section, brand, or source naming.
- **Compound:** constituent atoms are first assigned to their lowest coherent
  owners; the repeated relationship adds source-neutral layout or behavior; one
  user action remains one interactive root rather than duplicated controls. A
  relationship-owned multi-segment layout stays above the constituent primitive
  instead of becoming an oversized primitive variant.
- **Merge-retire:** observable contracts are equivalent or compatibly
  migratable; one survivor is unambiguous; every consumer and removal edge is
  known.
- **Token/default:** the source is authoritative for that exact global axis;
  every affected consumer and generated profile is known; adjacent axes are not
  silently conflated with the proposed ownership decision. Repetition across
  independent scopes must still be recommended for human review when one-page
  evidence is insufficient for automatic global acceptance.

### Medium

The likely direction is useful, but at least one dimension requires a human
choice. Typical causes are two plausible owners, uncertain instance-versus-
shared scope, a changed-since-initialization owner with uncertain prior product
intent, a new public axis with incomplete consumer intent, or a source that
evidences the visual value but not the behavioral or responsive contract.
Recommend one concrete owner/default/variant/token/compound migration, including
the recipes it would retire, and wait before editing the unresolved boundary.

### Low

Authority conflicts, hidden states are unavailable, consumer reach is unknown,
the proposal is contextual rather than source-neutral, required behavior would
be weakened, or required contract proof is unavailable. Preserve the local
implementation, report the conflict, and state the concrete migration that
would become appropriate if the conflict were resolved. Do not use low
confidence to avoid an existing owner-domain match merely because its inherited
visual recipe differs.

## Automatic-action vetoes

The following always prevent automatic acceptance:

- multiple plausible canonical owners remain;
- product or instance meaning is being mistaken for a reusable variant;
- a changed or newly added owner may contain conflicting prior product work and
  that intent has not been resolved from current evidence or human direction;
- source evidence does not cover an affected semantic, behavioral, responsive,
  loading, or media contract;
- affected consumers have not been enumerated;
- a public rename or breaking migration lacks a complete compatibility plan;
- required owner, catalogue, profile, or accessibility checks fail.

When a veto appears during an automatic attempt, restore that attempt and route
the proposal to human review.
