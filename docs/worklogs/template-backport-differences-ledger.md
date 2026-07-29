# Template Backport Differences Ledger

## Purpose

- Active goal: Port the accepted reusable architecture from the pinned Inference
  Console source into full and thin template profiles, while keeping the full
  profile product-ready and the thin profile intentionally smaller.
- Template root:
  `/Users/olafbobryk/Documents/Code/Personal/2025/averlo-next-template`
- Template baseline: `50616826610a9acded69625133e476694cdf3358`.
- Active source:
  `/Users/olafbobryk/Documents/Code/Mazi/2026/inference-console` at pinned commit
  `8a13d12ea11461fe204625bd1247a6db16c4a207`.
- Accepted mutation behavior reference:
  `1c6208b37fabb4666c142490608f45662013b0f7`; the later commit is scoped to the
  committed modal-mutation policy delta and does not repin the visual baseline.
- Source access: read only through `git show` or `git archive`; ignore its dirty
  working tree.
- Historical Source B:
  `/Users/olafbobryk/Documents/Code/Averlo/2026/averlo-rebrand`.
- Source B:
  `/Users/olafbobryk/Documents/Code/Averlo/2026/averlo-rebrand`
- Historical template recovery source:
  Git ref `7235466` (`84cd3c6` has the same historical `src/components/ui`
  tree) is the source for UI work that already existed in this template before
  `c7397aa` reduced the shared UI surface.
- Framework: Use `template-backport-workflow` classifications:
  `Port`, `Adapt`, `Skip`, and `Defer`.
- Delivery branches: `codex/inference-port` for the staged port and
  `codex/input-frame-parity-pilot` for the integrated closeout.
- Last updated: 2026-07-23

## Active Inference Console Port

Product spine: reusable full/thin template parity plus a product-ready,
organization-powered full-start dashboard.

| Chunk | Scope | Classification | Status | Current evidence | Next gate |
| --- | --- | --- | --- | --- | --- |
| P1-C1 | Clean baseline, filesystem-backed thin profile, shared Panel/Card | Adapt | complete | Commit `6cb2c99`; shared Panel/Card and manifest-driven materialization pass strict API review, typecheck, build, and smoke in both profiles | Closed |
| P1-C2 | Pinned visual tokens and shared component convergence | Adapt | complete | Commit `5d79e06`; tokens, Inter, shared primitives, inputs, modal flows, skeleton namespaces, full-only editor/color controls, and thin exclusions implemented; both profiles typecheck/build/smoke; responsive light/dark gate passed | Closed |
| P1-C3 | Provider-neutral authentication and organization lifecycle | Adapt | complete | Commit `66a08e1`; top-level auth routes, HttpOnly server-memory sessions, organization resolution, inert invitation review plus explicit acceptance, identity protection, private-file contracts, focused verifier, and thin exclusions implemented | Closed |
| P1-C4 | Dashboard shell, typed surface registry, commands, debug state | Adapt | complete | Dashboard-owned registry drives routes, hierarchy, sidebar, breadcrumbs, layout width, capabilities, and static commands; contextual command cleanup, deterministic debug states, no-resize forced loading, responsive shell, full/thin builds, and focused verifier passed | Closed; P1-C5 reference entities next |
| P1-C5 | Reference entities, mutations, policy, surface removal, skill, closure | Adapt | complete | Dashboard-owned member/record layers, fetch-free presentation, entity commands, fixture CRUD, deletion rollback, live/skeleton reference, repository policy, child surface removal, and the validated user skill are implemented; full/thin and disposable legacy removal gates pass | Closed; closing commit follows this ledger update |
| Post-C5 Card parity | Strict source-versus-target default Card correction | Adapt | complete | Card now owns the pinned 8px radius, ring/no-shadow chrome, and 16px/12px structured gaps without changing generic Panel defaults; default and small strict light/dark comparisons reach 0 changed pixels | Closed; correction commit follows this ledger update |
| Post-C5 Divider context | Surface-neutral labeled Divider correction | Adapt | complete | Labeled rules terminate at the label's padded box instead of painting `bg-background`, so the same primitive works on page, Card, Panel, and modal surfaces without a color seam | Closed; correction commit follows this ledger update |
| Post-C5 mutation policy | Shared modal submission and explicit mutation completion | Adapt | complete | Full/thin submission guards, dismissal locking, structured local results, explicit deletion completion, optimistic rollback, demo, policy, and verifiers are implemented and verified without touching the parity-owned InputFrame files | Closed; cohesive commit follows this ledger update |
| Integrated closeout | Accumulated visual review, mutation reconciliation, dependency hardening, and main handoff | Adapt | complete | Review work checkpointed at `7942996`; mutation branch reconciled at `b5e0fc6`; full and thin builds, browser mutation lifecycle, strict API review, zero-vulnerability audits, and clean-install manifest idempotency pass | Closed; local main, both port branches, and three prepared follow-up worktrees align on the final closeout tip |

### Current classifications

| ID | Candidate | Classification | Decision |
| --- | --- | --- | --- |
| INF-PROFILE-001 | Filesystem-backed thin profile with complete isolated materialization | Adapt | Manifest owns shared files, overrides, removals, package changes, routes/scripts, API review, and verification. |
| INF-UI-020 | Generic `Panel` plus structured `Card` built on it | Adapt | Shared identically by full and thin; Panel owns non-semantic surfaces and overlay roots. Card selects the pinned 8px radius, ring/no-shadow chrome, and 16px default or 12px small structured gap while explicit template overrides remain additive. |
| INF-UI-021 | File-backed Sonner thin toast | Adapt | Thin-specific implementation uses shared tokens; full template feedback API remains intact. |
| INF-VISUAL-001 | Pinned light/dark surface, sidebar, status, spectrum, radius, focus, motion, scrollbar grammar | Adapt | Port in P1-C2 with Inter; exclude SF Pro and product gradients. |
| INF-UI-022 | Source-matched Button, Text, Field, InputFrame, Dropdown/Listbox, Chip, Accordion, modal, toast, and status convergence | Adapt | Preserve mature template APIs, absolute loading overlay, focus behavior, and component-owned skeleton namespaces while adopting the pinned visual grammar. |
| INF-UI-023 | Full-only MDX editor, source mode, mentions, and modal editing | Adapt | Keep the existing renderer shared; strip editor source, CSS, and `@mdxeditor/editor` from thin output and lockfile. |
| INF-UI-024 | Date, color, selection interception, file/profile lifecycle, More-menu factories, and null-state improvements | Adapt | Date contracts are reusable; color controls are full-only; existing Multiselect/ChoiceField remains canonical instead of adding CheckboxInput. |
| INF-UI-025 | Source modal forms, step indicator, and richer confirmation contract | Adapt | Confirmation supports details, warnings, variants, and `false`-keeps-open without replacing the existing modal host/focus APIs. |
| INF-UI-026 | Async modal submission and explicit mutation completion policy through `1c6208b` | Adapt | Port the generic full/thin submission guard, local structured results, same-route versus navigation handoff, and entity deletion completion while retaining stronger template focus, optimistic rollback, and compatibility APIs. |
| INF-AUTH-001 | Provider-neutral auth/org/membership/invitation/private-file contracts | Adapt | Implement in P1-C3 with non-durable fixture adapter and server-resolved org context. |
| INF-DASH-001 | Dashboard shell, surface registry, contextual Command-K, deterministic debug state | Adapt | Implement in P1-C4 without Inference notifications or profile gradient. |
| INF-ENTITY-001 | Dashboard-owned entity presentation foundation and reference members/records | Adapt | Implement file-based dependency layers in P1-C5; no global presentation registry. |
| INF-ENTITY-002 | Repository frontend-entity policy and discovery skill | Adapt | Machine-verifiable local policy owns canonical paths and workflow. The user-level `entity-frontend-system` skill discovers that policy and may recommend, but never auto-invoke, vertical skills. |
| INF-SELECT-001 | `dashboard.reference-entities` child legacy removal surface | Adapt | `--no-dashboard-reference-entities` removes the example verticals while retaining dashboard core; `--no-dashboard` implicitly removes the child. Thin removes both through the same manifest. |
| INF-SKIP-020 | Supabase, Resend, DnD, charts, PDF, branded providers, notifications, roles, domains | Skip | Keep source/product/provider obligations out of the reusable baseline. |

