---
name: repository-workflows
description: Explicit-only router for Averlo repository implementation work across UI ownership and catalogue contracts, loading, forms, mutations, composition, interaction and measured scroll performance, entities, route surfaces, marketing, auth and organizations, API transport, CMS content sources, and contact delivery. Use when the user explicitly invokes $averlo:repository-workflows or the governing repository AGENTS.md requires it; select every implementation intent actually changed or reviewed and load only their reusable concern contracts.
---

# Averlo · Repository Workflows

Route implementation work through every applicable entry workflow and the
smallest reusable set of concern contracts. Keep exact component APIs and
operational procedures outside this router.

## Route the work

1. Read the root and nearest applicable AGENTS.md.
2. Split the request into change units only when targets or state boundaries
   differ. For each unit, select every entry workflow whose named behavior,
   architecture, or contract is actually being changed or reviewed. Do not
   force one primary workflow.
3. Load the union of required concern references once. Read only conditional
   repository-context paths that exist and apply. Do not load unrelated
   references or every listed source merely because they are adjacent.
4. When owner discovery applies, find the highest complete existing owner
   before designing or editing. Obtain exact imports, props, variants,
   compounds, and observable guarantees only from that owner's Storybook
   contract.
5. Treat AGENTS.md as structural policy and existing verification commands as
   deterministic policy. Run the smallest relevant checks for the changed
   scope.

## Orient through selected concerns

Use each loaded concern's `Repository context` section as its conditional
starting map. Inspect only concrete paths that exist and apply to the selected
change unit, then use targeted repository search when those owners do not
resolve the task. A missing expected owner is evidence to reconsider the route,
not permission to invent an API or load every adjacent source.

| Entry workflow               | Use for (non-exhaustive routing signals)                                                                                                                          | Required concerns                                                                                                                                                                                                                                                                                                                                                |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI ownership                 | Selecting, extending, moving, renaming, or reviewing a supported public UI owner or shared component boundary                                                     | [owner discovery](references/owner-discovery.md)                                                                                                                                                                                                                                                                                                                 |
| Component catalogue          | Creating or migrating owner stories, typed catalogue contracts, generated catalogue/export projections, or catalogue verification                                 | [owner discovery](references/owner-discovery.md), [catalogue contracts](references/catalogue-contracts.md)                                                                                                                                                                                                                                                       |
| Loading                      | Initial or region async loading, forced-loading states, placeholders, unavailable states, or live/loading parity                                                  | [owner discovery](references/owner-discovery.md), [loading parity](references/loading-parity.md), [interaction/responsive](references/interaction-responsive.md)                                                                                                                                                                                                 |
| Forms                        | Data entry or edit flows, field validation, real form submission, or reusable input behavior                                                                      | [owner discovery](references/owner-discovery.md), [form semantics](references/form-semantics.md), [action lifecycle](references/action-lifecycle.md), [interaction/responsive](references/interaction-responsive.md); add [form protection](references/form-protection.md) for public or externally reachable submissions, attachments, or stated abuse controls |
| Mutations                    | State-changing commands outside a form, including toggles, destructive actions, confirmation, optimistic updates, or async outcomes                               | [owner discovery](references/owner-discovery.md), [action lifecycle](references/action-lifecycle.md), [interaction/responsive](references/interaction-responsive.md)                                                                                                                                                                                             |
| Composition                  | Page hierarchy, surface structure, stable wrappers, grouping, visual placement, or layout restructuring                                                           | [owner discovery](references/owner-discovery.md), [visual composition](references/visual-composition.md), [interaction/responsive](references/interaction-responsive.md); add [section construction](references/section-construction.md) when creating or restructuring registered marketing sections                                                                 |
| Interaction                  | Focus, keyboard behavior, dismissal, motion, responsive rendering, shortcuts, accessibility behavior, or measured scroll optimization                             | [owner discovery](references/owner-discovery.md), [interaction/responsive](references/interaction-responsive.md); add [action lifecycle](references/action-lifecycle.md) for confirmation or action-outcome work; add [performance measurement](references/performance-measurement.md) for deterministic page-scroll measurement or measured optimization        |
| Entities                     | Domain facts, presentation factories, entity renderers, selectors, commands, entity loading, entity mutation, deletion, or pruning                                | [owner discovery](references/owner-discovery.md), [entity architecture](references/entity-architecture.md)                                                                                                                                                                                                                                                       |
| Route surfaces               | Product route identity, family registries, typed hrefs, dashboard hierarchy, installed-route policy, navigation, breadcrumbs, route commands, or browser metadata | [route architecture](references/route-architecture.md); add [route metadata](references/route-metadata.md) when titles, descriptions, canonicals, robots, social metadata, metadata factories, or route classification change                                                                                                                                    |
| Marketing sections and shell | Marketing section topology, section renderers, site shell, public navigation, responsive header/footer behavior, or section presentation                          | [owner discovery](references/owner-discovery.md), [marketing architecture](references/marketing-architecture.md), [media delivery](references/media-delivery.md), [visual composition](references/visual-composition.md), [interaction/responsive](references/interaction-responsive.md); add [section construction](references/section-construction.md) when creating or restructuring a registered section |
| Auth and organizations       | Provider-neutral auth adapters, sessions, active organizations, invitations, identities, authorization, safe continuation, or private-file policy                 | [auth/organization architecture](references/auth-organization.md)                                                                                                                                                                                                                                                                                                |
| API transport                | Shared request clients, typed endpoint wrappers, error shaping, injected transports, or transport-level mocks                                                     | [API transport](references/api-transport.md)                                                                                                                                                                                                                                                                                                                     |
| CMS and content sources      | Source-neutral render contracts, fallback content, server resolvers, Payload adapters, schema activation boundaries, or content-source cutover                    | [content-source architecture](references/content-sources.md); add [media delivery](references/media-delivery.md) when provider-backed media changes; add [route metadata](references/route-metadata.md) when provider-owned marketing page metadata changes                                                                                                        |
| Contact delivery             | Contact-form client/server implementation, validation, anti-spam guards, delivery response behavior, privacy, or recipient-independent message construction       | [contact delivery](references/contact-delivery.md), [form semantics](references/form-semantics.md), [form protection](references/form-protection.md), [action lifecycle](references/action-lifecycle.md), [API transport](references/api-transport.md), [interaction/responsive](references/interaction-responsive.md)                                           |

