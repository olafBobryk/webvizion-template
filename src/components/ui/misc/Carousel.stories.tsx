import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, waitFor } from "storybook/test";
import { Panel } from "@/components/ui/primitives/surfaces";
import { Text } from "@/components/ui/primitives/Text";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Carousel } from "./Carousel";
import { catalogContract } from "./Carousel.catalog";

const items = ["Strategy", "Design", "Delivery", "Review"].map(
	(label, index) => ({
		content: (
			<Panel className="grid min-h-72 content-between" padding="md">
				<Text as="h3" variant="headingLg">
					{label}
				</Text>
				<Text tone="muted">Reusable slide content {index + 1}</Text>
			</Panel>
		),
		id: label.toLowerCase(),
		label,
	}),
);

const meta = {
	id: "ui-misc-carousel",
	title: "UI/Misc/Carousel",
	component: Carousel,
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "padded",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LeftGutterAndPagination: Story = {
	args: {
		ariaLabel: "Delivery phases",
		items,
		onIndexChange: fn(),
		paginationLabel: "Choose a delivery phase",
	},
	play: async ({ args, canvas, userEvent }) => {
		await expect(
			canvas.getByRole("region", { name: "Delivery phases" }),
		).toHaveAttribute("data-carousel-gutter", "section");
		await expect(canvas.getAllByRole("group")).toHaveLength(items.length);
		const third = canvas.getByRole("button", {
			name: "Show slide 3: Delivery",
		});
		await userEvent.click(third);
		await waitFor(() => expect(third).toHaveAttribute("aria-current", "true"));
		await expect(args.onIndexChange).toHaveBeenCalledWith(2);
	},
};

export const WithoutSectionGutter: Story = {
	args: {
		ariaLabel: "Compact phases",
		gutter: "none",
		items: items.slice(0, 3),
	},
};
