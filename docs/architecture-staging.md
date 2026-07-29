# Architecture Staging

Consolidated into [the final architecture](./architecture.md) on 2026-07-20 after the pinned-source surface rescan and accepted mutation-policy delta, then reviewed with no unresolved or drifted decisions. Retained as the historical acceptance ledger for the Averlo full-start and thin-start profiles. The bounded Template Intelligence history cleanup and native Codex hook recorder were accepted and completed on 2026-07-23; neither changes the product architecture in the consolidated document.

## Template relationship and convergence scope

- Full start remains the canonical broad template system.
- Inference Console is a design reference, not a general component donor or runtime/source dependency.
- Structural primitive convergence begins with the `Panel` foundation and semantic `Card` system, while styling convergence covers the complete shared consumer layer.

## Inference Console visual-system baseline

- The complete template is reskinned to the visual system represented by the current Inference Console styling work.
- Inference Console revision `8a13d12ea11461fe204625bd1247a6db16c4a207` is the pinned source baseline for the visual-system port.
- Later committed or uncommitted Inference Console changes do not silently change the baseline; adopting them requires an explicit repin decision.
- The port covers the complete light and dark visual foundation: semantic colors, surfaces, borders, primary and status colors, sidebar tokens, chart and spectrum colors, radius scale, focus behavior, motion behavior, and scrollbar treatment.
- Template-specific automation and motion-disable behavior remains intact while adopting the source visual foundation.
- The reusable template uses Inter through the shared application-font contract. Local SF Pro binaries are not distributed with the template.
- The complete shared consumer layer adopts the source visual grammar, including typography, buttons, panels, cards, fields, inputs, dropdowns, listboxes, chips, skeletons, modals, toasts, and shared state surfaces.
- The reskin applies across marketing, authentication, dashboard, internal demonstrations, loading, error, empty, and overlay surfaces.
- Marketing and authentication retain the template's existing page composition and content architecture while adopting the pinned source's tokens, primitives, and visual grammar.
- Spectrum accents remain reusable visual tokens, while Inference Console logos, product copy, and domain-specific branded artwork remain outside the template.
- Dashboard visual parity is intentionally close to the Inference Console reference across shell geometry, navigation, spacing, density, cards, tables, forms, overlays, interaction states, and responsive behavior.
- The custom Inference Console profile-picture gradient background is explicitly excluded from the dashboard parity target.
- The pinned commit provides visual provenance and rendered references only; Inference Console product models, domain components, routes, and backend architecture are not template architecture.

## Panel and Card contract

- `Panel` is the non-semantic surface primitive.
- `Card` is a structured content pattern built on `Panel`, with header, title, description, action, content, and footer slots.
- `Panel` owns background, border, radius, shadow, overflow, width, padding, basic display and gap, polymorphic element selection, and ref forwarding.
- `Panel` does not own responsive columns or card-specific structure. Responsive composition belongs to layout components or caller-supplied classes.
- `Card` fixes sensible surface defaults and owns density through a small size contract.
- Card slots own their internal spacing and typography.
- `Card` may expose bounded escape hatches such as overflow, shadow, semantic accent, and caller-supplied classes, but it does not pass through every `Panel` layout property.
- The shared semantic accent vocabulary is `neutral`, `info`, `success`, `warning`, and `danger`.
- Surface and card-slot accents use the same semantic accent system.
- Arbitrary hexadecimal accents and separate translucent-versus-solid public modes stay outside the shared primitive contract unless a later dashboard requirement demonstrates that they are necessary.
- Full start and thin start both expose `Panel` and `Card` through the same implementation.
- Thin start remains smaller by excluding higher-level surfaces rather than hiding a foundational primitive used by `Card`.
- Card slots must be used under a real `Card` root. Consumers must not place card slots under a raw `Panel` by imitating Card data attributes.
- Overlays that need Card structure should use `Card` as their root; overlays with materially different structure should define overlay-owned slots.

## Additional shared-component convergence

