import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, waitFor } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Button } from "../primitives/Button";
import { type AppearancePreference, resolveAppearance } from "./appearance";
import { catalogContract } from "./Settings.catalog";
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

const meta = {
	id: "ui-foundations-settings",
	excludeStories: ["catalogContract"],
	title: "UI/Foundations/Settings and Appearance",
	component: SettingsProvider,
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof SettingsProvider>;

export default meta;
type Story = StoryObj;

export const AppearanceResolution: Story = {
	render: () => (
		<dl className="grid grid-cols-2 gap-2">
			<dt>System with dark preference</dt>
			<dd data-testid="system-dark">{resolveAppearance("system", true)}</dd>
			<dt>Explicit light preference</dt>
			<dd data-testid="explicit-light">{resolveAppearance("light", true)}</dd>
		</dl>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByTestId("system-dark")).toHaveTextContent("dark");
		await expect(canvas.getByTestId("explicit-light")).toHaveTextContent(
			"light",
		);
	},
};

export const PreferenceContext: Story = {
	render: () => (
		<SettingsProvider defaultAppearance="light" storageKey={null}>
			<PreferenceHarness />
		</SettingsProvider>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByText(/Appearance: light/)).toBeInTheDocument();
		await userEvent.click(canvas.getByRole("button", { name: "dark" }));
		await expect(
			canvas.getByText(/Appearance: dark; resolved: dark/),
		).toBeInTheDocument();
		await userEvent.click(
			canvas.getByRole("button", { name: "Disable motion" }),
		);
		await userEvent.click(
			canvas.getByRole("button", { name: "Increase text scale" }),
		);
		await expect(
			canvas.getByText(/motion: off; scale: 1.125/),
		).toBeInTheDocument();
	},
};

export const StorybookDarkAppearance: Story = {
	globals: { appearance: "dark" },
	render: () => <AppearanceProbe />,
	play: async ({ canvas }) => {
		await expect(
			canvas.getByText("Averlo appearance: dark; resolved: dark"),
		).toBeInTheDocument();
		await waitFor(() => {
			expect(document.documentElement).toHaveClass("dark");
			expect(document.documentElement.dataset.appearance).toBe("dark");
			expect(document.documentElement.dataset.resolvedAppearance).toBe("dark");
		});
	},
};
