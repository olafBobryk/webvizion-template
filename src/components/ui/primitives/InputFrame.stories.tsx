import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import clsx from "clsx";
import { expect, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import {
	InputFrame,
	inputFrameChromeClassName,
	inputVariants,
} from "./InputFrame";
import { catalogContract } from "./InputFrame.catalog";

const meta = {
	id: "ui-primitives-input-frame",
	excludeStories: ["catalogContract"],
	title: "UI/Primitives/InputFrame",
	component: InputFrame,
	subcomponents: { "InputFrame.Skeleton": InputFrame.Skeleton },
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
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const SizesAndAdornments: Story = {
	render: () => (
		<div className="grid gap-4">
			<InputFrame
				start={<span aria-hidden>€</span>}
				end={<span>EUR</span>}
				fullWidth
				size="sm"
			>
				<input
					aria-label="Small amount"
					className={inputVariants({
						size: "sm",
						hasStart: true,
						hasEnd: true,
					})}
				/>
			</InputFrame>
			<InputFrame fullWidth size="md">
				<input
					aria-label="Medium input"
					className={inputVariants({ size: "md" })}
				/>
			</InputFrame>
			<InputFrame fullWidth size="lg">
				<input
					aria-label="Large input"
					className={inputVariants({ size: "lg" })}
				/>
			</InputFrame>
		</div>
	),
};

export const FocusAndErrorState: Story = {
	render: () => (
		<InputFrame data-testid="error-frame" fullWidth tone="error">
			<input
				aria-label="Invalid value"
				aria-invalid="true"
				className={inputVariants()}
			/>
		</InputFrame>
	),
	play: async ({ canvas }) => {
		const input = canvas.getByRole("textbox", { name: "Invalid value" });
		await userEvent.click(input);
		await expect(input).toHaveFocus();
		await expect(canvas.getByTestId("error-frame")).toHaveAttribute(
			"aria-invalid",
			"true",
		);
	},
};

export const DisabledAndSkeletonParity: Story = {
	render: () => (
		<div className="grid gap-4">
			<InputFrame disabled fullWidth>
				<input
					aria-label="Disabled value"
					className={inputVariants({ disabled: true })}
					disabled
					defaultValue="Unavailable"
				/>
			</InputFrame>
			<InputFrame.Skeleton fullWidth>Loading value</InputFrame.Skeleton>
		</div>
	),
};

export const StaticChromeReuse: Story = {
	render: () => (
		<div
			className={clsx(inputFrameChromeClassName, "min-h-9 px-3 py-2")}
			data-testid="static-framed-content"
		>
			Non-interactive content
		</div>
	),
	play: async ({ canvas }) => {
		const surface = canvas.getByTestId("static-framed-content");
		await expect(surface).toBeVisible();
		await expect(surface).not.toHaveAttribute("aria-invalid");
		await expect(canvas.queryByRole("textbox")).toBeNull();
	},
};
