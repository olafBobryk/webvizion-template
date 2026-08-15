# Template propagation

## Contract

Apply this overlay only in the canonical Averlo template after a normally
selected workflow changes an owner that participates in generated-project
output. Trace only the owner's existing propagation edges through profile
manifests, positive assembly inventories, overrides, generated inventories, and
public exports.

Preserve each profile's intentional API and feature boundary. Include the
changed owner where the profile already owns that capability. Keep it omitted
where the capability is deliberately absent. Add or update an override only
when the profile needs a materially different implementation or dependency
boundary; do not create an override merely to mirror canonical source.

Keep manifests, source inventories, overrides, and generated projections
consistent with the canonical owner. Regenerate derived inventories with their
repository command when available instead of editing generated output by hand.

## Hard boundaries

- Do not load this overlay in a generated instance or an unclassified
  repository.
- Do not turn template propagation into an entry workflow or infer that direct
  assembler/profile maintenance was requested.
- Do not inspect every profile because the repository is the canonical
  template; first prove the changed owner participates in propagation.
- Do not widen a reduced profile to satisfy a canonical implementation. Prefer
  an intentional omission or the narrowest required override.
- Do not copy template machinery into generated projects.

## Repository context

Read only the proven propagation edges for the changed owner:

- `template-assembly/AGENTS.md` and the positive assembly inventory that owns
  the affected path.
- The participating profile manifest, source inventory, nearest profile
  `AGENTS.md`, and existing override when one applies.
- Generated catalogue or export projections only when the changed owner is
  already part of that public projection.
- The focused verifier that establishes ownership or generated-project
  compatibility.

## Verification

- Run `npm run verify:profiles` when profile inclusion, omission, overrides,
  inventories, dependencies, scripts, or generated output change.
- Run the selected workflow's ordinary focused checks as well; propagation does
  not replace them.
- Verify intentional omissions remain absent and generated instances contain no
  template machinery.
- Report the template-propagation overlay separately from selected entry
  workflows.
