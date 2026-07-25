# Loading screen entry

Use this entry when the destination needs a full-screen intro overlay that owns
the app-ready signal.

## Preserve
- `markAppReady()` before final unmount
- body scroll lock until completion
- graceful timeout path if animation callbacks never fire
- current motion timing helpers

## Adapt
- logo or wordmark asset
- color system
- reveal timing
- animation internals

## Notes
- `_source/LoadingScreenMount.tsx` is the copyable root-mount implementation.
- `_source/RiveLoadingAnimation.tsx` is an adapter surface for a future Rive runtime.
- Keep the live template loading screen canonical unless the task explicitly replaces it.
