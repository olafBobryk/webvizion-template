import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { SignatureInput } from "./SignatureInput";
import { catalogContract } from "./SignatureInput.catalog";

const onClear = fn();
const meta = {
	id: "ui-input-signature-input",
	excludeStories: ["catalogContract"],
	title: "UI/Input/SignatureInput",
	component: SignatureInput,
	subcomponents: { "SignatureInput.Skeleton": SignatureInput.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof SignatureInput>;
export default meta;
type Story = StoryObj;

export const InteractionContract: Story = {
	render: () => (
		<div className="w-[480px]">
			<SignatureInput
				description="Sign inside the field."
				label="Approval signature"
				onClear={onClear}
			/>
		</div>
	),
	play: async ({ canvas, canvasElement }) => {
		onClear.mockClear();
		const signature = canvasElement.querySelector(
			'canvas[aria-label="Approval signature"]',
		);
		if (!(signature instanceof HTMLCanvasElement)) {
			throw new Error("Signature canvas missing");
		}
		signature.focus();
		await expect(signature).toHaveFocus();
		await userEvent.pointer([
			{
				coords: { x: 12, y: 12 },
				keys: "[MouseLeft>]",
				target: signature,
			},
			{ coords: { x: 36, y: 28 }, target: signature },
			{ keys: "[/MouseLeft]", target: signature },
		]);
		const clear = canvas.getByRole("button", { name: "Clear signature" });
		await waitFor(() => expect(clear).toBeEnabled());
		await userEvent.click(clear);
		await expect(onClear).toHaveBeenCalledOnce();
	},
};

export const SkeletonParity: Story = {
	render: () => (
		<div className="w-[480px]">
			<SignatureInput.Skeleton label="Approval signature" />
		</div>
	),
};
