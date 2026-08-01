# Component Conventions

These guides own decisions that cross multiple UI families. Storybook owns each
public UI owner's availability, supported import, API, examples, exclusions,
and executable behavior. The nearest `AGENTS.md` owns structural implementation
invariants.

For catalogue work, begin at Storybook `UI/Guides/Catalog Rules`; for ordinary
selection, begin at the relevant owner Docs page. Use these guides only when a
decision spans owners.

| Decision | Guide |
| --- | --- |
| Abstraction level, composition, or public boundary | [Composition and public APIs](./composition-and-public-apis.md) |
| Form semantics, validation, or submission lifecycle | [Forms and submission](./forms-and-submission.md) |
| Field, toast, notice, or region feedback | [Feedback and status](./feedback-and-status.md) |
| Loading, skeleton, empty, error, or retry scope | [Loading and async states](./loading-and-async-states.md) |
| Modal, confirmation, dropdown, inspection, or toast ownership | [Overlays and confirmation](./overlays-and-confirmation.md) |
| Focus, responsive rendering, motion, shortcuts, or SVG | [Interaction and responsive rendering](./interaction-and-responsive-rendering.md) |
| Typography, surfaces, structure, and semantic accents | [Surfaces and presentation](./surfaces-and-presentation.md) |

Do not copy an owner's contract into these guides. Link to its Storybook page
and keep only the cross-family decision.
