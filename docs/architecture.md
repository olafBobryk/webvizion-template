# Averlo Template Architecture

Architecture for the Averlo full, app-only, marketing-only, and thin-start profiles.
This document defines durable system boundaries and does not authorize or prescribe an implementation sequence.
Reviewed against [the staging acceptance ledger](./architecture-staging.md) on 2026-07-20, including the pinned-source surface rescan and mutation-policy delta, with no unresolved or drifted decisions.

## Source relationship

- Full start is the canonical broad template system.
- Inference Console is a pinned visual and behavioral reference, not a runtime dependency, general component donor, backend blueprint, or source dependency.
- Inference Console revision `8a13d12ea11461fe204625bd1247a6db16c4a207` is the immutable baseline for this convergence. Later source changes require an explicit repin decision.
- The committed mutation-policy delta through `1c6208b37fabb4666c142490608f45662013b0f7` is a separately accepted behavioral reference. It does not repin the visual baseline or authorize unrelated source changes.
- Structural primitive convergence begins with `Panel` and `Card`; styling convergence covers the complete shared consumer layer.
- Source convergence is additive. Matching the reference must not flatten mature template APIs that remain useful.

## Template profiles

- `full` is the canonical broad source with marketing, auth, dashboard,
  developer tools, and Payload-ready scaffolding.
- `app-only` removes marketing and Payload, adds an explicit `/` to
  `/dashboard` redirect, and retains auth, dashboard, and local developer tools.
- `marketing-only` removes auth/dashboard while retaining the broad shared UI,
  marketing, developer tools, and Payload-ready scaffolding.
- `thin-start` remains the explicit minimal marketing profile.
- Profiles compose surface-owned manifests through one assembly command. The
  selected profile and content capability determine the owned core and surface
  files emitted into a one-way project without template tooling.
- The completed cutover and its verification evidence are recorded in
  `docs/positive-assembly-transition.md`.

### Shared-source invariant

- Components present in both full start and thin start normally share one implementation and visual contract.
- A profile-specific implementation exists only as an explicit, intentional override.
- Full start's live source is the canonical shared source rather than materialized output.
- Thin start references canonical shared files through an authoritative profile manifest.
- Genuine thin-specific replacements live as real source files outside the full-start import graph.

### Authoritative manifests

- Surface manifests own paths, routes, dependencies, scripts, markers, and
  removal assertions. Profile manifests compose surfaces and add only genuine
  profile-specific file overrides and validation.
- Package scripts and dependencies have explicit core or surface ownership. An
  unclassified source path or package entry fails assembly instead of being
  silently copied.
- Thin-start additionally uses a checked-in positive source inventory. Its
  inventory is generated from a verified materialized baseline, then reviewed
  and versioned as the profile's explicit source boundary.
- Generator reporting and API review derive from that manifest rather than parallel configuration lists.
- Review allowlists validate output; they never contain component source definitions.

### Thin-start materialization

- The thin-start generator is a materializer that selects shared files, applies explicit file-backed overrides, removes excluded surfaces, and adjusts profile dependencies.
- Component source does not live in generator strings.
- Routine thin-start development materializes into an ignored, isolated workspace that can run beside the canonical full-start preview without rewriting the canonical checkout.
- Materialized thin workspaces are disposable and are not edited directly. Changes belong in canonical shared source or explicit thin overrides before rematerialization.
- In-place materialization is reserved for creating a new template instance.

## Visual system

### Visual baseline

- The complete template adopts the pinned Inference Console visual system in light and dark modes.
- The shared foundation includes semantic colors, surfaces, borders, primary and status colors, sidebar tokens, chart and spectrum colors, radius scale, focus behavior, motion behavior, and scrollbar treatment.
- Template-specific automation and motion-disable behavior remains intact.
- The reusable template uses Inter through the shared application-font contract. Local SF Pro binaries are not distributed.
- Marketing and authentication retain their existing template composition and content architecture while adopting the converged tokens, primitives, and visual grammar.
- Dashboard parity is intentionally close to the reference across shell geometry, navigation, spacing, density, cards, tables, forms, overlays, interaction states, and responsive behavior.
- Spectrum accents remain reusable visual tokens. Inference Console logos, product copy, domain-specific artwork, and its custom profile-picture gradient background are excluded.

