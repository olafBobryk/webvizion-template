# Loading and Async States

Loading and state UI should describe the scope that is unavailable and preserve
the geometry of the content that will replace it.

## State Decisions

| Situation | Use |
| --- | --- |
| A component has an owned skeleton | `Component.Skeleton` |
| Generic content placeholder | `Skeleton` or `Text.Skeleton` |
| Async boundary with loading and failure handling | `SuspenseBoundary` |
| Minimal route status | Plain `StateIndicator` |
| Contained entity or table empty state | `StateIndicator variant="framed"` |
| Recoverable region failure with retry | `ErrorState` |
| Idle region awaiting a user choice | `IdleState` |
| Pending action inside a button | The `Button` loading contract |
| Initial route loading | Route/component skeletons, never a toast |

## Skeleton Parity

- Mirror the live component's DOM structure, wrappers, spacing, and breakpoint
  classes.
- Replace content nodes with skeleton nodes rather than replacing the layout.
- Keep skeletons non-interactive and remove hover, click, focus, and blur
  behavior.
- Preserve content-driven dimensions where the component contract supports it.
- Use the `Skeleton` radius prop instead of conflicting radius utilities.
- Data-bearing inputs expose `Input.Skeleton`; ordinary closed fields delegate
  to the shared input skeleton, while controls with repeated choices, previews,
  canvases, or extra rows own their distinct geometry.
- Static hidden inputs do not need skeleton APIs.

When a ghost fallback crossfades into content, the fallback and live layouts
must be structurally identical so the transition does not jump. Do not add a
spinner inside a control that already owns loading behavior.

## State Ownership

- Use the state family whenever the represented condition owns the availability
  of a route or region. Color alone is not a reason to substitute
  `StatusMessage`.
- Use `ErrorState` with an action for recoverable failures and fatal
  prerequisites that offer another path.
- A successful asynchronous flow becomes replacement content when users still
  need its instructions, link, or next action after the toast lifetime would
  end. Use normal content or `StateIndicator`; do not duplicate it in a toast.
- Add a new state preset only when repeated real consumers share semantics and
  presentation that the generic family cannot express.

## Avoid

- Toasts for initial loads.
- Bespoke icon-copy-action stacks when the state family fits.
- Skeletons that shrink, jump, or change breakpoint structure.
- One-off shimmer markup when a component-owned skeleton exists.
- Interactive skeleton controls.

## Owner References

- `src/components/ui/misc/AGENTS.md`
- `src/components/ui/misc/state/AGENTS.md`
- `src/components/ui/input/AGENTS.md`
