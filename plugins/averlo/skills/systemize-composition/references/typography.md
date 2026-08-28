# Typography systemization

Typography is an exhaustive existing-owner migration, not a repetition-based
candidate search. Apply this reference whenever the accepted composition renders
text.

## Inventory every role

1. Enumerate every rendered text node in the accepted focus, including shell
   text. Record its purpose, semantic element, font family and calibrated face,
   responsive sizes, weight, line height, tracking, casing, decoration, tone,
   and any glyph-box treatment that affects the accepted rendering.
2. Assign every node to `Text`. Repetition determines whether two nodes share a
   variant; it never determines whether a node belongs to `Text`. A role that
   appears once still receives a source-neutral `Text` value.
3. Deduplicate only when the complete responsive signature and purpose align.
   Do not collapse distinct signatures into an imprecise range. Express an
   evidenced responsive progression as one explicit variant contract.
4. Name values from their reusable hierarchy and purpose, never the product,
   route, section, source node, or copy. Keep the semantic element in `as`, tone
   and theme in their existing axes, and width, alignment, wrapping, and section
   geometry with the consumer.

## Replace inherited scales

Compare `Text`, its catalogue, and its consumers with repository initialization
history. When the owner is unchanged inherited scaffolding and the accepted
composition supplies the current product scale:

- replace the inherited scale as one required automatic owner migration;
- map every accepted role to an exact `Text` value;
- redefine compatible inherited values and retire unsupported or superseded
  inherited values rather than preserving a parallel template scale;
- migrate every accepted text consumer to `Text` and remove caller-owned font
  family, size, weight, line-height, tracking, casing, decoration, and
  glyph-treatment recipes;
- enumerate and intentionally migrate other inherited-template consumers whose
  appearance changes through the new instance scale.

An accepted role does not need cross-route recurrence to replace or extend its
existing semantic owner. Broad effects on inherited-template consumers are
descriptive consequences of replacement, not an ownership-confidence veto.
Route to human review only when `Text` or an affected consumer contains
conflicting prior product work, multiple product type hierarchies compete, or
the accepted render does not expose the role's required responsive or
behavioral evidence. Do not confidence-score the ordinary accepted role.

Use the actual face and weight calibrated during Compose. A nominal design-tool
weight that renders differently from the supplied font file is not authoritative
over the accepted native result.

## Prove the migration

Update the `Text` public type, catalogue, exhaustive Storybook scale, skeleton
coverage, and all affected consumers together. Verify that every accepted text
node resolves through `Text` and that no migrated consumer retains typography
overrides in `className`. Run focused catalogue, Storybook, type, route, shell,
and responsive checks. Visual Parity evidence may describe before/after effects;
it does not decide ownership or confidence.
