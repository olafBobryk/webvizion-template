# Agent Instructions

## Project

- This is the canonical Averlo Next template: a product-neutral Next.js
  foundation that materializes independent projects through positive assembly.
- Read `PRODUCT.md` before making product, audience, or UX decisions. Treat it
  as product intent; use repository policy, skills, and verifiers for
  engineering contracts.

## Averlo Plugin Pack

- Treat the Averlo plugin pack as the repository workflow layer. For
  implementation or implementation review, invoke
  `$averlo:repository-workflows` and follow only the workflows and concerns it
  selects.
- After the router is selected, do not separately invoke overlapping Averlo
  design-system, skeleton, entity, or surface skills for the same change unit.
  Use a dedicated operational skill when project lifecycle or transfer work is
  actually requested.
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