- Source convergence is additive: matching the pinned Inference Console visual and behavioral contracts must not flatten or remove mature template APIs that remain useful.
- `Markdown.Render` remains a shared full-start and thin-start composite over plain Markdown strings.
- Its contract includes default and compact density, design-system-backed GFM rendering, task lists, tables, images, code, quotes, links, validated generic button directives, and optional durable `@[user:<id>]` mention resolution.
- Default density owns site and document content; dashboard cards and Markdown modals opt into compact density. Renderer and editor use the same `.markdown-content` typography, list, quote, code, table, and rhythm contract for the selected density.
- Rendered tasks use `ChoiceIndicatorMulti`. The editor preserves Lexical's native inline checklist marker and interaction model while matching that shared indicator's geometry and tokens without injecting React into Lexical-owned DOM.
- Markdown rendering does not allow arbitrary HTML, JSX, class injection, data registries, or product-specific directives.
- Underline is the sole narrow exception: the editor stores paired `<u>...</u>` tags and the renderer recognizes only exact pairs without enabling general raw HTML parsing.
- `Markdown.Editor` is a full-start-only, client-only composite; thin start retains `Markdown.Render` without the MDXEditor dependency.
- The editor persists only plain Markdown strings and supports responsive rich editing, lossless source mode, automatic source fallback, headings, inline formatting, lists and tasks, links, tables, images, code, dividers, undo and redo, optional mention insertion, generic button-directive editing, and default or compact density.
- The width-aware editor toolbar composes the template's canonical `Icon`, `Dropdown.Menu`, `Dropdown.Listbox`, and `Button` contracts rather than introducing a duplicate package-owned menu system; editor dialogs remain on the Card-owned modal host.
- `Dropdown.Menu` owns action-menu keyboard navigation, fixed or absolute positioning, portal support, hover and pinned interaction modes, Button-backed triggers, and active or disabled options.
- `Dropdown.menuOptions` exposes typed factories for recurring open, edit, and delete actions with consistent icons, dividers, disabled states, danger semantics, and stable danger-last ordering.
- Button convergence maps pinned-source chrome into `primary`, default `secondary`, `ghost`, and contextual `inverse`, with a separate soft `danger` tone. The `none`, `sm`, `md`, `lg`, `xl`, `icon`, `icon-sm`, and `chip` sizes keep geometry independent from appearance.
- Loading states and variant-aware skeleton treatments follow the converged visual vocabulary without replacing the template's richer existing API surface.
- Existing Button capabilities such as icon-registry inputs, content and text configuration, radius and hit-area controls, focusability, typed link and button behavior, class and style extension, and layout alignment remain available unless an explicit later decision supersedes them.
- Button loading preserves the template's position-absolute overlay strategy: normal content remains in layout and fades while the centered loader appears, preventing loading-state resizing.
- `Button.Skeleton` mirrors live size, alignment, radius, icons, label width, and variant treatment without changing the final component dimensions.
- Shared components with recurring loading representations expose component-owned, namespaced skeleton APIs such as `Field.Skeleton`, `InputFrame.Skeleton`, and `Accordion.Skeleton`.
- Component-owned skeletons extend the template's richer live APIs rather than replacing or narrowing them. Routes compose these canonical skeletons instead of reimplementing their geometry.
- Components remain single-file by default. A component may separate shared contracts, a server-safe public entry and skeleton, and a narrow client implementation when server consumers need its public types or skeleton without importing meaningful client-only behavior.
- This selective server/client split is a dependency-boundary technique, not a mandatory naming convention or universal three-file component structure.
- Chip convergence adopts the pinned compact rounded-medium visual design, semantic, spectrum, and custom colors, interactive link or button behavior, static behavior, `Chip.Text`, and `Chip.Skeleton` while retaining useful existing tone, helper-palette, icon, and canvas-measurement capabilities.
- `ColorInput` and `ColorSwatchInput` join the full-start input library only; thin start does not include them.
- `ColorInput` supports controlled and uncontrolled hexadecimal selection, pointer and keyboard operation, normal form submission, field validation, and portal-aware dropdown positioning.
- `ColorSwatchInput` supports generic typed presets and an optional custom color. Its shared semantic defaults are neutral, info, success, warning, and danger; product-specific palettes stay outside the shared input.
- A single-date `DateInput` adopts the pinned Inference Console visual and interaction design while exposing template-safe controlled and uncontrolled values and native form serialization.
- `DateInput` and `DateRangeInput` share configurable locale, timezone, and preset contracts. Neither component hardcodes a universal timezone or fixed all-time boundary.
- The template's existing searchable `SelectInput` remains canonical. Its `onOptionSelect` hook runs before changing value; returning `true` claims an action row so it can close the menu without modifying the selected or hidden form value.
- Existing file and profile-picture inputs retain their caller-controlled APIs while gaining configurable validation, native file-form behavior, optional integrated previews, per-file removal, object-URL cleanup, and form-reset handling.
- `ProfilePictureInput` supports configurable accepted file types and maximum size without inheriting Inference-specific storage behavior or profile gradients.
- The accepted component ports include their generic dependency closure: semantic accent helpers, `StatusMessage`, `ModalForm`, shared overlay chrome, and the markdown-mention parser.
- `ModalForm` includes a generic `ModalStepForm` and `StepIndicator` modeled visually and behaviorally on the pinned Inference Console source while preserving stronger compatible template modal APIs.
- Completed step panels remain mounted and hidden so field state survives navigation. Back and Next actions never submit; only the final action validates and submits.
- The shared confirmation system supports structured impact details, warnings, semantic confirm variants, and asynchronous confirmation that may return `false` to keep the modal open after a failed mutation.
- Existing template helpers remain canonical wherever they provide an equivalent or stronger contract.
- Baseline Markdown image insertion accepts image URLs only. File upload remains a caller or product integration rather than a dependency of the shared editor.
- Markdown stores durable mentions as `@[user:<id>]`; callers provide mention options and rendering resolution, and shared Markdown components never fetch organizations or users directly.

