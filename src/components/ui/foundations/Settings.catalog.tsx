"use client";

import { useState } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Button } from "../primitives/Button";
import { type AppearancePreference, resolveAppearance } from "./appearance";
import { SettingsProvider, useSettingsContext } from "./settingsContext";

function AppearanceProbe() {
	const settings = useSettingsContext();

	return (
		<p>
			Averlo appearance: {settings?.appearance}; resolved:{" "}
			{settings?.resolvedAppearance}
		</p>
	);
}
function PreferenceHarness() {
	const settings = useSettingsContext();
	const [lastChoice, setLastChoice] = useState<AppearancePreference>("light");
	if (!settings) return null;

	return (
		<div className="grid gap-4">
			<p aria-live="polite">
				Appearance: {settings.appearance}; resolved:{" "}
				{settings.resolvedAppearance}
				{"; motion: "}
				{settings.motionDisabled ? "off" : "on"}; scale: {settings.textScale}
			</p>
			<div className="flex flex-wrap gap-2">
				{(["light", "dark", "system"] as const).map((appearance) => (
					<Button
						key={appearance}
						onClick={() => {
							settings.setAppearance(appearance);
							setLastChoice(appearance);
						}}
						variant={lastChoice === appearance ? "primary" : "secondary"}
					>
						{appearance}
					</Button>
				))}
				<Button
					onClick={() => settings.setMotionDisabled(true)}
					variant="ghost"
				>
					Disable motion
				</Button>
				<Button onClick={() => settings.setTextScale(1.125)} variant="ghost">
					Increase text scale
				</Button>
			</div>
		</div>
	);
}
function CatalogPreview1() {
	const render = () => (
		<dl className="grid grid-cols-2 gap-2">
			<dt>System with dark preference</dt>
			<dd data-testid="system-dark">{resolveAppearance("system", true)}</dd>
			<dt>Explicit light preference</dt>
			<dd data-testid="explicit-light">{resolveAppearance("light", true)}</dd>
		</dl>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview2() {
	const render = () => (
		<SettingsProvider defaultAppearance="light" storageKey={null}>
			<PreferenceHarness />
		</SettingsProvider>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview3() {
	const render = () => <AppearanceProbe />;
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-foundations-settings",
	name: "Settings and Appearance",
	role: "Application-level owner for appearance, text scale, reduced motion, and smooth-scroll preferences.",
	importStatement:
		'import { SettingsProvider, useSettingsContext } from "@/components/ui/foundations/settingsContext";\nimport { resolveAppearance, type AppearancePreference } from "@/components/ui/foundations/appearance";',
	chooseWhen: [
		"The application root or a settings control must read or change shared UI preferences.",
	],
	chooseInstead: [
		"Use MotionScope for a local expressive-motion adjustment that is not an application preference.",
	],
	compounds: ["AppearancePreference", "resolveAppearance"],
	exclusions: [
		"Route-local theme stores or dark-mode class ownership.",
		"Direct storage access by consumer components.",
	],
	guarantees: [
		{
			label: "Appearance resolution",
			storyId: "ui-foundations-settings--appearance-resolution",
		},
		{
			label: "Controlled preference context",
			storyId: "ui-foundations-settings--preference-context",
		},
		{
			label: "Storybook appearance integration",
			storyId: "ui-foundations-settings--storybook-dark-appearance",
		},
	],

	family: "UI",
	group: "Foundations",
	sweepSpan: "full",
	previewTargets: [
		{
			id: "appearance-resolution",
			name: "Appearance resolution",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "preference-context",
			name: "Controlled preference context",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
		{
			id: "storybook-dark-appearance",
			name: "Storybook appearance integration",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview3,
		},
	],
});
