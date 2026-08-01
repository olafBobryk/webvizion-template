# Dashboard entity renderer policy

- Renderers receive resolved domain facts or presentation view models and never
  fetch sessions, organizations, capabilities, or persistence themselves.
- Import the entity-owned presentation factory directly. Do not add a global
  renderer or presentation registry.
- Loading states belong to their live component as `Component.Skeleton`, must
  preserve the live geometry, and should be reviewed in the component owner's
  colocated Storybook stories.
- Entity deletion uses the shared confirmation primitive, includes impacts and
  warnings where useful, rolls optimistic state back on failure, and returns
  `false` to keep a failed confirmation open.
- Entity deletion completion declares `refresh` for collection actions or
  `navigate` for detail exits. Navigation owns one push or replacement and must
  not refresh the deleted detail route. Returned and thrown failures both roll
  optimistic state back.
- Use the shared table, detail, property-list, Markdown, selector, More-menu,
  state, toast, and modal components before creating entity-local substitutes.
- Entity-specific selectors compose `EntitySelector`. The shared selector owns
  plain closed-field labels, portal behavior, and option mapping; each entity
  wrapper owns its presentation model and explicit option renderer.
- Assistant tool lifecycle chrome belongs to the private assistant-owned
  `ToolPresentationFrame`. An entity tool wrapper owns its React-free
  presentation factory and explicit result renderer. Add a wrapper only when
  that entity has real Assistant tool contracts and execution; Record is the
  only current tool family.
- `DashboardTablePanel` owns responsive data-table mechanics. Its first identity
  column is always retained, optional columns are removed from right to left
  when their card overflows, and a final `kind: "action"` column is always
  visible and sticky. Set a higher `responsivePriority` only when a call site
  needs a later optional column to survive longer than the positional default.
- When a table needs its own header, compose it with the shared `Card.Header`
  slots. If the owning dashboard section already supplies all title, context,
  and actions, omit the table header; `DashboardTablePanel` removes its card top
  padding so the column header begins at the card edge. Do not pass a null or
  empty placeholder header. Keep table-level search, filters, summaries, and
  actions in a real caller-owned header rather than adding table-specific
  toolbar props or a second Card.
- A table supports at most one action column, and it must be the final column.
  Mirror `kind` and `responsivePriority` in `DashboardTablePanel.Skeleton` so
  live and loading layouts hide columns in the same order.
