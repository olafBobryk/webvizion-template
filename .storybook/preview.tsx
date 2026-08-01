import type { Preview } from "@storybook/nextjs-vite";
import "../src/app/globals.css";
import {
	type AppearancePreference,
	applyDocumentAppearance,
	isAppearancePreference,
} from "../src/components/ui/foundations/appearance";
import { MotionProvider } from "../src/components/ui/foundations/MotionProvider";
import { SettingsProvider } from "../src/components/ui/foundations/settingsContext";
import { IconProvider } from "../src/components/ui/icons/iconRegistry";
import { phosphorIconRegistry } from "../src/components/ui/icons/phosphorRegistry";
import { markAppReady } from "../src/lib/appReadySignal";

// Automated Storybook runs must not inherit the host machine's color scheme.
// System remains available in the toolbar; Light is the deterministic baseline.
const DEFAULT_STORYBOOK_APPEARANCE: AppearancePreference = "light";

const waitForThemeSettle = () =>
	new Promise<void>((resolve) => {
		window.setTimeout(resolve, 250);
	});

// Storybook has no application loading screen, so its preview is ready as soon
// as the shared environment loads. Motion owners still consume the real signal.
markAppReady();

const preview: Preview = {
	beforeEach: () => {
		// Vitest reuses a document across stories. Reset the document before the
		// decorator mounts so a prior Dark story cannot animate into a Light one.
		applyDocumentAppearance({
			appearance: "light",
			atomic: true,
			resolvedAppearance: "light",
		});
	},
	afterEach: async () => {
		// A11y runs after the interaction play function. Give component-owned
		// color transitions time to reach the already-selected root palette so
		// Axe never samples a dark-to-light intermediate value.
		await waitForThemeSettle();
	},
	decorators: [
		(Story, context) => {
			const appearance = isAppearancePreference(context.globals.appearance)
				? context.globals.appearance
				: DEFAULT_STORYBOOK_APPEARANCE;
			const story = context.title.startsWith("UI/Input/") ? (
				<div className="min-w-80">
					<Story />
				</div>
			) : (
				<Story />
			);

			return (
				<SettingsProvider
					defaultAppearance={appearance}
					key={appearance}
					storageKey={null}
				>
					<MotionProvider>
						<IconProvider registry={phosphorIconRegistry}>
							<div className="min-h-screen bg-background text-foreground antialiased">
								{story}
							</div>
						</IconProvider>
					</MotionProvider>
				</SettingsProvider>
			);
		},
	],
	globalTypes: {
		appearance: {
			description:
				"Render stories through Averlo's application appearance system.",
			name: "Appearance",
			toolbar: {
				dynamicTitle: true,
				icon: "paintbrush",
				items: [
					{ icon: "mirror", title: "System", value: "system" },
					{ icon: "sun", title: "Light", value: "light" },
					{ icon: "moon", title: "Dark", value: "dark" },
				],
			},
		},
	},
	initialGlobals: {
		appearance: DEFAULT_STORYBOOK_APPEARANCE,
	},
	parameters: {
		options: {
			storySort: {
				order: [
					"UI",
					[
						"Guides",
						"Foundations",
						"Primitives",
						"Input",
						"Helpers",
						"Icons",
						"Misc",
						"Motion",
						"Overlays",
						"Time",
					],
					"Dashboard",
					"Domain",
				],
			},
		},
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		a11y: {
			test: "error",
		},
	},
};

export default preview;
