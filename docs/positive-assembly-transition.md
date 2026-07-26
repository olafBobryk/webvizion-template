# Positive Assembly Transition

This note preserves the intended direction for project creation while the
template temporarily supports both the prune and positive-assembly engines.

## Decision

Positive assembly is the intended long-term project-creation model. Prune is an
accepted compatibility path for now; it is not the desired permanent public
setup language.

The current two-engine implementation was introduced in two recoverable steps:

- `96248e8` / `checkpoint/profile-prune-v1`: filesystem-backed profiles built
  on decentralized prune surfaces.
- `0bf79f4` / `baseline/positive-assembly-v1`: positive assembly added beside
  prune and promoted to `main`.

The second commit did not remove prune. `create:project` still defaults to
`prune`, accepts `--engine prune|assemble`, and retains `prune:template` in the
source template. A one-way assembled output itself omits both assembly and
prune machinery.

## Why prune remains temporarily

- Existing initialized projects can still remove optional surfaces in place.
- The profile/prune checkpoint is proven across the four current profile
  contracts.
- Positive assembly does not yet express every content capability as a
  creation-time positive choice. In particular, it has no independent
  static-versus-Payload-ready selector.
- Keeping both engines temporarily allows direct contract and integration
  comparison while assembly matures in real projects.

This is a migration period, not an endorsement of maintaining two setup models
forever.

## Target state

The eventual public workflow should have one project-creation model:

1. `create:project` positively selects a route profile and content
   capabilities.
2. A normal user does not choose an engine.
3. Static versus Payload-ready is expressed as positive inclusion at creation,
   not a later `--no-payload` deletion.
4. Generated projects contain project code only; they do not contain template
   profile, assembly, or prune machinery.
5. Existing-project migrations use an explicitly named maintenance workflow,
   not the primary creation instructions.
6. The prune implementation remains recoverable from its checkpoint tag and
   branch after it leaves `main`.

Possible final syntax is intentionally not locked here. The important contract
is positive selection—for example, a content choice such as `static` or
`payload-ready`—rather than another matrix of negative flags.

## Payload and fallback boundary

The migration to positive assembly must not redesign the marketing content
architecture. The template already provides:

- source-neutral `MarketingPageDocument` and `SiteLayoutDocument` view models;
- a typed section `layout` selected by `blockType`;
- marketing layout and section renderers that consume those models;
- `getMarketingPage()` and `getSiteLayout()` server resolver boundaries;
- committed fallback page and site-layout data; and
- a guarded Payload-ready scaffold for profiles that include Payload.

Static assembly should omit the Payload capability while retaining the same
fallback and render contracts. Payload-ready assembly should include the
guarded scaffold without changing those contracts.

After a fallback site is complete, the optional `$cms-backfill` skill may
activate Payload. Its generic assumption that a hard-coded site still needs a
CMS-neutral layout model is false here. It must treat the existing page, layout,
section, resolver, and fallback models as pinned inputs; refine the Payload
editorial schema around them; seed the exact fallback; and prove normalized
readback and visual parity before cutover.

## Exit gates for removing prune from `main`

Do not remove the compatibility engine until all of these are true:

- Positive assembly can create every accepted route profile.
- Payload-ready versus static content capability is positively selectable.
- Package, script, path, route, documentation, and verifier ownership all fail
  closed when unclassified.
- Full, app-only, marketing-only, and thin-start outputs pass clean install,
  static verification, production build, and route smoke checks.
- At least one real static project and one Payload-ready project have been
  created through assembly without manual source recovery.
- The project documentation no longer requires negative prune flags for normal
  creation.
- A focused maintenance path is documented for already-initialized legacy
  projects.
- The prune checkpoint tag and remote fallback branch are verified before
  removal.

## Removal sequence

When the gates pass:

1. Make positive assembly the only `create:project` implementation.
2. Remove the public `--engine` decision.
3. Remove `pruneFlags`, marker rewrites, negative removal plans, and prune-only
   verification from profile creation.
4. Remove `prune:template` and its implementation from `main`.
5. Rename assembly-oriented verification to the normal profile verification
   path.
6. Rewrite setup documentation around profile and content capability selection.
7. Verify the checkpoint tag and fallback branch remain reachable.

Until then, documentation must label `--no-payload` and similar flags as
compatibility prune syntax and must not imply that assembled outputs can run
post-creation pruning.

## Non-goals

- Do not delete fallback content when Payload is activated.
- Do not make marketing components consume Payload document shapes.
- Do not turn fixed marketing pages into unrestricted editor-controlled page
  builders.
- Do not multiply route profiles merely to encode every content-source choice.
- Do not rewrite shared Git history to hide the compatibility period.
