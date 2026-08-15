# Design-System Agent Benchmark

This procedure measures whether a design-system-assisted agent can build a
small application page through supported Storybook owners without creating new
component APIs or bypassing structural policy. It is an implementation-quality
experiment, not product work.

## Scenario registry

### `account-settings-v1`

Use a disposable, unlinked noindex route under `/internal/testing/<change>/`.
Delete that temporary route with the benchmark worktree after review. The
agent builds an Account Settings page with a brief loading skeleton, full name,
email, phone, time-zone, and notification-preference controls; a real validated
form; a duplicate-safe local async save using the shared promise-toast facade;
and a destructive action using the shared confirmation modal. It must not make
external state changes.

The task prompt, scenario id, and prompt revision stay fixed between runs. A
revision creates a new scenario id rather than silently changing the benchmark.

### `filter-dashboard-v1`

Use a disposable, unlinked noindex internal page for filtering a local report
list. It must exercise date-range, single-select, and multi-select filter
owners; a component-owned loading state; a Card footer action group for Apply
and Clear; shared async feedback; and a local confirmation-only bulk action.
It must not fetch, mutate, or persist data.

### `member-access-v1`

Use a disposable, unlinked noindex internal page for reviewing access against a
small in-memory organization-member fixture. The page must show an initial
loading state, repeated member identity, email, role, and access status; assign
a local review owner through the repository's entity selector; and perform a
local-only revoke action through shared confirmation and promise-toast
feedback. It must not fetch, persist, or externally mutate data.

This scenario deliberately separates fixture ownership from presentation
ownership. The agent must map the repository's entity contracts before
implementation, convert fixture records through the owning presentation
factory, and reuse the owning identity renderer and skeleton. Repeated
page-local avatar, name, or email markup is not production-grade entity
coverage. If an owner is absent or unusable under the no-new-shared-API
constraint, the agent must report that scope limitation instead of inventing a
parallel renderer.

## Run procedure

1. Create a clean disposable worktree at the recorded base commit. Do not link
   or read local environment files, deploy, or copy the page back to the source
   checkout.
2. Give one subagent the fixed prompt and require the design-system evidence
   order: local policy, owner stories/contracts, public facades, then minimal
   implementation source only when needed. Record evidence receipt paths and
   inspected Storybook owner IDs in its handoff.
3. Review the diff using the design-system audit checklist. Smoke test keyboard
   focus, inline validation, duplicate-save protection, toast feedback,
   confirmation behavior, skeleton non-interactivity, and responsive layout.
4. Run lint, typecheck, and build. Discard the worktree and page after review.
5. Append one JSON object to
   `design-system-agent-benchmark-runs.jsonl` and run
   `npm run generate:design-system-agent-benchmark-report`, followed by
   `npm run verify:design-system-agent-benchmark`.

The companion [human-readable run view](./design-system-agent-benchmark-runs.md)
is generated from the JSONL record and checked for drift by the verifier.

## Scoring

Score each category from 0 to 2: evidence discipline, component reuse,
structural compliance, accessibility and interaction, and verification and
minimality. A hard-gate breach overrides the numeric score.

| Classification | Requirement                     |
| -------------- | ------------------------------- |
| `good`         | 9–10/10 and no hard-gate breach |
| `acceptable`   | 7–8/10 and no hard-gate breach  |
| `needs-work`   | 0–6/10, or any hard-gate breach |

Hard gates are documented public imports and props, preserved component/source
topology, reuse of an existing owning entity renderer instead of a parallel
page-local renderer, keyboard and form semantics, and passing lint, typecheck,
and build.

Compare progress with the verifier's rolling median and hard-gate failure rate;
do not use one qualitative run as a trend.
