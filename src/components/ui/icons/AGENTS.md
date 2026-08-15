# Folder: `src/components/ui/icons`

## Ownership

This folder owns named icon rendering and registry composition.

## Dependency and runtime boundaries

- `Icon` and registry providers are client boundaries. Raw custom and Phosphor
  registry maps are implementation inputs, not independent public owners.
- `createIconRegistry` merges local icons with provider overrides; consumers do
  not bypass `IconProvider` to read or mutate the raw maps.
- Icons may depend on shared motion and skeleton infrastructure but must not
  acquire feature dependencies.

## Structural invariants

- Control icons are decorative by default. Accessible naming and visible focus
  belong to the containing control.
- RTL mirroring remains explicit through `mirrorInRtl`; physical directions are
  never flipped globally.
- Reusable SVGs enter the registry rather than being duplicated in feature JSX.
  Inline JSX SVG attributes use React camelCase names.
- Missing-icon diagnostics remain development-only and deduplicated by name.
