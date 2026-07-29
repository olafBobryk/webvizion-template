# Thin-start profile ownership

- `manifest.mjs` is authoritative for content capabilities, selected surfaces, explicit scripts and packages, source inventory, overrides, API review, and verification.
- Thin start supports `static` and `payload-ready`, defaults to `payload-ready`, and uses the same public project-creation command as every other profile.
- Shared files come from canonical source. Genuine thin-only behavior lives in `overrides/`; never edit a materialized workspace or duplicate shared implementation into an override.
- The thin source inventory is positive and fail-closed. Add a path only when the profile intentionally owns it, including new local `AGENTS.md` instructions needed by retained code.
- Keep `Markdown.Render`, the retained component family entries, and their public types while excluding editor, dashboard, broad helper, and unselected surface dependencies.
- Verify both content modes, strict API review, static checks, production build, and route smoke after changing the profile boundary.
