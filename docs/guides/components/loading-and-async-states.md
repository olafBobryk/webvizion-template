# Loading and Async States

Loading and state UI describe the unavailable scope and preserve the geometry
of the content that will replace it.

- Prefer an owner-provided skeleton, then a generic skeleton, then an async
  boundary when loading and failure behavior must be coordinated.
- A skeleton mirrors live wrappers, spacing, repeated rows, and responsive
  structure. It remains non-interactive.
- Pending actions use their owning control's loading state; initial route or
  region loading never uses a toast.
- Empty, idle, unavailable, recoverable-error, and fatal-prerequisite states
  belong to the region-level state family rather than a colored notice.
- Durable success instructions become replacement content rather than a second
  toast.

Geometry, variants, skeleton companions, and executable parity checks live on
the relevant Storybook owner.
