import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ScrollBorders } from "./ScrollBorders";
import { catalogContract } from "./ScrollBorders.catalog";

const meta = {
	id: "ui-misc-scroll-borders",
	title: "UI/Misc/ScrollBorders",
	component: ScrollBorders,
	excludeStories: ["catalogContract"],
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof ScrollBorders>;
export default meta;
type Story = StoryObj<typeof meta>;
const rows = Array.from({ length: 12 }, (_, index) => `Result ${index + 1}`);
export const OverflowContract: Story = {
	args: { onScroll: fn() },
	render: (args) => (
		<ScrollBorders
			{...args}
			data-testid="scroll-region"
			tabIndex={0}
			className="h-40 w-72 overflow-y-auto"
		>
			{rows.map((row) => (
				<div className="border-b border-border p-3" key={row}>
					{row}
				</div>
			))}
		</ScrollBorders>
	),
	play: async ({ args, canvas }) => {
		const region = canvas.getByTestId("scroll-region");
		Object.defineProperty(region, "scrollHeight", {
			configurable: true,
			value: 480,
		});
		Object.defineProperty(region, "clientHeight", {
			configurable: true,
			value: 160,
		});
		Object.defineProperty(region, "scrollTop", {
			configurable: true,
			value: 40,
			writable: true,
		});
		fireEvent.scroll(region);
		await expect(args.onScroll).toHaveBeenCalledOnce();
		await expect(region).toHaveClass("border-t!");
	},
};
export const SkeletonContract: Story = {
	render: () => (
		<ScrollBorders.Skeleton className="h-40 w-72">
			<div className="h-80 bg-muted/40" />
		</ScrollBorders.Skeleton>
	),
	play: async ({ canvasElement }) => {
		await expect(
			canvasElement.querySelector(".overflow-hidden"),
		).toBeInTheDocument();
	},
};
