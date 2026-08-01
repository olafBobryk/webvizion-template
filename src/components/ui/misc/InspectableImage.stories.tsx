import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, userEvent, waitFor } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ModalHost } from "../overlays/modal/ModalHost";
import { InspectableImage } from "./InspectableImage";
import { catalogContract } from "./InspectableImage.catalog";

const meta = {
	id: "ui-misc-inspectable-image",
	title: "UI/Misc/InspectableImage",
	component: InspectableImage,
	excludeStories: ["catalogContract"],
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<>
				<Story />
				<ModalHost />
			</>
		),
	],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof InspectableImage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const InspectionContract: Story = {
	// The shared inspection modal keeps its known dark-mode contrast finding as a
	// warning while the focus, launch, and dialog contract remains blocking.
	parameters: { a11y: { test: "error" } },
	args: {
		src: "/test/placeholder-square.jpg",
		alt: "Overlapping charcoal and coral shapes",
		width: 480,
		height: 320,
		className: "h-56 w-80 overflow-hidden rounded-xl",
	},
	play: async ({ canvas }) => {
		const trigger = canvas.getByRole("button", {
			name: "Overlapping charcoal and coral shapes",
		});
		trigger.focus();
		await expect(trigger).toHaveFocus();
		await userEvent.click(trigger);
		const dialog = await screen.findByRole("dialog", {
			name: "Image preview",
		});
		await waitFor(() => expect(dialog).toBeVisible());
	},
};
