# Folder: `src/lib/forms`

## Role

Typed, UI-agnostic form-guard helpers for route handlers and example forms.

## Invariants

- Guard helpers stay UI-agnostic and safe for route handlers.
- Honeypot hits should resolve as normal success responses and stop further work.
- Cooldown behavior should be expressed through typed cookie helpers.
- File-policy validation belongs on the server even when the client hints accepted types.
