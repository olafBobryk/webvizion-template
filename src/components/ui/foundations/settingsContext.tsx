"use client";

import * as React from "react";
import { SCROLL_CONFIG } from "@/config/scrollConfig";
import {
	APP_SETTINGS_STORAGE_KEY,
	type AppearancePreference,
	applyDocumentAppearance,
	clearDocumentAppearance,
	DEFAULT_APPEARANCE,
	isAppearancePreference,
	isResolvedAppearance,
	PREVIOUS_DASHBOARD_SETTINGS_STORAGE_KEY,
	type ResolvedAppearance,
	resolveAppearance,
} from "./appearance";

type SettingsContextValue = {
	appearance: AppearancePreference;
	motionDisabled: boolean;
	resolvedAppearance: ResolvedAppearance;
	setAppearance: (value: AppearancePreference) => void;
	setMotionDisabled: (value: boolean) => void;
	smoothScrollAvailable: boolean;
	smoothScrollDisabled: boolean;
	setSmoothScrollDisabled: (value: boolean) => void;
	textScale: number;
	setTextScale: (value: number) => void;
};

type SettingsProviderProps = {
	children: React.ReactNode;
	defaultAppearance?: AppearancePreference;
	defaultMotionDisabled?: boolean;
	defaultSmoothScrollDisabled?: boolean;
	defaultTextScale?: number;
	storageKey?: string | null;
};

type StoredSettings = {
	appearance?: AppearancePreference;
	motionDisabled?: boolean;
	smoothScrollDisabled?: boolean;
	textScale?: number;
};

type LegacyDashboardSettings = {
	dashboardAppearance?: "light" | "dark";
};

const SettingsContext = React.createContext<SettingsContextValue | undefined>(
	undefined,
);

const isValidTextScale = (value: unknown): value is number =>
	typeof value === "number" && Number.isFinite(value) && value > 0;

const readStoredSettings = (storageKey: string) => {
	try {
		const raw = localStorage.getItem(storageKey);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as StoredSettings;
		if (typeof parsed !== "object" || parsed === null) return null;
		return parsed;
	} catch {
		return null;
	}
};

