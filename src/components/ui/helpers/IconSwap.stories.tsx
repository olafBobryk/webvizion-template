import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Icon } from "../icons/Icon";
import { Button } from "../primitives/Button";
import { IconSwap } from "./IconSwap";
import { catalogContract } from "./IconSwap.catalog";

function IconSwapHarness() {
	const [activeIndex, setActiveIndex] = useState(0);
	return (
		<Button
			aria-label={activeIndex === 0 ? "Show password" : "Hide password"}
			onClick={() => setActiveIndex((current) => (current === 0 ? 1 : 0))}
			variant="secondary"
		>
			<span data-testid="swap">
				<IconSwap
					activeIndex={activeIndex}
					items={[
						{ icon: <Icon name="eye" /> },
						{ icon: <Icon name="eye-closed" /> },
					]}
				/>
			</span>
			Password
		</Button>
	);
}

const meta = {
	id: "ui-helpers-icon-swap",
	excludeStories: ["catalogContract"],
	title: "UI/Helpers/IconSwap",
	component: IconSwap,
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof IconSwap>;

export default meta;
type Story = StoryObj;

export const StatefulTransition: Story = {
	render: () => <IconSwapHarness />,
	play: async ({ canvas }) => {
		const button = canvas.getByRole("button", { name: "Show password" });
		const states = canvas
			.getByTestId("swap")
			.querySelectorAll(":scope > span > span");
		await expect(states[0]).toHaveClass("opacity-100");
		await userEvent.click(button);
		await expect(
			canvas.getByRole("button", { name: "Hide password" }),
		).toBeInTheDocument();
		await expect(states[1]).toHaveClass("opacity-100");
	},
};

export const SizeScale: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			{(["sm", "md", "lg"] as const).map((size) => (
				<div className="grid gap-1" key={size}>
					<span className="text-xs">{size}</span>
					<IconSwap
						activeIndex={0}
						items={[{ icon: <Icon name="check" /> }]}
						size={size}
					/>
				</div>
			))}
		</div>
	),
};
