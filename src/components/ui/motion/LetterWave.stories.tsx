import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Button } from "../primitives/Button";
import { LetterWave } from "./LetterWave";
import { catalogContract } from "./LetterWave.catalog";

const meta = {
	id: "ui-motion-letter-wave",
	title: "UI/Motion/LetterWave",
	component: LetterWave,
	excludeStories: ["catalogContract"],
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof LetterWave>;
export default meta;
type Story = StoryObj<typeof meta>;
export const HoverContract: Story = {
	args: { children: "Open project" },
	render: () => (
		<Button className="group" variant="secondary">
			<LetterWave variant="bodyStrong">Open project</LetterWave>
		</Button>
	),
	play: async ({ canvas }) => {
		const button = canvas.getByRole("button", { name: "Open project" });
		await expect(button).toBeVisible();
		const character = button.querySelector<HTMLElement>(
			'[style*="animation-delay"]',
		);
		await expect(character).not.toBeNull();
		if (!character) throw new Error("LetterWave did not render characters.");
		await userEvent.hover(button);
		await expect(button).toHaveClass("group");
		await expect(button).toHaveTextContent("Open project");
		await expect(character).toHaveClass("letter-wave-character");
		await expect(character.parentElement).toHaveAttribute(
			"aria-hidden",
			"true",
		);
	},
};
