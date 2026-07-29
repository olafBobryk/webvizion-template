# Inference Console Port Handoff

## Objective

Port the accepted reusable architecture from pinned Inference Console commit
`8a13d12ea11461fe204625bd1247a6db16c4a207` into both Averlo template profiles.
Full start becomes a polished organization-first reference product; thin start
shares its visual foundation through filesystem-backed materialization.

## Working state

- Canonical checkout:
  `/Users/olafbobryk/Documents/Code/Personal/2025/averlo-next-template`
- The superseded shared-checkout task is archived; its former app-managed
  worktree is no longer part of the active handoff.
- Final branch state: local `main`, `codex/inference-port`, and
  `codex/input-frame-parity-pilot` point to the same verified closeout tip.
- Baseline: `50616826610a9acded69625133e476694cdf3358`
- Source: `/Users/olafbobryk/Documents/Code/Mazi/2026/inference-console`
- Source policy: use `git show` or `git archive` at the pinned commit; never read
  implementation input from its dirty working tree.
- Mutation behavior reference: committed delta through
  `1c6208b37fabb4666c142490608f45662013b0f7`; this does not repin the visual
  baseline or authorize product-specific consumers.
- Full preview: restart/verify with `npm run dev:agent -- --random` before review.
- Thin preview: restart/verify with `npm run dev:thin -- --random` before review.
- Worktree policy: retain through both visual gates. Do not merge, push, or
  remove it without explicit direction.

## Product spine

Reusable full/thin template parity plus a product-ready, organization-powered
full-start dashboard.

## Delivery order

1. P1-C1 — profile engine and Panel/Card reconciliation.
2. P1-C2 — shared visual system and component convergence; visual gate 1.
3. P1-C3 — provider-neutral auth and organization lifecycle.
4. P1-C4 — dashboard shell, registry, commands, and debug state.
5. P1-C5 — reference entities, policy, surface removal, skill, and visual gate 2.

One verified commit closes each chunk. P1-C1 through P1-C4 are closed; P1-C5 is
complete and its closing commit follows this handoff update.

## P1-C1 state

- Status: complete in commit `6cb2c99`.
- Main baseline was committed cleanly as `5061682` before worktree creation.
- `template-profiles/thin-start/manifest.mjs` is authoritative for profile
  files, removals, package changes, route/script retention, API review, and
  verification.
- Former embedded component bodies are normal files beneath
  `template-profiles/thin-start/overrides/`.
- `create:thin-start` defaults to `.thin-start/workspace`, supports `--output`,
  and retains guarded `--in-place --confirm-instance` activation.
- `review:thin-start-api -- --root <workspace> --strict` reads the manifest.
- `dev:thin -- --random` refreshes the same profile before starting its isolated
  server.
- Full and thin share canonical `Panel` and `Card`. `Card` is implemented on
  `Panel`; unstructured surfaces and overlay roots use `Panel`.
- Thin Sonner toast remains an explicit file-backed override.

## P1-C2 state

- Status: complete; the closing commit immediately follows this handoff update.
- The pinned light/dark token, focus, motion, radius, status, spectrum, sidebar,
  and scrollbar grammar is installed with Inter through `next/font/google`.
- Shared primitives retain stronger template APIs while matching the source
  surface system. Button loading remains position-absolute and skeletons live
  on their owning component namespaces.
- `ModalForm`, `ModalStepForm`, `StepIndicator`, structured confirmation,
  DateInput, generic DateRange contracts, selection interception, file/profile
  lifecycle cleanup, More-menu factories, and NullState are implemented.
- The existing Markdown renderer remains shared. MDXEditor, source mode,
  mentions, modal editing, and color inputs are full-start only.
- Thin materialization removes editor/color source, CSS, dependency, and lockfile
  records while retaining shared Panel/Card and the common visual foundation.
- Both profiles pass typecheck, production build, smoke verification, and the
  strict thin API review. Responsive light/dark review passed for the full demo
  and the thin home/contact/internal-intelligence route matrix.
