import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Button } from "../primitives/Button";
import { catalogContract } from "./CopyAction.catalog";
import { CopyStatusIcon, useCopyAction } from "./useCopyAction";

function CopyHarness() {
	const [lastCopied, setLastCopied] = useState("Nothing copied");
	const { copied, handleCopy } = useCopyAction({
		value: "Averlo",
		onCopy: async (value) => setLastCopied(`Copied ${value}`),
		toastMessage: false,
	});
	return (
		<div className="grid gap-3">
			<Button
				onClick={handleCopy}
				leadingIcon={<CopyStatusIcon copied={copied} />}
			>
				Copy name
			</Button>
			<output aria-live="polite">{lastCopied}</output>
		</div>
	);
}

const meta = {
	id: "ui-helpers-copy-action",
	excludeStories: ["catalogContract"],
	title: "UI/Helpers/Copy Action",
	component: CopyStatusIcon,
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof CopyStatusIcon>;

export default meta;
type Story = StoryObj;

export const CopyCallbackAndFeedback: Story = {
	render: () => <CopyHarness />,
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button", { name: "Copy name" }));
		await expect(canvas.getByText("Copied Averlo")).toBeInTheDocument();
	},
};