### Panel and Card

- `Panel` is the non-semantic surface primitive.
- `Panel` owns background, border, radius, shadow, overflow, width, padding, basic display and gap, polymorphic element selection, and ref forwarding.
- Responsive columns and card-specific structure belong to layout composition rather than `Panel`.
- `Card` is a structured content pattern built on `Panel`, with header, title, description, action, content, and footer slots.
- `Card` fixes sensible surface defaults and exposes a small density or size contract. Its slots own internal spacing and typography.
- Bounded Card escape hatches include overflow, shadow, semantic accent, and caller classes; Card does not pass through every Panel layout property.
- Shared semantic accents are `neutral`, `info`, `success`, `warning`, and `danger`, used consistently across surface and Card slots.
- Arbitrary hexadecimal Panel/Card accents and separate translucent-versus-solid public modes remain outside the contract unless a demonstrated dashboard requirement justifies them.
- Full and thin profiles expose the same Panel and Card implementation.
- Card slots render only under a real Card root. Card-like overlays use Card; structurally different overlays define overlay-owned slots.

### Button and Chip

- Button separates action hierarchy (`primary`, `secondary`, `ghost`, and contextual `inverse`) from semantic `default`/`danger` tone. Its sizes are `none`, `sm`, `md`, `lg`, `xl`, `icon`, `icon-sm`, and `chip`; omitted variant and size resolve to `secondary` and the 36px `md` shell.
- Useful template contracts such as `outline`, icon-registry inputs, content and text configuration, radius and hit-area controls, focusability, typed link and button behavior, class and style extension, and layout alignment remain available unless explicitly superseded.
- Loading keeps normal content in layout while a position-absolute centered loader fades over it, preventing loading-state resizing.
- `Button.Skeleton` mirrors live size, alignment, radius, icons, label width, and variant treatment without changing final dimensions.
- Chip uses the compact rounded-medium reference design with semantic, spectrum, and custom colors and supports static, link, and button behavior.
- `Chip.Text` and `Chip.Skeleton` are part of the contract. Useful existing tone, helper-palette, icon, and canvas-measurement capabilities remain available.

### Loading and client boundaries

- Shared components with recurring loading representations expose component-owned namespaced skeletons such as `Field.Skeleton`, `InputFrame.Skeleton`, and `Accordion.Skeleton`.
- Component-owned skeletons extend the template's richer live APIs. Routes compose them rather than duplicating component geometry.
- Components remain single-file by default. A component may separate shared contracts, a server-safe public entry and skeleton, and a narrow client implementation when server consumers need its types or skeleton without importing meaningful client-only behavior.
- This split is a selective dependency-boundary technique, not a mandatory naming convention or universal component structure.

### Markdown

- `Markdown.Render` is shared by full and thin profiles and operates on plain Markdown strings.
- It supports default and compact density, design-system-backed GFM, task lists, tables, images, code, quotes, links, validated generic button directives, and optional durable `@[user:<id>]` mention resolution.
- Default density owns site and document content; dashboard cards and Markdown modals opt into compact density. Renderer and editor use the same `.markdown-content` typography, list, quote, code, table, and rhythm contract for the selected density.
- Rendered tasks use `ChoiceIndicatorMulti`. The editor preserves Lexical's native inline checklist marker and interaction model while matching that shared indicator's geometry and tokens without injecting React into Lexical-owned DOM.
- It does not accept arbitrary HTML, JSX, class injection, data registries, or product-specific directives.
- Underline is the sole narrow exception: the editor stores paired `<u>...</u>` tags and the renderer recognizes only exact pairs without enabling general raw HTML parsing.
- `Markdown.Editor` is a full-start-only client composite; thin start retains `Markdown.Render` without the MDXEditor dependency.
- The editor persists only plain Markdown strings and provides responsive rich editing, lossless source mode, automatic source fallback, headings, inline formatting, lists and tasks, links, tables, images, code, dividers, undo and redo, optional mention insertion, generic button-directive editing, and default or compact density.
- Its width-aware toolbar composes the template's canonical `Icon`, `Dropdown.Menu`, `Dropdown.Listbox`, and `Button` contracts rather than a duplicate package-owned menu system; editor dialogs remain on the Card-owned modal host.
- `Dropdown.Menu` owns action-menu keyboard navigation, fixed or absolute positioning, portal support, hover and pinned modes, Button-backed triggers, and active or disabled options.
- `Dropdown.menuOptions` provides typed factories for recurring open, edit, and delete actions with consistent icons, dividers, disabled states, danger semantics, and stable danger-last ordering.
- Baseline image insertion accepts image URLs only. File upload is a caller or product integration.
- Markdown stores mentions as durable `@[user:<id>]` references. Callers provide options and rendering resolution; shared Markdown components never fetch organizations or users directly.

