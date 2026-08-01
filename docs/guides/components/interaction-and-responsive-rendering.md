# Interaction and Responsive Rendering

Interaction remains accessible on first render and respects shared settings.

- Every interactive control preserves a visible token-driven focus indicator.
- Use responsive CSS for layout and lightweight visibility. Use breakpoint
  hooks only to avoid mounting expensive hidden work; never gate primary copy or
  essential accessibility content behind a client-only breakpoint.
- Use native keyboard behavior when it covers the interaction, scoped shared
  shortcuts for reusable commands, and owner-managed navigation for composite
  widgets.
- Use shared timing and spring tokens. CSS owns ordinary micro-interactions;
  shared motion owners handle reveal or scroll choreography.
- Application appearance, text scale, and motion preferences remain under the
  settings and motion providers.
- JSX SVG attributes use camelCase. Memoization requires a correctness or
  measured-performance reason.

Focus, keyboard, pointer, reduced-motion, and responsive guarantees that belong
to one owner are documented and executed in that owner's Storybook stories.
