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
3. Invoke `$averlo:repository-workflows` when implementation begins. Select the
   applicable composition, interaction, route, marketing/shell, catalogue, and
   content concerns from the actual change unit. Do not bypass the router with
   a parallel component-selection workflow.

## Build the one system

1. Preserve the target instance's one design system. Resolve each visible role
   through documented Storybook owners and review consumers before changing a
   shared token, primitive, public API, or composition.
2. For every changed role, choose one disposition: reuse, extend, new owner,
   instance-local, or merge-retire. Generalize only source-neutral behavior;
   retain product copy, assets, and true page choreography in the instance.
3. Permit a reference-backed slice to move the target instance's tokens and
   owners forward when that is the supported owner decision. Do not add a
   parallel theme or change the canonical Averlo template.
4. Capture the completed static endpoint with motion disabled, then invoke
   `$averlo:visual-parity` in its `verify` phase. At the named reference
   viewport, use its scoped verdict; at other widths, prove system fit rather
   than pixel identity.

## Handoff to motion

Record the resolved owners, consumer impact, responsive findings, and verified
visual-parity receipt. Mark the packet `pending` for human approval.
`$averlo:compose` pauses here by default; a direct caller may explicitly mark
the approval bypassed.