## Full-start detail and property system

- The full-start application layer includes `DashboardDetailField` with static, link, action, copy, truncation, icon, disabled, and skeleton states.
- It includes `DashboardPropertyList` with responsive identity, value, and action columns, add-property selection, and row actions.
- It includes `DashboardMarkdownEditorModalButton` as the focused dashboard editing surface. Callers own asynchronous persistence while the composite owns modal composition, validation display, loading feedback, errors, and success toast feedback.
- Detail and property components remain product-neutral and stay outside thin start.
- Detail fields and property lists own presentation and interaction composition only. Routes own property schemas, authorization, persistence, and product-specific editors.

## Dashboard entity presentation system

- Entity presentation is a full-start dashboard capability rather than a shared primitive, thin-start dependency, or application-wide global registry.
- Entity-presentation source lives beneath `src/app/(site)/dashboard` so dashboard assembly ownership remains physically visible.
- Non-React contracts and factories live beneath dashboard `_lib`, with generic presentation contracts separated from entity-owned domain inputs and presentation definitions. React renderers live beneath dashboard `_components`, with generic presentation components separated from entity-owned components.
- Surface adapters remain with their route or surface until repeated consumers justify promoting a reusable entity-owned adapter.
- The authoritative profile manifest exposes `dashboard.reference-entities` as an independently selectable child surface. The small presentation foundation remains dashboard core; profiles without the dashboard exclude both, while profiles without reference entities exclude their examples, integrations, demonstrations, and policy hooks without pretending that dashboard core is optional.
- The source is split by ownership and dependency direction instead of reproducing Inference Console's monolithic presentation registry and renderer namespace.
- A small dashboard presentation foundation owns only reusable contracts such as entity nouns, action labels, empty-state copy, field and column metadata, semantic variants, and renderer inputs.
- Every entity lives in its own folder and separates its domain input types, presentation definitions, derived view-model factory, render components, and surface adapters. Product-specific roles, routes, labels, icons, permissions, formatting, and variant registries remain with the owning entity.
- Dashboard consumers import from the file that owns the symbol. There is no global entity barrel, central `presentationRegistry`, or `presentationRender` object; a narrow entity entrypoint is allowed only when it deliberately hides private structure from multiple consumers.
- Presentation renderers receive ready data and never fetch. Routes and adapters own authorization, organization context, persistence, and mutations.
- The reference identity implementation models a global user separately from an organization-scoped member. The resolved member presentation owns deterministic fallbacks for display label, email, initials, avatar, role, joined date, profile target, and Markdown mention identity.
- The example member is wired through profile, compact, actor, avatar-only, avatar-list, table, detail, selector, Command-K, Markdown mention, empty, and skeleton presentations. It uses the template's plain avatar fallback and does not port Inference Console's custom profile-picture gradient.
- Entities implement only the presentation surfaces they actually need; the foundation does not require every entity to support every renderer or dashboard surface.
- An internal dashboard reference surface provides live examples and copyable usage for the generic contracts and the example member.

