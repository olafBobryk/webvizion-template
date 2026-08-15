# Folder: `src/lib/feedback`

## Role

Shared non-visual feedback event helpers used by UI hosts.

## Invariants

- Feedback helpers should stay UI-agnostic and event-based.
- Toast dispatch belongs here; rendering belongs in the component layer.
- Shared feedback contracts must stay stable because multiple components consume them.
