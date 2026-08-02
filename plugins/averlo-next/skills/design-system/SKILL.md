---
name: design-system
description: Storybook-first design-system enforcement for Averlo Next. Use when building, refactoring, reviewing, auditing, selecting, or migrating public UI under `src/app` or `src/components`; discover supported owners across primitives, foundations, inputs, misc, motion, overlays, icons, helpers, and time through callable Storybook tools when available, use the catalogue-rules guide for migrations, enforce structural `AGENTS.md` invariants, prefer public library facades, and verify focus, forms, loading, feedback, skeleton, motion, dropdown, and auth-redirect conventions.
---

# Averlo Next Design System

## Evidence Order

Choose components and APIs from the strongest available evidence. Do not infer
public support from a source-level export.

1. When Storybook MCP tools are callable, call `list-all-documentation` once.
   For catalogue authoring or migration, inspect
   `ui-guides-catalog-rules--docs` before the affected owners. For ordinary
   component selection, select and inspect the relevant owner directly. Use
   `get-documentation-for-story` only when owner docs do not include the
   relevant scenario. Never guess a Storybook ID or component prop.
2. Read `src/components/AGENTS.md` and the nearest relevant folder-level
   `AGENTS.md`. These files govern ownership, dependency direction, invariants,
   source topology, and prohibitions even when Storybook is available. Do not
   expect or recreate consumer selection guidance there.
3. When Storybook tools are unavailable, inspect the selected owner's colocated
   `*.stories.*` file for its supported import, examples, variants, compound
   members, and executable behavior. For catalogue work, also inspect the
   catalogue-rules source and the affected story's exported typed contract.
4. Use `bash <skill-path>/scripts/component-index.sh` only as a candidate index.
   If the component root is nonstandard, pass `--components-dir <path>`.
5. If the owner remains unresolved, read the focused guide under
   `docs/guides/components/`, its documented public facade, and finally the
   minimum implementation source needed to confirm behavior.

The component index is not API documentation. A symbol discovered in the index
or exported for internal composition is not public unless Storybook, a focused
guide, or a documented public facade supports consumer use. State an evidence
gap instead of inventing props or promoting an internal export.

Do not reorder the fallback when MCP tools are absent: read the governing
`AGENTS.md` files before the colocated story, then continue to the candidate
index, focused guide, facade, and source. Template Intelligence may locate these
files, but it is routing evidence rather than component API evidence.

## Workflow

### Build Mode

1. Identify the UX pattern, not only the requested styling.
2. Follow the evidence order and select the highest-level supported owner that
   covers the behavior.
3. List the governing local invariants before editing.
4. Use only documented variants, sizes, configuration, compounds, and import
   paths. Do not add caller-owned visual overrides unless the user explicitly
   requests that departure; surface a real API gap when no configuration fits.
5. Compose existing components before adding custom UI. Add a wrapper only when
   it owns distinct reusable behavior rather than renaming or forwarding props.
6. Keep any necessary abstraction aligned with the local component taxonomy and
   public facade.
7. Run `references/audit-checklist.md` before finishing.

### Review Mode

1. Identify the UX pattern each changed surface is solving.
2. Follow the evidence order and check for a missed supported owner or compound.
3. Check the nearest `AGENTS.md` invariants and public import boundary.
4. Report unsupported imports or props, convention drift, regressions, and
   missed reuse opportunities.
5. Recommend the shortest supported correction path and cite the first component
   evidence consulted.

## Verification Routing

After component, story, style, theme, or token changes:

1. For a live Storybook/MCP session, read `.codex/storybook-preview.json` in
   the current checkout or run `npm run storybook:preview`. This command
   requires the worktree's existing `npm run dev` preview and starts or reuses
   its sole managed Storybook process. Do not invoke raw `storybook dev`, pick
   a port, or assume `localhost:6006`; use `npm run storybook:status` to
   discover the UI and MCP URLs. A disposable Storybook server created by the
   test runner is verification infrastructure, not a second persistent dev
   instance.
2. When the metadata's MCP endpoint is callable, use `get-changed-stories`; use
   `get-stories-by-component` for touched files it does not cover.
3. Use `preview-stories` for the most relevant grounded story IDs and return all
   preview URLs it provides.
4. Use focused `run-story-tests` while iterating and an unscoped run for broad
   changes before handoff. Include accessibility checks.
5. When Storybook tools are unavailable, run the repository's focused Storybook
   test script, `build-storybook`, and `verify:storybook-catalog` when present,
   plus the repo checks required by the nearest `AGENTS.md`.

Fix semantic accessibility defects directly. Ask before changing visual design
to resolve contrast, spacing, typography, layout, or focus-indicator findings.
Do not bundle or assume a global localhost Storybook MCP registration; read the
current worktree's managed metadata and use the tools only when that endpoint is
callable.

## Required Checks

Always check these when relevant:

- missed supported component or compound opportunity
- supported public import versus implementation-only direct export
- control treatment through documented variant/configuration, without
  unrequested caller-owned visual overrides
- visible keyboard focus
- form semantics, submit behavior, and `Field`-owned validation relationships
- finished password flow, including `PasswordInput` and `showStrength`
- initial-load skeleton or inline loading versus toast misuse
- toast usage for user-initiated async actions
- skeleton parity and non-interactivity
- dropdown/listbox selection, dismissal, positioning, and keyboard ownership
- shared motion timing or spring tokens
- auth redirect behavior for guarded screens
- unnecessary `useMemo`, `useCallback`, or similar memoization
- for catalogue migrations: a typed contract colocated with every owner story,
  stable owner/guide IDs, an owner-level teaching story, executable guarantee
  links, no central owner index, no duplicated consumer guidance in
  higher-level stories or `AGENTS.md`, and removal of the superseded demo or
  fixture only after representative variants, states, compositions, and
  failure cases have equivalent lowest-owner coverage

Read `references/task-recipes.md` for common implementation patterns and
`references/audit-checklist.md` for the concrete review checklist.

## Response Format

For build tasks, respond with recommended existing components, applicable
invariants, risks or gaps, then the implementation path.

For review tasks, respond with findings or violations, missed existing
component opportunities, broken or at-risk invariants, then the correction path.
List multiple findings by severity and identify the component evidence used.

## Repo Contract

- Treat local `AGENTS.md` files as the authority for repo conventions.
- Treat Storybook as the canonical catalogue for all public
  `src/components/ui` owners. Catalogue migrations start at the rules guide;
  component selection starts at the relevant owner. Use colocated stories,
  focused repo docs, the public facade, and source as the explicit fallback.
- Keep `AGENTS.md` focused on ownership, dependency direction, prohibitions, and
  non-observable structural invariants. Do not duplicate Storybook consumer
  contracts there.
- Treat Storybook navigation and callable documentation discovery as the owner
  index. Keep each consumer contract in its lowest-level owner story and do not
  recreate a central registry or higher-level copy.
- Do not route public UI discovery through `/internal/demo/ui/**`; those
  superseded demo routes are intentionally absent after migration.
- Treat contracts and focused assertion stories as necessary but insufficient
  migration evidence. Before deleting a prior demo, compare its useful breadth
  with the lowest-owner stories and preserve that teaching value without
  recreating the old page structure or a second catalogue.
- Default to supported public library owners, not page-local custom markup or
  raw implementation exports.
- Summarize only the rules that apply to the task.
