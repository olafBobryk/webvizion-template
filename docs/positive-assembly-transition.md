# Positive Assembly Transition

## Status

The transition completed on 2026-07-29. Positive assembly is the only project
creation model on the current branch. Users choose a route profile and a
supported content capability; there is no engine or post-creation prune choice.

The migration was preserved in independently verified commits:

- `5b5a3d7`: final pre-migration prune oracle and code-clarity baseline;
- `146bfc2`: assembly-owned project state and generated-file renderers;
- `ab04dd1`: positive static versus Payload-ready selection; and
- `315a5a1`: assembly-only project creation with schema-v2 receipts.

## Current contract

1. `create:project` positively selects a route profile and content capability.
2. Static output retains fallback content while never including Payload.
3. Payload-ready output includes the guarded scaffold without exposing live CMS
   routes until activation.
4. Generated projects contain project code and an immutable receipt, not
   template profiles, assembly inventories, or creation machinery.
5. Path, documentation, package, script, surface, and generated-file ownership
   fail closed when unclassified.
6. Marketing components continue to consume source-neutral page, layout, and
   section models.

## Verification evidence

Every migration stage was compared against the immutable prune implementation
at `5b5a3d754068671fffe001f08b55464e1e93433e` from a detached worktree.

The parity matrix covered:

- full / Payload-ready;
- full / static, compared with legacy full plus `--no-payload`;
- app-only / static;
- marketing-only / Payload-ready;
- marketing-only / static, compared with legacy marketing-only plus
  `--no-payload`;
- thin-start / Payload-ready; and
- thin-start / static, compared with legacy thin-start plus `--no-payload`.

The comparator checked runtime source inventory and content, dependencies,
development dependencies, scripts, generated configuration, required paths,
forbidden paths, and omission of template machinery.

All seven positive outputs passed materialization. The complete integration
matrix additionally passed clean install, static verification, production
build, strict thin-start API review where applicable, and route smoke checks.

Two durable ignored acceptance projects were also created without manual source
recovery:

- `.template-instances/acceptance-full-static`;
- `.template-instances/acceptance-full-payload-ready`.

Both schema-v2 receipts record profile `full` and their respective content
mode. Both projects passed `npm ci`, `npm run verify:static`, `npm run build`,
and `npm run verify:smoke` on 2026-07-29.

## Payload and fallback boundary

The transition did not redesign marketing content. Static and Payload-ready
projects retain the existing `MarketingPageDocument`, `SiteLayoutDocument`,
section layout, resolver, renderer, and fallback contracts. Payload activation
must normalize CMS data into those contracts and keep fallback content until
migration and readback are proven.

## Legacy recovery

Prune remains recoverable from the immutable
`checkpoint/profile-prune-v1` tag and the matching remote
`origin/codex/template-profile-modes` branch, both resolving to
`96248e8a4a1ddbfe3dcb17ffad82322af220ad26`.

Existing initialized projects that retained prune may maintain it at their
pinned revision. Current project creation and documentation must not restore
negative prune flags or mix legacy manifests into positive assembly.
