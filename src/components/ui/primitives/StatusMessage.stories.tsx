import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, waitFor } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Button } from "./Button";
import { StatusMessage } from "./StatusMessage";
import { catalogContract } from "./StatusMessage.catalog";
import { StatusMessagePresence } from "./StatusMessagePresence";

const meta = {
	id: "ui-primitives-status-message",
	excludeStories: ["catalogContract"],
	title: "UI/Primitives/StatusMessage",
	component: StatusMessage,
	subcomponents: { "StatusMessage.Presence": StatusMessagePresence },
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
} satisfies Meta<typeof StatusMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SemanticTones: Story = {
	parameters: {
		a11y: { test: "error" },
	},
	render: () => (
		<div className="grid gap-3">
			<StatusMessage tone="info">
				This workspace is visible to invited members.
			</StatusMessage>
			<StatusMessage tone="success">
				Security settings are complete.
			</StatusMessage>
			<StatusMessage tone="warning">Billing details need review.</StatusMessage>
			<StatusMessage tone="danger">
				This environment is scheduled for deletion.
			</StatusMessage>
		</div>
	),
	play: async ({ canvas }) => {
		await expect(
			canvas.getByText("This workspace is visible to invited members."),
		).toBeVisible();
		await expect(
			canvas.getByText("Security settings are complete."),
		).toBeVisible();
		await expect(
			canvas.getByText("Billing details need review."),
		).toBeVisible();
		await expect(
			canvas.getByText("This environment is scheduled for deletion."),
		).toBeVisible();
	},
};

function ControlledPresenceExample() {
	const [open, setOpen] = useState(true);
	return (
		<div className="grid gap-3">
			<Button onClick={() => setOpen((current) => !current)}>
				{open ? "Hide notice" : "Show notice"}
			</Button>
			<div className="grid gap-0">
				<StatusMessage.Presence open={open} gap="sm" tone="info">
					A controlled contextual notice.
				</StatusMessage.Presence>
				<p>Content following the owned presence gap.</p>
			</div>
		</div>
	);
}

export const ControlledPresence: Story = {
	render: () => <ControlledPresenceExample />,
	play: async ({ canvas }) => {
		await expect(
			canvas.getByText("A controlled contextual notice."),
		).toBeVisible();
		await userEvent.click(canvas.getByRole("button", { name: "Hide notice" }));
		await waitFor(() => {
			expect(
				canvas.queryByText("A controlled contextual notice."),
			).not.toBeInTheDocument();
		});
		await userEvent.click(canvas.getByRole("button", { name: "Show notice" }));
		await waitFor(() => {
			expect(canvas.getByText("A controlled contextual notice.")).toBeVisible();
		});
	},
};
