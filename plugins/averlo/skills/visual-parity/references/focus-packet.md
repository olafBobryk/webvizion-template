# Visual-parity focus packet

Keep one short ignored receipt beside the ordered matrix. `frame` records the
pinned authority and capture scope; `verify` replaces only the current
measurement block after the Target capture. Store it at
`.codex/visual-parity/<task>/focus.md`.

```markdown
Phase: frame | verify
Workflow owner: compose | systemize-composition | animate | direct-review
Thread identity: <current Codex session/thread ID or not applicable>
Focus: section | page | shell | site | component
Target: <route, selector, or Storybook story>
Target identity: <repository revision or dirty identity plus capture SHA-256>
Source authority: <immutable Figma/export, frozen accepted Target, or none>
Authority boundaries: <included regions and excluded region → retained authority>
Authority equivalence: <case ID → source included bounds/crop ↔ Target selector/bounds; excluded pixels absent from both>
Authority locks: <preserved header, unchanged shared design-system owners, and allowed local/shell boundaries>
Comparison purpose: <source-parity | integration-parity | responsive-system-fit | static-endpoint>
Integration/static baseline: <pinned capture plus SHA-256, or not applicable>
Figma execution identity: <connector plus whoami, or not applicable>
Agent Space: <reused generic file/page and scratch node, or not used>
Product sources: <PRODUCT.md#product-sources or not applicable>
Review checkpoint: <owning workflow's current task-local checkpoint>
Active case: <case ID → exact source frame node/bounds → stable reference PNG → Target selector, or none>
Content cases: <case ID → exact source frame node/bounds → stable reference PNG → semantic landmark → block type → registered renderer → Target selector>
Shell cases: <case ID → exact source frame node/bounds → stable reference PNG → shell owner → Target selector>
Excluded regions: <source region → retained Target authority>
Accumulated gate: <case ID → included content and shell cases → Target selector or crop>
Cases in order: <case IDs and scope labels>
Matrix: <.codex/visual-parity/<task>/matrix.json>
Section boundary: <none | closed case ID>
Next case: <case ID | none>
Continuation token: <unique token | none>

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

The owning workflow writes `pending` when it creates or refreshes the current
checkpoint. Use `accepted` or `continue-requested` only after the user explicitly
provides that response; an agent must not infer either state from reaching or
reporting a checkpoint.

`Section boundary`, `Next case`, and `Continuation token` are optional Compose
recovery fields. Populate them only after the active case has closed and another
ordered case is ready. They authorize one automatic continuation for the same
thread. Clear the consumed boundary by making the named next case active. They
are not lifecycle status, a workflow ledger, or evidence that `/compact` ran.

Use a native route plus a stable selector for section evidence. A Storybook
fixture proves only that fixture. A changed viewport, selector, state, DPR,
font, or motion setting is a new case. Any Target code change invalidates the
full-page measurement and every affected scoped measurement.

When an owning workflow deliberately excludes a source region, crop or select
both sides to the same included authority boundary. Report the result as parity
for that declared boundary, never for the untouched whole frame. Preserve the
normal human-review URL separately from any automation-only review state.
For an accumulated gate, record the source crop and Target selector plus their
rendered bounds. A full source frame is invalid when the Target automation state
hides an excluded source region, even if the resulting images are mechanically
equal-size. Verify region membership and order, not dimensions alone.
When a fixed or overlapping excluded region can paint over a selected Target
element, the matrix Target URL must activate the repository's automation-only
review state. A DOM selector alone is not evidence that the excluded pixels are
absent; inspect the captured Target and classify it as incomparable if they
remain visible.

A current receipt must use `Phase: verify`, match its Target identity and
assessment to the current implementation, and include native evidence. The
owning workflow interprets these facts and decides its next human checkpoint.
The checkpoint, decomposition, and authority locks are recovery evidence for
the current ignored task packet, not lifecycle status or a durable workflow
record.
