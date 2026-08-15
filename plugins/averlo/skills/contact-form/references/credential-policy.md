# Credential policy

## Separation

- Management credential: `~/.codex/secrets/averlo-contact-form/resend-management.token`, full access, mode `600`. Use only for Resend key/domain administration.
- Project credential: domain-restricted `sending_access` key for verified `averlo.co`. Store in the target repository's ignored, mode-`600` `.env.local` as `RESEND_API_KEY`.
- Never upload the management credential to Vercel. Never use it to send an email.

## Repository values

Maintain these keys without overwriting unrelated `.env.local` values:

- `RESEND_API_KEY`
- `AVERLO_RESEND_API_KEY_ID`
- `AVERLO_CONTACT_CLIENT_EMAIL` when known
- `CONTACT_FORM_RECIPIENTS`

Local recipients must be exactly `bobryk.olaf@gmail.com`. Vercel Production recipients must be the validated client email plus Bobryk, trimmed and deduplicated.

Ensure `.env.local` is ignored before writing. Refuse symlinks and non-regular files. Write atomically with owner-only permissions. Never emit secret values.

## Rotation

Create a new child key, deploy it, verify an actual form send, and only then revoke the old key. Resend reveals a key value only once; an ID alone cannot recover it.

Use stdin for `vercel env` values. Do not place values in argv, logs, screenshots, commits, Preview, or Development.
