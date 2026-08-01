import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { CopyField } from "./CopyField";
import { catalogContract } from "./CopyField.catalog";

const meta = {
	id: "ui-misc-copy-field",
	title: "UI/Misc/CopyField",
	component: CopyField,
	excludeStories: ["catalogContract"],
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof CopyField>;
export default meta;
type Story = StoryObj<typeof meta>;
export const CopyContract: Story = {
	args: { value: "averlo.example/invite", toastMessage: false, onCopy: fn() },
	play: async ({ args, canvas }) => {
		const button = canvas.getByRole("button", {
			name: /averlo.example\/invite/i,
		});
		button.focus();
		await expect(button).toHaveFocus();
		await userEvent.click(button);
		await expect(args.onCopy).toHaveBeenCalledWith("averlo.example/invite");
	},
};
export const LoadingParity: Story = {
	args: { value: "averlo.example/invite" },
	render: () => (
		<div className="grid w-96 max-w-full gap-3">
			<CopyField value="averlo.example/invite" toastMessage={false} />
			<CopyField loading value="averlo.example/invite" toastMessage={false} />
			<CopyField.Skeleton placeholder="averlo.example/invite" />
		</div>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByText("averlo.example/invite")).toHaveLength(3);
	},
};

export const ValuePresentations: Story = {
	args: { value: "https://averlo.example/reports/q1" },
	render: () => (
		<div className="grid w-96 max-w-full gap-3">
			<CopyField
				toastMessage={false}
				value="https://averlo.example/reports/q1"
			/>
			<CopyField
				showIcon={false}
				toastMessage={false}
				type="phone"
				value="+31 20 123 4567"
			/>
		</div>
	),
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("button", { name: /averlo.example\/reports\/q1/i }),
		).toBeVisible();
		await expect(
			canvas.getByRole("button", { name: /\+31 20 123 4567/i }),
		).toBeVisible();
	},
};
