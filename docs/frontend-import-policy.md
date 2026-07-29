# Frontend Component API and Import Policy

## Status

This is the recommended default for new component families and explicit API-cleanup work. It does not require existing components to be renamed solely for consistency, and it is not a lint or CI rule.

## Ownership Before Syntax

Choose the owner and public boundary before choosing the exported name.

- A public family entrypoint is justified when it hides meaningful internal organization from multiple consumers.
- Do not create a barrel for one file, a route-local module, or a folder whose contents do not share a stable owner.
- Application, route, domain, demo, and composite consumers use the documented family entrypoint.
- Family internals import direct owners. Lower-level modules also use direct imports when a barrel would invert dependency direction or create a cycle.
- Barrels use explicit named exports. Do not use `export *` or expose private helpers merely because they share a folder.

## Choosing the Public Shape

| Public form | Use when | Existing convention |
| --- | --- | --- |
| Standalone component | The component is independently owned and no meaningful family improves discovery. | `DateAgo` |
| ES-module family namespace: `Family.Member` | A cohesive family exposes peer capabilities through one curated entrypoint. | `Markdown.Editor`, `Markdown.Render` |
| Runtime compound component: `RootComponent.Part` | The member is structurally owned by a root component, shares its context, or is an attached mode or slot. | `Dropdown.Menu`, `Card.Header` |
| Component-owned companion: `Component.Skeleton` | A component owns a subordinate representation with the same contract and identity. | `Button.Skeleton`, `Field.Skeleton` |

### Recommended Namespace Default

For a cohesive family of peer components, prefer an ES-module namespace at the consumer:

```tsx
import * as Markdown from "@/components/composites/markdown";

<Markdown.Editor />
<Markdown.Render markdown={value} />
```

The family `index.ts` continues to export independent named values and types. Do not create a runtime `Markdown` object merely to obtain dot syntax.

- Keep implementation names explicit, such as `MarkdownEditor.tsx` and `MarkdownRenderer.tsx`.
- Export concise public aliases and types, such as `Editor`, `Render`, `EditorProps`, and `RenderProps`.
- Use a runtime compound object only when the relationship itself is compound, not as a general grouping mechanism.
- Do not introduce a namespace only to shorten names. The family must improve ownership and discovery.

## Family-Owned Contracts

This document owns the repository-wide decision rules. The nearest family `AGENTS.md` owns:

- the canonical entrypoint and public members;
- full versus reduced-profile capabilities;
- private implementation boundaries and permitted direct imports;
- family-specific exceptions and invariants.

Do not duplicate complete family inventories here. A folder policy should link back to this document instead of restating the general decision matrix.

## Structural Changes

- Establish or confirm the public boundary before moving implementation files.
- Preserve public names during behavior-neutral moves; perform an approved API migration as a separate checkpoint.
- Update the entrypoint, consumers, demos, manifests, verification, documentation, and Template Intelligence together.
- Remove old aliases and compatibility paths when all live consumers migrate in the same pass.
- Run the applicable file and folder audits through `$code-clarity-cleanup`; size warnings require semantic review rather than automatic splitting.

## Profile Parity

- Full and reduced profiles expose deliberate subsets of one family contract.
- A reduced profile owns a file-backed entrypoint when the full entrypoint would expose removed capabilities.
- Namespace membership must reflect the selected profile; absent capabilities are omitted rather than stubbed.
- Profile changes must pass assembly, strict API review, and the relevant build and type checks.

## Verification

- Search for external deep imports and obsolete public names.
- Confirm family internals still import direct owners.
- Verify full and reduced-profile entrypoints independently.
- Run focused lint and type checks plus configured profile and build verification.
- Verify rendered output when a structural change moves JSX or client boundaries.
