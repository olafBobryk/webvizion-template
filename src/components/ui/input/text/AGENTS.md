# Folder: `src/components/ui/input/text`

## Ownership and boundary

This folder owns text, email, password, phone, multiline, and hidden honeypot
entry. External consumers use supported exports from `@/components/ui/input`;
Storybook owns their consumer contracts. Implementations import InputSkeleton
directly and keep private support types out of the public barrel.

## Private topology

- Password visibility, strength, and copy state remain internal to
  PasswordInput.
- `phoneCountryOptions.ts` owns country normalization, filtering, and dial-code
  matching. `PhoneCountryListbox.tsx` privately owns country-menu rendering;
  neither receives an independent catalogue identity.

## Structural invariants

- Text-like controls retain `Field` and `InputFrame`, real input semantics,
  browser autofill attributes, validation relationships, and visible focus.
- Email and telephone inputs preserve their native types and input-mode hints.
- PhoneInput keeps display text, selected country, and E.164 hidden form output
  as distinct state channels.
- SpamProtectionFields stays hidden, untabbable, ignored by accessibility APIs,
  and available only as a honeypot form value; it is not a security boundary.