- Verified previews at chunk closure:
  `http://localhost:3037/internal/demo?motion=off&reveal=off` (full) and
  `http://localhost:3034?motion=off&reveal=off` (thin).

## P1-C3 state

- Status: complete; the closing commit immediately follows this handoff update.
- User-facing auth routes remain top-level inside the shared auth layout, while
  the technical callback is `/auth/callback`.
- Provider-neutral auth, organization, membership, invitation, identity, and
  private-file contracts are documented in `docs/auth-organization-adapters.md`.
- The default fixture uses opaque HttpOnly server-memory sessions and clearly
  labels its non-durable behavior. Deterministic singleton, multi-org, and
  invitation accounts cover the product lifecycle without recommending fixture
  storage for a real instance.
- Dashboard requests resolve session and organization context server-side. One
  membership auto-selects, multiple memberships require
  `/select-organization`, revoked selections are invalidated, and logout deletes
  the selected session.
- Invitation GET is inert; explicit acceptance validates token, recipient,
  organization, expiry, revocation, and reuse before the atomic fixture
  membership transition. Reinvite invalidation and final viable identity
  protection are verified.
- The full profile passes focused auth verification, typecheck, 34-route build,
  smoke, and live cookie/redirect checks. Thin materialization excludes the
  complete auth/dashboard runtime and passes strict API review, typecheck,
  9-route build, and smoke.
- Current full review URLs:
  `http://localhost:3037/login?motion=off&reveal=off` and
  `http://localhost:3037/invitation?invitation=00000000-0000-4000-8000-000000000001&token=fixture-invitation-token&motion=off&reveal=off`.

## P1-C4 state

- Status: complete; the closing commit immediately follows this handoff update.
- The dashboard owns one typed surface registry for route identity, hierarchy,
  sidebar groups, breadcrumbs, layout width, capabilities, and static commands.
- The fixed responsive shell closely follows the pinned source visual system
  without its notification stack or custom profile-gradient treatment. The
  mobile rail/drawer, desktop collapsed state, page headers, breadcrumbs,
  account menu, route skeletons, and wide-layout escape hatch share this shell.
- `/dashboard`, records list/detail, settings, organization overview, members,
  and organization settings are implemented. Legacy `/dashboard/pages` source
  ownership and duplicate marketing-registry dashboard routes are removed.
- Command-K merges static registry actions with mounted contextual actions and
  removes registrations on unmount. Capability-hidden commands are filtered by
  the same registry access rules as navigation.
- Guarded debug controls expose deterministic loading, empty, error,
  unavailable, and not-found states, fixture reset, capability inspection, demo
  entry, and multi-organization selection. Forced loading overlays the real
  content frame without resizing it.
- `verify:dashboard`, contextual registration cleanup, no-resize geometry,
  responsive light/dark review, full 38-route build/smoke, and thin 10-route
  build/smoke all pass. Thin materialization excludes dashboard and debug
  ownership through the shared manifest.
- The verified full preview is
  `http://localhost:3037/dashboard?motion=off&reveal=off`; use the fixture demo
  action on `/login` when the in-memory session has restarted.

## P1-C5 state

- Status: complete; the closing commit immediately follows this handoff update.
- Dashboard-owned contracts are split into domain facts, React-free/fetch-free
  presentation factories, route/adapter fixtures, lifecycle definitions, and
  entity-owned renderers. There is no global presentation registry.
- Reference users remain global identities while reference members add
  organization, role, and joined-at facts. Member profile, compact, actor,
  avatar/list, selector, mention, table, detail, Command-K, empty, and skeleton
  surfaces consume one presentation model.
- Organization-scoped reference records cover sortable tables, detail fields,
  property lists, shared Markdown rendering, full-only modal MDX editing,
  mentions, More-menu actions, create/edit/archive/delete, optimistic rollback,
  deterministic failure mode, and resettable non-durable fixture CRUD.
- `docs/frontend-entity-policy.md` declares machine-verifiable canonical paths,
  ownership layers, mutation rules, skeleton parity, and agent workflow. Nearest
  dashboard policies reinforce those boundaries.
