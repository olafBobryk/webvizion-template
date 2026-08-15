---
name: figma-storybook-export
description: Deterministically render the Averlo generated component catalogue as 11 dense, shell-free Storybook section surfaces and capture them as editable trees into the preserved horizontal Figma Library frames. Use for Storybook-to-Figma catalogue exports, section recaptures, export-surface validation, Figma Library synchronization, or migration away from per-owner native-component import workflows.
---

# Averlo Storybook section capture

Use the generated catalogue as the owner authority, Storybook organizer stories as the rendered authority, Figma HTML capture for editable output, and the ignored ledger for synchronization identity.

## Contract

- Keep exactly two Figma pages: Library and unchanged Quick Pilot.
- Keep the 11 existing Library frame IDs, names, width, order, and horizontal coordinates.
- Use this fixed order: Overview, Foundations, Icons, Helpers, Primitives, Input, Time, Misc, Overlays, Assistant, Utilities.
- Include 74 UI owners and 2 Assistant owners in generated order. Exclude all Dashboard owners.
- Put exactly one editable Storybook section capture in each frame at local x = 0, y = 0.
- Resize only each target frame height to its capture. Do not create component masters, variant sets, Code Connect mappings, catalogue cards, or navigation chrome.
- Never import Storybook or story files from an application route. The route and organizer stories must share a catalogue renderer and generated data.

Read [references/export-contract.md](references/export-contract.md) before changing the renderer or Figma structure. Read [references/state-schema.md](references/state-schema.md) before creating, migrating, or verifying the ledger.

## Workflow

1. Treat the current working tree as authoritative. Preserve unrelated edits.
2. Read the component catalogue policy and the representative owner stories.
3. Run the repository design-system evidence command for representative owners before reading component implementations.
4. Build the manifest and section layout with build-export-manifest.mjs and build-layout-plan.mjs from this skill.
5. Verify the shared export renderer:
   - provider-only route at /internal/demo;
   - bounded section routes at /internal/demo/[section];
   - one fullscreen organizer story per section;
   - light appearance, motion and reveal disabled;
   - 96px margins, 640px standard stages, and 1248px wide stages;
   - PortalScope, preview ID scoping, error isolation, authored fixtures, and one-axis projections.
6. Invoke $storybook:stories before Storybook work. Run npm run storybook:status, read every command's --help, and resolve all 11 organizer story IDs from Storybook output. Treat returned IDs as opaque.
7. Run Storybook rendering, interaction, and accessibility tests for all 11 stories. Stop before Figma mutation if any organizer story is missing or failing.
8. Capture each isolated Storybook iframe at 1440px using Figma generate_figma_design and the selector [data-component-export-section]. Record each returned root ID immediately.
9. Before cleanup, validate that all 11 capture roots exist, are editable frames, and are approximately 1440px wide.
10. In one authorized Figma mutation:
    - remove only children of the 11 target frames;
    - preserve the frames and both pages;
    - reparent one capture root into each frame;
    - change inherited target-frame auto layout to NONE;
    - set capture x = 0 and y = 0;
    - preserve frame width and resize frame height to capture height.
11. Record section story IDs, source signatures, frame IDs, capture IDs, screenshot paths, and validation status with record-section-capture.mjs.
12. Run verify-export-state.mjs --strict, representative visual review,
    repository checks, and direct Storybook section URLs when human review is
    needed.

## Synchronization

- Rebuild the manifest, layout plan, and Storybook section inventory.
- Compare section content signatures in the ledger.
- Recapture only changed sections.
- Replace the existing capture child by ledger ID without changing the target frame ID.
- Mark missing or ambiguous sections blocked; never invent a story ID or silently delete a preserved frame.
- Keep removed catalogue owners represented only through the next section recapture. There is no per-owner Figma identity in this strategy.

## Safety

- Capture all sections successfully before deleting existing frame children.
- Validate exact frame IDs and geometry immediately before mutation.
- Return every mutated frame ID and capture ID from Figma writes.
- Do not use story.to.design, s2d, browser importer plugins, native reconstruction, importer topology, or Code Connect.
- Authentication, CAPTCHA, legal, and entitlement prompts remain interactive checkpoints.
