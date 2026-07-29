"use client";

import type * as React from "react";
import type { AppearancePreference } from "@/components/ui/foundations/appearance";
import type { useSettingsContext } from "@/components/ui/foundations/settingsContext";
import { Icon } from "@/components/ui/icons/Icon";
import { RadioInput, ToggleInput } from "@/components/ui/input";
import { Card } from "@/components/ui/primitives/Card";

export type SettingsSection = {
	id: string;
	content: React.ReactNode;
};

export type BaseSettingsContext = NonNullable<
	ReturnType<typeof useSettingsContext>
>;

const BASE_SETTINGS_OPTIONS: React.ComponentProps<
	typeof ToggleInput
>["options"] = [
	{
		value: "reduce-motion",
		label: "Reduce motion",
		description:
			"Disables non-essential animations. Still respects system reduced-motion.",
	},
	{
		value: "large-text",
		label: "Increase text size",
		description: "Scales application typography up by 10% for readability.",
	},
];

function AppearanceSettingsControl({
	settings,
}: {
	settings: BaseSettingsContext;
}) {
	return (
		<RadioInput
			description="Use your device setting or choose one appearance across the application."
			label="Appearance"
			name="application-appearance"
			onChange={(value) =>
				settings.setAppearance(value as AppearancePreference)
			}
			options={[
				{ label: "System", value: "system" },
				{ label: "Light", value: "light" },
				{ label: "Dark", value: "dark" },
			]}
			value={settings.appearance}
		/>
	);
}

function AccessibilitySettingsCard({
	settings,
}: {
	settings: BaseSettingsContext;
}) {
	const selectedValues = [
		settings.motionDisabled ? "reduce-motion" : null,
		settings.smoothScrollAvailable && settings.smoothScrollDisabled
			? "disable-smooth-scroll"
			: null,
		settings.textScale > 1 ? "large-text" : null,
	].filter(Boolean) as string[];

	const options = settings.smoothScrollAvailable
		? [
				...BASE_SETTINGS_OPTIONS.slice(0, 1),
				{
					value: "disable-smooth-scroll",
					label: "Disable smooth scroll",
					description:
						"Uses immediate jumps for anchor links and desktop wheel scrolling.",
				},
				...BASE_SETTINGS_OPTIONS.slice(1),
			]
		: BASE_SETTINGS_OPTIONS;

	function handleSettingsChange(values: string[]) {
		settings.setMotionDisabled(values.includes("reduce-motion"));
		if (settings.smoothScrollAvailable) {
			settings.setSmoothScrollDisabled(
				values.includes("disable-smooth-scroll"),
			);
		}
		settings.setTextScale(values.includes("large-text") ? 1.1 : 1);
	}

	return (
		<Card className="scroll-mt-24" id="accessibility">
			<Card.Header>
				<Card.Title className="inline-flex items-center gap-2">
					<Icon className="text-muted-foreground" name="sliders" size="sm" />
					Accessibility
				</Card.Title>
				<Card.Description>
					Appearance, motion, scrolling, and text preferences.
				</Card.Description>
			</Card.Header>
			<Card.Content className="grid gap-5">
				<AppearanceSettingsControl settings={settings} />
				<ToggleInput
					description="Choose motion, scrolling, and text preferences for this application."
					label="Interaction and text"
					onChange={handleSettingsChange}
					options={options}
					value={selectedValues}
				/>
			</Card.Content>
		</Card>
	);
}

export function buildSharedSettingsSections(
	settings: BaseSettingsContext,
): SettingsSection[] {
	return [
		{
			id: "accessibility",
			content: <AccessibilitySettingsCard settings={settings} />,
		},
	];
}