### Inputs and supporting primitives

- The frontend import policy lives in `docs/frontend-import-policy.md`. Cohesive component families may expose curated public barrels while keeping internal owner imports direct.
- `@/components/ui/input` is the stable public input boundary for external consumers. Full and thin profiles own explicit barrels matching their retained capabilities, so physical input folders can be reorganized without changing consumer imports.
- `@/components/ui/misc` is the stable public misc boundary for application and feature consumers. Full start exposes the reusable family while thin start exposes only `Skeleton`; misc internals and lower-level UI dependencies retain direct owner imports to prevent circular or inverted dependency graphs.
- `ColorInput` and `ColorSwatchInput` belong to full start only.
- `ColorInput` supports controlled and uncontrolled hexadecimal selection, pointer and keyboard operation, normal form submission, field validation, and portal-aware dropdown positioning.
- `ColorSwatchInput` supports generic typed presets and an optional custom color. Shared semantic defaults are neutral, info, success, warning, and danger; product palettes remain outside the shared input.
- A single-date `DateInput` matches the pinned Inference Console visual and interaction design while exposing template-safe controlled and uncontrolled values and native form serialization.
- `DateInput` and `DateRangeInput` share configurable locale, timezone, and preset contracts. Neither hardcodes a universal timezone or fixed all-time boundary.
- The existing searchable `SelectInput` remains canonical. Its `onOptionSelect` hook runs before value mutation; returning `true` claims an action row so it can close the menu without changing the selected or hidden form value.
- Existing file and profile-picture inputs retain their caller-controlled APIs while supporting configurable validation, native file-form behavior, optional integrated previews, per-file removal, object-URL cleanup, and form reset.
- `ProfilePictureInput` supports configurable accepted types and maximum size without Inference-specific storage behavior or profile gradients.
- Accepted ports include their generic dependency closure: semantic accent helpers, `StatusMessage`, `ModalForm`, shared overlay chrome, and the markdown-mention parser.
- `ModalForm` includes a generic `ModalStepForm` and `StepIndicator` matching the pinned source's visual and interaction design while retaining stronger compatible template modal APIs.
- Completed step panels remain mounted and hidden so field state survives navigation. Back and Next never submit; only the final action validates and submits.
- The shared confirmation system supports structured impact details, warnings, semantic confirm variants, and asynchronous confirmation that may return `false` to keep the modal open after a failed mutation.
- Full and thin `ModalShell` implementations expose `useModalSubmission`, reject duplicate submissions, and block Escape, backdrop, and header-close dismissal while a mutation is pending. The port preserves the full shell's stronger focus, stacking, scroll-lock, motion, and composition behavior and the thin shell's smaller public surface.
- Shared modal options carry an accessible label through the host. Both confirmation implementations consume the shell submission contract. Full-start `ModalStepForm` accepts submission state and disables Back, Cancel, and Next while pending; its caller-owned final action uses the Button loading contract.
- Server-backed modal actions return local discriminated results shaped as `{ ok, message, fieldErrors? }`. Field-error keys remain form or domain owned; there is no global catch-all modal mutation result type. Validation stays inline, while overall success, partial success, and recoverable failure use the shared toast system.
- Recoverable failure clears pending state and preserves the mounted modal and entered values. Same-route success closes and performs one local update or `router.refresh()`. Navigation success performs one `router.push()` or `router.replace()`, closes without refreshing, and remains submission-locked until unmount so the destination loading boundary owns pending presentation.
- Existing template helpers remain canonical where they provide an equivalent or stronger contract.

