# Folder: `src/components/ui/motion`

## Role
Shared reveal, intro, and scroll-motion helpers for cases where motion meaningfully improves presentation.

Read `docs/guides/components/interaction-and-responsive-rendering.md` for the
cross-cutting decision between CSS, responsive rendering, and this motion
family. This file owns motion-component implementation constraints.

## Use This Folder When
- A page needs staggered entrance motion.
- A section needs staged reveal sequencing between media and content.
- A section needs subtle parallax or scroll-lag effects.
- Text should reveal with a scramble, character stagger, or hover wave effect.

## Prefer These Files
- `src/components/ui/motion/MotionScene.tsx`: section-scoped stage orchestration for multi-step reveal choreography.
- `src/components/ui/motion/ActiveStageHost.tsx`: intro-aware auto-cycling stage state for feature tabs, cards, or visual sequences.
- `src/components/ui/motion/index.ts`: exports the agent-facing `Reveal` namespace.
- `src/components/ui/motion/reveal/`: reveal scheduler, list, item, image, highlight text, text, and scramble internals.
- `src/components/ui/motion/LetterWave.tsx`: hover-driven per-character wave text.
- `src/components/ui/motion/ScrollHighlightText.tsx`: character-by-character highlight sweep driven by scroll progress.
- `src/components/ui/motion/ScrollLag.tsx`: subtle lagging scroll effect.
- `src/components/ui/motion/ScrollParallax.tsx`: scroll-based offset effect.
- `src/components/ui/motion/ScrollWidth.tsx`: scroll-driven frame mask for progressive width reveals.
- `src/components/ui/motion/reveal/RevealScramble.tsx`: text scramble reveal effect.
- `src/components/ui/motion/reveal/RevealNumeric.tsx`: numeric text reveal, scroll, and count-up effects exposed as `Reveal.Numeric`.

## Invariants
- Use these helpers only when motion adds value; do not animate everything by default.
- Entrance, reveal, and scroll helpers in this folder are intro-aware. On first load they should remain inert until `LoadingScreenMount` has fully exited and `appReady` is true.
- Reduced motion must remain respected. The defaults here already assume `disableWhenReducedMotion` behavior.
- `Reveal.Root` is the entrance scheduler. It batches visible, ready reveal items and reveal lists by DOM order.
- `Reveal.List` is a root-scheduled boundary with a local child scheduler. `Reveal.Item` automatically joins the local list queue when rendered inside it.
- Marketing pages already wrap page content in one root. Add a scoped `Reveal.Root` only for isolated tests, resettable demos, or non-marketing surfaces.
- Reveal motion can be disabled at the root by user settings or URL overrides such as `?motion=off` / `?reveal=off`. Disabled roots render reveal content visible immediately with no stagger or transform.
- `Reveal.Image` defaults to `loadStrategy="ignore-load"`, so cache state, blur placeholders, and loading callbacks do not block the entrance reveal. Use `loadStrategy="wait-for-load"` only when reveal completion or `unlock` should wait for the actual image load.
- `Reveal.Image` supports a shared corner clip-path reveal via `revealVariant="corner-clip"` plus `revealOrigin`, `revealFinalRadius`, and `revealTransition`. Use it for generic media blocks that should wipe in from a chosen corner.
- When using the shared corner clip-path reveal, let `Reveal.Image` own the reveal mask and final radius instead of duplicating outer overflow or rounded-corner wrappers for the same mask.
- CSS transition utilities remain the default for micro-interactions. Use these helpers for reveal or scroll motion, not as a replacement for normal component transitions.
- Focus visibility and keyboard usability must not depend on motion. Motion can enhance presentation but cannot gate access to controls or content.
- For `motion/react` transitions, use `motionTiming.ts`, `getMotionTiming`, or `spring.ts` instead of hardcoded durations and easings.
- When mixing `Reveal.Item` with transparent gradient-border wrappers, avoid `asChild`; keep a normal wrapper so the child keeps its intended size and position.
- Prefer `MotionScene` when choreography spans multiple dependencies such as intro completion, media reveal completion, and later content stages.
- Use `after` for reveal stage dependencies and `unlock` only on components that genuinely complete a stage: `Reveal.List`, `Reveal.Item`, `Reveal.Image`, or `Reveal.Scramble`.

## How To Use It
- Use `Reveal.Root` and `Reveal.Item` for entrance choreography. On marketing pages, the root already exists.
- Use `Reveal.List` when a section should count as one root-scheduled boundary and then stagger its own children locally.
- Use `Reveal.Text` when copy should stagger letter-by-letter as one scheduled reveal item.
- Use `Reveal.Image` when an image should reveal with a loading fallback or when image readiness should unlock later reveal stages. Use `loadStrategy="wait-for-load"` for image-readiness gates.
- Use `Reveal.Image` with `revealVariant="corner-clip"` when a media block should wipe in from a chosen corner without waiting for image load, including cases that still need Next blur placeholders.
- Use `deferInteractionUntilRevealed` on reveal-wrapped links, buttons, cards, or controls that should not be clicked, hovered, or focusable before visual reveal completes.
- Use `MotionScene` when a section needs explicit sequencing such as image reveal first, copy second, and accent text third.
- Use `ActiveStageHost` when a section should cycle through a finite set of active items after app readiness or after a scene stage unlocks.
- Use `active` on `Reveal.List` or `Reveal.Item` when reveal timing should be driven by app state instead of viewport entry.
- Use `Reveal.HighlightText` when one substring should shift to the primary color as part of entrance choreography. It defaults to `dir="auto"` so mixed LTR/RTL copy keeps sensible bidi behavior.
- Use `ScrollHighlightText` when a short string should brighten progressively as it enters the viewport.
- Use `ScrollParallax` and `ScrollLag` sparingly for decorative depth effects.
- Use `ScrollWidth` when a card or media block should reveal from a narrow inset to a full-width frame while preserving rounded corners.
- Use `Reveal.Numeric` for metric values that should count up or reveal digit by digit. Use `Reveal.Scramble` for decoding text; prefer `maintainSpace` when scramble layout must remain stable.
- Use `LetterWave` for hover-only accent text. Give it a parent with the `group` class.
- If a component already animates itself sufficiently, do not wrap it in extra motion without a clear UX payoff.

## Avoid
- Layering motion helpers on top of already animated controls without need.
- Ignoring reduced-motion expectations or forcing motion on critical interactive content.
- Using `Reveal.Image` callbacks or page-local booleans for multi-step choreography when `MotionScene` would express the same relationship directly.
- Importing old compatibility exports for new reveal work; prefer `import { Reveal } from "@/components/ui/motion"`.
- Using `asChild` on `Reveal.Item` when the wrapped border or transparency pattern depends on a stable outer wrapper.
- Using `LetterWave` as a replacement for meaningful reveal timing; it is a hover accent, not a sequencing primitive.