## Entity frontend policy and skill

- A repository-owned frontend entity policy is the durable source of truth for entity-layer ownership, presentation reuse, data-source boundaries, surface integration, skeleton parity, demonstration, and documentation requirements.
- The policy is linked from the relevant dashboard, component, domain, and library `AGENTS.md` files instead of accumulating every rule in a single root instruction file.
- The policy requires tables, forms, filters, detail views, selectors, Command-K, Markdown mentions, empty states, and loading surfaces to reuse owning entity presentation definitions when those surfaces exist.
- A generic `entity-frontend-system` Codex skill complements the repository policy. Like the existing focused loading and import-surface skills, it searches for the repository's actual entity, presentation, renderer, surface, loading, command, and import contracts; classifies the entity's frontend surfaces; identifies gaps; and recommends the relevant vertical skills or work without inventing product models or assuming template-specific paths.
- The entity skill does not become the source of truth, embed a preferred folder layout or one repository's entity schema, or invoke recommended vertical workflows without authorization from the active task. The repository policy links to it as an optional creation and audit workflow.
- The skill contract is derived after the dashboard presentation foundation, example member, and frontend entity policy establish real APIs.
- Repository frontend policies may reference only verifiable paths, exports, demonstrations, and public contracts. A policy-integrity check reports stale references rather than allowing copied instructions to drift away from the repository.

## Additional reusable dashboard patterns

- The full-start dashboard includes an entity-neutral deletion lifecycle definition and composition that centralizes impact descriptions, confirmation-modal structure, danger-menu placement, mutation feedback, refresh behavior, and disabled explanations while leaving the mutation and entity-specific consequences with the owning adapter.
- The framed and dashed no-data treatment proven by Inference Console is adapted as a dashboard-oriented variant or wrapper around the template's canonical `StateIndicator`; it does not introduce a competing global null-state system.
- Dashboard status and not-found surfaces use a shared status-page frame derived from the typed dashboard surface registry. The reusable frame does not hardcode product route prefixes.
- A generic activity or event row is an optional dashboard extension rather than baseline template content.
- Inference-specific notification systems, product permission presentations, charts, and provider-branded authentication buttons are not baseline ports; they remain demand-led additions.

## Shared profile invariant

- Components present in both full start and thin start should normally share one implementation and visual contract.
- A profile-specific implementation is allowed only as an explicit, intentional profile override.

## Filesystem-backed template profiles

- Full start and thin start use layered, filesystem-backed profile sources.
- Full start's live source is the canonical shared source rather than being materialized from a separate package.
- Thin start references canonical shared files through its profile manifest.
- Only genuine thin-specific replacements are stored as separate, real source files outside the full-start import graph.
- One authoritative profile manifest declares shared inclusions, file-backed overrides, removals, dependencies, retained routes and scripts, public API allowances, and required validations.
- Generator reporting and API review derive from the authoritative profile manifest rather than maintaining parallel configuration lists.

## Thin-start materialization

- The thin-start generator is a materializer: it selects shared files, applies explicit file-backed overrides, removes excluded surfaces, and adjusts profile dependencies.
- Component source code must not live inside generator strings.
- Review allowlists validate the materialized output; they do not serve as component source definitions.
- Routine thin-start development materializes into an ignored, isolated profile workspace that can run beside the canonical full-start preview.
- Previewing thin start must not rewrite the canonical checkout.
- In-place materialization is reserved for creating a new template instance.
- Materialized thin-start workspaces are disposable and must not be edited directly.
- Changes are made in canonical shared source or explicit thin override files, then the materialized workspace is refreshed.

## Profile parity gate

