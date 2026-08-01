import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Text } from "./Text";
import { catalogContract } from "./Text.catalog";

const meta = {
	id: "ui-primitives-text",
	excludeStories: ["catalogContract"],
	title: "UI/Primitives/Text",
	component: Text,
	subcomponents: { "Text.Skeleton": Text.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "padded",
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

export const TypeScale: Story = {
	render: () => (
		<div className="grid gap-3">
			<Text as="h1" variant="headingHero">
				Hero heading
			</Text>
			<Text as="h2" variant="headingPage">
				Page heading
			</Text>
			<Text as="h3" variant="headingLg">
				Section heading
			</Text>
			<Text variant="bodyStrong">Strong body</Text>
			<Text variant="body">Body copy</Text>
			<Text variant="caption">Caption</Text>
		</div>
	),
};

export const ToneAndTheme: Story = {
	render: () => (
		<div className="grid gap-4">
			<div className="grid gap-1">
				<Text>Default foreground</Text>
				<Text tone="muted">Muted supporting copy</Text>
			</div>
			<div className="grid gap-1 rounded-xl bg-foreground p-4">
				<Text theme="light">Light-theme foreground</Text>
				<Text theme="light" tone="muted">
					Light-theme supporting copy
				</Text>
			</div>
		</div>
	),
};

export const PolymorphismAndSkeleton: Story = {
	render: () => (
		<div className="grid gap-4">
			<Text as="label" htmlFor="storybook-text-input" variant="bodyStrong">
				Project name
			</Text>
			<input id="storybook-text-input" className="rounded-lg border p-2" />
			<Text.Skeleton as="p" variant="support">
				Loading supporting copy
			</Text.Skeleton>
			<Text.Skeleton
				as="p"
				data-testid="compact-text-skeleton"
				density="compact"
				variant="support"
			>
				Loading compact supporting copy
			</Text.Skeleton>
		</div>
	),
	play: async ({ canvas }) => {
		const skeleton = canvas.getByTestId("compact-text-skeleton");
		await expect(skeleton).toHaveAttribute("data-skeleton-density", "compact");
		await expect(skeleton).toHaveClass("before:inset-y-px");
	},
};