const readLegacyAppearance = () => {
	try {
		const raw = localStorage.getItem(PREVIOUS_DASHBOARD_SETTINGS_STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as LegacyDashboardSettings;
		return parsed.dashboardAppearance === "light" ||
			parsed.dashboardAppearance === "dark"
			? parsed.dashboardAppearance
			: null;
	} catch {
		return null;
	}
};

const writeStoredSettings = (storageKey: string, settings: StoredSettings) => {
	try {
		localStorage.setItem(storageKey, JSON.stringify(settings));
	} catch {
		// Ignore storage failures (private mode, quota, etc.).
	}
};

export function SettingsProvider({
	children,
	defaultAppearance = DEFAULT_APPEARANCE,
	defaultMotionDisabled = false,
	defaultSmoothScrollDisabled = false,
	defaultTextScale = 1,
	storageKey = APP_SETTINGS_STORAGE_KEY,
}: SettingsProviderProps) {
	const smoothScrollAvailable = SCROLL_CONFIG.enableSmoothScroll;
	const [appearance, setAppearanceState] =
		React.useState<AppearancePreference>(defaultAppearance);
	const [motionDisabled, setMotionDisabled] = React.useState(
		defaultMotionDisabled,
	);
	const [resolvedAppearance, setResolvedAppearance] =
		React.useState<ResolvedAppearance>(() =>
			resolveAppearance(
				defaultAppearance,
				typeof window !== "undefined" &&
					window.matchMedia("(prefers-color-scheme: dark)").matches,
			),
		);
	const [smoothScrollDisabled, setSmoothScrollDisabled] = React.useState(
		smoothScrollAvailable ? defaultSmoothScrollDisabled : true,
	);
	const [textScale, setTextScale] = React.useState(defaultTextScale);
	const hasHydrated = React.useRef(false);

	function setAppearance(nextAppearance: AppearancePreference) {
		const nextResolvedAppearance = resolveAppearance(
			nextAppearance,
			window.matchMedia("(prefers-color-scheme: dark)").matches,
		);
		applyDocumentAppearance({
			appearance: nextAppearance,
			atomic: nextResolvedAppearance !== resolvedAppearance,
			resolvedAppearance: nextResolvedAppearance,
		});
		setAppearanceState(nextAppearance);
		setResolvedAppearance(nextResolvedAppearance);
	}

	React.useLayoutEffect(() => {
		if (!storageKey || !hasHydrated.current) return;
		writeStoredSettings(storageKey, {
			appearance,
			motionDisabled,
			smoothScrollDisabled,
			textScale,
		});
	}, [appearance, motionDisabled, smoothScrollDisabled, textScale, storageKey]);

	React.useEffect(() => {
		if (!hasHydrated.current) return;
		document.documentElement.style.setProperty(
			"--text-scale",
			String(textScale),
		);

		return () => {
			document.documentElement.style.removeProperty("--text-scale");
		};
	}, [textScale]);

	React.useLayoutEffect(() => {
		const stored = storageKey ? readStoredSettings(storageKey) : null;
		const nextAppearance = storageKey
			? isAppearancePreference(stored?.appearance)
				? stored.appearance
				: (readLegacyAppearance() ?? defaultAppearance)
			: defaultAppearance;
		const documentResolvedAppearance =
			document.documentElement.dataset.resolvedAppearance;
		const shouldUseDocumentAppearance =
			Boolean(storageKey) && isResolvedAppearance(documentResolvedAppearance);
		const nextResolvedAppearance = shouldUseDocumentAppearance
			? documentResolvedAppearance
			: resolveAppearance(
					nextAppearance,
					window.matchMedia("(prefers-color-scheme: dark)").matches,
				);

		setAppearanceState(nextAppearance);
		setResolvedAppearance(nextResolvedAppearance);
		applyDocumentAppearance({
			appearance: nextAppearance,
			atomic: true,
			resolvedAppearance: nextResolvedAppearance,
		});
		if (typeof stored?.motionDisabled === "boolean") {
			setMotionDisabled(stored.motionDisabled);
		}
		if (
			smoothScrollAvailable &&
			typeof stored?.smoothScrollDisabled === "boolean"
		) {
			setSmoothScrollDisabled(stored.smoothScrollDisabled);
		} else if (!smoothScrollAvailable) {
			setSmoothScrollDisabled(true);
		}
		const nextTextScale = isValidTextScale(stored?.textScale)
			? stored.textScale
			: defaultTextScale;
		document.documentElement.style.setProperty(
			"--text-scale",
			String(nextTextScale),
		);
		setTextScale(nextTextScale);
		hasHydrated.current = true;
	}, [defaultAppearance, defaultTextScale, storageKey]);

	React.useEffect(() => {
		if (appearance !== "system") return;
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = () => {
			const nextResolvedAppearance = resolveAppearance("system", media.matches);
			if (nextResolvedAppearance === resolvedAppearance) return;
			applyDocumentAppearance({
				appearance: "system",
				atomic: true,
				resolvedAppearance: nextResolvedAppearance,
			});
			setResolvedAppearance(nextResolvedAppearance);
		};
		media.addEventListener("change", handleChange);
		return () => media.removeEventListener("change", handleChange);
	}, [appearance, resolvedAppearance]);

	React.useEffect(() => () => clearDocumentAppearance(), []);

	React.useEffect(() => {
		if (!storageKey) return;
		const handleStorage = (event: StorageEvent) => {
			if (event.key !== storageKey) return;
			const stored = readStoredSettings(storageKey);
			const nextAppearance = isAppearancePreference(stored?.appearance)
				? stored.appearance
				: defaultAppearance;
			const nextResolvedAppearance = resolveAppearance(
				nextAppearance,
				window.matchMedia("(prefers-color-scheme: dark)").matches,
			);
			applyDocumentAppearance({
				appearance: nextAppearance,
				atomic: nextResolvedAppearance !== resolvedAppearance,
				resolvedAppearance: nextResolvedAppearance,
			});
			setAppearanceState(nextAppearance);
			setResolvedAppearance(nextResolvedAppearance);
			if (typeof stored?.motionDisabled === "boolean") {
				setMotionDisabled(stored.motionDisabled);
			}
			if (
				smoothScrollAvailable &&
				typeof stored?.smoothScrollDisabled === "boolean"
			) {
				setSmoothScrollDisabled(stored.smoothScrollDisabled);
			} else if (!smoothScrollAvailable) {
				setSmoothScrollDisabled(true);
			}
			setTextScale(
				isValidTextScale(stored?.textScale)
					? stored.textScale
					: defaultTextScale,
			);
		};

		window.addEventListener("storage", handleStorage);
		return () => window.removeEventListener("storage", handleStorage);
	}, [defaultAppearance, defaultTextScale, resolvedAppearance, storageKey]);

	return (
		<SettingsContext.Provider
			value={{
				appearance,
				motionDisabled,
				resolvedAppearance,
				setAppearance,
				setMotionDisabled,
				smoothScrollAvailable,
				smoothScrollDisabled,
				setSmoothScrollDisabled: smoothScrollAvailable
					? setSmoothScrollDisabled
					: () => {},
				textScale,
				setTextScale,
			}}
		>
			{children}
		</SettingsContext.Provider>
	);
}

export function useSettingsContext() {
	return React.useContext(SettingsContext);
}