## Operating Rules

- Classify by lifecycle and surface removal ownership before import path.
- Shared UI or workflow code must be generic, documented, demoed, and usable
  outside one product instance before it can survive template surface removal.
- Product routes, client copy, brand assets, source-specific IA, backend
  persistence obligations, auth/role behavior, deploy hooks, credentials, and
  generated benchmark logs stay out of the template.
- Backend-bound source behavior must become local, stubbed, or omitted unless
  the template already owns the matching backend contract.
- Use one read-only explorer per source repo for each exploration pass.
  Explorers must read the template backport workflow, template `AGENTS.md`, and
  the relevant source `AGENTS.md`, then return ledger-ready rows only.
- The orchestrator deduplicates rows, assigns stable IDs, updates decisions, and
  creates implementation packets by ownership after ledger review.

## Source Inventory

| Source | Root | Role | Current use |
| --- | --- | --- | --- |
| Template | `/Users/olafbobryk/Documents/Code/Personal/2025/averlo-next-template-inference-port` | Isolated target worktree | Receives the accepted five-chunk port before any merge decision. |
| Inference Console | `/Users/olafbobryk/Documents/Code/Mazi/2026/inference-console` at visual pin `8a13d12` and accepted mutation reference `1c6208b` | Pinned product source | Read-only source for visual primitives, dashboard patterns, auth/org contracts, presentation patterns, and the bounded modal-mutation policy delta. |
| Averlo Rebrand | `/Users/olafbobryk/Documents/Code/Averlo/2026/averlo-rebrand` | Product descendant | Source for dev/test workflow, orchestration, scroll-performance, content, metadata, shell, and motion patterns. |
| Historical Template UI | Git ref `7235466` in this repo | Pre-thin-start template state | Primary source for recovered helpers, richer Button behavior, and future form/misc UI packets that already belonged to the template. |

## Candidate Differences