- `dashboard.reference-entities` is a child legacy removal surface.
  `--no-dashboard-reference-entities` removes the examples while retaining
  dashboard core; `--no-dashboard` implicitly removes both. Child-only,
  dashboard-only, and dashboard-plus-no-Payload disposable builds pass.
- Thin materialization removes dashboard/entity ownership and the focused
  scripts through its authoritative manifest. Strict API review, absence
  assertions, typecheck, 10-route build, and smoke pass.
- `/Users/olafbobryk/.codex/skills/entity-frontend-system` is installed and
  validated. It discovers repository policy and can recommend relevant vertical
  skills, but never overrides repository rules or invokes those skills itself.
- Browser verification passed contextual entity command registration/cleanup,
  record create/edit/delete, Markdown modal presentation, deletion failure with
  confirmation held open, optimistic rollback, and the responsive sidebar.
  Visual gate 2 covers auth and dashboard at mobile/tablet/desktop sizes in
  light and dark modes.
- Verified full preview:
  `http://localhost:3074/dashboard/reference/entities?motion=off&reveal=off`.
  Use the fixture demo action at
  `http://localhost:3074/login?motion=off&reveal=off` if the in-memory session
  has restarted.

## Post-closure Card parity correction

- Status: complete; the correction commit follows this handoff update.
- A controlled source-versus-target Card pilot exposed three coupled default
  differences: the target inherited Panel's larger radius, real border plus
  shadow, and wider gap scale. Card now selects the pinned source defaults
  without changing generic Panel defaults.
- Default Card chrome is an 8px radius through the additive Panel `xs` radius,
  a non-layout foreground ring, no real border, no shadow, and 16px structured
  spacing. `size="sm"` uses the source's 12px structured spacing.
- The additive template API remains intact. Explicit `background`, `border` or
  `bordered`, `radius`, `shadow`, `padding`, and `gap` values continue to win;
  Card remains composed on Panel and every existing slot is unchanged.
- The original fixed-size pilot measured 15.8099% exact changed pixels in light
  and 15.8249% in dark. The corrected default and small fixtures both measure
  0 changed pixels in light and dark for the exact and >=16-channel metrics.
- Full and materialized thin Panel/Card implementations remain byte-identical,
  and strict thin API review passes. The live full demo is
  `http://localhost:3074/internal/demo/ui/primitives?motion=off&reveal=off`.
- Ignored visual evidence lives under
  `.codex/tmp/source-parity-card-pilot/after/`,
  `.codex/tmp/source-parity-card-pilot/after-small/`, and
  `.codex/tmp/card-parity-live/`.

## Post-closure Divider context correction

- Status: complete; the correction commit follows this handoff update.
- Labeled Divider no longer paints `bg-background` over the rule. The line is
  split into two flexible segments that terminate at the label's padded box,
  preserving the square interruption without depending on the parent surface.
- The existing `children` and `textProps` API is unchanged. Unlabeled Divider
  output is unchanged, and label `className` remains additive.
- The internal primitive demo now exercises the labeled Divider inside a
  `surface` Panel. Browser review covers the login Card plus light and dark
  elevated surfaces at `http://localhost:3090`; no console or request failures
  were observed.
- Platform and theme-switch visual drift remain explicitly outside this thread
  and should be reviewed as a separate, narrowly scoped follow-up.

## Post-closure mutation policy port

- Status: complete; the cohesive mutation-policy commit follows this handoff
  update.
- Full and thin modal shells expose `useModalSubmission`, reject duplicate
  submits, and block Escape, backdrop, and header-close dismissal while pending.
  The full shell retains its stronger focus, stacking, scroll-lock, motion, and
  Card/Panel composition behavior.
- Confirmation, multi-step forms, record create/edit, dashboard and reusable
  Markdown editing, and entity deletion consume the shared pending contract.
  Recoverable failure preserves mounted values and overall feedback uses the
  shared toast system.
