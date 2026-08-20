# Agent Instructions

## Project

- This is the canonical Averlo Next template: a product-neutral Next.js
  foundation that materializes independent projects through positive assembly.
- Read `PRODUCT.md` before making product, audience, or UX decisions. Treat it
  as product intent; use repository policy, skills, and verifiers for
  engineering contracts.

## Averlo Plugin Pack

- When a task explicitly names an Averlo skill, resolve and read that exact
  skill before any implementation. If it is absent from the current task's
  skill catalogue, its resolved path is missing, or its resolved plugin version
  differs from the enabled installed Averlo version, stop and report a workflow
  resolution failure. Do not substitute another Averlo or generic skill.
- Treat the Averlo plugin pack as the repository workflow layer. For
  implementation or implementation review, invoke
  `$averlo:repository-workflows` and follow only the workflows and concerns it
  selects.
- After the router is selected, do not separately invoke overlapping Averlo
  design-system, skeleton, entity, or surface skills for the same change unit.
  `$averlo:compose`, `$averlo:static-composition`,
  `$averlo:motion-composition`, and `$averlo:visual-parity` are operational
  owners, not overlapping substitutes; they may invoke the repository router
  and Figma skills as subordinate steps. A source-backed composition must not
  call Figma or edit product code until its named composition owner is loaded
  and its preflight permits work.
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

- Route UI work through `$averlo:repository-workflows`. Follow the owner evidence
  and concern contracts it selects rather than treating this file as a
  component catalogue or API reference.
