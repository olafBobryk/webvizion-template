# Story backport metadata

Backport state belongs on the individual story export. Do not put it on the file-level meta object and do not create a repository registry.

## Status lifecycle

| Tag | Meaning |
| --- | --- |
| `backport-candidate` | Local reusable evidence awaiting review. |
| `backport-approved` | Human-approved and eligible for template import. |
| `backport-ported` | Source story successfully represented and verified in the template. |
| `backport-rejected` | Deliberately excluded from the template. |
| `backport-canonical` | Template-owned canonical story. |

Only an approved story can initiate a template mutation. Change the source to ported only after target verification succeeds.

## Source story

```ts
export const ContextualDestructiveAction: Story = {
	tags: ["backport-approved"],
	parameters: {
		backport: {
			schemaVersion: 1,
			target: "averlo-next-template",
			canonicalStoryId:
				"ui-primitives-dropdown--contextual-destructive-action",
			strategy: "adapt",
			rationale:
				"Keep secondary destructive row actions inside the contextual menu.",
			fingerprint: "sha256:<normalized-story-hash>",
		},
	},
	// render and play remain the executable source of truth.
};
```

`fingerprint` is optional for candidates and rejected stories. It is required and must match for approved and ported stories.

## Canonical template story

```ts
export const ContextualDestructiveAction: Story = {
	tags: ["backport-canonical"],
	parameters: {
		backport: {
			schemaVersion: 1,
			target: "averlo-next-template",
			canonicalStoryId:
				"ui-primitives-dropdown--contextual-destructive-action",
			strategy: "adapt",
			rationale:
				"Keep secondary destructive row actions inside the contextual menu.",
			source: {
				repository: "owner/project-or-synthetic-label",
				storyId:
					"ui-primitives-dropdown--contextual-destructive-action",
				fingerprint: "sha256:<normalized-story-hash>",
			},
		},
	},
};
```

The canonical story's executable fingerprint must equal `source.fingerprint`. The repository value is a stable remote slug or an explicit synthetic label, never an absolute local path or secret URL.

## Literal-only rule

The scanner intentionally rejects spreads, computed properties, helper-returned metadata, and dynamic tags. Literal metadata keeps discovery deterministic without evaluating instance code.
