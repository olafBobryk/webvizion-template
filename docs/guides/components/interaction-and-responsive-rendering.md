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
  `MotionSource` selects scalar activation strategy and overall timing, while
  `MotionEffect` owns the corresponding visual mapping and internal phasing.
- Keep ordinary rules on the server-safe `Divider`. Draw an unlabeled rule with
  `MotionEffect.Divider` inside the appropriate source; labeled dividers remain
  static so their text stays readable.
- Application appearance, text scale, and motion preferences remain under the
  settings and motion providers.
- JSX SVG attributes use camelCase. Memoization requires a correctness or
  measured-performance reason.

Focus, keyboard, pointer, reduced-motion, and responsive guarantees that belong
to one owner are documented and executed in that owner's Storybook stories.
