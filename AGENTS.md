# Agent Instructions

## Legacy Orchestration Is Transitional and Default-Off

- The orchestration capability under `template-assembly/capabilities/orchestration/` is a dormant compatibility installer, not an active template subsystem.
- Do not add new product, documentation, assembly, or agent-workflow coupling to this legacy system.
- A replacement orchestration system is under development. Remove this capability once that replacement is accepted; preserve this note until removal so the intent is not lost.
- Canonical main and generated projects must remain orchestration-free unless a user explicitly selects or installs the capability.

## Template Intelligence Baseline

- Before substantial planning or implementation work, prefer the lightweight local map: `npm run intelligence:generate`, then `npm run intelligence:query -- <topic>` for relevant topics.
- Treat `.template-intelligence/agent-map.json` as the first-pass map for where to read next. Use it to narrow file inspection before broad `rg` sweeps.
- Serena is an optional warm local service, not a normal-work prerequisite. Use it when it is already running, when semantic code navigation would materially help, or when the user explicitly asks for it.
- Warm Serena with `npm run intelligence:serena:ensure`; inspect it with `npm run intelligence:serena:status`; stop it with `npm run intelligence:serena:stop`. The wrapper uses a path-hashed project name for each checkout/worktree and stores ignored state in `.codex/serena.json`.
- `npm run intelligence:hybrid` is now benchmark-oriented. It records a `TemplateSerena` row only after a successful Serena semantic call. Without a warm Serena service, it exits cleanly after Template Intelligence work and records no `TemplateSerena` row unless `--require-serena` is passed. Use `--ensure-serena` only for intentional benchmark/setup runs.
- Do not block ordinary implementation work on Serena setup. If Serena is cold or unavailable, continue with Template Intelligence, `rg`, and direct file inspection.
- Do not commit `.template-intelligence/**`, `.serena/**`, `.understand-anything/**`, `.codex/serena.json`, or `.codex/tmp/**`; these are local/generated context artifacts.

## Dev Server Isolation

- If available, use `$agent-dev-workflow` before starting dev servers, opening localhost, or running browser/Playwright verification.
- Do not run `next dev` or `npx next dev` directly in this repository.
- Use `npm run dev` for isolated, prewarmed previews. `npm run dev:agent` is a
  compatibility alias for older automations and skills.
- For Playwright, screenshots, or automated traversal, open the printed automation URL with `?motion=off&reveal=off`.
- Do not stop, kill, or reuse the user's `3000` dev server unless explicitly asked.
- `npm run dev:local` and `npm run dev:user` retain the former local-server
  behavior: they try `http://localhost:3000` first, then fall forward through
  `3001-3010` before failing.
- Preview servers use a random isolated port and `.next-preview-*` build
  directory. Treat the printed URL as the source of truth for review links
  after each restart.
- Storybook is a paired but separate Vite process. Start it only with
  `npm run storybook:preview` after a healthy `npm run dev`; it reuses one
  worktree-owned instance recorded in `.codex/storybook-preview.json`.
  Never run raw `storybook dev`, choose a Storybook port, or assume `6006`.
  Use `npm run storybook:status` to discover the Storybook UI URL.
- For section-scoped UI review, report a direct section-anchor URL on the
  verified preview. If the expected anchor is missing, say
  `section anchor missing`, name the expected section id, and provide the nearest
  verified page URL only as a fallback.
- Do not edit generated `tsconfig.next-*.json` files; the dev server wrapper owns them.

## Template Content Modes

- This template supports static, Payload-ready, and Payload-powered Vercel modes. Read the nearest instructions in `template-assembly/`, `src/lib/marketing-content/`, and `src/payload/` before changing their ownership.
- Static projects should select `--content static` during `create:project` so Payload is never included, then build from fallback TypeScript content.
- Payload-ready projects keep the guarded Payload scaffold but do not expose live admin/API routes until activation.
- Payload-powered Vercel projects must follow `docs/guides/payload-vercel-neon-blob.md` and use Neon Postgres, Vercel Blob, and real Payload admin/API routes.
- Keep the frontend contract lightweight. Marketing components should render page, section, and site layout data; they should not depend on full Payload document shapes.
- Put source-specific details in server-side resolvers/adapters. Payload-only metadata such as relationships, media records, drafts, SEO fields, localization, redirects, and taxonomies should be resolved before it reaches section renderers.

## WhatsApp Deploy Bot Registration

- When a clone becomes a live Vercel project, register it with the WhatsApp deploy bot whitelist as soon as the Vercel deploy hooks exist.
- Use `WHATSAPP_DEPLOY_BOT_ADMIN_URL` and `WHATSAPP_DEPLOY_BOT_ADMIN_TOKEN` from the agent environment.
- Call `POST /api/admin/projects` with the project slug, display name, aliases, and staging/production deploy hook URLs.
- Use lowercase kebab-case for `slug`; include the package/repo/client names as aliases when useful.
- Do not expose deploy hook URLs or admin tokens in commits, docs, chat summaries, logs, or screenshots.

## Halo UI Primitives

- For an ordinary UI change, read the nearest `AGENTS.md` and the relevant owner
  story before inspecting implementation. Read a focused component guide only
  when its concern applies (forms, feedback, loading, overlays, responsive
  behavior, or shared surfaces).
- Before changing a public component API, primitive, shared token, or migrating
  a component family, run `npm run design-system:evidence -- --target <source>
  --owner <owner-story>`. The command is quiet by default and writes a
  privacy-safe receipt under `.codex/design-system-evidence/`; include its path
  in a delegated handoff only for that higher-risk work.
- Treat `ToastHost` plus `showToast` as the shared transient-feedback system. Simple toast helpers accept `{ title }`; promise toasts accept `loadingTitle`, `successTitle`, and `errorTitle`.
- Treat `ConfirmationModal` and `useConfirmationModal` as the shared confirm-before-action primitive. Do not create page-local confirmation dialogs for standard destructive or confirm flows.

## Responsive Rendering

- Use Tailwind responsive classes for visual breakpoint changes and lightweight markup.
- Use `useTailwindBreakpoints` only when a hidden branch would still mount expensive client work such as animation scenes, observers, canvas/WebGL runtimes, media, or duplicated decorative DOM.
- Do not hide SEO-critical content, primary copy, headings, or essential accessibility affordances behind client-only breakpoint checks.
