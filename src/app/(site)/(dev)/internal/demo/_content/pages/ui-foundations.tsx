"use client";

import type { AppearancePreference } from "@/components/ui/foundations/appearance";
import { useSettingsContext } from "@/components/ui/foundations/settingsContext";
import { SegmentedControl } from "@/components/ui/misc";
import { Text } from "@/components/ui/primitives/Text";

import { relatedMap } from "../relationships";
import type { DemoPage } from "../types";

function AppearanceSettingsDemo() {
	const settings = useSettingsContext();
	if (!settings)
		return <Text tone="muted">Settings provider unavailable.</Text>;
	return (
		<div className="grid gap-3">
			<SegmentedControl<AppearancePreference>
				ariaLabel="Demo application appearance"
				columns={3}
				layout="columns"
				onChange={settings.setAppearance}
				options={[
					{ label: "System", value: "system" },
					{ label: "Light", value: "light" },
					{ label: "Dark", value: "dark" },
				]}
				value={settings.appearance}
			/>
			<Text tone="muted" variant="caption">
				Resolved appearance: {settings.resolvedAppearance}
			</Text>
		</div>
	);
}

export const uiFoundationsDemoPage: DemoPage = {
	id: "ui-foundations",
	slug: ["ui", "foundations"],
	title: "UI Foundations",
	description: "Utilities and providers",
	groups: [
		{
			id: "foundations",
			title: "Foundations",
			description: "Utilities and providers",
			items: [
				{
					id: "appearance-setting",
					kind: "component",
					name: "Appearance setting",
					label: "Atomic application appearance",
					related: relatedMap.SettingsProvider,
					Render: AppearanceSettingsDemo,
				},
			],
		},
	],
};
