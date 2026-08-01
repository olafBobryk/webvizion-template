export type AppearancePreference = "system" | "light" | "dark";
export type ResolvedAppearance = "light" | "dark";

export const APP_SETTINGS_STORAGE_KEY = "averlo-ui-settings";
export const PREVIOUS_DASHBOARD_SETTINGS_STORAGE_KEY =
	"webvizion-dashboard-settings";
export const DEFAULT_APPEARANCE: AppearancePreference = "light";

const THEME_COLORS: Record<ResolvedAppearance, string> = {
	dark: "#18181b",
	light: "#ffffff",
};

let switchingStartFrame = 0;
let switchingEndFrame = 0;

export function isAppearancePreference(
	value: unknown,
): value is AppearancePreference {
	return value === "system" || value === "light" || value === "dark";
}

export function isResolvedAppearance(
	value: unknown,
): value is ResolvedAppearance {
	return value === "light" || value === "dark";
}

export function resolveAppearance(
	appearance: AppearancePreference,
	prefersDark: boolean,
): ResolvedAppearance {
	return appearance === "system"
		? prefersDark
			? "dark"
			: "light"
		: appearance;
}

function updateThemeColor(resolvedAppearance: ResolvedAppearance) {
	document
		.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
		.forEach((meta) => {
			meta.content = THEME_COLORS[resolvedAppearance];
		});
}

function scheduleTransitionRestore() {
	window.cancelAnimationFrame(switchingStartFrame);
	window.cancelAnimationFrame(switchingEndFrame);
	switchingStartFrame = window.requestAnimationFrame(() => {
		switchingEndFrame = window.requestAnimationFrame(() => {
			delete document.documentElement.dataset.themeSwitching;
		});
	});
}

export function applyDocumentAppearance({
	appearance,
	atomic = false,
	resolvedAppearance,
}: {
	appearance: AppearancePreference;
	atomic?: boolean;
	resolvedAppearance: ResolvedAppearance;
}) {
	const root = document.documentElement;
	if (atomic) root.dataset.themeSwitching = "true";
	root.dataset.appearance = appearance;
	root.dataset.resolvedAppearance = resolvedAppearance;
	root.classList.toggle("dark", resolvedAppearance === "dark");
	root.style.colorScheme = resolvedAppearance;
	updateThemeColor(resolvedAppearance);
	if (atomic) scheduleTransitionRestore();
}

export function clearDocumentAppearance() {
	window.cancelAnimationFrame(switchingStartFrame);
	window.cancelAnimationFrame(switchingEndFrame);
	const root = document.documentElement;
	root.classList.remove("dark");
	delete root.dataset.appearance;
	delete root.dataset.resolvedAppearance;
	delete root.dataset.themeSwitching;
	root.style.colorScheme = "";
	updateThemeColor(
		window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light",
	);
}

export const appearanceBootstrapScript = `
(() => {
	try {
		if (/^\\/admin(?:\\/|$)/.test(window.location.pathname)) return;
		const settingsKey = ${JSON.stringify(APP_SETTINGS_STORAGE_KEY)};
		const previousSettingsKey = ${JSON.stringify(PREVIOUS_DASHBOARD_SETTINGS_STORAGE_KEY)};
		const isAppearance = (value) => value === "system" || value === "light" || value === "dark";
		let settings = {};
		try {
			settings = JSON.parse(window.localStorage.getItem(settingsKey) || "{}") || {};
		} catch {}
		let appearance = isAppearance(settings.appearance) ? settings.appearance : null;
		if (!appearance) {
			let previousAppearance = null;
			try {
				const previousSettings = JSON.parse(window.localStorage.getItem(previousSettingsKey) || "{}");
				previousAppearance = previousSettings?.dashboardAppearance;
			} catch {}
			appearance = previousAppearance === "light" || previousAppearance === "dark"
				? previousAppearance
				: ${JSON.stringify(DEFAULT_APPEARANCE)};
			try {
				window.localStorage.setItem(settingsKey, JSON.stringify({ ...settings, appearance }));
			} catch {}
		}
		const resolvedAppearance = appearance === "system"
			? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
			: appearance;
		const textScale = typeof settings.textScale === "number" && Number.isFinite(settings.textScale) && settings.textScale > 0
			? settings.textScale
			: 1;
		const root = document.documentElement;
		root.dataset.appearance = appearance;
		root.dataset.resolvedAppearance = resolvedAppearance;
		root.classList.toggle("dark", resolvedAppearance === "dark");
		root.style.colorScheme = resolvedAppearance;
		root.style.setProperty("--text-scale", String(textScale));
		const themeColor = resolvedAppearance === "dark" ? "#18181b" : "#ffffff";
		document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
			meta.setAttribute("content", themeColor);
		});
	} catch {}
})();
`;
