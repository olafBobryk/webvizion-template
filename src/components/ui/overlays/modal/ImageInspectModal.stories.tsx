import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Button } from "../../primitives/Button";
import { ImageInspectModal } from "./ImageInspectModal";
import { catalogContract } from "./ImageInspectModal.catalog";
import { ModalHost } from "./ModalHost";
import { useImageInspectModal } from "./useImageInspectModal";

function ImageInspectHarness() {
	const { openImageInspect } = useImageInspectModal();
	return (
		<>
			<div id="modal-root" />
			<ModalHost />
			<Button
				onClick={() =>
					openImageInspect({
						src: "/test/placeholder-portrait.jpg",
						alt: "Abstract blue portrait composition",
					})
				}
			>
				Inspect image
			</Button>
		</>
	);
}

const meta = {
	id: "ui-overlays-image-inspect-modal",
	excludeStories: ["catalogContract"],
	title: "UI/Overlays/ImageInspectModal",
	component: ImageInspectModal,
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "fullscreen",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof ImageInspectModal>;

export default meta;
type Story = StoryObj;

export const HostedImageInspection: Story = {
	render: () => (
		<div className="p-8">
			<ImageInspectHarness />
		</div>
	),
	play: async ({ canvas }) => {
		await userEvent.click(
			canvas.getByRole("button", { name: "Inspect image" }),
		);
		const body = within(document.body);
		await body.findByRole("dialog", { name: "Image preview" });
		await expect(
			await body.findByRole("img", {
				name: "Abstract blue portrait composition",
			}),
		).toBeInTheDocument();
		await userEvent.click(body.getByRole("button", { name: "Close" }));
		await waitFor(() =>
			expect(
				body.queryByRole("dialog", { name: "Image preview" }),
			).not.toBeInTheDocument(),
		);
	},
};
