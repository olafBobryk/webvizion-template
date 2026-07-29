# Folder: `src/components/ui`

## Role
Main design-system and UX-system entry point. This folder is where agents should look first before building any new interface element.

## Start Here If
- You need a button, text style, container, field shell, input, overlay, state component, or motion helper.
- You are about to build a familiar UX pattern and want to know whether the library already covers it.
- You want the fastest path to a convention-aligned implementation.

## Decision Guide
- Need low-level structure or styling primitives: use `src/components/ui/primitives/`.
- Need a form control: import the public control from `@/components/ui/input`, then inspect `src/components/ui/input/` only when changing its implementation.
- Need checkbox, radio, or toggle semantics: use `src/components/ui/input/choice/`.
- Need file selection and preview workflows: import `FileInput` from `@/components/ui/input`; its implementation lives under `src/components/ui/input/files/`.
- Need feedback, empty states, copy, segmented control, skeletons, or disclosure: import the public component from `@/components/ui/misc`, then inspect `src/components/ui/misc/` only when changing its implementation.
- Need date or time display: use `src/components/ui/time/`.
- Need icons or icon animation helpers: use `src/components/ui/icons/` and `src/components/ui/helpers/`.
- Need focus, motion tokens, or settings: use `src/components/ui/foundations/`.
- Need modals, toasts, or portal-backed surfaces: use `src/components/ui/overlays/`.
- Need reveal or parallax-style motion: use `src/components/ui/motion/`.
- Need keyboard shortcuts: use `@tanstack/react-hotkeys`.

## Invariants
- Agents should assume the preferred implementation is already somewhere in this tree.
- Focus behavior must remain visible and token-driven across all interactive UI.
- New UI should preserve the existing component taxonomy instead of scattering shared behaviors into page code.
- Favor additive extension through props, variants, slots, and composition over cloning components into page-local folders.
- Keep shortcut registration scoped and discoverable.
- When a folder already has a purpose, put work there instead of creating parallel structure.
- Follow `src/components/AGENTS.md` for public naming and namespace decisions. Treat documented family `index.ts` files as public APIs; external consumers use the entrypoint while family internals and lower-level dependencies import direct owners when needed to preserve dependency direction.
- Initial-load feedback should default to inline loading states or skeletons, not toasts.
- Memoization helpers should be rare and justified, not automatic.

## How To Use The Library
- Start with the highest-level component that already matches the UX.
- Only drop down to primitives when the higher-level component truly does not fit.
- If you are assembling a page, map each surface to a library category first: shell, inputs, feedback, overlay, motion, or time.
- When uncertain, search this folder before introducing new markup.

## Common Conventions
- Use `Button` for actions and links with button-like styling.
- Use `Text` for typography.
- Use `Field` plus the existing input components for form work.
- Use `PasswordInput` with `showStrength` for sign-up or password-creation UX.
- Use real `<form>` elements with `onSubmit` for submissions.
- Use native keyboard behavior first; add reusable shortcuts through `@tanstack/react-hotkeys` only when needed.
- Use `Dropdown` plus `Listbox` only when an existing higher-level selection component is not already suitable.
- Use `showToast.promise`, `useConfirmationModal`, and `useImageInspectModal` rather than custom overlay or event systems.
- Use component skeletons or `Skeleton` for initial-load states before considering toast-based feedback.

## Avoid
- Skipping the library because custom markup feels faster.
- Building new page-specific patterns that duplicate inputs, overlays, or feedback states already present in `ui/`.
- Wiring reusable shortcuts with ad hoc global `keydown` listeners.
- Showing toasts for initial page load or background hydration where inline loading states already fit better.
