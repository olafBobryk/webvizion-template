# Visual-parity handoff

Keep one short receipt beside the ordered matrix. `frame` records authority and
scope; `verify` replaces the measurement block after the current Target capture
without changing Source or capture conditions.

```markdown
Phase: frame | verify
Focus: section | page | shell | site
Target: <route, selector, or Storybook story>
Target identity: <current repository revision plus Target-capture SHA-256 when measured>
Effective scope / expansion: <owners inspected and why it changed>
Composition record: <docs/composition/<focus-slug>.md>
Active scope: <composition-record scope ID>
Source authority: <immutable Figma/export, pinned renderer, or none>
Comparison purpose: <source-parity | integration-parity | responsive-system-fit>
Integration baseline: <frozen realized Target capture and SHA-256, or not applicable>
Figma execution identity: <connector plus whoami result, or not applicable>
Isolated source working copy: <Agent Space page ID and cloned focus-node ID, or not applicable>
Product sources: <PRODUCT.md#product-sources or not applicable>
Declared terminal condition: <zero changed RGB pixels or explicit alternative>
Matrix: <.codex/visual-parity/<task>/matrix.json>

Mechanical assessment:
- Assessment: <.codex/visual-parity/<task>/assessment/summary.json>
- Captured Target identity: <revision and Target-capture SHA-256 at capture>
- Measurements: <case id → comparable, source/Target capture SHA-256, dimensions, total/changed/threshold-changed pixels, ratios, channel deltas>
- Artifacts: <case id → source, target, overlay, heatmap, side-by-side>

Evidence:
- Native implementation: <source/DOM evidence and flattened-reference check>
- Responsive evidence: <width → Target-only finding and artifact; never borrowed parity>
- Repository checks: <command → result>
- Human-review artifacts: <current captures and direct review location>
- Incompletion: <none | acknowledged blocker and best current evidence>

Approval: pending | approved | bypassed
```

Use a native route plus a section selector for section evidence. A Storybook
fixture proves only the fixture. A changed viewport, selector, state, DPR, font,
or motion setting is a new case, not an update to an existing result. A Target
code change invalidates only the affected prior measurements but always
invalidates the final full-page measurement.

A receipt used to update the composition record must use `Phase: verify`, match
its Target identity and assessment to the current implementation, and include
current native evidence. Treat a stale `frame` receipt, an absent required
block, or mismatched Target identity as unusable even when an older assessment
measured zero changed pixels. The active composition peer owns durable status
and interpretation; Compose owns lifecycle completion.