- Architecture-significant shared-system changes can be reviewed against full-start and thin-start previews produced from the same commit.
- Both profiles receive type, build, and smoke verification.
- Both profiles receive public API-surface review and a small visual route matrix.
- Markdown verification covers renderer-editor round trips, lossless source fallback, responsive and keyboard-accessible toolbar behavior, and the exclusion of mention parsing from code and links.
- Button verification covers zero layout shift during position-absolute loading and dimensional parity between every live variant and its skeleton.
- Chip verification covers semantic, spectrum, custom, static, link, button, and skeleton states.
- Color-input verification covers pointer and keyboard operation, validation, form behavior, and portal positioning.
- Detail-system verification covers responsive property layout across its container breakpoint.
- Entity-presentation verification covers the example member across identity, table, detail, selector, Command-K, Markdown mention, empty, and loading surfaces and checks that owning definitions are reused rather than copied into routes.
- Profile verification proves that thin start excludes dashboard presentation and reference-entity capabilities, that profiles without the dashboard exclude both, and that omitting `dashboard.reference-entities` leaves no reference-entity imports, dependencies, demonstrations, policy hooks, or generated output behind.
- Focused behavioral or structural verification covers authentication entry, invitation acceptance, viable-identity protection, entity deletion, component skeleton parity, and profile assembly. Product-specific Inference Console verifier scripts are not copied.

## Full-start dashboard role

- The full-start dashboard is a first-class, product-neutral reference application rather than an empty shell.
- It uses capability-led example surfaces rather than inventing a fake business product.
- It demonstrates overview, collection, record-detail, settings, and organization-level patterns with clearly replaceable fixture content.
- It demonstrates responsive behavior and loading, empty, and error states.
- It includes authenticated Support plus a separate platform-operations shell.
  The operator fixture receives organization-independent platform-admin access;
  organization roles never grant it. Support requests and product reports use
  resettable server-memory stores and perform no external writes.

## Support and platform-operations decision

- Port the pinned Inference support mailto structure and adapt it with a guarded
  fixture request form at `/dashboard/support`.
- Adapt the Zero Emissions report flow to the current Card-owned modal and
  dashboard entity systems, preserving category, severity, route, viewport,
  browser context, validation, pending close lock, and automatic triage.
- Skip attachments, Supabase, storage uploads, email delivery, and product role
  coupling. Platform Inbox and Reports remain separate peer surfaces under a
  protected dashboard-owned shell.

## Dashboard routes and surface registry

- The baseline dashboard routes are `/dashboard`, `/dashboard/records`, `/dashboard/records/[recordId]`, and `/dashboard/settings`.
- A typed dashboard surface registry is the source of truth for route identity, paths, labels, navigation placement, breadcrumbs, visibility, and standard-versus-wide layout mode.
- The Command-K menu consumes the same surface registry and context model as dashboard navigation and breadcrumbs, following the structural pattern proven in Inference Console.
- Mounted dashboard pages and surfaces may register currently available contextual actions with the dashboard shell. Registration is dashboard-local and is removed when its owner unmounts.
- Command-K combines these live actions with the static surface hierarchy, navigation, active organization context, and capability checks rather than maintaining a separate command model.
- The dashboard overview is a lightweight capability and navigation directory.
- Charts and summary metrics are not required baseline dashboard content because many products do not need them.

## Record reference interaction

- The reference collection demonstrates search, filtering, sorting, pagination, row navigation, and action menus.
- The reference detail surface demonstrates page actions, structured properties, related data, and a focused edit modal.
- These are reference capabilities rather than requirements that every converted product must retain.
- The fixture adapter supports organization-scoped, resettable create, edit, archive, and delete commands.
- Demo mutations exercise confirmation, validation, toast, optimistic, and failure feedback patterns.
- Demo persistence may be explicitly non-durable; production adapters own durable storage.

## Dashboard shell

- The dashboard uses a fixed responsive sidebar with desktop collapse and a mobile overlay mode.
- It uses a persistent top bar with a command surface and account menu.
- Dashboard pages use shared breadcrumbs, page headers, and action zones.
- The shell provides a standard constrained content width and an explicit wide-surface escape hatch.
- Inference Console may inform structural maturity, but product-specific branding and domain behavior are not copied into the template shell.

## Dashboard data and authentication boundaries