| ID | Source | Candidate | Evidence paths | Template target | Classification | Decision | Risk/gate | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| INF-UI-001 | Inference / Historical Template UI | Fill documented UI library gaps: `icons`, `helpers`, `misc`, `Panel`, and `Divider`. | `src/components/ui/helpers/IconSwap.tsx`<br>`src/components/ui/icons/**`<br>`src/components/ui/misc/**`<br>`src/components/ui/primitives/Panel.tsx`<br>`src/components/ui/primitives/Divider.tsx` | `src/components/ui/**` | Adapt | Implemented from history | Full accidental-legacy removal recovery in `948efcd` restored generic helpers, icons, time helpers, media/file/profile controls, graph/health controls, and misc primitives. | Complete. |
| INF-UI-002 | Inference / Historical Template UI | Central icon registry/provider with named icons, missing-icon handling, and override support. | `src/components/ui/icons/Icon.tsx`<br>`src/components/ui/icons/iconRegistry.tsx`<br>`src/app/(site)/layout.tsx` | UI foundations and site layout | Adapt | Implemented from history | Full recovery in `948efcd` restored `src/components/ui/icons/**` and app-level `IconProvider` wiring. | Complete unless future consumers need custom provider overrides. |
| INF-UI-003 | Inference / Historical Template UI | Richer `Button` primitive with icon-name support, loading overlay, disabled link handling, skeleton state, and layout controls. | `src/components/ui/primitives/Button.tsx` | `src/components/ui/primitives/Button.tsx` | Adapt | Implemented from history | Restored richer historical behavior from `7235466` while preserving current default CTA behavior; later bulk recovery re-enabled string icon-name rendering through the restored icon registry. | Complete for this pass. |
| INF-UI-004 | Inference | More accessible positioned `Dropdown` with portal/fixed positioning, collision handling, hover pinning, Escape/Tab behavior, and focus handling. | `src/components/ui/primitives/Dropdown.tsx` | `src/components/ui/primitives/Dropdown.tsx` | Adapt | Implemented | Hover pinning, icon registry, `renderMenu`, and motion dependencies intentionally skipped; additive open/positioning props were accepted. | Complete for this pass. |
| INF-UI-005 | Inference / Historical Template UI | Form and typography primitive upgrades: typed tags, skeleton typography, start/end field slots, autofill handling, and live error/message IDs. | `src/components/ui/primitives/Text.tsx`<br>`src/components/ui/primitives/InputFrame.tsx`<br>`src/components/ui/primitives/Field.tsx`<br>`src/components/ui/input/**` | UI primitives and input components | Adapt | Implemented from history | Restored richer `Text`, `Field`, `InputFrame`, and generic input controls from `7235466`, preserving current compatibility where needed. | Complete for core form/input recovery. |
| INF-UI-006 | Inference | Modal focus and scroll management: focus restore, Tab trap, top-most Escape guard, nested scroll-lock counter, and motion props. | `src/components/ui/overlays/modal/ModalShell.tsx`<br>`src/components/ui/overlays/modal/ModalHost.tsx` | Modal overlay primitives | Adapt | Implemented | `ModalShell` now moves focus into the dialog, traps Tab inside the active modal, restores focus on close, and accepts an `isTopMost` guard; `ModalHost` passes the top-most state for stacked modals. Source-specific visuals remain skipped. | Complete for this pass. |
| INF-UI-007 | Inference / Historical Template UI | Generic loading and skeleton feedback bundle. | `src/components/ui/misc/Skeleton.tsx`<br>`src/components/ui/misc/Loader.tsx`<br>`src/components/mount/LoadingScreenMount.tsx` | UI misc and mount components | Adapt | Implemented | `Skeleton` and `Loader` preserved with current accepted adaptations; branded/source loading screen visuals remain out of scope. | Complete for shared loading primitives. |
| INF-UI-008 | Inference / Historical Template UI | Copy action and animated copy/check helper. | `src/components/ui/helpers/useCopyAction.tsx`<br>`src/components/ui/helpers/IconSwap.tsx`<br>`src/components/ui/misc/CopyField.tsx` | `src/components/ui/helpers/**`<br>`src/components/ui/misc/CopyField.tsx` | Port | Implemented from history | Restored `IconSwap`, `useCopyAction`, helper guidance, and `CopyField`; adapted copy/check icons to local ReactNode SVGs instead of the deferred icon registry. | Complete for this pass. |
| INF-UI-009 | Inference | Responsive hero section min-height and inner-height fix. | `src/components/ui/primitives/Section.tsx` | `src/components/ui/primitives/Section.tsx` | Port | Implemented | Class-only primitive change; worker skipped visual preview because no route/API change was introduced. | Complete for this pass. |
| INF-APP-001 | Inference | Generic command/search registry pattern: flatten route tree, match keywords/actions, rebuild hierarchy, and preserve review query flags. | `src/app/(site)/_components/inference-webos/InferenceCommandSearch.tsx`<br>`src/app/(site)/_components/inference-webos/InferenceSideRail.tsx` | Future template route/search registry | Defer/Adapt | Deferred | Current implementation is source IA, copy, and app-shell specific. | Revisit only if template search/navigation scope expands. |
| INF-UI-010 | Inference / Historical Template UI | Generic avatar, chip, helper palette, and physically clipped overlapping avatar stack pattern. | `src/components/ui/misc/Pill.tsx`<br>`src/components/ui/misc/ProfilePicture.tsx`<br>`src/components/ui/misc/Chip.tsx`<br>`src/components/domain/inference/InferenceAtoms.tsx` | UI misc and optional demo/reference surface | Adapt | Implemented from history | Full recovery in `948efcd` restored historical avatar, chip, file/media, profile, image-switcher, phone, and signature controls; Inference domain atoms remain skipped. | Complete for generic avatar/chip/misc recovery. |
| ARB-DEV-001 | Averlo Rebrand | Random agent preview ports and section-anchor review link policy. | `AGENTS.md`<br>`docs/orchestration/artifacts/preview-port-policy.md`<br>`scripts/dev-server.mjs` | Dev server workflow | Port | Implemented | Verified `--random` dry-run and preserved user server isolation. | Complete for this pass. |
| ARB-DEV-002 | Averlo Rebrand | Shared local production preview helper for smoke checks. | `scripts/_lib/local-production-preview.mjs`<br>`scripts/verify/verify-smoke.mjs`<br>`retired generator script` | Testing scripts | Port | Implemented | Product route list was not ported; internal-route env remains local to smoke verification; legacy removal renderer now preserves helper output. | Complete for this pass. |
| ARB-TOOL-001 | Averlo Rebrand | Page-target scroll-performance measurement harness and benchmark scripts. | `scripts/scroll-performance/measure.mjs`<br>`scripts/scroll-performance/record.mjs`<br>`docs/worklogs/scroll-performance-benchmark.md` | Internal tooling | Adapt | Implemented | Kept Playwright-backed measurement but removed the synthetic `/internal/scroll-performance` fixture route and source scenarios. | Complete as a page-first harness using `--path`, optional `--ready-selector`, ignored `tmp/` output, and `target_path` result records. |
| ARB-TOOL-002 | Averlo Rebrand | Page-target scroll-performance autoresearch loop. | `scripts/scroll-performance/setup-autoresearch.mjs`<br>`scripts/scroll-performance/score-candidate.mjs`<br>`scripts/scroll-performance/lib/scroll-performance.mjs` | Experimental workflow | Adapt | Implemented | Creates disposable worktrees, writes runtime state under ignored `tmp/`, scores real page paths, and can hard-reset discarded candidates inside the tagged worktree. | Complete with project-supplied mutable scope allowlists; do not run scoring from a worktree with unrelated commits or uncommitted work. |
| ARB-ORG-001 | Averlo Rebrand | Static-page orchestration template: entry recommendation, section contract, review routing, and learning return. | `docs/orchestration/shapes/static-page-implementation-strategy-template.md`<br>`docs/orchestration/workpieces/static-page-entry-recommendation-template.md`<br>`docs/orchestration/workpieces/static-page-section-defined-contract-template.md`<br>`docs/orchestration/workpieces/static-page-pattern-return-template.md` | Orchestration/process docs | Adapt | Strategy baseline initialized | Current shape strategy support docs were initialized and updated from `codex-orchestrator-dashboard`; Averlo product projection was not copied. | Defer starter static-page shapes unless the template should ship accepted project-local orchestration examples. |
| ARB-ORG-002 | Averlo Rebrand | Docked orchestration CLI pointer/shim from commit `795ee82`. | `docs/ORCHESTRATION.md`<br>`scripts/orchestration.mjs`<br>`package.json`<br>`.gitignore` | Orchestration pointer and CLI shim | Adapt | Implemented | `docs/orchestration/` is ignored and externally managed as a nested root; Averlo product graph, agents, runs, checkpoints, and `.codex-orchestration/` state were not copied. | Complete for shim/pointer; initialize the docked root separately when projection state is needed. |
| ARB-CONTENT-001 | Averlo Rebrand / Portfolio cousin | Generic markdown renderer with design-system component mapping and a small custom button directive. | `src/components/domain/content-page`<br>`src/components/domain/markdown`<br>`src/lib/marketing-content/contentPages/MarkdownRenderer.tsx` | `src/components/composites/markdown/MarkdownRenderer.tsx` | Adapt | Implemented | Kept renderer-only scope: no metadata/frontmatter, page chrome, content-entry model, contact-copy behavior, project/external-card directives, or Averlo fixtures. Added `react-markdown`/`remark-gfm` for broad markdown coverage and `::button[Label]{href=/path variant=primary size=md}` for a generic custom component. Later moved ownership from `domain` to `composites` and made the renderer an explicit thin-start composite. | Complete for this pass. |
| ARB-CONTENT-002 | Averlo Rebrand | Static-first resolver and site-content boundary with small render props. | `src/lib/site-content/pages.ts`<br>`src/lib/marketing-content/resolvers.ts`<br>`src/lib/marketing-content/types.ts` | Content modes | Adapt | Implemented lightweight cleanup | The template already had the architecture; this pass made the static fallback page map explicit with `fallbackMarketingPages` and exported `marketingPageSlugs`. Averlo page blocks, IA, assets, blog/services/portfolio data, and blur-data maps remain skipped. | Complete unless a future packet intentionally expands the template into a multi-page static starter. |
| ARB-UI-001 | Averlo Rebrand / Historical Template UI | UI primitive affordances: loading buttons, touch hit areas, stable field errors, chip multiselect, and scroll borders. | `src/components/ui/primitives/Button.tsx`<br>`src/components/ui/primitives/Field.tsx`<br>`src/components/ui/input/selection/ButtonMultiSelectInput.tsx`<br>`src/components/ui/misc/ScrollBorders.tsx` | UI primitives, inputs, and misc | Adapt | Implemented from history/adapted | Generic `ScrollBorders` added; historical Button touch hit areas, loading overlay, skeleton behavior, `Field`, and historical multiselect/combobox controls restored. `ButtonMultiSelectInput` was not a historical template file and was not added. | Complete for reusable primitive/input affordances. |
| ARB-MOTION-001 | Averlo Rebrand | Motion/reveal primitive upgrades: corner-clip image reveal, numeric reveal, and automation-friendly motion flags. | `src/components/ui/motion/reveal/RevealImage.tsx`<br>`src/components/ui/motion/reveal/RevealNumeric.tsx`<br>`src/components/ui/foundations/motionDisableOverride.ts` | Motion primitives and foundations | Adapt | Implemented | Product loading SVG data was not ported; intro/loading URL override integration was wired into the loading mount. | Browser verification remains optional for future consumers using these primitives. |
| ARB-SHELL-001 | Averlo Rebrand | Shell-owned CTA and shared layout provider pattern. | `src/app/(site)/(marketing)/_components/layout/MarketingShell.tsx`<br>`src/app/(site)/(marketing)/_components/layout/MarketingSharedLayout.tsx`<br>`src/app/(site)/(marketing)/_components/layout/Cta.tsx` | Marketing shell slots | Defer | Deferred | Current CTA is visual, product, asset, and provider bound; shared layout provider is tied to Averlo hero media. | Reconsider only as a generic shell slot API, not as a direct source port. |
| ARB-META-001 | Averlo Rebrand | Static metadata factory and root metadata helper. | `src/lib/site-content/metadata.ts`<br>`src/config/metadataConfig.ts` | Generic metadata helper/config | Adapt | Implemented | Added typed `siteMetadata`, route-keyed `staticPageMetadata`, and shared root/page metadata factories using template defaults; Averlo product URL, route list, copy, and assets were not ported. | Complete for this pass. |

