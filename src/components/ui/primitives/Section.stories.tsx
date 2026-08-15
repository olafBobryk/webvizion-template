import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CSSProperties } from "react";
import { expect } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Button } from "./Button";
import { Section } from "./Section";
import { catalogContract } from "./Section.catalog";
import { Text } from "./Text";

const meta = {
	id: "ui-primitives-section",
	excludeStories: ["catalogContract"],
	title: "UI/Primitives/Section",
	component: Section,
	subcomponents: { "Section.Background": Section.Background },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "fullscreen",
		a11y: { test: "error" },
		docs: {
			description: {
				component: formatCatalogOwnerContract(catalogContract),
			},
		},
	},
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const WidthPaddingAndAlignment: Story = {
	render: () => (
		<Section
			align="center"
			background="surface"
			maxWidth="narrow"
			padding="soft"
		>
			<Text as="h2" variant="headingPage">
				Narrow centered section
			</Text>
			<Text tone="muted">
				Outer spacing and inner width are separate decisions.
			</Text>
		</Section>
	),
};

export const DecorativeBackground: Story = {
	render: () => (
		<Section align="center" className="min-h-80" justify="center">
			<Section.Background>
				<div
					data-testid="decorative-background"
					className="h-full bg-gradient-to-br from-primary/20 to-transparent"
				/>
			</Section.Background>
			<Text as="h2" variant="headingPage">
				Foreground content remains in flow
			</Text>
		</Section>
	),
	play: async ({ canvas }) => {
		const background = canvas.getByTestId("decorative-background").parentElement
			?.parentElement;
		await expect(background).toHaveAttribute("aria-hidden", "true");
	},
};

export const InteractiveBackground: Story = {
	render: () => (
		<Section align="center" className="min-h-80" justify="center">
			<Section.Background interactive>
				<div className="flex h-full items-end justify-end p-6">
					<Button>Pause background</Button>
				</div>
			</Section.Background>
			<Text as="h2" variant="headingPage">
				Interactive media opts into pointer and accessibility ownership
			</Text>
		</Section>
	),
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("button", { name: "Pause background" }),
		).toBeEnabled();
	},
};

export const HeroSafeHeight: Story = {
	render: () => (
		<Section
			align="center"
			background="foreground"
			height="hero"
			justify="center"
			padding="hero"
		>
			<Text as="h1" theme="light" variant="headingHero">
				Hero content can grow safely
			</Text>
			<Text theme="light" tone="muted">
				The section prefers the viewport without forcing a fixed height.
			</Text>
		</Section>
	),
};

export const SemanticSurfaceContexts: Story = {
	render: () => (
		<div className="grid gap-4">
			{(
				[
					["ink", "Ink context"],
					["paper", "Paper context"],
					["primary", "Primary context"],
				] as const
			).map(([background, label]) => (
				<Section
					background={background}
					key={background}
					padding="soft"
					data-testid={`section-${background}`}
				>
					<Text as="h2" theme="inherit" variant="headingMd">
						{label}
					</Text>
					<Text theme="inherit">
						This section publishes a semantic context without changing child
						surface ownership.
					</Text>
				</Section>
			))}
		</div>
	),
	play: async ({ canvas }) => {
		for (const background of ["ink", "paper", "primary"] as const) {
			const section = canvas.getByTestId(`section-${background}`);
			await expect(section).toHaveAttribute("data-surface-context", background);
			await expect(section.className).not.toMatch(/\brounded/);
		}
	},
};

export const FullBleedCappedForeground: Story = {
	render: () => (
		<div className="min-w-[1728px]">
			<Section
				className="min-h-80 bg-ink text-ink-foreground"
				data-testid="capped-section"
				style={{ "--spacing-section-y": "7rem" } as CSSProperties}
			>
				<Section.Background interactive>
					<button
						className="absolute inset-0 w-full bg-primary/10"
						type="button"
					>
						<span className="sr-only">Interactive background</span>
					</button>
				</Section.Background>
				<div className="relative rounded-md border border-border p-6">
					Default-capped foreground
				</div>
			</Section>
		</div>
	),
	play: async ({ canvas }) => {
		const root = canvas.getByTestId("capped-section");
		const frame = root.querySelector<HTMLElement>("[data-section-frame]");
		if (!frame) throw new Error("Section frame was not rendered.");
		const outerRect = root.getBoundingClientRect();
		const frameRect = frame.getBoundingClientRect();

		await expect(root).toHaveAttribute("data-section-root", "");
		await expect(root.className).not.toContain("max-w-");
		await expect(frameRect.width).toBeLessThanOrEqual(1500);
		await expect(
			Math.abs(frameRect.left - (outerRect.width - frameRect.width) / 2),
		).toBeLessThanOrEqual(1);
		await expect(
			canvas.getByRole("button", { name: "Interactive background" }),
		).toBeEnabled();
	},
};
