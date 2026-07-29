# Frontend Import Policy

## Purpose

Keep consumer imports stable while allowing cohesive component families to organize their implementation by ownership. A barrel is a public boundary, not a shortcut to export every file.

## Public Family Boundaries

- A cohesive frontend family with many complete leaf or composite components may expose a curated `index.ts` entrypoint.
- Application, route, domain, and composite consumers import public components and public types from the family entrypoint rather than implementation files.
- Family-internal modules import their owning files directly. Lower-level UI modules also keep direct owner imports when importing a higher-level barrel would invert the dependency graph or create a cycle.
- Dependency direction takes precedence over path uniformity. A foundational component must not import a barrel that re-exports components depending on that foundation.
- Barrels use explicit named exports. Do not use `export *`, and do not expose internal skeleton helpers, render helpers, adapters, utilities, or private subcomponents merely because they share a folder.
- A barrel is justified when it hides meaningful internal organization from multiple consumers. Do not create one-file barrels or barrels for route-local modules that already have an obvious owner.

## Structural Changes

- Establish or confirm the public boundary before moving a large component family.
- Preserve public export names while moving implementation files between ownership-based subfolders.
- Update the barrel, family-internal imports, demos, scripts, manifests, verification paths, documentation, and Template Intelligence in the same structural change. Do not leave compatibility paths or stale deep imports behind.
- Run the applicable folder-size and file-size audits through the global `$code-clarity-cleanup` skill before and after structural changes. Size warnings require semantic review and reporting, never an automatic split.

## Profile Parity

- Full and thin profiles expose deliberate public surfaces. When a full barrel exports files removed by thin-start, thin-start owns a file-backed barrel override that exports only retained capabilities.
- Profile API review should allow the public family entrypoint for consumers while retaining only the narrow deep imports required by family internals.
- Full and thin barrel changes must pass profile assembly, thin-start dry-run, and strict API review when the required runtime is available.

## Input Family

- `@/components/ui/input` is the public input entrypoint for application, route, composite, demo, and other external consumers.
- `src/components/ui/input/**` implementation files may import `InputSkeleton`, choice internals, and sibling owners directly.
- `InputSkeleton`, calendar implementation details, date utilities, and internal color-panel composition are not public input exports.
- The full barrel exposes the complete reusable input inventory. The thin barrel exposes only the controls retained by thin-start.

## Misc Family

- `@/components/ui/misc` is the public entrypoint for application, route, domain, composite, and demo consumers of cross-cutting UI components.
- Files inside `src/components/ui/misc/**`, input implementations, primitives, icons, and overlays may import direct misc owners to preserve dependency direction and avoid barrel cycles.
- Accordion client/shared modules and the file-preview implementation owned by `FileInput` are private and are not public misc exports.
- The full barrel exposes the reusable misc inventory. The thin barrel exposes only `Skeleton`, matching the capability selected by thin-start assembly.

## Markdown Family

- External consumers use `import * as Markdown from "@/components/composites/markdown"` and the `Markdown.Editor`, `Markdown.EditorModalForm`, and `Markdown.Render` members.
- The full barrel exposes editing and rendering. The thin barrel exposes only `Markdown.Render` and its renderer-related types.
- Markdown-family internals import direct owners. Do not create a runtime `Markdown` object or a private editor barrel.

## Verification

- Search for external imports beneath `@/components/ui/input/`; only input-family implementation files may use them.
- Search for imports beneath `@/components/ui/misc/`; only misc internals and lower-level UI implementation edges may use them.
- Search for old filesystem paths after moves.
- Run lint, profile-assembly verification, thin-start dry-run, component and route skeleton verification, and build/type checks when their local runtimes are available.