## Skip/Gate List

| ID | Source | Item | Decision | Reason | Follow-up |
| --- | --- | --- | --- | --- | --- |
| SKIP-INF-001 | Inference | `src/app/(site)/(app)/**`, `/deal/**`, `/access/**`, and `_components/auth/inference*` | Skip | Product IA, mock access/session behavior, and deal routes. | Do not port. |
| SKIP-INF-002 | Inference | `src/app/(site)/_components/inference-webos/**` | Skip except extracted patterns | WebOS shell, assistant state, deal data, route map, and visuals are source-specific. | Keep only command/search pattern as deferred idea. |
| SKIP-INF-003 | Inference | `src/components/domain/inference/**` | Skip except generic avatar-stack idea | Domain atoms depend on Inference tokens, copy, sizes, and routes. | Extract only reusable visual mechanics if needed. |
| SKIP-INF-004 | Inference | `public/brand/inference/**` and Navon logo/root metadata changes | Skip | Brand and client assets. | Do not port. |
| SKIP-INF-007 | Inference | Source-only `GoogleIcon` and provider/auth-brand icon additions | Skip | Provider trademark/auth scope is not part of the generic recovered icon registry. | Do not port unless a future auth-provider package explicitly owns branded icons. |
| GATE-INF-001 | Inference | `src/font/sf-pro/**` and root font wiring | Gate/Skip | Large local font payload and licensing/bundle concerns. | Do not add as template default without explicit font policy. |
| SKIP-INF-005 | Inference | Supabase/customer push token migrations or service-role workflows | Skip | Backend persistence and external service obligations. | Do not port. |
| GATE-INF-002 | Inference | `react-markdown` and `remark-gfm` dependency additions | Gate | Observed use is source assistant markdown; generic renderer scope is separate. | Revisit only with content-page packet. |
| SKIP-INF-006 | Inference | Inference KPI/WebOS media rules in global CSS | Skip | Product-specific viewport scaling and hover behavior. | Do not port. |
| SKIP-ARB-001 | Averlo Rebrand | Product routes and IA: `about`, `work`, `services`, `blog`, `booking`, `contact`, and `terms-of-use` trees | Skip | Source-specific pages, copy, assets, and navigation. | Do not port. |
| GATE-ARB-001 | Averlo Rebrand | `src/lib/booking`, `/api/booking`, `/api/contact`, `/api/internal/email-preview` | Gate/Skip | Provider-backed email/calendar/booking behavior creates external-state obligations. | Do not port unless template explicitly adopts matching provider contract. |
| GATE-ARB-002 | Averlo Rebrand | `google-auth-library`, `resend`, `playwright`, `@icons-pack/react-simple-icons`, and `lucide-react` | Gate | Dependencies vary by candidate and may broaden template cost/scope. | Decide per packet, with dependency rationale. |
| SKIP-ARB-002 | Averlo Rebrand | `public/assets/**`, source favicons, manifest assets, and brand imagery | Skip | Brand/client assets. | Use only as pattern evidence. |
| GATE-ARB-003 | Averlo Rebrand | `docs/orchestration/**` product graph | Gate | Active Averlo orchestration state should not port wholesale. | Use the docked `docs/orchestration/` root only when initialized separately; do not copy product projection docs into the template. |
| GATE-ARB-004 | Averlo Rebrand | `vercel.json`, `.vercelignore`, deploy hooks, and deployment metadata | Gate/Skip | Instance-specific deployment shape and possible secret-adjacent config. | Do not port without separate deployment policy. |
| SKIP-GLOBAL-001 | Both | `docs/worklogs/template-intelligence-benchmark-runs.jsonl` and generated local indexes | Skip | Generated/local benchmark drift is not reusable template behavior. | Do not copy source rows into template. |
| SKIP-GLOBAL-002 | Both | Secrets, tokens, API keys, chat IDs, deploy hooks, and env values | Skip | Project policy forbids exposing or committing secrets. | Use ignored repo-local env files when needed. |

## Decisions

