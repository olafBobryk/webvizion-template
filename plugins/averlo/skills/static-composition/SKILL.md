---
name: static-composition
description: Build or port a static section, page, shell, or site composition in a generated Averlo instance, optionally against scoped Figma evidence. Use when static hierarchy, layout, tokens, or canonical owners must change before motion; do not use in the canonical template or for motion-only work.
---

# Averlo · Static Composition

Build the static endpoint first. It is the source of truth for every later
motion endpoint, not a disposable fidelity scaffold.

## Establish the packet

1. Require a schema-v2 `.template-profile.json` receipt and read
   [`visual-parity`'s focus packet](../visual-parity/references/focus-packet.md).
2. Invoke `$averlo:visual-parity` in its `frame` phase. Use its reference slice
   when authority exists; otherwise use its declared system-fit baseline.
3. When a persistent external source informs the product, add or update a
   `## Product sources` table in `PRODUCT.md` with its canonical source,
   authority, scope, and supplied material. Record provenance, never conversion
   progress, implementation status, or a second component catalogue.
4. Inspect the complete declared source focus and the target's current tokens,
   documented owners, variants, and consumers before implementing individual
   sections. Use the resulting role census as working analysis, not a permanent
   registry or lifecycle state machine.
5. Preflight every required font and constituent asset. A Figma image or SVG
   asset is usable only when its exact bytes can be retained; a reference
   screenshot is not a constituent asset. When a required font file or other
   source asset is unavailable from Figma, the repository, or a user-supplied
   lawful source, stop before implementation and request it. Do not silently
   substitute a font, rasterize text, or weaken the reference requirement.
6. Invoke `$averlo:repository-workflows` when implementation begins. Select the
   applicable composition, interaction, route, marketing/shell, catalogue, and
   content concerns from the actual change unit. Do not bypass the router with
   a parallel component-selection workflow.

## Build the one system

1. Keep one coherent design system in the target instance. An authoritative
   reference supersedes inherited template visuals for every evidenced role;
   existing visual tokens, variants, and owner treatments are inventory, not
   fidelity constraints. Preserve semantic HTML, accessibility, supported
   interaction, data, routing, and framework boundaries while replacing the
   visual implementation they carry.
2. Make every genuine typography role an instance-wide `Text` variant on first
   use. Before adding it, compare its family, weight, size, line height,
   tracking, responsive behavior, and purpose against the complete documented
   axis, the source-focus census, and current consumers; reuse an equivalent
   role instead of adding a contextual alias. Name shared variants for a
   source-neutral system role or scale, never a product, section, route, brand,
   or Figma node. Update the owner contract and exhaustive Storybook type-scale
   evidence in the same change. Keep section geometry and choreography with the
   section rather than encoding them into typography variants.
3. For every changed role, choose one disposition: reuse, extend, replace, new
   owner, instance-local, or merge-retire. Generalize only source-neutral behavior;
   retain product copy, assets, and true page choreography in the instance.
4. Let the reference-backed focus replace the shared tokens and owners its
   evidence supports. Do not invent replacements for unevidenced roles, claim
   they were converted, add a parallel theme, or change the canonical Averlo
   template.
5. Implement visible product structure natively: text remains selectable text,
   controls keep their semantics and behavior, sections own real responsive
   layout, and media uses constituent assets. A full-frame or full-page capture
   may be Source evidence but must never render as Target product UI.
6. Follow the repository workflow's media-delivery concern for every marketing
   image, mark, or icon. Do not ship expiring design-tool URLs.
7. Capture the completed static endpoint with motion disabled, then invoke
   `$averlo:visual-parity` in its `verify` phase. At the named reference
   viewport, use its scoped verdict; at other widths, prove system fit rather
   than pixel identity. One supplied source viewport creates one source-backed
   parity case; responsive captures are separate evidence and cannot inherit
   its verdict.

## Handoff to motion

Record the product-source entry, resolved owners, consumer impact, native-render
evidence, responsive findings, and verified visual-parity receipt. Mark the
packet `pending` for human approval.
`$averlo:compose` pauses here by default; a direct caller may explicitly mark
the approval bypassed.