- The default dashboard runs from deterministic typed fixture data behind lightweight adapters.
- Shared dashboard surfaces must not require Payload, Supabase, or another hosted backend.
- Dashboard adapters expose clear seams for replacing fixtures with a project data source.
- A provider-neutral private-file and avatar-storage adapter defines authorization, validation, opaque object keys, metadata ownership, signed-access lifetimes, replacement cleanup, and deletion responsibilities without installing a concrete storage provider.
- Dashboard data is organization-scoped behind the adapter boundary from the start.
- Applications without multi-organization UX still operate through a singleton organization rather than bypassing organization scope.
- The default demo pattern uses an organization-scoped demo context and the same data boundaries as a converted product.
- Dashboard authentication uses a provider-neutral contract with a local mock or demo session as the default implementation.
- Dashboard routes remain guarded; Payload or another authentication provider may replace the default adapter.
- Provider-neutral fixture, authentication, and selection adapters are template scaffolding rather than recommended final product implementations.
- When implementation begins in a template instance, the instance must explicitly choose its real data, authentication, organization-selection, and persistence implementations instead of preserving the scaffold by default.

## Authentication entry and identity lifecycle

- Full start defines a provider-neutral registry of available authentication entry methods, including password, OAuth, magic link, demo, and local-review methods.
- Server-side resolution intersects template configuration, provider capability, and current user state. Missing or uncertain capability fails closed, and unavailable methods are not presented as usable actions.
- The baseline route lifecycle includes login, sign-in options, forgot password, reset password, set password, callback, invitation, and corresponding loading and error states. These routes consume provider-neutral contracts rather than provider-specific document shapes.
- Every authentication flow uses one safe continuation-path helper. It accepts only local application paths, rejects protocol-relative and external destinations, and falls back to the dashboard.
- Authentication failures and outcomes use stable public status codes mapped to user-facing copy. Raw provider errors are never passed through route URLs or rendered directly.
- Password state and connected-provider identities are modeled separately.
- Before disconnecting a provider or removing a credential, the server recomputes the currently enabled identities and rejects any mutation that would remove the account's final viable sign-in method.

## Template-instance activation boundary

- Beginning implementation in a template instance requires an explicit activation pass rather than silently inheriting scaffold choices.
- The activation pass selects the real authentication provider, persistence layer, organization-selection mechanism, content mode, and disposition of demo and debug infrastructure.
- Fixture data and provider-neutral adapters are clearly named and documented as scaffold or demo infrastructure rather than presented as production architecture.
- Organization ownership, membership, context, and capability contracts may be removed by an instance, but only as a deliberate exceptional decision.
- The expected path for single-tenant and white-labelled products is to retain the organization contract through singleton organization mode while hiding organization-management and switching UX that the product does not need.
- Demo-organization support, fixture mutations, the debug menu, and forced-state routes remain installed in an activated instance as dormant, guarded infrastructure.
- Production access to retained demo and debug infrastructure remains disabled unless the instance explicitly enables the appropriate guard and environment opt-in.

## Organization context and lifecycle

- Every authenticated dashboard request resolves an organization context containing the organization, current membership, and effective capabilities.
- Routes and adapters consume the resolved organization context rather than importing a fixed organization identifier.
- Singleton mode provisions one normal organization and hides organization switching by default.
- Demo mode uses a separate seeded, resettable demo organization with isolated users and fixture data.
- Singleton and demo modes use the same organization-scoped adapters and entity shapes.
- The organization context and membership model support multiple organizations even when the default interface is singleton-only.
- An organization switcher can be enabled through a small, explicit configuration change without rewriting routes, adapters, or entity ownership.
- Canonical dashboard URLs do not include an organization slug; the validated active organization comes from the organization context.
- The organization adapter owns a server-readable active-organization selection and validates membership whenever it resolves that selection.
- The template mock adapter may persist active organization selection in a protected server-readable cookie; a product adapter may use an account preference or another product-appropriate mechanism.
- Singleton mode automatically selects the only valid membership.
- When multiple memberships exist without a valid active selection, the user must choose through a dedicated organization-selection screen.
- `/select-organization` is the mandatory organization-selection fallback. It sits after authentication but outside the organization-dependent dashboard shell because no active organization exists yet.
- The resolver must never silently select an arbitrary organization.
- Sign-out clears the active selection, and revoked membership invalidates it immediately.
- The normal organization switcher is controlled by an explicit feature or configuration setting. When enabled, the sidebar owns the current-organization link and direct switch menu, while `/dashboard/organization/switch` provides the full dashboard-shell chooser.
- The guarded debug menu can switch fixture organizations, enter the demo organization, inspect current membership and capabilities, force interface states, and reset demo fixtures.
- Demo access is explicit through demo login or organization selection.
- Demo users receive real demo-organization membership through the same organization context model.
- Development debug controls may enter the demo organization directly, but normal users are never silently moved into demo data.

