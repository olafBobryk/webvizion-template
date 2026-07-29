# Folder: `src/components/ui/input`

## Role
Ready-made form controls composed from the primitives. This folder should be the default destination for form UX before building anything custom.

## Use This Folder When
- A page needs a text, email, password, phone, numeric, selectable, combobox, date, date range, color, signature, radio, multi-select, or toggle input.
- You want consistent validation, focus, shell styling, and accessibility wiring.
- The goal is to get close to standard product UX by using proven controls instead of custom page code.

## Public Import Surface
- Application, route, composite, demo, and other external consumers import public inputs and public types from `@/components/ui/input`.
- The explicit root `index.ts` is the stable public boundary. Do not deep-import implementation files from outside this family.
- Input-family implementations import direct owners such as `InputSkeleton`, choice primitives, and sibling modules. They must not self-import through the public barrel.
- Full-start and thin-start own separate barrel files because thin-start deliberately exposes a smaller input inventory.
- See `src/components/AGENTS.md` for the repository-wide policy.

## Choose The Highest-Level Match First
- `src/components/ui/input/text/TextInput.tsx`: plain single-line text entry.
- `src/components/ui/input/editable/`: display-to-edit field composites for inline rename and stable field-shell editing.
- `src/components/ui/input/text/EmailInput.tsx`: email entry with email-centric defaults.
- `src/components/ui/input/text/PasswordInput.tsx`: password entry with built-in visibility toggle and optional strength meter.
- `src/components/ui/input/files/ProfilePictureInput.tsx`: image picker for profile/avatar flows with preview, type validation, and remove action.
	- Use the default overlay layout for direct profile controls and `layout="file-row"` for source-style modal forms with a separate removal action.
	- Use `renderPreview` when a domain presentation owns the avatar fallback, color seed, or icon-only policy; keep the edit preview on that same presentation recipe.
- `src/components/ui/input/files/FileInput.tsx`: controlled generic-file field for selection, previews, inspection, and editable/read-only presentation. It does not own upload transport or persistence.
- `src/components/ui/input/text/TextAreaInput.tsx`: multi-line text input.
- `src/components/ui/input/numeric/NumberInput.tsx`: typed numeric entry.
- `src/components/ui/input/numeric/UnitNumberInput.tsx`: numeric entry with a fixed unit.
- `src/components/ui/input/numeric/SliderInput.tsx`: range-style numeric selection.
	- Keep native range semantics beneath the shared custom track, progress, thumb, focus, and disabled treatment. The range, number field, and optional unit must remain vertically centered within one `InputFrame`.
- `src/components/ui/input/text/PhoneInput.tsx`: phone input with country-aware UX.
- `src/components/ui/input/selection/SelectInput.tsx`: searchable single-select dropdown.
- `src/components/ui/input/selection/ComboboxTextInput.tsx`: text-driven combobox.
- `src/components/ui/input/selection/ComboboxMultiSelectInput.tsx`: multi-select combobox.
- `src/components/ui/input/selection/ButtonMultiSelectInput.tsx`: compact button-based multi-select for tags, filters, and preference pickers.
- `src/components/ui/input/date/`: the canonical date subsystem. Import `DateInput` and `DateRangeInput` from `@/components/ui/input`.
	- Both inputs share one source-native calendar popover, UTC date model, keyboard navigation, and utility treatment.
	- `DateRangeInput` is full-start-only; thin-start retains `DateInput` and the shared calendar core.
- `src/components/ui/input/color/ColorInput.tsx` and `ColorSwatchInput.tsx`: full-start color entry and swatch selection controls.
- `src/components/ui/input/SignatureInput.tsx`: canvas-based signature capture composed through `Field` and `InputFrame`. Its `height` is the total InputFrame height; the canvas fills the available inner area, and the Clear label uses caption typography so it does not enlarge the field header.
- `src/components/ui/input/text/SpamProtectionFields.tsx`: hidden honeypot field for form submissions.
- `src/components/ui/input/choice/RadioInput.tsx`: radio group built on the shared choice system.
- `src/components/ui/input/choice/MultiselectInput.tsx`: checkbox group built on the shared choice system.
- `src/components/ui/input/choice/ToggleInput.tsx`: toggle-style group built on the shared choice system.

## Invariants
- Prefer a complete input from this folder before composing a fresh control from primitives.
- Form fields should continue to route label, description, required state, and message handling through `Field`.
- Text-like controls should continue to route shell styling through `InputFrame`.
- If an input needs copy-to-clipboard affordances, use `useCopyAction` rather than duplicating clipboard or toast logic.
- The focus invariant is non-negotiable:
  - Keyboard users must see visible focus on the field shell and on the actual interactive control.
  - New input work should reuse the focus tokens already wired into `InputFrame` and the choice indicators.
  - Do not suppress native focus without preserving a visible replacement.
