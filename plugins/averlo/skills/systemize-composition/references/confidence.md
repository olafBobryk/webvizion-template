# Systemization confidence

Confidence answers one question: may this proposed shared-system change proceed
without another human ownership decision? It is categorical evidence, not a
numeric score and not a measure of how attractive the change seems.

## Evidence dimensions

Assess every proposal across all of these dimensions:

| Dimension | Required evidence |
| --- | --- |
| Source role | Complete purpose and visual signature, including relevant states, responsive behavior, and independent recurrence when reuse is claimed. |
| Owner choice | Governing policy and Storybook evidence identify one coherent owner; plausible competing owners have evidence-based rejection. |
| API shape | The proposed import, props, variants, tokens, defaults, and compatibility behavior are source-neutral and fully specified. |
| Consumer reach | Current and generated-profile consumers are enumerated; unrelated behavior or appearance is not silently changed. |
| Semantic behavior | Semantics, accessibility, interaction, loading, media, and responsive contracts affected by the change are known and preserved. |
| Proof | Affected scopes can be captured deterministically, compared with their frozen target-before images, and checked through the relevant repository and Storybook verifiers. |

Confidence is the lowest supported dimension. Strong evidence in one dimension
cannot compensate for missing evidence in another.

## Classification

### High

Every dimension is complete, no veto below applies, and the proposed action can
be implemented without another product or ownership choice. High confidence
authorizes an isolated automatic attempt, not acceptance in advance. Acceptance
still requires zero changed target-to-target pixels and passing contracts.

Action-specific evidence includes:

- **Reuse:** purpose, semantics, behavior, and full visual signature match one
  already-supported owner/API.
- **Extension:** the existing owner domain is unambiguous; the addition is
  source-neutral and non-duplicative; affected consumers opt in or have fully
  evidenced compatibility; exhaustive owner teaching evidence is defined.
- **New owner:** the role recurs across independent scopes or consumers; no
  existing owner or composition covers it; its responsibility and minimal API
  are coherent without product, route, section, brand, or source naming.
- **Merge-retire:** observable contracts are equivalent or compatibly
  migratable; one survivor is unambiguous; every consumer and removal edge is
  known.
- **Token/default:** the source is authoritative for that exact global axis;
  every affected consumer and generated profile is in the evidence boundary;
  adjacent unevidenced axes remain unchanged.

### Medium

The likely direction is useful, but at least one dimension requires a human
choice. Typical causes are two plausible owners, uncertain instance-versus-
shared scope, a new public axis with incomplete consumer intent, or a source
that evidences the visual value but not the behavioral or responsive contract.
Recommend one concrete path and wait before editing the unresolved boundary.

### Low

Authority conflicts, hidden states are unavailable, consumer reach is unknown,
the proposal is contextual rather than source-neutral, required behavior would
be weakened, or deterministic render-preserving proof is unavailable. Preserve
the local implementation and report the conflict.

## Automatic-action vetoes

The following always prevent automatic acceptance:

- multiple plausible canonical owners remain;
- product or instance meaning is being mistaken for a reusable variant;
- source evidence does not cover an affected semantic, behavioral, responsive,
  loading, or media contract;
- unrelated consumers would change without explicit evidence;
- a public rename or breaking migration lacks a complete compatibility plan;
- the target-before capture is stale, incomparable, or not native;
- any affected target-before/target-after case is nonzero;
- required owner, catalogue, profile, or accessibility checks fail.

When a veto appears during an automatic attempt, restore that attempt and route
the proposal to human review.
