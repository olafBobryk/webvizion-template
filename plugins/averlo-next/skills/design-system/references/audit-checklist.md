# Audit Checklist

Use only the relevant sections after following the skill's evidence order and
reading the relevant local `AGENTS.md` files.

## Evidence And Public API

- When Storybook tools were callable, were documentation IDs listed before an
  owner was selected, and was the selected owner documentation inspected?
- When Storybook tools were unavailable, was the colocated story used before the
  component index, focused guides, public facade, and source fallbacks, while
  the governing `AGENTS.md` files were still read first?
- Was Template Intelligence treated only as routing evidence rather than the
  first component contract?
- Is the component index treated as candidates rather than API authority?
- Is every recommended import supported by Storybook, a documented public
  facade, or an explicit focused guide rather than merely exported in source?
- Were unsupported props and raw implementation exports rejected instead of
  inferred or promoted?

## Component Reuse

- Did the implementation start from the highest-level existing component that fits?
- Was custom UI introduced where `src/components/ui/` already has a suitable component?
- If a new abstraction was added, does it compose from primitives or existing inputs instead of bypassing them?
- For every visually meaningful control, was its primitive API inspected and its selected variant, size, and configuration verified? Are there no caller-owned visual class or style overrides unless the user explicitly requested that departure?

## Focus Invariant

- Does every interactive element preserve visible keyboard focus?
- Does focus use the shared focus tokens from `src/components/ui/foundations/focus.ts` when applicable?
- For text-like fields, does the shell still show the proper `focus-within` treatment?
- For hidden-input patterns like radio, checkbox, or toggle UI, does the visible indicator still reflect focus correctly?

## Forms And Inputs

- Does form UI use existing input components before custom fields?
- Are labels, descriptions, errors, and required state routed through `Field` and the relevant input component?
- Does text-like input styling still flow through `InputFrame` and `inputVariants`?
- Is submission handled through a real `<form>` with `onSubmit` when appropriate?
- Is double submit guarded by checking `loading` before starting another request?
- Are submit and conflicting actions disabled appropriately during submission?
- Is invalid form feedback inline rather than toast-only?
- Are required-field and input-specific errors rendered through existing `Field`/input error props instead of browser-native validation bubbles, `reportValidity()`, or default HTML warning UI?

## Common UX Conventions

- For sign-up or password creation, did the implementation use `PasswordInput` and enable `showStrength` when appropriate?
- For login, did it avoid unnecessary password strength UI?
- For searchable choice UI, did it use `SelectInput`, `ComboboxTextInput`, or `ComboboxMultiSelectInput` before custom dropdown work?
- For phone input, did it start from `PhoneInput`?
- For copy actions, did it use `CopyField`?
- For confirmations, did it use `useConfirmationModal`?
- For image inspection, did it use `InspectableImage` or `useImageInspectModal`?

## Loading, Toasts, And Skeletons

- For initial page load, did the UI use skeletons or inline loading states instead of toasts?
- For user-initiated async actions, did it use `showToast.promise` or the established toast pattern?
- Is toast copy short, neutral, and server-driven when possible?
- Do skeletons mirror the live layout structure, wrappers, spacing, and breakpoints?
- Are skeletons non-interactive and free of event handlers or interactive semantics?

## Motion And Styling

- Does motion use shared timing or spring tokens instead of hardcoded values?
- If `RevealItem` is used with transparent gradient-border wrappers, does it avoid `asChild`?
- For transparent bordered panels, are wrapper border responsibilities separated from panel fill responsibilities?
- If inline SVG is used in JSX, are SVG attributes camelCase?

## Storybook Verification

- When visual verification was useful, was the current worktree's managed
  Storybook metadata read or `npm run storybook:preview` used after a healthy
  Next preview? Was raw `storybook dev` avoided and the printed UI URL used?
- Do migrated component changes update owner-level stories and behavior tests?
- When tools were already callable, were relevant stories discovered and
  targeted previews obtained? Were focused and broad story tests matched to the
  scope?
- When Storybook tools were unavailable, were the focused test and any broader
  build checks proportionate to the change?
- Are semantic accessibility defects fixed directly and visual accessibility
  changes held for user approval?

## Catalogue Migrations

- Was the Storybook catalogue-rules guide consulted before changing a migrated
  family contract?
- Does every supported owner story export exactly one typed local contract with
  a stable ID, supported import, selection guidance, compounds, exclusions, and
  executable guarantees?
- Does every owner Docs page render that same colocated contract rather than a
  handwritten or centrally maintained copy?
- Does each owner have a teaching story that makes its practical breadth
  inspectable, rather than only proving that the API and assertions exist?
- Does every guarantee resolve to an owned story with relevant assertions?
- Are raw helpers, skeleton implementations, styling helpers, controllers, and
  positioning internals absent as catalogue identities unless explicitly
  promoted through a supported facade?
- Were consumer examples and observable behavior removed from `AGENTS.md` while
  structural ownership, dependency, and source-topology invariants remained?
- Is Storybook discovery serving as the catalogue, with no central owner index,
  registry content, or recursive copy in higher-level stories and guides?
- Did the repository catalogue verifier and generated-profile verifier pass?
- Was the superseded UI demo, fixture, navigation entry, and relationship data
  removed only after its useful variants, states, compositions, and failure
  cases had equivalent lowest-owner stories and those stories passed?
- Does the catalogue verifier discover all `src/components/ui` owner contracts
  dynamically without hard-coding a second owner list?

## Auth And Redirects

- If auth guards are involved, does auth failure redirect instead of leaving the UI blank?
- Is `redirect()` used for redirect behavior where appropriate?

## React Compiler Guidance

- Are `useMemo`, `useCallback`, and similar wrappers only used when clearly necessary?
- Could simple local values or plain functions replace unnecessary memoization?
