import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ImageSwitcher } from "./ImageSwitcher";
import { catalogContract } from "./ImageSwitcher.catalog";

const images = [
	{
		src: "/test/placeholder-portrait.jpg",
		alt: "Abstract blue portrait composition",
	},
	{
		src: "/test/placeholder-square.jpg",
		alt: "Overlapping charcoal and coral shapes",
	},
] as const;
const meta = {
	id: "ui-misc-image-switcher",
	title: "UI/Misc/ImageSwitcher",
	component: ImageSwitcher,
	excludeStories: ["catalogContract", "images"],
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
	args: { images, intervalMs: 0, onIndexChange: fn(), frameClassName: "h-72" },
} satisfies Meta<typeof ImageSwitcher>;
export default meta;
type Story = StoryObj<typeof meta>;
export const NavigationContract: Story = {
	play: async ({ args, canvas }) => {
		await expect(canvas.getByText("1/2")).toBeVisible();
		await userEvent.click(canvas.getByRole("button", { name: "Next image" }));
		await expect(canvas.getByText("2/2")).toBeVisible();
		await expect(args.onIndexChange).toHaveBeenCalledWith(1);
		await userEvent.click(
			canvas.getByRole("button", { name: "Previous image" }),
		);
		await expect(args.onIndexChange).toHaveBeenCalledWith(0);
	},
};
export const SingleImageContract: Story = {
	args: { images: [images[0]], intervalMs: 0 },
	play: async ({ canvas }) => {
		await expect(
			canvas.getByAltText("Abstract blue portrait composition"),
		).toBeVisible();
		await expect(
			canvas.queryByRole("button", { name: "Next image" }),
		).not.toBeInTheDocument();
	},
};