| Date | Decision | Rationale | Status |
| --- | --- | --- | --- |
| 2026-07-01 | Use Averlo Rebrand as the Averlo source for this ledger. | It is recent, clean, and contains active orchestration and workflow artifacts. | accepted |
| 2026-07-01 | Keep the central differences ledger tracked under `docs/worklogs`. | Findings should be durable and reviewable before implementation packets are created. | accepted |
| 2026-07-01 | Explorers are read-only and the orchestrator owns ledger writes. | Prevents concurrent writes to one tracked file and keeps classification consistent. | accepted |
| 2026-07-01 | This pass records candidates only; it does not backport code. | Implementation needs packet-specific ownership, docs/demo/legacy removal updates, and verification. | accepted |
| 2026-07-01 | Do not run the hybrid preset for this ledger-only pass when it would append tracked benchmark rows outside the requested change. | The shell lacks default `npm`/`node`/`uv`/`serena` PATH entries, and the requested first step is ledger creation only. | accepted |
| 2026-07-01 | Initialize and update the current shape strategy from `codex-orchestrator-dashboard` instead of copying Averlo Rebrand orchestration projection docs. | The template had no recognized strategy root; `init:shape-strategy` plus `update:shape-strategy` produces current generic support docs without importing product graph state. | accepted |
| 2026-07-01 | Keep ARB-UI-001 limited to `ScrollBorders` for this pass. | Button, Field, and multiselect changes are broader primitive API decisions and should not be bundled with a small scroll affordance. | accepted |
| 2026-07-01 | Keep legacy-generated smoke verification on the shared local production helper. | The Averlo Rebrand helper was accepted for `verify:smoke`; leaving the old inline renderer would regress reduced clones during later template cleanup. | accepted |
| 2026-07-01 | Adapt `INF-UI-001` Panel and Divider with template-local visual scale. | The source primitives are generic, but the template uses smaller `rounded-md` surfaces and does not currently ship the old internal demo route requested by component guidance. | accepted |
| 2026-07-01 | Split copy helper from icon registry work. | Current template and Averlo Rebrand Button APIs accept `ReactNode` icons; copy behavior can use existing toast policy without committing to `lucide-react`, Phosphor, or a local SVG registry. | accepted |
| 2026-07-01 | Recover UI helpers and Button from historical template ref `7235466` before sourcing those ideas from product descendants. | `IconSwap`, `useCopyAction`, `CopyField`, and richer `Button` already existed in this template and were removed by `c7397aa`; restoring history preserves template intent without importing product scope. | accepted |
| 2026-07-01 | Prefer path-limited bulk recovery from `7235466` over component-by-component historical recovery. | A raw revert of `c7397aa` conflicts in current layout/content files and re-adds auth, dashboard, internal demo, reference, and playground surfaces; targeted directory restores recover the reusable UI library without widening app scope. | accepted |
| 2026-07-01 | Adopt the docked `docs/orchestration/` pointer and CLI shim, and remove `.codex-orchestration/` from this checkout. | The current orchestration strategy is an ignored nested root managed separately; legacy `.codex-orchestration/` evidence is not projection truth. | accepted |
| 2026-07-01 | Add a soft canonical-`main` legacy removal warning while preserving the hard mutating gate. | Dry-runs should warn maintainers that surface removal template `main` can collapse the full template, while mutating runs still require `--confirm-template-root`. | accepted |
| 2026-07-01 | Keep `retired generator command --confirm-template-root` idempotent against already-thinned optional surfaces. | The recovered checkout no longer has `MarketingContentSearch.tsx`; confirmed legacy removal should skip that optional rewrite and still generate fallback content matching `SiteLayoutDocument`. | accepted |
| 2026-07-03 | Treat `948efcd` as the new checkpoint baseline for continued backport work. | The commit restores the full template surface after accidental legacy removal, keeps the later orchestration/removal-safety work, passes lint/build, and is pushed to `origin/main`. | accepted |
| 2026-07-03 | Close the old file/media/profile and graph/health gates as complete. | `948efcd` restored `FileGallery`, `FilePreview`, `FileInspectModal`, `ImageSwitcher`, `InspectableImage`, `FileUploadInput`, `ProfilePictureInput`, `GraphMap`, `InteractionGate`, and `HealthCheckIndicator`. | accepted |
| 2026-07-03 | Reopen only the modal focus-management slice of `INF-UI-006`. | The template has modal scroll-lock and shell behavior, but not Inference's focus trap, initial focus, focus restore, or top-most Escape guard. | accepted |
| 2026-07-03 | Complete the modal focus-management slice of `INF-UI-006`. | The accepted port is generic overlay accessibility behavior in shared primitives; source-specific backdrop, sizing, and motion visuals remain out of scope. | accepted |
| 2026-07-03 | Complete `ARB-META-001` as a small generic metadata helper. | The accepted slice keeps only typed site/page metadata factories and route-keyed config; Averlo product URL, route list, copy, and assets remain skipped. | accepted |
| 2026-07-04 | Complete `ARB-CONTENT-001` as a renderer-only markdown backport. | The template should render markdown through the design system without adopting frontmatter, metadata inference, page title/description props, back-button chrome, blog routes, or portfolio content-entry metadata. | accepted |
| 2026-07-04 | Rebuild scroll-performance tooling around real page targets. | The template should own measurement, recording, scoring, and disposable worktree orchestration, while project instances own target pages and mutable scopes. Synthetic fixture routes and `control/default/stress` scenarios were removed. | accepted |
| 2026-07-04 | Complete `ARB-CONTENT-002` as an explicit lightweight fallback page map. | The template already had the minimal resolver/render contract. The accepted change only replaces hard-coded resolver branching with `fallbackMarketingPages` plus exported `marketingPageSlugs`; Averlo's broad static site-content system remains out of scope. | accepted |

## Explorer Runs

| Date | Agent | Source | Mode | Result |
| --- | --- | --- | --- | --- |
| 2026-07-01 | `019f1b40-0694-7953-8d84-015c5102d17c` | Inference | Read-only explorer | Returned UI, icon, modal, dropdown, loading, command-search, avatar, and skip/gate findings. |
| 2026-07-01 | `019f1b40-0a75-7f13-ba54-962ede99efe0` | Averlo Rebrand | Read-only explorer | Returned dev/test, scroll-performance, orchestration, content, UI, motion, shell, metadata, and skip/gate findings. |
| 2026-07-01 | `019f1b54-04ad-7e00-b4ad-9e209bcfb3ff` | Averlo Rebrand | Worker | Implemented `ARB-MOTION-001` motion/reveal primitives. |
| 2026-07-01 | `019f1b54-5119-74f3-93fa-d993e9d9a3d4` | Averlo Rebrand | Worker | Implemented `ARB-DEV-001` and `ARB-DEV-002` dev/test workflow changes. |
| 2026-07-01 | `019f1b54-904b-74f1-bbcf-856a7b289e2a` | Averlo Rebrand | Worker | Implemented narrowed `ScrollBorders` slice from `ARB-UI-001`. |
| 2026-07-01 | `019f1b59-56c1-7b53-ac70-fcd72163f751` | Inference | Worker | Implemented light `Skeleton` and `Loader` slice from `INF-UI-007`. |
| 2026-07-01 | `019f1b68-00f7-7520-8e2e-c84fcbfbf036` | Inference | Worker | Implemented `INF-UI-009` responsive hero `Section` sizing. |
| 2026-07-01 | `019f1b71-8934-7d72-bee2-cc207c6549f2` | Inference | Worker | Implemented `INF-UI-004` dropdown behavior backport. |
| 2026-07-01 | `019f1b71-dfc8-7eb1-90c5-c6838e135580` | Inference | Worker | Implemented `INF-UI-006` modal behavior backport. |
| 2026-07-01 | `019f1b72-2913-76b3-9dd4-e341b87aa866` | Inference/Rebrand | Read-only explorer | Recommended `split-copy-and-icons`: implement `IconSwap` and `useCopyAction` before any icon registry/provider. |
| 2026-07-01 | `019f1ba3-9207-7bb1-8c20-7f68b62cd052` | Historical Template UI | Read-only explorer | Mapped `7235466` UI files back to ledger rows and split future recovery into icon, form/input, core misc, file/media, and graph/health packets. |
| 2026-07-01 | `019f1ba3-6294-7fe2-8144-b0e20e3d326b` | Historical Template UI | Worker | Restored `INF-UI-008`, `CopyField`, and `INF-UI-003` richer Button behavior from `7235466`, intentionally skipping icon registry. |
| 2026-07-01 | `019f1bb4-7d20-7bf1-834a-e17635dc61b8` | Historical Template UI | Worker | Bulk-restored reusable UI library surfaces from `7235466`: icons, inputs, time helpers, richer `Text`/`Field`/`InputFrame`, and core misc, while keeping app routes, graph/health, and media-inspection surfaces gated. |
| 2026-07-01 | Orchestrator | Averlo Rebrand / Template | Cleanup packet | Implemented `ARB-ORG-002`, removed `.codex-orchestration/`, added canonical-`main` legacy removal warning, and verified the confirmed legacy removal path in a disposable checkout. |
| 2026-07-03 | `019f28fb-6df8-7dd3-96ed-4f113fb6c468` | Inference | Read-only explorer | Confirmed nearly all Inference/historical reusable UI work is complete after `948efcd`; recommended reopening only modal focus management and keeping command-search deferred. |
| 2026-07-03 | `019f28fb-9a1d-7193-b3e7-f5f8af21f898` | Averlo Rebrand | Read-only explorer | Confirmed remaining Averlo work is content-page/metadata/tooling focused; recommended keeping shell and autoresearch deferred. |