## Apply repository-mode overlays

After normal workflow selection, classify the repository once:

- Treat a repository with `.template-profile.json` as a generated instance.
- Otherwise, treat it as the canonical template only when `package.json` names
  `averlo-next-template` and both `template-assembly/` and `template-profiles/`
  exist.

In the canonical template only, load
[template propagation](references/template-propagation.md) when a changed owner
participates in profile manifests, assembly inventories, overrides, generated
inventories, or public exports. Canonical-template identity alone does not load
the overlay or justify inspecting unrelated template files. This overlay is not
an entry workflow; report it separately from selected workflows in the handoff.

## Preserve routing boundaries

- Select workflows additively within each change unit. Load a shared concern
  once even when several workflows require it.
- Select a workflow only for behavior or architecture actually changed or
  reviewed, not ambient context. Rendering a form in an unchanged layout does
  not select Composition. An asynchronous form submission does not select
  Mutations because Forms already loads action lifecycle. Baseline focus and
  responsive preservation do not select Interaction unless that behavior is in
  scope.
- Select both workflows when both contracts change: a marketing renderer plus
  its CMS adapter selects Marketing sections and shell and CMS and content
  sources.
- Add Section construction only when a registered marketing section is created
  or restructured. A shell-only change, copy-only content edit, or unchanged
  renderer used as context does not load it.
- Add Form protection only when a form is public or externally reachable,
  accepts attachments, or has an explicit abuse-control requirement. Ordinary
  authenticated dashboard edits do not select it merely because they submit to
  a server. Contact delivery always loads it.
- Add Route metadata only when browser document metadata or its route/source
  ownership changes. Ordinary navigation, registry, or CMS work does not load
  it merely because routes have titles elsewhere in the UI.
- Do not infer exact component APIs from this table, source exports, or
  generated catalogues. Use the selected Storybook owner.
- This router is self-contained for repository implementation work. Do not load
  the compatibility design-system, skeletons, entities, or surfaces skills as
  additional source material after routing here.

Do not copy concern rules into this router or create workflow reference files.
In the handoff, state the change units, selected workflows, loaded concerns,
owner evidence when applicable, and focused verification.
