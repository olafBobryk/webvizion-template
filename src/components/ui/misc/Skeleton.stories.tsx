import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Skeleton } from "./Skeleton";
import { catalogContract } from "./Skeleton.catalog";

const meta = {
	id: "ui-misc-skeleton",
	title: "UI/Misc/Skeleton",
	component: Skeleton,
	excludeStories: ["catalogContract"],
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof Skeleton>;
export default meta;
type Story = StoryObj<typeof meta>;
export const NonInteractiveContract: Story = {
	render: () => (
		<Skeleton data-testid="placeholder" className="w-64 p-3">
			Final content width
		</Skeleton>
	),
	play: async ({ canvas }) => {
		const placeholder = canvas.getByTestId("placeholder");
		await expect(placeholder).toHaveAttribute("aria-hidden", "true");
		await expect(placeholder.querySelector("span")).toHaveClass(
			"pointer-events-none",
		);
	},
};
export const RadiusScale: Story = {
	render: () => (
		<div className="flex gap-3">
			{(["none", "sm", "md", "lg", "xl", "2xl", "full"] as const).map(
				(radius) => (
					<Skeleton
						key={radius}
						radius={radius}
						className="size-14"
						data-testid={`radius-${radius}`}
					/>
				),
			)}
		</div>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByTestId("radius-full")).toHaveClass("rounded-full");
		await expect(canvas.getByTestId("radius-none")).toHaveClass("rounded-none");
	},
};
