---
name: storybook-backport
description: Create reusable Storybook stories inside Averlo-derived product instances, track each story's candidate/approval/ported status inline, scan a bounded workspace for approved stories, and adapt the smallest reusable story and component changes back into the canonical Averlo Next template. Use for instance-to-template Storybook backports, story portability reviews, backport status transitions, or discovery of reusable UI evidence across Averlo projects.
---

# Storybook Backport

Move reusable UI evidence from product instances into the canonical template without creating a reverse-sync system or central ledger.

## Required companions

1. Invoke `$storybook:stories` before creating or editing a story or UI.
2. Invoke `$averlo-next:design-system` before inspecting shared UI implementation. Keep its evidence receipt.
3. Use `$template-backport-workflow` to classify every selected change as port, adapt, skip, or defer.
4. Use `$agent-worktree-workflow` when source and template mutations need isolation.
5. Invoke `$averlo-next:entities`, `$averlo-next:surfaces`, or `$averlo-next:skeletons` when the story changes those contracts.

Read [references/story-metadata.md](references/story-metadata.md) before adding or changing backport metadata.

## Choose the mode

- **Instance mode:** create or revise a local story and prepare it for template review.
- **Template mode:** discover approved stories beneath an explicit workspace root and pull a selected story into the canonical template.

Never scan `/`, the home directory, or an inferred broad root. Never persist a workspace registry.

## Instance mode

1. Confirm Storybook 10.5 or newer and `@storybook/addon-mcp` are installed. Generated Averlo projects should already satisfy this.
2. Follow the Storybook writing workflow and use documented public component owners.
3. Add the story-level `backport-candidate` tag and literal `parameters.backport` object. Do not mark unrelated stories.
4. Run the local Storybook interaction and accessibility checks and publish a Storybook review.
5. Keep the story as a candidate until a human explicitly approves it.
6. On approval, compute the normalized story fingerprint:

   ```sh
   node <skill-path>/scripts/scan-story-backports.mjs fingerprint \
     --template <instance-root> \
     --story <absolute-story-path> \
     --export <story-export>
   ```

7. Change the tag to `backport-approved` and store that fingerprint. Re-run the scanner and story checks.

Editing an approved or ported story invalidates its fingerprint. Return it to candidate or approve the new fingerprint deliberately.

## Template mode

1. Run discovery from the canonical template:

   ```sh
   node <skill-path>/scripts/scan-story-backports.mjs scan \
     --workspace <bounded-parent-directory> \
     --template <template-root>
   ```

   Add `--json` only for machine consumption. The default report is the human review view.

2. Treat only `backport-approved` entries as eligible. Candidate, rejected, ported, and canonical stories are informational.
3. If more than one approved story targets the same canonical story ID, stop and obtain an explicit selection. Never choose by recency or traversal order.
4. Compare the source story and its minimum local dependencies against the template. Classify product routes, entities, persistence, auth, and copy separately from reusable behavior.
5. Port or adapt the story plus only the smallest shared component/catalogue changes needed to make it executable. Do not copy generated catalogues; regenerate them in the template.
6. Preserve the canonical owner and public import boundary. Add no caller-owned visual override merely to make the source story fit.
7. Set the target story to `backport-canonical` with source repository, source story ID, and the approved fingerprint.
8. Run focused Storybook checks, catalogue checks, lint, typecheck, profile verification, and build as required by the changed owners.
9. Only after the target passes, change the source tag to `backport-ported` while preserving its approved fingerprint. If the source is not writable, report the incomplete transition and do not claim the lifecycle is finished.

## Scanner contract

- Metadata must be inline object/array/string/number literals. Spreads, computed properties, helper calls, and dynamic status tags are invalid.
- Participating stories carry exactly one supported status tag.
- A schema-v2 `.template-profile.json` receipt establishes verified template lineage. Missing receipts are allowed but reported as unverified legacy lineage.
- Scanner conflicts and validation errors are blocking. Human output is the default; JSON is deterministic and contains no timestamps.
- Ordinary stories with neither a backport status tag nor `parameters.backport` remain outside the workflow.

## Completion report

Report the source and target story paths, status transition, fingerprint, port/adapt/skip decisions, design-system evidence receipt, verification results, and Storybook review URL. Do not create a separate run ledger.
