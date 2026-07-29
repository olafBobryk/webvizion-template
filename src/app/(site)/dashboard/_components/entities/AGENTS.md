# Dashboard entity renderer policy

- Renderers receive resolved domain facts or presentation view models and never
  fetch sessions, organizations, capabilities, or persistence themselves.
- Import the entity-owned presentation factory directly. Do not add a global
  renderer or presentation registry.
- Loading states belong to their live component as `Component.Skeleton` and must
  preserve the live geometry.
- Entity deletion uses the shared confirmation primitive, includes impacts and
  warnings where useful, rolls optimistic state back on failure, and returns
  `false` to keep a failed confirmation open.
- Entity deletion completion declares `refresh` for collection actions or
  `navigate` for detail exits. Navigation owns one push or replacement and must
  not refresh the deleted detail route. Returned and thrown failures both roll
  optimistic state back.
- Use the shared table, detail, property-list, Markdown, selector, More-menu,
  state, toast, and modal components before creating entity-local substitutes.
- `DashboardTablePanel` owns responsive data-table mechanics. Its first identity
  column is always retained, optional columns are removed from right to left
  when their card overflows, and a final `kind: "action"` column is always
  visible and sticky. Set a higher `responsivePriority` only when a call site
  needs a later optional column to survive longer than the positional default.
- Compose each table's required `header` with the shared `Card.Header` slots.
  Keep search, filters, summaries, and table-level actions in that caller-owned
  header rather than adding table-specific toolbar props or a second Card.
- A table supports at most one action column, and it must be the final column.
  Mirror `kind` and `responsivePriority` in `DashboardTablePanel.Skeleton` so
  live and loading layouts hide columns in the same order.