## Next Packets

| Packet | Candidate IDs | Purpose | Required checks |
| --- | --- | --- | --- |
| Scroll-performance tooling gate | `ARB-TOOL-001`, `ARB-TOOL-002` | Implemented as grouped page-target measurement, recording, and disposable autoresearch scoring. | Dependency gate for Playwright; legacy removal dry-run; ignored-output check; real-page measurement check. |
| Orchestration starter examples | `ARB-ORG-001` | Decide whether the template should ship starter project-local shapes beyond the generic strategy support docs. | Shape-strategy adapter check; no product graph references. |

## Verification Log

### 2026-07-23 integrated closeout

- Preserved 347 accumulated review files in `7942996` without committing local
  `.codex` evidence or `test-results` output.
- Merged the accepted mutation-policy history in `b5e0fc6`, keeping Card-owned
  modal presentation and the stronger focus/stacking behavior while restoring
  synchronous submission guards, pending dismissal locks, structured failures,
  deletion completion branches, and optimistic rollback.
- Browser verification exposed and corrected one integration-only target miss:
  the legacy confirmation host lock prevented successful programmatic close.
  Confirmation now relies on the shell submission lock for user dismissal and
  closes successfully without unlocking first.
- Upgraded the coordinated Payload suite to `3.86.0`, Next.js minimum to
  `16.2.11`, MDXEditor to `4.1.0`, Sharp to `0.35.3`, and tsx to `4.23.1`, with
  narrow transitive overrides for patched js-yaml, PostCSS, DOMPurify, Sharp,
  and esbuild releases. Full and production-only `npm audit` both report zero
  vulnerabilities.
- Full verification passes lint, typecheck, modal/mutation/auth/dashboard/
  platform/entity/skeleton/surface removal verifiers, a 51-route production build, and
  smoke checks.
- A fresh thin workspace passes strict API review, clean install, typecheck,
  a 9-route production build, and smoke. Dashboard, mutation-verifier, and
  MDXEditor ownership are absent; the shared modal submission contract remains.
- The final isolated browser matrix at `http://localhost:3060` covers desktop
  and narrow light/dark modal surfaces, focus return, Command-K, pending Escape
  locking, duplicate-submit rejection, retained failed values, confirmation
  success, optimistic deletion rollback, collection completion, detail
  replacement navigation, and zero application console/request failures.

