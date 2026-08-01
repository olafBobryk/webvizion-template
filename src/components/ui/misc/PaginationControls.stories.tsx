import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { PaginationControls } from "./PaginationControls";
import { catalogContract } from "./PaginationControls.catalog";

const meta = {
	id: "ui-misc-pagination-controls",
	title: "UI/Misc/PaginationControls",
	component: PaginationControls,
	excludeStories: ["catalogContract"],
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
	args: { current: 2, total: 5, onPrev: fn(), onNext: fn() },
} satisfies Meta<typeof PaginationControls>;
export default meta;
type Story = StoryObj<typeof meta>;
export const PagingContract: Story = {
	play: async ({ args, canvas }) => {
		await expect(canvas.getByText("2/5")).toBeVisible();
		await userEvent.click(canvas.getByRole("button", { name: "Previous" }));
		await userEvent.click(canvas.getByRole("button", { name: "Next" }));
		await expect(args.onPrev).toHaveBeenCalledOnce();
		await expect(args.onNext).toHaveBeenCalledOnce();
	},
};
export const SkeletonParity: Story = {
	render: () => (
		<div className="grid gap-4">
			<PaginationControls
				current={1}
				total={5}
				onPrev={fn()}
				onNext={fn()}
				disablePrev
			/>
			<PaginationControls.Skeleton current={1} total={5} />
		</div>
	),
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("button", { name: "Previous" }),
		).toBeDisabled();
		await expect(canvas.getAllByText("1/5")).toHaveLength(2);
	},
};
