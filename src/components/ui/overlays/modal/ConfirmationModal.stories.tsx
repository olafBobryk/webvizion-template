import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Button } from "../../primitives/Button";
import { ConfirmationModal } from "./ConfirmationModal";
import { catalogContract } from "./ConfirmationModal.catalog";
import { ModalHost } from "./ModalHost";
import { useConfirmationModal } from "./useConfirmationModal";

function ConfirmationHarness() {
	const [confirmations, setConfirmations] = useState(0);
	const { openConfirmation } = useConfirmationModal();
	return (
		<>
			<div id="modal-root" />
			<ModalHost />
			<Button
				onClick={() =>
					openConfirmation({
						title: "Delete report?",
						description: "Review the impact before continuing.",
						confirmLabel: "Delete report",
						details: [{ label: "Report", description: "Quarterly review" }],
						warning: "This cannot be undone.",
						onConfirm: () => {
							setConfirmations((count) => count + 1);
							return false;
						},
					})
				}
			>
				Open confirmation
			</Button>
			<output aria-live="polite">Confirmed {confirmations} times</output>
		</>
	);
}

const meta = {
	id: "ui-overlays-confirmation-modal",
	excludeStories: ["catalogContract"],
	title: "UI/Overlays/ConfirmationModal",
	component: ConfirmationModal,
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "fullscreen",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof ConfirmationModal>;

export default meta;
type Story = StoryObj;

export const ConfirmationContract: Story = {
	parameters: { a11y: { test: "error" } },
	render: () => (
		<div className="flex gap-4 p-8">
			<ConfirmationHarness />
		</div>
	),
	play: async ({ canvas }) => {
		await userEvent.click(
			canvas.getByRole("button", { name: "Open confirmation" }),
		);
		const body = within(document.body);
		const dialog = await body.findByRole("dialog", { name: "Delete report?" });
		await expect(body.getByText("Quarterly review")).toBeInTheDocument();
		await expect(body.getByText("This cannot be undone.")).toBeInTheDocument();
		await userEvent.click(body.getByRole("button", { name: "Delete report" }));
		await expect(canvas.getByText("Confirmed 1 times")).toBeInTheDocument();
		await expect(dialog).toBeInTheDocument();
	},
};
