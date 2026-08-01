# Assistant component ownership

- Keep the top-level Assistant facade limited to complete consumer-facing
  compositions. Message roles, response rendering, tool dispatch, lifecycle
  frames, and entity connectors remain private implementation families.
- `ToolPresentationFrame` owns generic Assistant tool lifecycle UI: Card slots,
  state, results, approval actions, disabled behavior, and loading geometry.
- Entity-owned tool wrappers provide React-free presentation models and render
  their own result identities, statuses, and actions. Do not add a tool wrapper
  without a real tool contract and execution path.
- Keep tool dispatch exhaustive over `AssistantToolName`. Add a typed branch
  when a real tool family is introduced; do not add a renderer registry or cast
  tool names and states into an entity contract.
- Do not export `ToolPresentationFrame` from the top-level Assistant facade.
