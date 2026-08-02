---
name: surfaces
description: Surfaces for Averlo Next. Use when auditing, creating, or refactoring route-surface registries across marketing, auth, and dashboard families; route identity, matching, typed hrefs, installed-route verification, dashboard hierarchy, navigation, breadcrumbs, page metadata, capabilities, layout, Command-K entries, or nested actions.
---

# Averlo Next Surfaces

Keep route identity canonical across installed application families. Add richer
information architecture only at the family boundary that owns it.

## Architecture

- Treat the shared route surface as the base contract. It owns `family`, `id`,
  `href`, and exact-or-pattern matching.
- Declare each product route once in its marketing, auth, or dashboard family
  registry. Compose those registries into one application registry for global
  identity, matching, typed href generation, and installed-route verification.
- Keep family enrichment separate from route identity. The dashboard may enrich
  its route entries with labels, descriptions, icons, capabilities, layout
  widths, navigation placement, `parentId`, domain ownership, and commands.
- Do not make marketing or auth adopt dashboard metadata merely because they
  share the route contract. Let their owning layout, content, or navigation
  models consume canonical surface IDs and hrefs.
- Keep internal developer routes outside the product surface registry when the
  repository defines that boundary explicitly.

## First Steps

1. Read repository and nearest component instructions.
2. Identify the route family and classify the work as shared route identity,
   family enrichment, a registry consumer, or a non-surface UI concern.
3. Inspect the shared route contract, owning family registry, composed
   application registry, route helpers, and installed-route verifier.
4. For dashboard work, also inspect the dashboard metadata registry and its
   navigation, trail, layout, loading, capability, and command consumers.
5. Inspect the loaded page and any presentation, entity, action, layout, or
   content constants it uses before editing.
6. Identify the owning surface and action boundary before changing code.

## Route Contract

- Preserve the family-prefixed surface ID, canonical href, and matching mode
  everywhere a route is referenced.
- Use exact matching only for static paths and pattern matching for parameterized
  paths. Build dynamic hrefs through the typed surface helper.
- Add, move, and remove the route tree and its family-registry entry together.
- Reuse the composed registry for cross-family href lookup, defaults, and
  installed-route checks instead of creating another global route map.
- Treat route metadata as structural identity, not as page copy or dashboard
  information architecture.

## Dashboard Enrichment

- Reuse the canonical label, icon, description, keywords, permissions, and
  hierarchy everywhere the dashboard surface appears.
- Treat `parentId` as semantic information architecture, not filesystem nesting
  or a record of cross-links. Reuse it for navigation context and command
  hierarchy.
- Render navigable ancestors only. Do not force a global root or repeat the
  current destination when the page heading already names it. Top-level
  surfaces have no ancestor trail.
- Keep dynamic entity names in the page heading and presentation model. Put
  their parent collection in the ancestor trail; do not add the dynamic name.
- Keep live and loading surfaces structurally aligned, including intentionally
  omitted current-page breadcrumbs.
- Match static page headings to canonical labels. Resolve intentional vocabulary
  differences at the owning product term instead of allowing registry, sidebar,
  trail, heading, and Command-K drift.
- Avoid flags whose value is identical for every surface. Derive behavior from
  hierarchy or add an opt-out only for a real exception.

## Classification

- `canonical surface`: the main documented destination for a product concept.
- `repeated surface`: another rendering of the same concept; reuse its surface.
- `nested action`: an action owned by a canonical surface, such as create,
  invite, resend, revoke, edit, or manage.
- `modal action`: a nested action opened through the owning action API.
- `fallback navigation`: a destination used only when an action cannot execute
  directly.
- `summary UI`: cards, metrics, charts, panels, totals, or grouped sections that
  recap another destination.
- `entity summary`: a preview or filtered list for an entity that already has a
  canonical collection or detail destination.
- `helper UI`: filters, sorting, view toggles, pagination, column controls, and
  inline field groups.
- `missing API`: the required surface, action, or modal hook is absent.

## Hard Stops

- Do not create a second global route model or duplicate a canonical route ID or
  href.
- Do not duplicate dashboard labels, icons, descriptions, keywords,
  permissions, or hierarchy outside the owning enrichment registry.
- Do not extend dashboard metadata to another route family without a real
  family-specific consumer and contract.
- Do not register an intentionally internal developer route as a product
  surface.
- Do not make repeated, summary, entity-summary, or helper UI a peer surface or
  Command-K entry unless it is a distinct destination.
- Do not infer parentage from folders or cross-links when the loaded information
  architecture presents peer destinations.
- Do not wire command search to page-local details when a surface or action API
  should own the behavior.
- Do not add modal-backed commands unless the modal opens through an exposed
  API. If the canonical API is missing, report the smallest required extension.

## Commands and Actions

- Preserve the command hierarchy: surface, then section, then action.
- Keep nested actions under their owning surface and align permissions with the
  owning action.
- Give create, edit, and manage actions action-specific icons rather than the
  parent surface icon.
- Prefer direct modal execution when the action API supports it. Use fallback
  navigation only when execution requires unavailable route- or row-local data.
- Close command search before navigating or executing an action.
- Fold summary, filter, and alias terms into canonical keywords instead of
  adding duplicate results.

## Verification

- Grep for duplicate or stale IDs, hrefs, labels, icons, descriptions, aliases,
  route models, and hierarchy metadata.
- Run the repository's app-level route-surface verifier. Confirm every installed
  marketing, auth, and dashboard page has one family-registry owner or an
  explicit structural exemption.
- For dashboard changes, also run its registry and page-policy verifiers.
- Confirm top-level dashboard surfaces have no ancestor trail; nested surfaces
  show only registry-defined ancestors; headings own the current destination.
- Confirm static headings, sidebar items, loading states, and Command-K
  vocabulary match dashboard enrichment metadata.
- Confirm summary and helper UI stays out of searchable surfaces and nested
  actions remain under their canonical owner.
- Run proportional formatter, lint, type, build, and repository-provided checks.
- When browser review is available, verify affected desktop and mobile
  navigation, ancestor links, search, keyboard selection, action execution, and
  loading parity.