- Same-route completion performs one local update or refresh. Detail deletion
  declares replacement navigation through the shared deletion layer and never
  combines that route change with refresh. Returned and thrown deletion failures
  both roll optimistic state back.
- Mutation results stay local and structured as `{ ok, message, fieldErrors? }`;
  the dashboard Markdown result retains its prior `error` field as a compatibility
  fallback. No global mutation-result registry or provider dependency was added.
- `verify:mutation-policy`, the expanded entity-deletion verifier, the internal
  async modal demo, nearest policies, child-surface ownership, and thin-profile
  exclusions make the contract discoverable and machine-verifiable.
- Full typecheck/build/smoke and focused mutation/entity/dashboard/legacy removal checks
  pass. A disposable thin workspace passes strict API review, install,
  typecheck, build, and smoke while excluding dashboard and Markdown-editor
  ownership.
- Browser review on the retained `http://localhost:3090` preview passed pending
  dismissal locking, duplicate-submit control, retained inline failure values,
  confirmation-held-open rollback, same-route refresh, detail replacement
  navigation, Markdown failure retention, fixture reset, and console health.
- The reviewed InputFrame parity work is included in the integrated closeout
  history; no reserved parity file ownership remains after local-main handoff.

## Integrated closeout

- Status: complete after the hygiene commit containing this handoff update.
- Accumulated visual and product review changes are preserved in checkpoint
  `7942996`. Accepted mutation history is reconciled in merge commit `b5e0fc6`.
- The reconciliation retains Card-owned modal surfaces, focus trapping, focus
  return, stacking, motion, and scroll locking. Full and thin shells share the
  synchronous `useModalSubmission` guard, pending dismissal behavior, and
  confirmation completion semantics.
- Browser review caught and fixed a dual-lock regression before closure:
  successful confirmation now closes programmatically while submission remains
  locked against user dismissal.
- The dependency graph is coordinated on Payload `3.86.0`, Next.js `16.2.11`,
  MDXEditor `4.1.0`, Sharp `0.35.3`, and tsx `4.23.1`. Narrow overrides keep all
  transitive advisory paths patched; full and production-only audits are zero.
  Dependency pinning is format-preserving, so a clean install leaves the
  tracked manifest unchanged.
- Full lint/typecheck, focused verifiers, 51-route build, and smoke pass. A
  freshly materialized thin profile passes strict API review, clean install,
  typecheck, 9-route build, and smoke while excluding dashboard and MDXEditor
  ownership.
- Final browser evidence is ignored under
  `.codex/review/port-closeout-modal-after-fix/` and
  `.codex/review/port-closeout-mutations-final/`. The current isolated review
  entry is
  `http://localhost:3013/login?next=%2Fdashboard%2Frecords%3Fmotion%3Doff%26reveal%3Doff&motion=off&reveal=off`.
- No remote push or worktree removal is part of closeout. Homepage-section,
  bounded-fix, and behavior-preserving cleanup work now wait in separate clean,
  app-managed worktrees at the same local-main baseline.

## Required gates

Every chunk runs `git diff --check`, focused Biome checks, `npm run typecheck`,
and relevant structural verification. Shared/profile chunks also materialize a
disposable thin workspace, run strict API review, install, typecheck, build, and
smoke both profiles.

Visual reviews use isolated random-port previews and
`?motion=off&reveal=off`. Gate 1 covers the full component demo and thin
home/contact/internal-intelligence matrix. Gate 2 covers the complete auth and
dashboard journey in light/dark and mobile/tablet/desktop.

## Stop conditions

Stop for human input if the source pin changes, the target prerequisite becomes
dirty outside the active chunk, a provider/backend dependency becomes necessary,
an existing public API must be removed, or visual parity requires changing the
accepted information architecture.

## Exclusions

Do not port source-specific Supabase, Resend, Lucide, DnD, charting, PDF,
branded-provider, notification, role, or domain implementations. Do not port SF
Pro, product logos/copy, custom profile gradients, or Inference-specific profile
backgrounds. Charts and summary metrics remain optional.
