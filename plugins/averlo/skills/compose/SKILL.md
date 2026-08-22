---
name: compose
description: Orchestrate a source-backed section, page, shell, or site through native realization, render-preserving design-system integration, exact visual convergence, and optional motion in a generated Averlo instance. Use for ordinary Figma-to-code composition requests, complete static ports, or full static-plus-motion delivery; do not implement a plane directly.
---

# Averlo · Compose

Own one composition lifecycle while loading only the peer skill for the active
plane. Compose owns orchestration, the durable record lifecycle, and the one
runtime goal. It never calls Figma, edits product code, interprets comparison
metrics, or duplicates a peer skill's implementation rules.

## Establish the lifecycle

1. Require a schema-v2 `.template-profile.json` receipt. Resolve the durable
   `docs/composition/<focus-slug>.md` path and read
   [the composition-record contract](references/composition-record.md).
2. Default the Terminal plane to `composition-convergence`. Select
   `motion-composition` only when the caller explicitly requests motion or
   animation. A request to build, port, or match a static Figma surface does not
   imply motion.
3. Create the record immediately when absent and link it from `docs/README.md`
   under `## Composition records`. Reuse it across tasks and corrections.
   Upgrade a legacy record in place: map `Current pass` to Active plane, map its
   realization handoff to Plane handoffs, preserve all source/progress/owner
   evidence, add Integration parity, and remove the retired workflow name from
   goal or next-action prose. Never create a second record.
4. Call `get_goal`. Reuse a compatible active goal for this record and Terminal
   plane. When none exists, call `create_goal` with:

   ```text
   Invoke $averlo:compose to continue <record-path> through <terminal-plane> using the peer-plane handoffs and terminal conditions.
   ```

   Omit `token_budget` unless the caller explicitly supplied one. Never create
   child goals or copy the record schema into the objective. A goal is runtime
   continuation only; the committed record remains durable truth.
5. If a prior compatible goal ended blocked, recheck the recorded blocker. When
   it is genuinely cleared, create the replacement goal before invoking a peer
   skill or editing the Target. If it remains, update the record without
   inventing progress.

## Route one active plane

Invoke exactly one peer composition skill per continuation:

1. `$averlo:composition-realization` while its handoff is not `ready`.
2. `$averlo:composition-system-integration` after realization and while its
   handoff is not `ready`.
3. `$averlo:composition-convergence` after integration and while its handoff is
   not `exact`.
4. Pause for human approval after exact static convergence. Invoke
   `$averlo:motion-composition` only when Terminal plane is motion and approval
   is recorded or explicitly bypassed.

Pass the same record and compatible active goal to the peer. A peer invoked by
Compose must not create, complete, or block a competing goal. After the peer
updates its handoff, return control to Compose and select the next incomplete
plane. Do not stop at a ready intermediate handoff when the Terminal plane is
later.

Convergence may discover a repeated or owner-overlapping role missing from the
integration census. In that case it records the exact owner gap, sets System
integration handoff back to `pending`, and returns to Compose. Compose reruns
System Integration for a render-preserving migration before resuming
Convergence.

## Finish honestly

Leave the goal active while an actionable plane is `pending`, `active`,
`waiting`, or has an improving nonzero measurement. Call `update_goal` with
`blocked` only when the record is blocked under the owning peer's rules and no
actionable work remains.

For a static Terminal plane, call `update_goal` with `complete` only when
Convergence handoff is `exact`, every source-backed scope and full-page gate is
current at `changedPixels: 0`, responsive evidence is current, and required
repository and human-review evidence is recorded. For motion delivery, also
require Motion handoff `complete`. Report token usage returned by the goal tool
when the caller supplied a budget.
