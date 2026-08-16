# Visual-parity handoff

Keep one short receipt beside the matrix. Update it after `verify`; do not
replace the source, target, or capture conditions mid-loop.

```markdown
Phase: frame | verify
Focus: section | page | shell | site
Target: <route, selector, or Storybook story>
Effective scope / expansion: <owners inspected and why it changed>
Source authority: <immutable Figma/export, pinned renderer, or none>
Product sources: <PRODUCT.md#product-sources or not applicable>
Matrix: <.codex/visual-parity/<task>/matrix.json>
Assessment: <.codex/visual-parity/<task>/assessment/summary.json>
Case verdicts: <case id → exact | accepted-intentional | residual | failed | incomparable | system-fit>
Intentional residuals: <none | declared differences and owner>
Native implementation: <source/DOM evidence and flattened-reference check>
Responsive evidence: <width → system-fit finding and artifact; never borrowed parity>
Approval: pending | approved | bypassed
```

Use a native route plus a section selector for section evidence. A Storybook
fixture proves only the fixture. A changed viewport, selector, state, DPR, font,
or motion setting is a new case, not an update to an existing verdict.