## Full-start dashboard

### Product-neutral reference application

- The dashboard is a first-class, product-neutral reference application rather than an empty shell or fabricated business product.
- Capability-led fixtures demonstrate overview, collection, record detail, personal settings, organization settings, responsive behavior, and loading, empty, error, unavailable, and not-found states.
- Example capabilities are replaceable reference patterns, not requirements for every resulting product.
- Charts and summary metrics are optional extensions rather than baseline content.

### Routes and surface registry

- Baseline routes include `/dashboard`, `/dashboard/profile`, `/dashboard/administration`, `/dashboard/records`, `/dashboard/records/[recordId]`, `/dashboard/settings`, and `/dashboard/support`.
- Organization routes are `/dashboard/organization` and `/dashboard/organization/settings`; the legacy `/dashboard/organization/members` route redirects to Administration.
- A typed dashboard surface registry is the source of truth for route identity, paths, labels, navigation placement, breadcrumbs, visibility, and standard-versus-wide layout mode.
- Navigation, breadcrumbs, and Command-K consume the same registry and organization context model.
- Mounted pages and surfaces may register currently available contextual actions with the dashboard shell. Dashboard-local registration is removed when its owner unmounts.
- Command-K combines live actions with the static surface hierarchy, navigation, active organization context, and capability checks rather than maintaining a separate command model.
- The overview is a lightweight capability and navigation directory rather than a required metrics dashboard.
- Dashboard Support combines a configurable mailto action with a guarded,
  fixture-only request form. Support requests never send email and are visible
  to platform administrators in `/dashboard/platform/inbox`.

### Platform operations

- `AuthUser.platformRole` is an organization-independent access axis. The
  fixture operator is a platform administrator; organization owner/admin roles
  do not imply platform access.
- `/dashboard/platform` is the capability-gated entry surface for internal
  operations in the canonical dashboard shell. It links to Inbox for dashboard
  support requests and Reports for structured issue reports captured from the
  dashboard modal; those child routes do not appear in the sidebar.
- Support and report fixtures are in-memory, resettable, and make no external
  writes. Reports retain route, viewport, and browser context but no
  attachments. Status and internal notes follow deterministic triage rules.
- Platform pages use the ordinary dashboard sidebar, top bar, breadcrumbs,
  Command-K, responsive width, tables, detail fields, member and organization
  presentation, Cards, Chips, loading states, and form feedback. Their route
  identity lives in the canonical dashboard surface registry.

### Shell and application components

- The shell uses a fixed responsive sidebar with desktop collapse and mobile overlay behavior, plus a persistent top bar with command and account surfaces.
- Pages use shared breadcrumbs, page headers, action zones, a constrained standard width, and an explicit wide-surface escape hatch.
- Product branding and domain behavior are not copied into the shell.
- Recurring dashboard patterns live in a full-start-only application component layer; thin start excludes that layer.
- The layer owns shell, navigation, page header, breadcrumbs, table panels, detail fields, property lists, and loading counterparts. Route-specific fixture content remains route-owned.

### Entity presentation

