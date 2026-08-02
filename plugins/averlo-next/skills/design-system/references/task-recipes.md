# Task Recipes

Use these as quick patterns after selecting an owner through the skill's
Storybook-first evidence order and reading the relevant `AGENTS.md` files.

## Selecting A Public UI Owner

- Prefer callable Storybook owner documentation, then the nearest `AGENTS.md`.
- If Storybook tools are unavailable, use the owner's colocated stories before
  treating component-index output as a candidate.
- Confirm the supported public facade and import. Do not treat raw source exports
  as consumer APIs.
- Storybook owns public UI discovery across primitives, foundations, inputs,
  misc, motion, overlays, icons, helpers, and time. Do not fall back to an
  internal UI demo.
- For primitives, keep compound members under their owner: `Button.Skeleton`,
  `Card.*`, `Section.Background`, `StatusMessage.Presence`, `Field.Skeleton`,
  `InputFrame.Skeleton`, and `Dropdown.*`.

## Auth Forms

- Login: start with `EmailInput` and `PasswordInput`.
- Sign-up or password creation: start with `EmailInput` and `PasswordInput` with `showStrength` when appropriate.
- Use a real `<form>` with `onSubmit`.
- Guard against double submit when `loading` is already true.
- Use inline field feedback for validation issues and toast feedback only for user-triggered async submission results.

## Settings And Profile Forms

- Start from `TextInput`, `EmailInput`, `PhoneInput`, `SelectInput`, and `ToggleInput` before building custom controls.
- Keep labels, descriptions, and messages routed through the input components.
- Use submit-button `loading` state and disable conflicting actions while the request is in flight.
- Do not auto-clear the form after submit unless the product explicitly wants it.

## Filters, Search, And Selection UI

- Use `SelectInput` for searchable single-select flows.
- Use `ComboboxTextInput` for text-driven selection.
- Use `ComboboxMultiSelectInput` for multi-select search.
- Use `DateRangeDropdown` for date-range filtering before building custom preset UIs.
- Use `RadioInput`, `MultiselectInput`, or `ToggleInput` for grouped choice selection.
- Use `Dropdown.Menu` for action menus and `Dropdown.Listbox` for selectable
  entity menus.
- Use `Dropdown.Panel` for independently controlled anchored date, color, or
  swatch surfaces. Do not import `DropdownSurface` directly.
- Preserve dropdown/listbox focus, selection, pointer/keyboard ownership,
  dismissal, portal positioning, and recursive cascade behavior.

## Async Mutations And Toasts

- Initial load: use skeletons or inline loading states.
- User actions like save, apply, submit, retry, or manual refresh: use `showToast.promise` when appropriate.
- Keep toast copy short and neutral; prefer server-provided messages when available.
- Do not use toasts for inline validation that should live on the field itself.

## Skeleton-First Loading

- Prefer component-specific skeletons when they exist.
- Otherwise use `Skeleton`, `Text.Skeleton`, or primitive skeleton helpers.
- Mirror the live component layout exactly so the UI does not shift when content arrives.
- Keep skeletons non-interactive.

## Modal, Confirmation, And Image Inspection Flows

- Use `useConfirmationModal` for destructive or confirm-before-action UX.
- Use `useImageInspectModal` or `InspectableImage` for enlarge or inspect behavior.
- Keep modal work inside the shared modal host system.
- Preserve focus entry, trap, and return behavior when modal flows change.

## Storybook Handoff

- Start or reuse the current checkout's one persistent Storybook/MCP server
  with `npm run storybook:preview` after `npm run dev` is healthy. Read
  `.codex/storybook-preview.json` or run `npm run storybook:status` for its
  actual URLs; never run raw `storybook dev` or assume port 6006.
- Keep disposable Storybook test workers separate from that persistent preview.
- For public UI families, update the owner story with behaviorally distinct
  states and play coverage rather than creating identities for implementation
  helpers.
- When tools are callable, discover changed story IDs, run story tests, and
  return every preview URL produced.
- Otherwise run the repository's Storybook test and static build scripts.

## Migrating A Component Family To Storybook

1. Inspect `UI/Guides/Catalog Rules` before editing an owner.
2. Define and export one typed contract in each lowest-level owner story; keep
   compound members under their owner and implementation helpers private.
3. Render that local contract on its owner Docs page and expose the same value
   through Storybook parameters for tooling. Let Storybook navigation and
   callable discovery provide the catalogue; do not create a central owner
   registry or index.
4. Link each observable guarantee to an owned story and add play assertions for
   semantics or interaction. Keep semantic and behavioral checks blocking;
   contain approved visual-only warnings to their exact stories.
5. Add at least one owner-level teaching story that makes the practical family
   breadth inspectable without implementation-source reading. Compare the prior
   demo's representative variants, states, compositions, and failure cases;
   port the useful examples into lowest-owner stories without copying the old
   page structure or creating a second catalogue.
6. Reduce nearby Markdown: owner selection, APIs, examples, variants, and
   behavior belong in Storybook; `AGENTS.md` retains only ownership, dependency,
   prohibition, and source-topology rules; focused guides retain cross-family
   decisions. Higher-level stories link to lower owners rather than repeating
   their contracts.
7. Run Storybook tests, the static build, the catalogue verifier, and profile
   verification. Confirm stable guide/owner IDs and the absence of internal
   catalogue identities, then remove the superseded UI demo, fixture,
   navigation, and relationship data rather than retaining a transition mirror.
