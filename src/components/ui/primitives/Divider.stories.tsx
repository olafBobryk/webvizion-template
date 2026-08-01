import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import Divider from "./Divider";
import { catalogContract } from "./Divider.catalog";
import { Panel } from "./surfaces";
import { Text } from "./Text";

const meta = {
	id: "ui-primitives-divider",
	excludeStories: ["catalogContract"],
	title: "UI/Primitives/Divider",
	component: Divider,
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
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unlabeled: Story = {
	render: () => (
		<div className="grid gap-4">
			<Text>First content group</Text>
			<Divider />
			<Text>Second content group</Text>
		</div>
	),
};

export const LabeledAcrossSurfaces: Story = {
	parameters: {
		a11y: { test: "error" },
	},
	render: () => (
		<div className="grid gap-6">
			<Divider textProps={{ tone: "muted", variant: "caption" }}>
				or continue with
			</Divider>
			<Panel background="card" padding="sm">
				<Divider textProps={{ tone: "muted" }}>Card surface</Divider>
			</Panel>
			<Panel background="muted" padding="sm">
				<Divider textProps={{ tone: "muted" }}>Muted surface</Divider>
			</Panel>
		</div>
	),
	play: async ({ canvas }) => {
		for (const label of ["or continue with", "Card surface", "Muted surface"]) {
			const text = canvas.getByText(label);
			await expect(text).toBeVisible();
			await expect(text.parentElement).toHaveClass(
				"before:bg-border",
				"after:bg-border",
			);
			await expect(text).not.toHaveClass("bg-background");
		}
	},
};
