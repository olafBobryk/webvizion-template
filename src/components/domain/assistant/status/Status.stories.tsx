import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import * as Assistant from "@/components/domain/assistant";
import { IconProvider } from "@/components/ui/icons/iconRegistry";
import { phosphorIconRegistry } from "@/components/ui/icons/phosphorRegistry";
import { catalogContract } from "./Status.catalog";

const meta = {
	id: "domain-assistant-status",
	title: "Domain/Assistant/Status",
	component: Assistant.Thinking,
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<IconProvider registry={phosphorIconRegistry}>
				<Story />
			</IconProvider>
		),
	],
	parameters: {
		catalogContract,
		layout: "fullscreen",
		a11y: { test: "error" },
		docs: {
			description: {
				component:
					"Assistant-owned pending states share the conversation message axis and stable response-line geometry.",
			},
		},
	},
} satisfies Meta<typeof Assistant.Thinking>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PendingStates: Story = {
	render: () => (
		<div className="grid gap-7 py-6">
			<Assistant.Loading />
			<Assistant.Thinking />
		</div>
	),
	play: async ({ canvas }) => {
		const statuses = canvas.getAllByRole("status");
		await expect(statuses).toHaveLength(2);
		await expect(statuses[0]).toHaveTextContent("Waiting for Assistant");
		await expect(statuses[1]).toHaveTextContent("Thinking...");
		await expect(
			Math.abs(
				statuses[0].getBoundingClientRect().height -
					statuses[1].getBoundingClientRect().height,
			),
		).toBeLessThan(0.2);
		await expect(statuses[0].getBoundingClientRect().left).toBe(
			statuses[1].getBoundingClientRect().left,
		);
		await expect(
			statuses[1].querySelectorAll('[style*="animation-delay"]'),
		).toHaveLength(3);
	},
};
