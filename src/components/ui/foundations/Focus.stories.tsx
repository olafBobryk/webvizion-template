import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { catalogContract } from "./Focus.catalog";
import { focusRing } from "./focus";

const meta = {
	id: "ui-foundations-focus",
	excludeStories: ["catalogContract"],
	title: "UI/Foundations/Focus",
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const KeyboardFocusVisibility: Story = {
	render: () => (
		<div className="grid gap-4">
			<button
				className={`rounded-md border px-3 py-2 ${focusRing.visibleDefault}`}
				type="button"
			>
				Direct control
			</button>
			<label className={`rounded-md border p-2 ${focusRing.fieldDefault}`}>
				<span className="sr-only">Field shell</span>
				<input className="outline-none" placeholder="Focus the field" />
			</label>
		</div>
	),
	play: async ({ canvas }) => {
		await userEvent.tab();
		await expect(
			canvas.getByRole("button", { name: "Direct control" }),
		).toHaveFocus();
		await userEvent.tab();
		await expect(canvas.getByPlaceholderText("Focus the field")).toHaveFocus();
	},
};