## Organization invitation lifecycle

- Organization invitations are explicit organization-scoped records with recipient identity, normalized email, expiry, revocation, reuse, and acceptance state.
- An invitation link opens an inert review screen. Only an explicit POST accepts the invitation, so link scanners and speculative navigation cannot consume a one-time token.
- Acceptance verifies the authenticated recipient, normalized email, organization, expiry, revocation, and prior use before atomically creating membership.
- Duplicate pending invitations are rejected. The explicit Refresh action rotates the token, extends expiry, and invalidates the earlier link.
- Expired, revoked, mismatched, reused, cross-organization, and already-member attempts fail closed.
- Authentication-user creation never grants organization access by itself; only the verified invitation-acceptance lifecycle creates the corresponding membership.

## Organization routes

- `/dashboard/organization` presents organization profile and overview information.
- `/dashboard/profile` presents the read-only global account and active organization access.
- `/dashboard/administration` is nested beneath Organization settings and presents pending invitations, members, roles, and ownership management.
- `/dashboard/organization/members` redirects to `/dashboard/administration#members`.
- `/dashboard/organization/settings` presents organization identity editing and a concise people/access summary.
- `/dashboard/settings` remains personal account and interface settings.

## Settings ownership

- `/dashboard/settings` owns personal profile, interface preferences, authentication, and notification preferences.
- `/dashboard/organization/settings` owns organization identity editing and the Administration entry summary.
- `/dashboard/administration` owns members, invitations, roles, and ownership transfer.

## Organization membership and permissions

- Baseline organization membership roles are `owner`, `admin`, and `member`.
- Product capabilities are resolved separately through the organization adapter or policy layer rather than adding product-specific role columns to the base membership.

## Organization-owned records

- Every product or domain record is organization-owned from its first representation, including fixture types.
- Relationships and adapter operations preserve the organization boundary.
- Members and invitations are organization-scoped.

## Dashboard component ownership

- Recurring dashboard patterns live in a full-start-only application component layer.
- This layer owns the shell, navigation, page header, breadcrumbs, table panels, detail fields, and their loading counterparts.
- Summary-card and chart-panel systems are opt-in extensions rather than required baseline components.
- Route-specific fixture content remains with its route.
- Thin start excludes the dashboard application component layer.

## Dashboard state review and debugging

- Real dashboard routes own their normal loading, error, and relevant not-found boundaries.
- A guarded internal dashboard review route renders deterministic live, loading, empty, error, and unavailable variants.
- The guarded review surface includes side-by-side live and skeleton examples for fields, accordions, tables, detail views, cards, and installed optional chart surfaces.
- Skeleton parity review covers geometry, responsive behavior, and light and dark modes.
- The full-start dashboard includes a default debug surface that can force loading for diagnosis while preserving the real route shell.
- Debug controls are separate from normal user navigation and product behavior.
- The debug menu ships in full start but is available only in development or guarded internal-review mode by default.
- Production debug-menu exposure requires explicit environment opt-in.

## Async mutation and modal completion policy

- The committed Inference Console mutation-policy delta from
  `8a13d12ea11461fe204625bd1247a6db16c4a207` through
  `1c6208b37fabb4666c142490608f45662013b0f7` is an explicitly accepted
  behavioral source for this port. It does not repin the earlier visual-system
  baseline or authorize unrelated source changes.
- Full start and thin start expose the same modal-level submission contract
  through `useModalSubmission`. The contract rejects duplicate submission and
  lets the owning `ModalShell` block Escape, backdrop, and header-close
  dismissal while a mutation is pending.
- The port preserves each profile's stronger existing behavior and public API.
  Full start retains its focus trap, focus restoration, modal stacking, scroll
  lock, motion, and Card/Panel composition. Thin start retains its smaller modal
  surface. Shared modal options carry an accessible label through the host to
  either shell.
- Both confirmation implementations consume the shell submission contract.
  Full-start `ModalStepForm` accepts submission state and disables Back,
  Cancel, and Next while pending; its caller-owned final submit action continues
  to use the Button loading contract.
