# Thin-Start Profile Boundary

Thin-start is a positive assembly profile. Shared files come from the canonical
template; genuine thin-only replacements live under
`template-profiles/thin-start/overrides/`.

The manifest is authoritative for selected surfaces, content capabilities,
source inventory, explicit core scripts and packages, overrides, API review,
and verification. Component source must never be embedded in generator strings.

## Materialization

Create the ignored local workspace with the same public project command used by
every other profile:

```bash
npm run create:project -- \
  --profile thin-start \
  --content payload-ready \
  --output .thin-start/workspace
npm run review:thin-start-api -- --root .thin-start/workspace --strict
```

Use `--content static` to omit Payload positively. Use a custom `--output` for
a separate project. Existing outputs are not replaced by default; `--force`
works only when the schema-v2 receipt matches both `thin-start` and the selected
content mode.

For routine template development:

```bash
npm run dev:thin -- --random
```

Edit canonical shared files or explicit overrides, then rematerialize. There is
no in-place activation or parked-reference path.

## Included surface

Thin-start keeps the small Button, Panel/Card, Text, Section, Field,
InputFrame, Dropdown, native choice-input, Markdown renderer, modal, motion,
marketing-content, and intelligence scaffolds declared by its positive
inventory. Its Sonner toast is an explicit file-backed override. Broad helper,
icon, dashboard, demo, and scroll-performance surfaces are never copied.

Static output excludes the Payload surface. Payload-ready output adds the
guarded scaffold without changing fallback content or frontend render models.

## Required review

The exported API review reads the same manifest as the assembler and rejects
broad imports, unapproved composites, compatibility markers, and parked
reference imports. Both content modes must also pass static verification,
production build, and route smoke checks.