- Entity presentation is a full-start dashboard capability rather than a shared primitive, thin-start dependency, or application-wide global registry.
- Entity-presentation source lives beneath `src/app/(site)/dashboard` so dashboard assembly ownership remains physically visible.
- Non-React contracts and factories live beneath dashboard `_lib`, with generic presentation contracts separated from entity-owned domain inputs and presentation definitions. React renderers live beneath dashboard `_components`, with generic presentation components separated from entity-owned components.
- Surface adapters remain with their route or surface until repeated consumers justify promoting a reusable entity-owned adapter.
- The profile manifest exposes `dashboard.reference-entities` as an independently selectable child surface. The small presentation foundation remains dashboard core; profiles without the dashboard exclude both, while profiles without reference entities exclude their examples, integrations, demonstrations, and policy hooks.
- A small dashboard presentation foundation owns only reusable contracts such as entity nouns, action labels, empty-state copy, field and column metadata, semantic variants, and renderer inputs.
- Source is split by dependency layer and entity ownership. Each entity folder separates domain inputs, presentation definitions, derived view-model factories, render components, and surface adapters; product-specific roles, routes, labels, icons, permissions, formatting, and variants remain with that entity.
- Dashboard consumers import directly from owning files. There is no global entity barrel, central `presentationRegistry`, or `presentationRender` object; a narrow entity entrypoint exists only when it deliberately hides private structure from multiple consumers.
- Renderers receive ready data and never fetch. Routes and adapters own authorization, organization context, persistence, and mutations.
- The reference identity entity separates a global user from an organization-scoped member. Its resolved presentation provides deterministic display, email, initials, avatar, role, joined-date, profile-target, and Markdown-mention fallbacks.
- The example member demonstrates profile, compact, actor, avatar-only, avatar-list, table, detail, selector, Command-K, Markdown mention, empty, and skeleton presentations without the Inference-specific profile gradient.
- Entities implement only the presentation surfaces they need. An internal dashboard reference surface demonstrates the contracts and provides copyable usage.

### Frontend entity policy and workflow

- A repository-owned frontend entity policy is authoritative for entity ownership, presentation reuse, data-source boundaries, surface integration, skeleton parity, demonstrations, and documentation.
- Relevant dashboard, component, domain, and library `AGENTS.md` files link to the focused policy rather than duplicating or centralizing every rule at the root.
- Where an entity participates in tables, forms, filters, detail views, selectors, Command-K, Markdown mentions, empty states, or loading surfaces, those consumers reuse the owning presentation definitions.
- A generic `entity-frontend-system` Codex skill is an optional discovery and audit workflow linked from the policy. It searches for the repository's actual entity, presentation, renderer, surface, loading, command, and import contracts; classifies entity surfaces; identifies gaps; and recommends relevant vertical skills or work without inventing product models, encoding template-specific paths, or invoking recommended workflows without task authorization.
- The skill contract is derived only after the presentation foundation, example member, and repository policy establish real APIs; the skill never supersedes repository policy.
- Frontend policies may reference only verifiable paths, exports, demonstrations, and public contracts. A policy-integrity check reports stale references rather than allowing copied instructions to drift away from the repository.

### Records, detail, and mutations

- The collection reference demonstrates search, filtering, sorting, pagination, row navigation, and action menus.
- The detail reference demonstrates page actions, structured properties, related data, and a focused edit modal.
- `DashboardDetailField` supports static, link, action, copy, truncation, icon, disabled, and skeleton states.
- `DashboardPropertyList` provides responsive identity, value, and action columns, add-property selection, and row actions.
- `DashboardMarkdownEditorModalButton` provides focused Markdown editing. Callers own asynchronous persistence; the composite owns modal composition, shared submission locking, validation display, loading feedback, errors, and success toasts.
- Detail and property components own presentation and interaction composition only. Routes own property schemas, authorization, persistence, and product-specific editors.
- Fixture adapters provide organization-scoped, resettable create, edit, archive, and delete commands and demonstrate confirmation, validation, toast, optimistic, and failure feedback.
- An entity-neutral deletion lifecycle definition and dashboard composition centralize impact descriptions, confirmation structure, danger-menu placement, mutation feedback, completion behavior, and disabled explanations. Owning adapters retain the mutation and entity-specific consequences.
- Entity deletion completion is typed as `refresh` or `navigate`. The shared API retains refresh as a compatibility default, while reference consumers declare completion explicitly. Deleting the entity represented by the current detail route uses replacement navigation; feature callbacks do not duplicate the route change or refresh the deleted route.
- Optimistic deletion rolls back after either a failed result or a thrown mutation. Failure reports through the shared toast system and returns `false` so confirmation remains open.
- Reference adoption covers record create and edit, dashboard and reusable Markdown modal forms, entity confirmation and deletion, and the internal asynchronous-mutation demonstration. The non-persistent report-issue stub and non-modal profile form remain outside this modal policy.
- The framed and dashed no-data treatment proven by Inference Console is a dashboard-oriented variant or wrapper around the canonical `StateIndicator`, not a competing global null-state system.
- Demo persistence may be explicitly non-durable; production adapters own durable storage.

