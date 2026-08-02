# Folder: `src/components/branding`

## Ownership

This folder owns the product mark and wordmark implementation. Storybook
`Branding/Logo` owns consumer selection, supported variants, examples, and
observable semantics.

## Invariants
- Keep brand SVG geometry, wordmark styling, sizing, and tone variants centralized
  in `Logo` rather than branching them in consumers.
- Semantic rendering and interaction state remain component-owned. Do not wrap
  `Logo` in another interactive element or replace its token-driven focus behavior.
- Extend the canonical owner when a reusable brand variant is required; do not
  add a second logo implementation or duplicate its assets.
