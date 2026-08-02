<INSTRUCTIONS>
## Scope

These instructions guide work anywhere under `src/components`. Use the existing
library before inventing controls, wrappers, overlays, feedback patterns, or
layout widgets.

## Read the Relevant Convention

Cross-cutting usage decisions are organized for review under
`docs/guides/components/README.md`. Before implementing a matching pattern, read
its guide:

- Component selection, composition, naming, and imports:
  `docs/guides/components/composition-and-public-apis.md`
- Forms, validation, submission, and mutation results:
  `docs/guides/components/forms-and-submission.md`
- Toasts, inline errors, contextual status, and action outcomes:
  `docs/guides/components/feedback-and-status.md`
- Loading, empty, error, retry, and skeleton states:
  `docs/guides/components/loading-and-async-states.md`
- Modals, confirmations, inspection, and dismissal:
  `docs/guides/components/overlays-and-confirmation.md`
- Focus, responsive rendering, motion, hotkeys, and rendering behavior:
  `docs/guides/components/interaction-and-responsive-rendering.md`
- Typography, actions, cards, panels, sections, and surface ownership:
  `docs/guides/components/surfaces-and-presentation.md`

## Default Workflow

1. Identify the UX pattern before page-specific styling.
2. Search `primitives/`, `input/`, `misc/`, `overlays/`, and `composites/` for
   the highest-level existing owner.
3. For public component work, inspect the relevant Storybook owner documentation
	and examples, then read the relevant pattern guide and nearest folder
	`AGENTS.md` for structural invariants.
4. Compose upward from library pieces rather than creating a page-local clone.
5. Add a new reusable component only when extending an existing owner would
   harm reuse or coherence.

## Reusable Feature Completion

For a new reusable library feature:

1. Implement it in its canonical owner folder.
2. Update explicit exports and public types only where needed.
3. Add focused Storybook owner documentation, examples, and behavior tests for
	public component families. Internal-only families follow their nearest
	catalogue policy.
4. Record implementation constraints in the nearest `AGENTS.md`.
5. Update a pattern guide only when a cross-cutting decision changes.
6. Run focused checks, public-contract verification, profile verification, and
   rendered review appropriate to the change.

## Global Invariants

- Preserve visible keyboard focus through shared foundation tokens.
- Route field labels, descriptions, errors, required state, IDs, and ARIA
  relationships through `Field` and the complete input component.
- Use the shared portal and host model for modal, dropdown, and toast behavior.
- Prefer component-owned skeletons over custom placeholders.
- Use real file paths and export names in documentation.
- Avoid `useCallback`, `useMemo`, and similar memoization unless correctness or
  measured performance requires them.
- Preserve existing public names during behavior-neutral moves. Make API renames
  a separate, verified checkpoint.
- Use `redirect()` for redirects. Auth guards must redirect `401` and `403`
  outcomes to `/login` instead of returning blank UI or a permanent loading
  state.

## Directory Map

- `branding/`: brand identity primitives.
- `composites/`: reusable above-primitive compositions.
- `domain/`: reserved extension point for reusable domain-level widgets added by
  assembled template instances; the source template need not contain it yet.
- `mount/`: client-only modal, toast, and loading hosts.
- `ui/foundations/`: focus, motion, settings, and shared CSS tokens.
- `ui/helpers/`: small component helpers.
- `ui/icons/`: icon rendering and registries.
- `ui/primitives/`: low-level reusable building blocks.
- `ui/input/`: complete form controls.
- `ui/misc/`: cross-cutting state, display, and interaction helpers.
- `ui/motion/`: reveal and scroll-driven helpers.
- `ui/overlays/`: portal-backed modals and toasts.
- `ui/time/`: date and relative-time presentation.

## Documentation Ownership

- Pattern guides own cross-cutting component-selection and UX decisions.
- Storybook owns availability, supported APIs, examples, and executable behavior
	for public component families with a catalogue owner.
- The nearest folder `AGENTS.md` owns implementation constraints, internal
	dependency direction, server/client boundaries, and profile differences.
- Public facades and source remain the final implementation contract;
  documentation must name real components and paths.
</INSTRUCTIONS>