### State and debug surfaces

- Real routes own their normal loading, error, not-found, and other relevant boundaries.
- Status and not-found surfaces use a shared frame derived from the dashboard surface registry rather than hardcoded product route prefixes.
- A guarded internal dashboard review route renders deterministic live, loading, empty, error, and unavailable variants.
- The guarded review surface presents live and skeleton examples side by side for fields, accordions, tables, detail views, cards, and installed optional chart surfaces.
- Skeleton parity review covers geometry, responsive behavior, and light and dark modes.
- A default debug surface can force loading while preserving the real route shell.
- Debug controls are separate from normal navigation and product behavior.
- The debug menu is available in development or guarded internal-review mode by default; production exposure requires explicit environment opt-in.
- A generic activity or event row remains an optional dashboard extension. Inference-specific notifications, product permission presentations, charts, and provider-branded authentication buttons are demand-led rather than baseline ports.

## Data, authentication, and organizations

### Scaffold boundaries

- The default dashboard runs from deterministic typed fixtures behind lightweight adapters and does not require Payload, Supabase, or another hosted backend.
- Authentication uses a provider-neutral contract with a local mock or demo session. Dashboard routes remain guarded, and a real provider may replace the adapter.
- Fixture, authentication, active-organization selection, and persistence adapters are clearly labeled template scaffolding, not recommended final product implementations.
- A provider-neutral private-file and avatar-storage adapter defines authorization, validation, opaque object keys, metadata ownership, signed-access lifetimes, replacement cleanup, and deletion responsibilities without installing a concrete storage provider.

### Authentication entry and identity lifecycle

- Full start defines a provider-neutral registry of password, OAuth, magic-link, demo, and local-review entry methods.
- Server-side resolution intersects template configuration, provider capability, and current user state. Missing or uncertain capability fails closed, and unavailable methods are not presented as usable actions.
- The baseline lifecycle includes login, sign-in options, forgot password, reset password, set password, callback, invitation, and corresponding loading and error states. Routes consume provider-neutral contracts rather than provider document shapes.
- Every authentication flow uses one continuation-path helper that accepts only local application paths, rejects protocol-relative and external destinations, and falls back to the dashboard.
- Failures and outcomes use stable public status codes mapped to user-facing copy; raw provider errors are not exposed through route URLs or rendered directly.
- Password state and connected-provider identities are modeled separately.
- Before removing a credential or disconnecting a provider, the server recomputes enabled identities and rejects any mutation that would remove the account's final viable sign-in method.

### Organization context

- Every authenticated dashboard request resolves organization context containing the organization, current membership, and effective capabilities.
- Routes and adapters consume resolved context rather than a fixed organization identifier.
- Every domain record, fixture record, relationship, member, invitation, and adapter operation is organization-scoped from its first representation.
- Singleton mode provisions one normal organization, automatically selects the sole valid membership, and hides switching by default.
- Singleton organization mode is the expected path for single-tenant and white-labelled products.
- The underlying organization and membership model still supports multiple organizations. A small explicit configuration enables the sidebar switch menu and dashboard-shell chooser without rewriting adapters or entity ownership.
- Organization architecture may be removed only as a deliberate exceptional instance decision.

### Active organization selection

- Canonical dashboard URLs do not include an organization slug.
- The organization adapter owns server-readable active selection and validates membership on every resolution.
- The template mock may use a protected server-readable cookie; product adapters choose an appropriate account preference or equivalent mechanism.
- When multiple memberships exist without a valid active selection, `/select-organization` is required after authentication and outside the organization-dependent dashboard shell. Once context exists, voluntary switching stays inside the shell at `/dashboard/organization/switch`.
- The resolver never silently chooses an arbitrary organization.
- Sign-out clears active selection, and revoked membership invalidates it immediately.

### Organization invitations

