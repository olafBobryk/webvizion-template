# Contact form UX fallback

Apply this only where repository-local policy does not provide a stronger rule.

- Use a real `<form>` and semantic labels.
- Reuse the repository's highest-level field, input, textarea, button, and feedback components.
- Show validation beside the affected field; do not rely on native validation bubbles or toast-only validation.
- Preserve visible keyboard focus and logical tab order.
- Guard against double submission before starting a request. Disable conflicting actions and expose a clear submitting state.
- Announce success or failure accessibly. Keep entered content after a failed send and avoid silently clearing a successful form unless product behavior says otherwise.
- Treat the server response as authoritative. Use a generic user-facing failure while keeping PII and secrets out of logs.
- Add lightweight bot protection already supported by the repository; do not introduce a new vendor without authorization.
