# Folder: `src/components/ui/overlays/toast`

## Role
Shared transient-feedback host for success, error, info, and loading toasts.

The cross-channel decision table and unresolved `StatusMessage` boundary live in
`docs/guides/components/feedback-and-status.md`. This file owns toast-specific
implementation constraints.

## Use This Folder When
- A user action needs temporary asynchronous feedback.
- A mutation, save, upload, or background task should report progress or completion unobtrusively.

## Prefer These Files
- `src/components/ui/overlays/toast/ToastHost.tsx`: app-wide toast renderer.
- `src/lib/feedback/toast.ts`: paired toast API used by the host.

## Invariants
- Mount the host once through `ToastClientMount` near the app root.
- Prefer `showToast.success`, `showToast.error`, `showToast.loading`, `showToast.dismiss`, and `showToast.promise` over feature-local toast state.
- Toasts are for transient feedback, not for replacing inline validation or modal confirmation.
- The host should continue to respect reduced-motion settings.
- Dismiss controls and interactive content inside toasts must preserve visible focus.
- Initial page loads should not show toasts. Use skeletons or inline loading states for first render.
- Toast copy should stay short, neutral, and server-driven when possible.
- Toast titles are part of the shared pattern. `ToastHost` supplies defaults for success, error, loading, and info; pass `{ title }` to simple helpers only when the flow needs a more specific title.

## How To Use It
- Use `showToast.promise` for async workflows that move from loading to success or error.
- For promise flows, use `loadingTitle`, `successTitle`, and `errorTitle` when the default titles are too generic.
- Use `showToast.loading` when a long-running, user-initiated process starts and update or dismiss it later.
- Use inline field messaging through `Field` for form validation instead of showing validation toasts.
- For mixed flows, fetch directly on initial load and switch to toast-wrapped fetches only for explicit user actions like apply, submit, retry, or manual refresh.

## Avoid
- Rebuilding a second toast system.
- Using toasts for blocking decisions or complex recovery flows better handled by a modal or inline state.
- Showing loading toasts during initial route entry or first content hydration.
