# Agent Instructions

## Project

- This is the canonical Averlo Next template: a product-neutral Next.js
  foundation that materializes independent projects through positive assembly.
- Read `PRODUCT.md` before making product, audience, or UX decisions. Treat it
  as product intent; use repository policy, skills, and verifiers for
  engineering contracts.

## Averlo Plugin Pack

- Treat the Averlo plugin pack as an optional repository workflow layer. Use
  `$averlo:repository-workflows` when the user explicitly invokes it or an
  already-selected operational Averlo workflow requires it. Its absence from
  the current skill catalogue does not block ordinary implementation or
  implementation review; proceed from `AGENTS.md`, owner evidence, and existing
  repository verifiers.
- After the router is selected, do not separately invoke overlapping Averlo
  design-system, skeleton, entity, or surface skills for the same change unit.
  `$averlo:compose` owns native source-backed composition and measured human
  review passes. `$averlo:systemize-composition` explicitly owns later shared
  design-system decisions, `$averlo:animate` explicitly owns motion, and
  `$averlo:visual-parity` supplies subordinate evidence. A source-backed
  composition must not call Figma or edit product code until Compose is loaded;
  systemization and animation must not begin without their explicit workflows.
- Root and nearest `AGENTS.md` files own structural policy. Existing verifier
  commands own deterministic policy.

## Development and Review Isolation

- Use `$preview` to start, recover, verify, or hand off application and Storybook
  previews. It owns wrapper selection, server isolation, generated preview
  state, review modes, section anchors, screenshots, and verified review links.
- Do not start development servers or report a preview as live outside that
  workflow.

## Application Areas

- The dashboard is the application implementation area.
- Marketing is the public-site implementation area.
- A generated project's selected profile determines which areas exist. Use the
  matching repository workflow and nearest `AGENTS.md` for their structure.
- Resolve provider-specific records and metadata in server-side resolvers or
  adapters before data reaches the frontend contract.

## Design System

- For UI work, follow the nearest `AGENTS.md`, Storybook owner evidence, and
  existing repository verifiers rather than treating this file as a component
  catalogue or API reference. When `$averlo:repository-workflows` is explicitly
  invoked, also follow the concern contracts it selects.
