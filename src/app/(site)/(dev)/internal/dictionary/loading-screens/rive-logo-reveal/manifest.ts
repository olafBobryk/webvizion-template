import type { DictionaryManifest } from "../../_lib/types";

export const manifest = {
	id: "rive-logo-reveal",
	family: "loading-screens",
	title: "Rive Logo Reveal",
	summary:
		"State-machine-style loading screen that keeps the app-ready contract explicit and fails open when animation callbacks never arrive.",
	copyTargets: [
		"src/components/mount/LoadingScreenMount.tsx",
		"src/components/mount/RiveLoadingAnimation.tsx",
	],
	adaptationPoints: ["logo asset", "colors", "timing", "wordmark lockup"],
	notes: [
		"Uses a lazily loaded animation surface so runtime failures can fall through timeouts.",
		"Locks body scroll until the loading screen exits.",
		"Calls markAppReady before the final unmount path completes.",
		"Swap the placeholder animation internals for the real .riv asset when the runtime is introduced.",
	],
} satisfies DictionaryManifest;
