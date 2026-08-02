# Folder: `src/components/ui/input/text`

## Ownership and boundary

This folder owns text, email, password, phone, multiline, and hidden honeypot
entry. Storybook owns their consumer contracts. Implementations import
InputSkeleton directly and keep private support types out of the public facade.

## Private topology

- Password visibility, strength, and copy state remain internal to
  PasswordInput.
- `phoneCountryOptions.ts` owns country normalization, filtering, and dial-code
  matching. `PhoneCountryListbox.tsx` privately owns country-menu rendering;
  neither receives an independent catalogue identity.

## Structural invariants

- Text-like controls retain `Field`, `InputFrame`, and real input semantics.
- PhoneInput keeps display text, selected country, and E.164 hidden form output
  as distinct state channels.
- SpamProtectionFields remains a non-security-boundary honeypot rather than a
  visible control.