- Invitations are explicit organization-scoped records with recipient identity, normalized email, expiry, revocation, reuse, and acceptance state.
- Invitation links open an inert review screen. Only an explicit POST accepts an invitation, preventing link scanners or speculative navigation from consuming a one-time token.
- Acceptance verifies the authenticated recipient, normalized email, organization, expiry, revocation, and prior use before atomically creating membership.
- Duplicate pending invitations are rejected. The explicit Refresh action rotates the token, extends expiry, and invalidates the earlier link.
- Expired, revoked, mismatched, reused, cross-organization, and already-member attempts fail closed.
- Authentication-user creation does not grant organization access; only verified invitation acceptance creates the corresponding membership.

### Demo organization and permissions

- Demo mode uses a separate seeded, resettable organization with isolated users and fixture data but the same adapters and entity shapes.
- Demo access is explicit through demo login or organization selection, and demo users receive real demo-organization membership.
- Development debug controls may enter demo directly; normal users are never silently moved into demo data.
- The guarded debug menu can switch fixture organizations, enter demo, inspect membership and capabilities, force interface states, and reset fixtures.
- Baseline membership roles are `owner`, `admin`, and `member`.
- Product capabilities are resolved separately through the organization adapter or policy layer rather than product-specific base-role columns.

### Settings ownership

- `/dashboard/settings` owns personal profile, interface, authentication, and notification preferences.
- `/dashboard/profile` is the read-only global account and active-organization access surface.
- `/dashboard/administration` is nested beneath Organization settings and owns pending invitations, memberships, roles, removals, and ownership transfer.
- `/dashboard/support` owns authenticated support mailto and fixture request submission.
- `/dashboard/organization` presents organization profile and overview information.
- `/dashboard/organization/members` redirects to `/dashboard/administration#members`.
- `/dashboard/organization/settings` owns organization identity editing and a server-derived people/access summary that leads to Administration.

## Template-instance activation

- Beginning real implementation requires an explicit activation pass rather than silent inheritance of scaffold choices.
- Activation selects the real authentication provider, persistence layer, organization-selection mechanism, content mode, and disposition of demo and debug infrastructure.
- An instance does not preserve fixture, authentication, selection, or persistence scaffolding by default merely because it shipped in the template.
- Demo-organization support, fixture mutations, debug menu, and forced-state routes remain installed as dormant guarded infrastructure unless the instance deliberately removes them.
- Retained demo and debug infrastructure is local-development only and always
  returns 404 in production; there is no host or environment opt-in.

## Verification invariants

- Architecture-significant shared-system changes are reviewed against the
  materialized profile matrix produced from the same source revision.
- Full, app-only, marketing-only, and thin-start receive structural
  materialization, type/build, production smoke, and representative local-route verification.
- Markdown verification covers renderer-editor round trips, lossless source fallback, responsive and keyboard-accessible toolbar behavior, and exclusion of mention parsing from code and links.
- Button verification covers zero layout shift during loading and dimensional parity between every live variant and its skeleton.
- Chip verification covers semantic, spectrum, custom, static, link, button, and skeleton states.
- Color-input verification covers pointer and keyboard operation, validation, form behavior, and portal positioning.
- Detail-system verification covers responsive property layout across its container breakpoint.
- Entity-presentation verification covers the example member across identity, table, detail, selector, Command-K, Markdown mention, empty, and loading surfaces and checks that owning definitions are reused rather than copied into routes.
- Profile verification proves that thin start excludes dashboard presentation and reference-entity capabilities, that profiles without the dashboard exclude both, and that omitting `dashboard.reference-entities` leaves no reference-entity imports, dependencies, demonstrations, policy hooks, or generated output behind.
- Focused behavioral or structural verification covers authentication entry, invitation acceptance, viable-identity protection, entity deletion, component skeleton parity, and profile assembly. Product-specific Inference Console verifier scripts are not copied.
- Mutation verification covers duplicate-submit rejection, dismissal locking, inline field errors, retained values after failure, confirmation `false` behavior, optimistic rollback after returned and thrown failures, explicit refresh-versus-navigation completion, and the absence of navigation-plus-refresh handoffs.
- Dashboard visual review covers the baseline route matrix in light and dark modes, desktop and mobile shell behavior, Command-K, and deterministic live, loading, empty, error, unavailable, and not-found states.
