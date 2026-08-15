---
name: design-system
description: Targeted design-system guidance for Averlo Next UI work. Use when building, refactoring, reviewing, selecting, or migrating public UI under `src/app` or `src/components`; find supported owners, enforce local structural invariants, prefer public facades, and verify the behavior actually changed.
---

# Averlo Next Design System

## Evidence order

Choose components and APIs from the strongest available evidence. Do not infer
public support from a source-level export.

1. Read `src/components/AGENTS.md` and the nearest relevant folder-level
   `AGENTS.md` for ownership, dependency direction, invariants, source topology,
   and prohibitions.
2. Inspect the selected owner's colocated `*.stories.*` file for its supported
   import, examples, variants, compound members, and executable behavior. For a
   catalogue migration, also read the catalogue rules and typed owner contract.
3. When Storybook documentation tools are already callable, use their grounded
   owner documentation. Do not install or start an MCP service solely for
   discovery, and never guess a Storybook ID or component prop.
4. If the owner remains unresolved, use the component index as a candidate list,
   then a focused guide, documented public facade, and the minimum source needed
   to confirm behavior.

For public component API, primitive, shared-token, or component-family migration
work, record the order with:

```sh
npm run design-system:evidence -- --target <source> --owner <owner-story>
```

The receipt is quiet by default. Ordinary UI work does not need one.

## Build and review

1. Identify the UX pattern and select the highest-level supported owner that
   covers it.
2. Use documented variants, sizes, configuration, compounds, and import paths.
   Surface an API gap rather than adding unrequested caller-owned visual
   overrides.
3. Compose existing components before adding custom UI. A wrapper must own
   distinct reusable behavior rather than rename or forward props.
4. Apply only the relevant items from `references/audit-checklist.md`; do not
   turn the entire catalogue into a routine checklist.

For reviews, identify missed supported owners or compounds, broken local
invariants, unsupported imports or props, and the shortest supported correction.

## Verification routing

- For behaviorally meaningful UI changes, run the focused Storybook test and
  relevant accessibility checks.
- Run broader Storybook tests, a static build, or the catalogue verifier for
  public-owner changes, shared tokens/primitives, or component-family migrations.
- Start the managed Storybook preview only when visual verification is useful or
  the user asks to browse it. Never invoke raw `storybook dev` or assume a port.
- If Storybook tools are already callable, use grounded story IDs for targeted
  previews; do not create an MCP service just to obtain them.

Fix semantic accessibility defects directly. Ask before changing visual design
to resolve contrast, spacing, typography, layout, or focus-indicator findings.

## Relevant checks

Check only the concerns that apply to the change:

- supported public import and component/compound reuse;
- visible keyboard focus and control semantics;
- form, loading, toast, confirmation, dropdown, skeleton, and motion conventions;
- auth redirects; and
- migration-specific owner contract, story breadth, and obsolete-demo removal.

Use `references/task-recipes.md` only when a matching implementation pattern is
needed.

## Response

State only the component evidence, constraints, and checks that affected the
result. For review tasks, list findings by severity and identify the evidence
used.

## Repo contract

- Local `AGENTS.md` files govern repository conventions.
- Storybook is the canonical catalogue for public `src/components/ui` owners;
  owner stories, focused docs, public facades, and source are the fallback order.
- Keep `AGENTS.md` to ownership, dependency direction, prohibitions, and
  non-observable structural invariants; do not duplicate consumer contracts.
- Keep each consumer contract with its lowest-level owner. Do not recreate a
  central owner index or route public discovery through the removed internal demo.
- Default to supported public library owners, not page-local custom markup or raw
  implementation exports. Summarize only rules that apply to the task.
