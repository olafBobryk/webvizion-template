# Form protection

## Contract

Apply this concern to public or externally reachable submissions: marketing
contact, enquiry, lead, booking, newsletter, callback, unauthenticated upload,
or another endpoint exposed to abuse. It is not a default requirement for
ordinary authenticated dashboard edits. Load it for an internal form only when
the task, threat model, or an existing owner explicitly gives that form an
abuse-control requirement.

Keep protection server-owned. Reuse the existing hidden-honeypot owner and
shared guard helpers where they fit; do not recreate their fields, cookie
encoding, cooldown state, or file policy in a route handler. Check guards
before provider, storage, or persistence work. A honeypot hit should terminate
as the guard's neutral success result, without exposing detection or sending a
message. Client filtering, hidden fields, and accepted-file hints are
convenience controls, never authorization or security enforcement.

Validate file type, size, contents, authorization, and any normalization on the
server. Keep guard helpers UI-agnostic and avoid logging submitted values,
addresses, recipient details, credentials, or provider responses containing
personal data.

When the chosen delivery, storage, or identity provider supports configurable
rate limits, look for a repository policy first. If no policy selects a limit
and the choice would affect user throttling, provider cost, or service limits,
ask the user before enabling or choosing a threshold. Do not silently invent a
rate-limit value. A provider limit complements server guards; it does not
replace them.

## Hard boundaries

- Do not add protection merely because a form is an authenticated dashboard
  mutation; use an explicit public-exposure or abuse-control signal.
- Do not treat a client-only delay, disabled button, hidden field, or browser
  `accept` attribute as server enforcement.
- Do not duplicate the existing honeypot, cooldown, cookie, or file-policy
  helper inside an endpoint or page.
- Do not make a detected honeypot state observable to the submitter or perform
  provider, storage, or persistence work after it.
- Do not select, provision, or tune a provider rate limit without a repository
  policy or an explicit user decision.

## Repository context

Read only the entries that exist and apply:

- `src/lib/forms/AGENTS.md` and `src/lib/forms/guard.ts` for server guard
  ownership and typed cooldown behavior.
- `src/components/ui/input/text/AGENTS.md`,
  `src/components/ui/input/text/SpamProtectionFields.catalog.tsx`, and its
  Storybook contract when the existing honeypot owner is used or changed.
- The route handler or server action and its nearest `AGENTS.md` for the
  public-exposure boundary.
- `src/lib/api/AGENTS.md` only when provider transport or rate-limit support is
  part of the change.

## Verification

- Verify a valid submission reaches its intended server boundary once.
- Verify a honeypot hit returns the guard's neutral result and performs no
  provider, storage, or persistence work.
- Verify cooldown behavior, typed cookie ownership, and server-side file policy
  when those controls apply.
- Verify client hints cannot bypass server validation or authorization.
- When rate limiting is selected, verify the configured provider behavior and
  the user-approved threshold; otherwise record that no provider limit was
  configured.
