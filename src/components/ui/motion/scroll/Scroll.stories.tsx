import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import * as Scroll from "./index";
import { catalogContract } from "./Scroll.catalog";

const meta = {
	id: "ui-motion-scroll",
	title: "UI/Motion/Scroll",
	component: Scroll.Lag,
	excludeStories: ["catalogContract"],
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "fullscreen",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof Scroll.Lag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const VelocityLag: Story = {
	args: { children: <span>Velocity content</span> },
	render: () => (
		<div className="min-h-[140vh] overflow-hidden p-12">
			<Scroll.Lag data-testid="lag" className="max-w-xl">
				<div className="rounded-xl border border-subtle bg-surface p-8">
					Velocity lag remains readable content.
				</div>
			</Scroll.Lag>
		</div>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByTestId("lag")).toHaveTextContent(
			"Velocity lag remains readable content.",
		);
	},
};
