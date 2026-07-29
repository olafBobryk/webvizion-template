# Component Conventions

This directory is the canonical review surface for cross-cutting component and
UX conventions. Read the guide that matches the interaction being built before
choosing a component. The nearest `AGENTS.md` remains canonical for a
component's implementation details, public exports, and profile availability.

## Start Here

| If the work involves | Read |
| --- | --- |
| Choosing a component, composing a family, or naming an API | [Composition and public APIs](./composition-and-public-apis.md) |
| Inputs, validation, form submission, or mutation results | [Forms and submission](./forms-and-submission.md) |
| Toasts, field errors, persistent notices, or action outcomes | [Feedback and status](./feedback-and-status.md) |
| Loading, empty, error, retry, or skeleton states | [Loading and async states](./loading-and-async-states.md) |
| Modals, confirmations, image inspection, or dismissal | [Overlays and confirmation](./overlays-and-confirmation.md) |
| Focus, breakpoints, motion, keyboard shortcuts, or SVG rendering | [Interaction and responsive rendering](./interaction-and-responsive-rendering.md) |
| Typography, panels, cards, sections, accents, or transparent surfaces | [Surfaces and presentation](./surfaces-and-presentation.md) |

## How Convention Ownership Works

- These guides own decisions that apply across several component folders or to
  component consumers elsewhere in the application.
- `src/components/AGENTS.md` owns the library workflow and routes agents here.
- A nearer `AGENTS.md` owns local implementation constraints and may narrow a
  general rule for its component family.
- Real source code owns the executable API. A guide must use real export names
  and paths so readers can confirm the contract.

## Review Order

1. Review the decision tables first; they describe which component owns each
   common situation.
2. Change one convention family at a time so the resulting implementation audit
   remains attributable.
3. After the policy review, verify documentation against actual consumers,
   demos, profile outputs, static checks, and visual behavior.
