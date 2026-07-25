# Folder: `src/lib`

## Role
Shared non-UI application utilities. This folder is for transport, state helpers, and reusable project foundations that should stay independent from React components.

## Use This Folder When
- You need API or fetch helpers.
- You need shared modal, toast, or motion helpers that are not UI components themselves.
- You want logic that can be reused by app routes, demo code, tests, or external consumers without pulling in component dependencies.

## Preferred Starting Points
- `src/lib/api/createApiClient.ts`: generic request factory for project and external APIs.
- `src/lib/api/createMockFetch.ts`: transport-level mock fetch implementation.
- `src/lib/api/checkHealth.ts`: example endpoint wrapper built on the shared API client.
- `src/lib/forms/guard.ts`: reusable server-side form guard helpers.
- `src/lib/mock/createFakeFetcher.ts`: convenience fake fetcher built on top of `createMockFetch`.
- `src/lib/feedback/toast.ts`: shared toast helpers.
- `src/lib/modal.ts`: shared modal state helpers.
- `src/lib/metadata.ts`: shared Next metadata factories backed by `src/config/metadataConfig.ts`.

## New Feature Workflow
For any new reusable lib feature:
1. Implement the feature in its canonical domain folder under `src/lib`.
2. Keep the public API small and typed, and update barrel exports only when the new surface should be imported broadly.
3. Add or update a demo in `src/app/(site)/(dev)/internal/demo/content.tsx` when the feature is reusable, interactive, or intended for agent discovery.
4. Add at least one usage snippet in the demo when the feature has a public call shape other engineers should copy.
5. Update the nearest `AGENTS.md` with role, preferred entrypoints, and invariants introduced by the new feature.
6. If the feature changes shared lib conventions, update this file as the parent contract.
7. Run checks on the touched files before considering the feature complete.

## Invariants
- Network and transport code does not belong in `src/components`.
- Prefer small endpoint wrappers over raw `fetch` calls scattered through app code.
- Keep the transport layer dependency-injectable: demos and tests should swap the client or fetcher, not duplicate endpoint logic.
- Keep browser-only defaults explicit when they matter, but do not hardwire project assumptions into the factory when injection solves it cleanly.
- UI feedback belongs in `src/app` or `src/components`; `src/lib` should return data or throw typed errors.

## Demo Guidance
- Demo project foundations through `src/app/(site)/(dev)/internal/demo/content.tsx`, usually under the matching utility area such as `lib/api` or related foundations pages.
- Prefer showing one real wrapper function and one mock transport example over duplicating full API pages.
- For fake calls, route the same endpoint wrapper through `createMockFetch(...)` or use `createFakeFetcher(...)` when a component just needs async list data.

## Folder Index
- `src/lib/api/`
- `src/lib/forms/`
- `src/lib/mock/`
- `src/lib/feedback/`
- `src/lib/metadata.ts`

## Avoid
- Putting API helpers in `src/components`.
- Calling `fetch` directly from many pages when a lib wrapper already exists.
- Creating separate “demo-only” endpoint functions that drift from the real transport contract.

Reusable lib features are not complete until implementation, demo coverage where relevant, and documentation all exist together.
