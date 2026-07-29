# Folder: `src/components/ui/input/choice`

## Role
Shared building blocks and complete radio, checkbox, and toggle-style inputs.

## Use This Folder When
- The UI needs a labeled choice control with a visually hidden native input.
- You are extending radios, checkboxes, switches, or grouped option inputs.
- A higher-level input should reuse the same indicator and focus behavior.

## Prefer These Files
- `src/components/ui/input/choice/ChoiceField.tsx`: shared label, input, and change-handling wrapper.
- `src/components/ui/input/choice/ChoiceIndicators.tsx`: shared indicator visuals for radio, multi-select, and toggle styles.
- `src/components/ui/input/choice/RadioInput.tsx`, `MultiselectInput.tsx`, and `ToggleInput.tsx`: complete grouped controls exported through `@/components/ui/input`.

## Public Surface
- External consumers import choice fields, indicators, and complete choice inputs from `@/components/ui/input`.
- Files inside this family import `ChoiceField` and `ChoiceIndicators` directly.

## Invariants
- Keep the native input in the DOM. Do not replace it with a div plus ARIA unless there is no viable native pattern.
- `ChoiceField` should continue to own the label-to-input relationship and Enter-key activation support.
- The visible indicator should stay separate from the real input but remain tied to it through peer and group state.
- The focus invariant is especially important here:
  - Focus lands on the real hidden input.
  - The visible indicator shows focus through `focusRing.peerDefault` or `focusRing.peerError`.
  - Error tone should continue to affect the focus treatment where appropriate.
- Checkbox, radio, and toggle semantics should remain native and keyboard-friendly.
- Keep the borderless choice geometry integer-aligned: radio and default
  checkbox are 22px with fixed 12px marks at 5px insets. The compact checkbox
  is 18px with the same 12px mark at a 3px inset and is reserved for dense
  inline authored content such as Markdown task lists. The default toggle is
  42x26px with a 22x18px thumb at 4px insets; the compact toggle is 34x20px
  with a 16px thumb at 2px insets. Both anchor the thumb at the closed left
  inset and animate `translate` to preserve equal 4px or 2px gaps when active.
- Radio and checkbox selection and hover states must not transform their marks
  or containers; use color and opacity so the centered artwork cannot drift from
  subpixel scaling.
- In full-start, checkbox artwork must render through `Icon name="check"` so it
  follows the active icon registry. Thin-start retains its local fallback because
  that profile does not select the shared icon subsystem.

## How To Use It
- Use `ChoiceField` as the structural wrapper whenever you need a custom-looking radio, checkbox, or toggle.
- Use the existing indicator exports from `ChoiceIndicators.tsx` before drawing new checkmarks, radio dots, or switches.
- Build grouped controls in `RadioInput`, `MultiselectInput`, or `ToggleInput` rather than consuming `ChoiceField` ad hoc in page code unless the pattern is clearly library-worthy.

## Avoid
- Reimplementing labeled choice controls from scratch.
- Moving focus styles onto the label while leaving the actual input focus invisible.
- Breaking native Space behavior or removing Enter activation support.
