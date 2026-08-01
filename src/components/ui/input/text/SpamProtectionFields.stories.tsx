import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { SpamProtectionFields } from "./SpamProtectionFields";
import { catalogContract } from "./SpamProtectionFields.catalog";

const meta = {
	id: "ui-input-spam-protection-fields",
	excludeStories: ["catalogContract"],
	title: "UI/Input/Text/SpamProtectionFields",
	component: SpamProtectionFields,
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof SpamProtectionFields>;
export default meta;
type Story = StoryObj;

export const HoneypotContract: Story = {
	render: () => (
		<form aria-label="Contact">
			<SpamProtectionFields fieldName="contact_website" />
			<button type="submit">Send</button>
		</form>
	),
	play: async ({ canvasElement }) => {
		const input = canvasElement.querySelector('input[name="contact_website"]');
		await expect(input).toHaveAttribute("aria-hidden", "true");
		await expect(input).toHaveAttribute("autocomplete", "off");
		await expect(input).toHaveAttribute("tabindex", "-1");
	},
};
