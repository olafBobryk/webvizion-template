# Visual-parity focus packet

Keep one short ignored receipt beside the ordered matrix. `frame` records the
pinned authority and capture scope; `verify` replaces only the current
measurement block after the Target capture.

```markdown
Phase: frame | verify
Workflow owner: compose | systemize-composition | animate | direct-review
Focus: section | page | shell | site | component
Target: <route, selector, or Storybook story>
Target identity: <repository revision or dirty identity plus capture SHA-256>
Source authority: <immutable Figma/export, frozen accepted Target, or none>
Authority boundaries: <included regions and excluded region → retained authority>
Authority locks: <preserved header, unchanged shared design-system owners, and allowed local/shell boundaries>
Comparison purpose: <source-parity | integration-parity | responsive-system-fit | static-endpoint>
Integration/static baseline: <pinned capture plus SHA-256, or not applicable>
Figma execution identity: <connector plus whoami, or not applicable>
Isolated source working copy: <Agent Space page and focus node, or not applicable>
Product sources: <PRODUCT.md#product-sources or not applicable>
Review checkpoint: <owning workflow's current task-local checkpoint>
Source decomposition: <case ID → source node/bounds → semantic landmark → block type or shell boundary → Target selector>
Cases in order: <case IDs and scope labels>
Matrix: <.codex/visual-parity/<task>/matrix.json>

Mechanical assessment:
- Assessment: <.codex/visual-parity/<task>/assessment/summary.json>
- Captured Target identity: <revision and capture SHA-256>
- Measurements: <case → comparable, source/Target SHA-256, dimensions, changed pixels, ratios, channel deltas>
- Artifacts: <case → source, target, overlay, heatmap, side-by-side>

Evidence:
- Native implementation: <route source, rendered DOM, constituent media, and flattened-reference check>
- Responsive evidence: <width → Target-only finding and artifact>
- Repository checks: <command → result>
- Human-review artifacts: <current captures and direct review URL>
- Incompletion: <none | external/capture blocker and best current evidence>

Human review: pending | accepted | continue-requested
```

Use a native route plus a stable selector for section evidence. A Storybook
fixture proves only that fixture. A changed viewport, selector, state, DPR,
font, or motion setting is a new case. Any Target code change invalidates the
full-page measurement and every affected scoped measurement.

When an owning workflow deliberately excludes a source region, crop or select
both sides to the same included authority boundary. Report the result as parity
for that declared boundary, never for the untouched whole frame. Preserve the
normal human-review URL separately from any automation-only review state.

A current receipt must use `Phase: verify`, match its Target identity and
assessment to the current implementation, and include native evidence. The
owning workflow interprets these facts and decides its next human checkpoint.
The checkpoint, decomposition, and authority locks are recovery evidence for
the current ignored task packet, not lifecycle status or a durable workflow
record.
