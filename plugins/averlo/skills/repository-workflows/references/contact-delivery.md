# Contact delivery

## Contract

Keep contact, enquiry, lead, booking, and callback delivery as one server-owned
submission boundary. Reuse repository form, action, feedback, transport, and
interaction concerns for the client flow.

On the server, validate and normalize every field independently of client
hints. Apply existing honeypot, cooldown, and file-policy guards without making
them a security boundary. Trim and deduplicate configured recipients. Keep
credentials server-only, return an unavailable response when delivery is not
configured, and expose a generic recoverable failure without leaking provider
details.

Build recipient-independent professional message content from normalized
submission data. Identify the enquiry source, summarize the contact and message
details, preserve a reply path to the submitter when supported, and keep
application-specific recipient selection in configuration rather than the
reusable message builder.

Keep logs free of message contents, email addresses, recipients, provider
responses that include personal data, credentials, and secrets. Preserve
entered values after recoverable failure. Prevent a duplicate start
synchronously and expose pending/result state through the owning form action.

Test the client lifecycle with delivery intercepted before any real send.
Actual credential provisioning, recipient setup, inbox confirmation, deployment
configuration, and production sends belong to the dedicated contact-form
operational skill.

## Hard boundaries

- Do not put provider credentials, management keys, recipient lists, or
  privileged clients in browser code.
- Do not log or return personal message data, email addresses, recipients, or
  secrets.
- Do not treat client validation, accepted-file hints, honeypots, or cooldown UI
  as authoritative server enforcement.
- Do not silently report success when delivery configuration is absent.
- Do not provision credentials, configure production recipients, deploy, or
  send a real message from this implementation router.
- Do not create a contact-only input, toast, modal, or API client when an
  existing owner covers it.

## Repository context

Read only the implementation layers being changed:

- `plugins/averlo/skills/contact-form/SKILL.md` for the implementation versus
  provisioning boundary.
- `plugins/averlo/skills/contact-form/references/form-ux-policy.md` only when
  repository-local UI rules are incomplete.
- `src/lib/forms/AGENTS.md` for server form guards.
- `src/lib/api/AGENTS.md` for delivery transport ownership.
- The contact form owner, route handler or server action, delivery adapter, and
  nearest AGENTS.md.
- Do not read credential-policy or provisioning scripts unless the separate
  $averlo:contact-form operational workflow is explicitly selected.

## Verification

- Intercept or mock delivery first. Verify inline validation, logical focus,
  duplicate guarding, pending state, failure preservation, success ownership,
  and accessible results without an external send.
- Test server normalization, recipient deduplication, missing configuration,
  provider failure, guard behavior, and PII-safe logging.
- Run focused form, transport, type, and build checks.
- Route any actual local or production delivery verification to
  $averlo:contact-form and report it separately.