- Server-backed modal actions return local, discriminated results shaped as
  `{ ok, message, fieldErrors? }`. Field-error keys remain owned by the form or
  domain mutation; the template does not introduce a global catch-all modal
  mutation result type. Shared deletion results remain a small base contract.
- Modal field validation stays inline. Overall mutation success, partial
  success, and recoverable failure use the shared toast system. Recoverable
  failure clears submission state while leaving the modal and entered values
  mounted.
- Same-route completion closes the modal and performs exactly one local data
  update or `router.refresh()`. Navigation completion performs exactly one
  `router.push()` or `router.replace()`, closes the modal, does not refresh, and
  keeps submission locked until the modal unmounts so the destination route's
  loading boundary owns pending presentation.
- Entity deletion gains an additive typed completion contract with `refresh`
  and `navigate` branches. The existing refresh default remains for public API
  compatibility, while reference consumers declare their completion explicitly.
  Deleting the entity represented by the current detail route uses replacement
  navigation so browser history does not reopen that deleted route.
- The template's stronger optimistic deletion behavior is retained. A failed
  result or thrown mutation rolls optimistic state back, reports failure, and
  returns `false` so the confirmation remains open. The shared deletion layer
  owns completion navigation; feature-level deletion callbacks do not duplicate
  route changes.
- The full-start reference adoption covers record create and edit, dashboard
  Markdown editing, the reusable Markdown modal form, entity confirmation and
  deletion, an internal asynchronous-mutation demonstration, nearest component
  and entity policies, and focused structural verification.
- The non-persistent report-issue stub and non-modal profile settings form are
  outside this modal-mutation adoption. Product-specific Inference Console
  mutation consumers, backend actions, roles, and domain workflows remain
  excluded. The separately delegated strict visual-parity task retains exclusive
  ownership of the full and thin `InputFrame` files during this work.

## Template Intelligence benchmark cleanup

- The cleanup is complete. The tracked history preserves 34 unique legacy
  observations: the 26 current template rows plus the eight unique rows
  recovered from commit `c4f5771bcca9abc4daafb7d40eeb7b1c80226732`.
- Deduplicate copied Inference rows against their template source rather than
  treating the copies as additional observations.
- Keep the Inference Graphify policy-only row out of benchmark evidence because
  it does not represent an executed Graphify run.
- Keep Averlo Rebrand example metrics out of benchmark evidence. Useful task or
  scenario descriptions may be retained as examples without promoting their
  placeholder measurements.
- Preserve original metrics and add only verifiable source provenance. Do not
  fabricate timings, files, task classes, cohort identifiers, or other missing
  fields during cleanup.
- Do not use the recovered material to claim comparative strategy performance;
  it contains no matched executed Control or Graphify cohorts.
- Every tracked row retains its original metrics and strategy while adding
  source repository, source commit, and legacy evidence quality.

## Native Codex turn recording

- Repository-local Codex lifecycle hooks automatically record trusted sessions
  and turns without a launcher, daemon, or worker command.
- Raw events stay in ignored `.template-intelligence` state. Curated legacy
  history remains tracked separately and is never automatically modified.
- The recorder stores only lifecycle and normalized activity metadata. Prompt,
  command, response, transcript, assistant-message, environment, and absolute
  path content is excluded.
- Observed paths are derived from independent Template Intelligence, Serena,
  Graphify, and direct-search signals. Mixed or incomplete activity is labeled
  honestly rather than forced into a benchmark strategy.
- Automatic activity is observational and cannot claim correctness, complete
  tool coverage, or comparative strategy performance.

## Final architecture disposition

- The accepted architecture will be consolidated into `docs/architecture.md` from the pinned Inference Console styling baseline.
- Final architecture is organized around template profiles, the visual system and primitives, the full-start dashboard, organization/authentication/data contracts, template-instance activation, and verification invariants.
- `docs/architecture-staging.md` remains as the historical acceptance ledger after consolidation, marked as consolidated and linked to the final architecture document.
- Consolidation may deduplicate and improve sequencing, but it must not add implementation planning or change accepted meaning.
- The final review traces every staging decision into the consolidated architecture, checks for wording drift, and marks consolidation complete only after parity passes.
