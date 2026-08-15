---
name: averlo-contact-form
description: Build, repair, configure, test, and ship Averlo-managed contact, enquiry, lead, booking, and callback forms in Next.js projects deployed on Vercel with Resend. Use for missing website enquiries, recipient-routing changes, Resend/Vercel environment setup, or end-to-end contact-form verification. Do not invoke for unrelated newsletter-only signup forms unless they deliver client leads or enquiries.
---

# Averlo Contact Form

Deliver enquiry forms reliably without exposing credentials or weakening the repository's UX conventions.

## Workflow

1. Read the repository root and nearest `AGENTS.md` files. Then read local `PRODUCT.md`, `DESIGN.md`, component guidance, and existing form/input/button/toast implementations when present.
2. Invoke `$averlo:repository-workflows`. Select Forms and every applicable
   interaction, action-lifecycle, protection, and API-transport concern before
   choosing owners from Storybook. If no local form policy exists, read
   `references/form-ux-policy.md`.
3. Run `node scripts/audit-contact-form.mjs --repo <repo>` from this skill. Treat findings as orientation, then inspect the actual form, route, configuration, and deployment metadata.
4. Establish the client recipient. If it cannot be discovered from configuration or user context, stop with exactly: `What email address should receive website enquiries?`
5. Implement a semantic form with inline validation, visible focus, an in-flight double-submit guard, accessible status, and existing repository components. Keep server credentials server-only.
6. On the server, validate and normalize input, trim and deduplicate recipients, send from an inferred site name at `developer@averlo.co`, and set `replyTo` to the submitter. Use professional client-facing copy: identify the website enquiry, summarize contact and message details, explain that replying continues the conversation, and end with `Delivered by Averlo`. Never expose sandbox/test language in the reusable notification template. Return `503` when delivery configuration is absent. Never log message content, email addresses, or secrets.
7. Provision a per-project key only when needed with `node scripts/provision-project-key.mjs --repo <repo> --project <vercel-project>`. Read `references/credential-policy.md` first. Never put the management key in a repository or Vercel.
8. First run a browser test with the POST intercepted or mocked to verify validation, focus, loading, failure preservation, and success state without sending. Then test locally through the actual form in a Playwright/browser session. Local `CONTACT_FORM_RECIPIENTS` must contain only `bobryk.olaf@gmail.com`. Verify the HTTP/UI result and then confirm the received copy with Gmail. If Gmail is unavailable, claim only that Resend accepted the send.
9. Deploy only when the user explicitly authorizes publishing. Use `$production-ship`, then sync Production-only values with `node scripts/sync-vercel-contact-env.mjs --repo <repo> --client-email <email>`. Do not add sending credentials to Preview or Development.
10. Submit the production form once. Production recipients must be the client and `bobryk.olaf@gmail.com`, trimmed and deduplicated. Confirm the Bobryk copy and visible To list with Gmail, then report exactly: `We sent a website-enquiry test to {clientEmail}. Could you confirm it arrived?`

## Safety gates

- This sensitive workflow is available only as `$averlo:contact-form` from the Averlo plugin. Do not install or copy it as a standalone global skill.
- Ask for confirmation immediately before creating the persistent full-access Resend management credential. Store it only at `~/.codex/secrets/averlo-contact-form/resend-management.token`, owner-readable only.
- Use the manager only to list domains and create/list/revoke keys. Use a domain-restricted `sending_access` child key for application sends.
- Store repository values only in ignored, mode-600 `.env.local`. Do not print, quote, summarize, commit, or pass secrets in command arguments.
- Keep production recipients explicit. Never infer a client address from a submitter or silently remove the Bobryk delivery copy.
- Preserve existing user changes and avoid using a client production site as a skill regression fixture.

## Bundled resources

- Read `references/credential-policy.md` before provisioning or syncing credentials.
- Read `references/form-ux-policy.md` only when local UX rules are missing or incomplete.
- Use `scripts/provision-project-key.mjs` for Resend child-key setup.
- Use `scripts/sync-vercel-contact-env.mjs` for Vercel Production environment sync.
- Use `scripts/audit-contact-form.mjs` for a read-only preflight.