| Date | Check | Result | Notes |
| --- | --- | --- | --- |
| 2026-07-01 | `npm run intelligence:hybrid -- --task-id backport-port-consolidation ...` | passed | Generated Template Intelligence, queried `ui-primitives` and `dev-server`, made two Serena semantic calls, and recorded a Hybrid benchmark row. |
| 2026-07-01 | `npm run lint` | passed | Biome reported config info messages only. |
| 2026-07-01 | `npm run typecheck` | passed | TypeScript completed with no errors. |
| 2026-07-01 | `npm run build` | passed | Next build completed; `.env.local` was present but not inspected. |
| 2026-07-01 | `npm run verify:smoke` | passed | Local production smoke checked `/`, `/internal/intelligence`, and `/api/health`; health `503` accepted. |
| 2026-07-01 | `npm run dev:agent -- --dry-run` | passed | Printed `http://localhost:3013` with automation URL. |
| 2026-07-01 | `npm run dev:agent -- --random --dry-run` | passed | Printed a random agent port with automation URL. |
| 2026-07-01 | `check-shape-strategy-adapter` | passed | Adapter read the initialized strategy root with no warnings. |
| 2026-07-01 | `git diff --check` | passed | No whitespace errors. |
| 2026-07-01 | `node --check retired generator script scripts/verify/verify-smoke.mjs scripts/_lib/local-production-preview.mjs` | passed | Syntax checks completed for legacy removal and smoke helper scripts. |
| 2026-07-01 | `retired generator command -- --dry-run --no-dashboard --no-demo --no-dictionary --no-reference --no-playground` | passed | Dry-run preserved smoke rewrite as a central file without mutating the checkout. |
| 2026-07-01 | `retired generator command -- --dry-run --no-dashboard --no-demo --no-dictionary --no-reference --no-playground --no-payload` | passed | Dry-run covered the no-Payload variant and package rewrite plan. |
| 2026-07-01 | `retired generator command -- --dry-run --no-intelligence` | passed | Dry-run covered the route-list variant where `/internal/intelligence` is removed. |
| 2026-07-01 | Rendered legacy removal smoke verifier sanity check | passed | Retained routes include `/internal/intelligence`; intelligence-reduced routes omit it; both use the shared production preview helper. |
| 2026-07-01 | `npm run intelligence:hybrid -- --task-id INF-UI-009 ...` | passed | Worker generated Template Intelligence, queried `ui-primitives`, made two Serena semantic calls, and recorded a Hybrid benchmark row. |
| 2026-07-01 | `npm run lint`, `npm run typecheck`, `git diff --check` | passed | Worker verification for the responsive hero `Section` sizing port. |
| 2026-07-01 | `npm run intelligence:hybrid -- --task-id INF-UI-001-panel-divider ...` | passed | Generated Template Intelligence, queried `ui-primitives`, made two Serena semantic calls, and recorded a Hybrid benchmark row. |
| 2026-07-01 | `npm run lint`, `npm run typecheck`, `npm run build`, `git diff --check` | passed | Verification for added `Panel` and `Divider` primitives. |
| 2026-07-01 | `npm run verify:smoke` | passed | Final local production smoke after primitive additions checked `/`, `/internal/intelligence`, and `/api/health`. |
| 2026-07-01 | `npm run intelligence:hybrid -- --task-id INF-UI-004-dropdown ...` | passed | Worker generated Template Intelligence, queried `ui-primitives`, made two Serena semantic calls, and recorded a Hybrid benchmark row. |
| 2026-07-01 | `npm run intelligence:hybrid -- --task-id INF-UI-006-modal ...` | passed | Worker generated Template Intelligence, queried `ui-primitives`, made two Serena semantic calls, and recorded a Hybrid benchmark row. |
| 2026-07-01 | `npm run lint`, `npm run typecheck`, `npm run build`, `git diff --check` | passed | Integrated verification after dropdown and modal behavior backports. |
| 2026-07-01 | `npm run intelligence:hybrid -- --task-id historical-ui-restore ...` | passed | Reran with valid topics `ui-primitives` and `legacy-subtraction` after an invalid topic attempt; recorded a Hybrid benchmark row. |
| 2026-07-01 | `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` | passed | Orchestrator verification after restoring historical `IconSwap`, `useCopyAction`, `CopyField`, and richer `Button` behavior from `7235466`; lint reported existing Biome config info only. |
| 2026-07-01 | `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` | passed | Worker verification after bulk UI recovery from `7235466`; restored icons, inputs, time helpers, and core misc while leaving graph/health/media-inspection surfaces gated. |
| 2026-07-01 | `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` | passed | Orchestrator verification after integrating the bulk UI recovery and ledger updates; lint reported existing Biome config info only. |
| 2026-07-01 | `npm run intelligence:hybrid -- --task-id orchestration-legacy-cleanup ...` | passed | Generated Template Intelligence, queried `dev-server` and `legacy-subtraction`, made a Serena semantic lookup, and recorded a Hybrid benchmark row. |
| 2026-07-01 | `node --check scripts/orchestration.mjs retired generator script` | passed | Syntax checks completed after adding the orchestration shim and legacy removal warning/idempotency changes. |
| 2026-07-01 | `npm run orchestration -- state` | expected failure | Cleanly reported that no docked `docs/orchestration` CLI root exists yet. |
| 2026-07-01 | `npm run orchestration-state` | expected failure | Same clean missing-docked-root message as the direct orchestration command. |
| 2026-07-01 | `retired generator command -- --dry-run --no-dashboard` | passed | Printed the canonical-template `main` warning and did not mutate files. |
| 2026-07-01 | `retired generator command -- --yes --no-dashboard` | expected failure | Printed the warning and kept the hard gate without `--confirm-template-root`. |
| 2026-07-01 | `retired generator command -- --yes --no-dashboard --confirm-template-root` in disposable checkout | passed | Confirmed maintainer path completed formatter, reference validation, and build outside the dirty working tree. |
| 2026-07-01 | `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` | passed | Final cleanup packet verification; lint reported existing Biome config info only. |
| 2026-07-03 | `bash ~/.codex/skills/production-ship/scripts/ship-git.sh --message "Restore full template surface after accidental legacy removal" ...` | passed | Staged source-like recovery files, ran lint/build, committed `948efcd`, fast-forward checked `main`, and pushed `origin/main`; lint reported existing Biome config info only. |
| 2026-07-03 | `npm run intelligence:hybrid -- --task-id resume-template-backport ...` | passed | First attempt used an invalid topic and recorded nothing; rerun queried `ui-primitives`, `legacy-subtraction`, and `dev-server`, made two Serena semantic calls, and recorded a Hybrid benchmark row. |
| 2026-07-03 | `npm run intelligence:hybrid -- --task-id INF-UI-006-modal-a11y ...` | passed | Generated Template Intelligence, queried `ui-primitives`, made two Serena semantic calls for `ModalShell`, and recorded a Hybrid benchmark row. |
| 2026-07-03 | `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` | passed | Verification after completing modal focus trap, focus restore, and top-most modal guard; lint reported existing Biome config info only. |
| 2026-07-03 | `npm run intelligence:hybrid -- --task-id ARB-META-001-metadata-helper ...` | passed | Generated Template Intelligence, queried `content-modes`, made two Serena semantic calls for root metadata, and recorded a Hybrid benchmark row. |
| 2026-07-03 | `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` | passed | Verification after adding the generic metadata config/helper; lint reported existing Biome config info only. |
| 2026-07-03 | `npm run intelligence:hybrid -- --task-id compare-content-page-portfolio ...` | passed | Comparison pass queried `content-modes`, made two Serena semantic calls for marketing content types, and recorded a Hybrid benchmark row. |
| 2026-07-04 | `npm run intelligence:hybrid -- --task-id ARB-CONTENT-001-markdown-renderer ...` | passed | Generated Template Intelligence, queried `content-modes` and `ui-primitives`, made two Serena semantic calls for `Button`, and recorded a Hybrid benchmark row. |
| 2026-07-04 | `npm run typecheck`, `npm run lint`, `npm run build` | passed | Verification after adding `MarkdownRenderer`, markdown dependencies, and `/internal/demo/composites/markdown`; lint reported no findings. |
| 2026-07-04 | `curl -fsS http://localhost:3069/internal/demo/composites/markdown?motion=off&reveal=off` | passed | Verified the isolated agent preview route returned the markdown demo, rendered both button directive labels, and escaped the raw `<script>` sample as text. |
| 2026-07-04 | Disposable thin-start activation, `npm run review:thin-start-api -- --strict`, `npm run typecheck` | passed | Verified thin-start keeps `src/components/composites/markdown/MarkdownRenderer.tsx` plus a minimal `ChoiceIndicatorMulti` dependency without restoring the broad icon/helper/misc surfaces. |
| 2026-07-04 | Disposable thin-start activation, `npm run review:thin-start-api -- --strict`, `npm run typecheck`; `curl -fsS http://localhost:3069/internal/demo/ui/input/choice?motion=off&reveal=off` | passed | Verified thin-start now keeps `RadioInput`, `MultiselectInput`, `ToggleInput`, `ChoiceField`, and `ChoiceIndicators`; full demo route includes the thin-start choice-input usage snippet. |
| 2026-07-04 | `npm run intelligence:hybrid -- --task-id scroll-performance-page-target-rebuild ...`; `npm run lint`; `npm run typecheck`; `npm run build`; `npm run measure:scroll-performance -- --path /internal/demo/ui/primitives --output tmp/scroll-performance-page-smoke.json --notes "page smoke"`; `npm run record:scroll-performance -- --input tmp/scroll-performance-page-smoke.json --output tmp/scroll-performance-runs-smoke.jsonl`; `npm run setup:scroll-performance-autoresearch -- --tag page-smoke --path /internal/demo/ui/primitives --mutable src/components/ui/primitives --dry-run`; scroll-performance legacy removal dry-runs; canonical `main` mutating legacy removal failure | passed / expected failure | Verified the replacement page-target scroll-performance system, grouped scripts, ignored runtime output, narrower `--no-scroll-performance` surface, and removal of the synthetic internal fixture route. The mutating legacy removal command failed as expected on canonical `main` without `--confirm-template-root`. |
| 2026-07-19 | Full and materialized thin `npm run typecheck`, `npm run build`, and `npm run verify:smoke` | passed | Full produced 23 routes; thin produced 9 routes. Both smoke checks passed `/`, `/internal/intelligence`, and `/api/health`. |
| 2026-07-19 | `npm run review:thin-start-api -- --root .thin-start/workspace --strict` | passed | No broad, outside-allowlist, parked-reference, or compatibility-marker findings. |
| 2026-07-19 | Default and custom `create:thin-start`; guarded in-place checks; `dev:thin -- --random --dry-run` | passed / expected failure | Default and custom workspaces materialized from one manifest. Missing `--confirm-instance` failed closed; in-place dry-run did not mutate. |
| 2026-07-19 | `cmp` shared Panel/Card; thin MDX/editor exclusion | passed | Full and thin Panel/Card files are byte-identical; thin has no MDXEditor package or editor source. |
| 2026-07-19 | Isolated preview route matrix | passed | Full `/internal/demo` and thin `/`, `/contact`, and `/internal/intelligence` returned 200 with automation overrides. |
| 2026-07-19 | Responsive visual gate 1 at base, small, medium, large, and extra-large widths in light and dark modes | passed | Reviewed the full internal component demo and the thin home/contact/internal-intelligence matrix. The full MDX editor rendered initial content, inserted a mention, and entered source mode. |
| 2026-07-19 | Focused Biome checks and `git diff --check` | passed | No errors. Biome retained the existing intentional `<img>` warning in the file-inspection preview surface. |
| 2026-07-19 | `npm run verify:auth` | passed | Verified safe continuation paths and review flags, singleton auto-selection, multi-org selection, revoked selection recovery, invitation preview/recipient/expiry/revocation/reuse/reinvite rules, final viable identity protection, fail-closed methods, and private-file policy. |
| 2026-07-19 | Live auth route and cookie checks | passed | `/dashboard/settings?tab=profile` preserved its safe continuation, unsafe callback continuation fell back to `/dashboard`, opaque HttpOnly fixture login reached the dashboard, logout cleared the session, and multi-org login required selection before dashboard access. |
| 2026-07-19 | Full and materialized thin typecheck/build/smoke plus strict thin API review | passed | Full built 34 routes including all accepted auth routes and handler; thin built 9 routes with auth, dashboard, verifier, proxy, adapters, and direct `tsx` dependency absent. Shared Card remained byte-identical. |
| 2026-07-19 | Auth visual review at mobile, tablet, and desktop widths | passed | Reviewed login, invitation, and organization-selection screens with automation flags; corrected structured invitation fields and propagated motion/reveal flags across safe auth redirects. |
| 2026-07-20 | `npm run verify:dashboard`, `npm run verify:auth`, `npm run lint`, `npm run typecheck`, `git diff --check` | passed | Registry ownership, route hierarchy, capability filtering, feature configuration, debug modes, and auth lifecycle passed. Biome retained the intentional thin image-inspection `<img>` warning only. |
| 2026-07-20 | Full `npm run build` and `npm run verify:smoke` | passed | Full built 38 routes including the accepted dashboard and debug route matrix; smoke passed. Legacy `/dashboard/pages` source ownership is absent. |
| 2026-07-20 | Contextual Command-K cleanup and forced-loading geometry checks | passed | The records command registered once and unregistered after navigating to settings. Forced loading preserved the real shell and retained the same 872px content-frame height. |
| 2026-07-20 | Dashboard responsive light/dark review | passed | Reviewed desktop records/detail plus collapsed and expanded mobile shell; corrected the mobile logo visibility conflict and verified rendered typography resolves to Inter rather than the browser serif fallback. |
| 2026-07-20 | Materialized thin strict API review, full-only absence assertions, typecheck, build, and smoke | passed | Thin built 10 routes with dashboard, debug API, dashboard verifier, and full-only MDX editor source absent; strict API review reported no findings. |
| 2026-07-20 | `npm run verify:frontend-entities`, `npm run verify:dashboard`, `npm run verify:auth`, `npm run verify:profiles` | passed | Verified React-free/fetch-free presentation factories, user/membership separation, organization-scoped resettable CRUD, mutation failure integrity, confirmation rollback and `false`-keeps-open behavior, skeleton namespaces, policy markers, route hierarchy, invitations, identity protection, and legacy removal dry-runs. |
| 2026-07-20 | Disposable `--no-dashboard-reference-entities` apply/build plus dashboard verifier | passed | Removed records, members, reference routes, entity layers, policy, and focused scripts while retaining and building dashboard/auth/organization/settings core (36 routes). |
| 2026-07-20 | Disposable `--no-dashboard` and `--no-dashboard --no-payload` apply/build/typecheck | passed | Dashboard-only legacy removal retained the Payload-ready marketing/internal profile (19 routes); combined static legacy removal removed Payload and dashboard/auth ownership and built 18 routes. |
| 2026-07-20 | Materialized C5 thin strict API review, absence assertions, typecheck, build, and smoke | passed | Thin built 10 routes and excluded dashboard, entity policy/verifiers, MDX editor source/package, and all entity scripts. |
| 2026-07-20 | Auth/dashboard visual gate 2 and browser lifecycle checks | passed | Reviewed light/dark mobile/tablet/desktop auth, overview, record detail, members, member profile, reference parity, Markdown modal, and mobile shell. Browser checks passed entity Command-K registration/cleanup, create/edit/delete, failed deletion keeping confirmation open, optimistic rollback, and mobile navigation. Fixed the server/client avatar-skeleton split and added auth system-dark behavior discovered by this gate. |
| 2026-07-20 | `entity-frontend-system` skill initialization and `quick_validate.py` | passed | Created `/Users/olafbobryk/.codex/skills/entity-frontend-system`; it discovers repository contracts and recommends available vertical skills without superseding local policy or invoking them automatically. Validation ran in an ephemeral PyYAML environment because the default Python lacked the validator dependency. |
| 2026-07-20 | Final `git diff --check`, full Biome, typecheck, focused auth/dashboard/entity/legacy removal verifiers, 39-route build, and smoke | passed | All closure gates passed. Biome reported only the existing intentional thin image-inspection `<img>` warning. |
| 2026-07-20 | Strict pinned-source Card comparison, default and `size="sm"`, light/dark | passed | The pre-fix default differed by 15.8099% exact pixels in light and 15.8249% in dark. After pinning Card's radius, ring/no-shadow chrome, and independent structured gap, all four corrected comparisons reached 0 exact and 0 >=16-channel changed pixels. |
| 2026-07-20 | Live xl Card demo review at `http://localhost:3074/internal/demo/ui/primitives?motion=off&reveal=off` | passed | The hot-reloaded default Card computed to an 8px radius, 0px real border, 1px foreground ring with no shadow, and 16px gap. Light and forced-dark 1440x1000 captures were inspected. |
| 2026-07-20 | Focused Biome, `git diff --check`, full/thin typecheck, shared Panel/Card `cmp`, and strict thin API review | passed | The full and freshly materialized thin profiles retain byte-identical Panel/Card implementations. Strict review reported no broad, outside-allowlist, parked-reference, or compatibility-marker findings. |
| 2026-07-20 | Labeled Divider light/dark page and elevated-surface review at `http://localhost:3090` | passed | Replaced the label's `bg-background` paint-over with two flexible rule segments that stop at the unchanged padded label box. Login and internal primitive demo captures preserve the 384x21 and 260x21 divider geometry, render a transparent label background, and report no console or request failures. |
| 2026-07-20 | `npm run verify:mutation-policy`, `npm run verify:frontend-entities`, `npm run verify:dashboard`, `npm run verify:profiles`, focused Biome, `npm run typecheck`, `git diff --check` | passed | Verified the full/thin submission guard, dismissal locking, structured local results, explicit refresh/navigation deletion completion, rollback contracts, policy markers, and surface removal ownership. |
| 2026-07-20 | Full build/smoke and disposable thin materialization, strict API review, install, typecheck, build, smoke, and full-only absence assertions | passed | Full built 39 routes. Thin built 10 routes with the shared modal submission contract present and dashboard, Markdown editor, and mutation verifier ownership absent. |
| 2026-07-20 | Live mutation lifecycle review at `http://localhost:3090` | passed | The async demo rejected conflicting submission controls and Escape while pending; failed record creation retained its title with inline and toast feedback; failed deletion kept confirmation mounted and restored the optimistic row; list deletion stayed on the collection route; detail deletion replaced navigation to `/dashboard/records`; the Markdown modal remained mounted with inline failure feedback; fixture state was reset and no console warnings/errors remained. |
