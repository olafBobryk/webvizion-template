# Legacy Codex Orchestration (opt-in)

> Transitional capability: this legacy orchestration system is default-off and
> must not gain new product or template coupling. A replacement orchestration
> system is under development; remove this capability once the replacement is
> accepted.

Status: opt-in pointer

This project explicitly installed the dormant legacy orchestration capability.

- Local orchestration root: `docs/orchestration/`
- Nested Git branch: `orchestration`
- CLI: `npm run orchestration -- <command>`
- State shortcut: `npm run orchestration-state`

The ignored `docs/orchestration/` directory is a nested Git repository. Its
capability marker records installation without changing the immutable project
creation receipt.

Keep the integration isolated to the pointer, shim, package commands, ignore
rule, and nested root. Do not extend the legacy system while its replacement is
being evaluated.
