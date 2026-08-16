# Visual-parity handoff

Keep one short receipt beside the ordered matrix. `frame` records authority and
scope; `verify` replaces the measurement block after the current Target capture
without changing Source or capture conditions.

```markdown
Phase: frame | verify
Focus: section | page | shell | site
Target: <route, selector, or Storybook story>
Target identity: <current repository revision plus dirty-worktree identity>
Effective scope / expansion: <owners inspected and why it changed>
Source authority: <immutable Figma/export, pinned renderer, or none>
Figma execution identity: <connector plus whoami result, or not applicable>
Isolated source working copy: <Agent Space page ID and cloned focus-node ID, or not applicable>
Source decomposition: <explicit nodes or metadata-derived bounds and matrix order>
Product sources: <PRODUCT.md#product-sources or not applicable>
Declared terminal condition: <zero changed RGB pixels or explicit alternative>
Matrix: <.codex/visual-parity/<task>/matrix.json>

Mechanical assessment:
- Assessment: <.codex/visual-parity/<task>/assessment/summary.json>
- Captured Target identity: <revision and dirty-worktree identity at capture>
- Measurements: <case id → comparable, dimensions, total/changed/threshold-changed pixels, ratios, channel deltas>
- Artifacts: <case id → source, target, overlay, heatmap, side-by-side>

Workflow interpretation:
- Case results: <case id → exact | unresolved | accepted-intentional | incomparable | native-invalid | system-fit>
- Approved exceptions: <none | declared nonzero differences and owner; forbidden for zero-diff>
- Native implementation: <source/DOM evidence and flattened-reference check>
- Responsive evidence: <width → system-fit finding and artifact; never borrowed parity>
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

A terminal receipt must use `Phase: verify`; match its Target identity and
assessment to the current implementation; and include current native evidence,
responsive evidence, repository checks, and human-review artifacts. Treat a
stale `frame` receipt, an absent required block, or mismatched Target identity as
unresolved even when an older assessment measured zero changed pixels.
