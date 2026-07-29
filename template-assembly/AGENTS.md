# Positive project assembly

- `create:project` positively selects a route profile and supported content capability. Do not restore exclusion flags, in-place mutation, or a second project-creation engine.
- Every source path, document, package, script, generated file, and surface has explicit core, surface, profile, or template-only ownership. Unclassified entries fail closed.
- Generated projects contain selected project code and a schema-v2 receipt, never template profiles, inventories, or creation machinery.
- Shared source is canonical. Profile-specific replacements are explicit file-backed overrides; never embed component or application source in renderer strings.
- Generated workspaces are disposable one-way outputs. Edit canonical source or an owned override, then reassemble.
- Keep generated routes, API exports, configuration, package state, documentation ownership, and the receipt derived from the same selected surfaces.
- Update manifests, inventories, source owners, project renderers, and verification together. Run `npm run verify:profiles`; use strict thin-start API review when its contract changes.
