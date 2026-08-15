# Ledger schema

Store ignored state at .codex/tmp/figma-storybook-export/state.json.

## Top level

- schemaVersion: 3.
- strategy: storybook-section-capture.
- pipeline: Storybook and Figma providers, local and hosted URLs, plugin version, and synchronization timestamp.
- source: manifest path, manifest fingerprint, 76 included owners, and 13 excluded Dashboard owners.
- destination: Figma file, Library page, Quick Pilot page, and preserved foundations counts.
- sections: one object for each ordered section.
- verification: structural, Storybook, visual, and ledger results.

## Section

Each section requires id, label, order, Storybook-returned storyId, contentSignature, frameId, x, y, width, captureRootId, captureHeight, validationScreenshot, status, capturedAt, and validatedAt.

Allowed status values are pending, captured, validated, changed, and blocked.

Treat Storybook IDs and Figma IDs as opaque. Do not derive missing values.

## Reconciliation

- Missing ledger section: new.
- Signature mismatch: changed.
- Ledger section absent from the current plan: removed.
- Missing story ID, frame ID, capture ID, screenshot, or successful validation: blocking.
- A removed catalogue owner does not create a Figma orphan. Its owning section becomes changed and is recaptured.
- Do not store per-owner Figma IDs, component types, variant topology, importer metadata, or Code Connect state.

Strict verification succeeds only when new, changed, removed, missingStoryIds, missingFrameIds, missingCaptureIds, missingScreenshots, unvalidated, and schemaErrors are empty.
