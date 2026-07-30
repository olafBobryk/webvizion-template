# Folder: `src/components/ui/input/text`

## Role

Text-like controls, including semantic email, password, phone, multiline, and hidden honeypot entry.

## Public Surface

- External consumers import text-family components from `@/components/ui/input`.
- Family implementations import `InputSkeleton` directly and keep their internal types private unless the public barrel deliberately exports them.

## Invariants

- Preserve `Field` and `InputFrame` ownership, real input semantics, browser autofill behavior, validation wiring, and visible focus.
- Keep password visibility and strength behavior in `PasswordInput`, and country-aware behavior in `PhoneInput`; `phoneCountryOptions.ts` owns country normalization, filtering, and dial-code matching, while `PhoneCountryListbox.tsx` privately owns country-menu rendering.