- IDs should fall back to `React.useId()` when `id` or `name` is missing.
- `aria-describedby` and `aria-invalid` should stay attached to the real input element, not only the wrapper.
- Use existing conventions before inventing custom ones. Examples:
  - Sign-up or reset-password flows should usually use `PasswordInput` with `showStrength`.
  - Password visibility toggling should come from `PasswordInput`, not a page-specific eye button.
  - Searchable selection should start with `SelectInput` or a combobox variant, not a custom dropdown.
  - Country or dialing-code UX should start with `PhoneInput`.
- Submission UX should stay form-native and accessible:
  - Use real `<form>` elements with `onSubmit`.
  - Guard against double submit by returning early when `loading` is already true.
  - Set `loading` on the submit button and disable other conflicting actions while the request is in flight.
  - Do not auto-clear the form after submit unless the product explicitly wants that behavior.
- `SelectInput.onOptionSelect` may return `true` to intercept a selection before the normal value change. Keep ordinary `onChange` behavior as the default.
- `SelectInput.showSelectedIcon` mirrors the selected option's passed icon in the closed field when an entity-context selector needs visible identity; leave it off for ordinary text selects.
- Use `SelectInput.dropdownPositionStrategy="fixed"` inside scrolling Cards and modals so the portaled menu remains viewport-positioned instead of contributing to local overflow. The default remains `absolute` for ordinary page fields.
- File and profile inputs must clear native file state on form reset and clean up object URLs when files are replaced or the component unmounts.
- Do not introduce a separate `CheckboxInput`; `MultiselectInput` and the `choice/` subsystem are the canonical checkbox-style controls.
- Color inputs and the MDX editor are full-start-only profile features. Thin-start must not retain their source files or dependencies.
- `ColorSwatchInput` controls its semantic `value` and `customColorHex` independently. Supplying one must not make the other read-only; consumers that need both externally controlled should preserve both fields from `onChange`.

## Page-Level Usage Guidance
- **Login form:** usually `EmailInput` plus `PasswordInput` without strength meter.
- **Sign-up form:** usually `EmailInput` plus `PasswordInput showStrength`.
- **Profile or settings form:** start with `ProfilePictureInput`, `TextInput`, `EmailInput`, `PhoneInput`, `SelectInput`, and `ToggleInput` before creating bespoke controls.
- **Filter bars and dashboards:** use `SelectInput`, `ComboboxTextInput`, `ComboboxMultiSelectInput`, and `DateRangeInput` before ad hoc filter UIs.
- **Preference selection:** use `RadioInput`, `MultiselectInput`, `ButtonMultiSelectInput`, or `ToggleInput` so focus, semantics, and shared selection treatments stay consistent. `ButtonMultiSelectInput` uses plain primary/secondary Button variants without additional indicators or per-button styling.

## Submission And Feedback Pattern
- Use `showToast.promise` for user-initiated async submissions such as save, apply, submit, retry, or manual refresh.
- Map toast success and error copy to server messages when available.
- Keep toast copy short, neutral, and server-driven when possible.
- Use inline validation through `Field` messages for invalid form data instead of validation toasts.
- For initial page loads, use skeletons or inline loading states instead of a loading toast.

## Skeleton Ownership
- Data-bearing inputs expose loading geometry through `Input.Skeleton`.
- Closed single-field controls delegate to the shared `InputSkeleton`, which composes `Field.Skeleton` and `InputFrame.Skeleton`.
- Controls with repeated choices, previews, canvases, or additional rows own only that distinct geometry and compose child component skeletons.
- Static hidden inputs such as spam-protection fields do not need skeleton APIs.

## How To Extend Safely
- If the needed UX is text-like, begin from an existing text-like input and preserve `Field` plus `InputFrame` structure.
- If the needed UX is inline renaming or title editing, use `EditableTextField` from `ui/input/editable` before creating a page-local edit/display toggle.
- If the needed UX is choice-based, extend the choice subsystem in `choice/` rather than building a new label-plus-hidden-input pattern.
- If the needed UX opens a menu, see whether `SelectInput`, `ComboboxTextInput`, or `ComboboxMultiSelectInput` already covers it before touching `Dropdown` directly.

## Avoid
- Page-local password fields with custom show or hide logic.
- Raw searchable dropdowns or listbox implementations in feature code.
- Directly styling inputs in ways that bypass `InputFrame` and shared focus handling.
- Handling submissions from click handlers alone when a real form would solve the same job.

## See Also
- `src/components/AGENTS.md`
- `src/components/ui/input/color/AGENTS.md`
- `src/components/ui/input/editable/AGENTS.md`
- `src/components/ui/input/choice/AGENTS.md`
- `src/components/ui/input/files/AGENTS.md`
- `src/components/ui/input/numeric/AGENTS.md`
- `src/components/ui/input/selection/AGENTS.md`
- `src/components/ui/input/text/AGENTS.md`
- `src/components/ui/primitives/AGENTS.md`
- `src/components/ui/overlays/toast/AGENTS.md`
